import { PacketReader } from '../../protocol/packets/packetReader';
import { MessagePacket } from '../user/MessagePacket';
import { User, statChangedPacket } from '../user/User';
import { MiniRoomPacket, TradeAction, MiniRoomTypeLegacy } from './MiniRoomPacket';
import { tradeManager } from './TradeManager';
import { TradeOfferItem, TradeRoom } from './TradeRoom';
import { inventoryOperation } from '../item/ItemPacket';
import { InventoryManager } from '../item/InventoryManager';
import { InventoryOperation } from '../item/InventoryOperation';
import { InventoryType, inventoryTypeByItemId } from '../item/InventoryType';
import { ItemProvider } from '../../provider/ItemProvider';
import { Item } from '../item/Item';
import { ItemType, itemTypeByValue } from '../item/ItemType';
import { Stat } from '../user/stat/Stat';
import { ItemConstants } from '../item/ItemConstants';
import { EnterResultType } from './EnterResultType';
import { EntrustedShop } from './EntrustedShop';
import { MemoryGameRoom } from './MemoryGameRoom';
import { MiniGameRoom } from './MiniGameRoom';
import { MiniRoom } from './MiniRoom';
import { MiniRoomProtocol, miniRoomProtocolByValue } from './MiniRoomProtocol';
import { MiniRoomType, miniRoomTypeByValue } from './MiniRoomType';
import { OmokRoom } from './OmokRoom';
import { PersonalShop } from './PersonalShop';

interface TakeItemResult {
  item: Item;
  invType: InventoryType;
  ops: InventoryOperation[];
}

export class MiniRoomHandler {
  static channelServerOverride: any = null;

  static handleMiniRoom(user: User, r: PacketReader): void {
    const action = r.readByte();

    // Kinoko-style MiniRoom dispatch: if the user is currently inside a
    // kinoko MiniRoom (Omok / Memory / PersonalShop / EntrustedShop), `action`
    // is a MiniRoomProtocol value (room-specific or common in-room action).
    const dialog = typeof (user as any).getDialog === 'function' ? (user as any).getDialog() : null;
    if (dialog instanceof MiniRoom) {
      MiniRoomHandler.handleKinokoRoom(user, r, action, dialog);
      return;
    }

    // MRP_Create (action 0) - create a new Omok/Memory/PersonalShop/EntrustedShop.
    if (action === MiniRoomProtocol.MRP_Create) {
      MiniRoomHandler.handleCreate(user, r);
      return;
    }

    // MRP_Enter (action 4) - enter an existing MiniRoom by id (no dialog yet).
    // Disambiguate from legacy TradeAction.Decline (also 4): a trade decline
    // only happens when there is a pending trade request for this user.
    if (action === MiniRoomProtocol.MRP_Enter &&
        !tradeManager.getPendingRequest(user.getCharacterId())) {
      MiniRoomHandler.handleEnter(user, r);
      return;
    }

    // Legacy trade protocol: action in [2..10] followed by a type byte.
    const type = r.readByte();
    if (type !== MiniRoomTypeLegacy.Trade) {
      user.write(MessagePacket.system('That room type is not available.'));
      return;
    }

    switch (action) {
      case TradeAction.Request:
        MiniRoomHandler.requestTrade(user, r);
        return;
      case TradeAction.Invite:
        MiniRoomHandler.invite(user, r);
        return;
      case TradeAction.Decline:
        MiniRoomHandler.decline(user, r);
        return;
      case TradeAction.Exit:
        MiniRoomHandler.exit(user);
        return;
      case TradeAction.Chat:
        MiniRoomHandler.chat(user, r);
        return;
      case TradeAction.SetItem:
        MiniRoomHandler.setItem(user, r);
        return;
      case TradeAction.SetMesos:
        MiniRoomHandler.setMesos(user, r);
        return;
      case TradeAction.Confirm:
        MiniRoomHandler.confirm(user);
        return;
      case TradeAction.CancelConfirm:
        MiniRoomHandler.cancelConfirm(user);
        return;
      default:
        user.write(MessagePacket.system('That trade action is not available.'));
    }
  }

  // ===========================================================================
  // Kinoko-style MiniRoom dispatch (Omok / Memory / PersonalShop / EntrustedShop)
  // ===========================================================================

  private static handleKinokoRoom(user: User, r: PacketReader, action: number, dialog: MiniRoom): void {
    const mrp = miniRoomProtocolByValue(action);
    if (mrp === null) {
      console.error(`[MiniRoom] Unknown in-room mini room action ${action}`);
      return;
    }
    // MiniGameRoom protocol range
    if (mrp >= MiniRoomProtocol.MGRP_TieRequest && mrp <= MiniRoomProtocol.MGP_MatchCard) {
      if (!(dialog instanceof MiniGameRoom)) {
        console.error(`[MiniRoom] Received mini game action ${MiniRoomProtocol[mrp]} outside a mini game room`);
        return;
      }
      dialog.handlePacket(user, mrp, r);
      return;
    }
    // PersonalShop protocol range
    if (mrp >= MiniRoomProtocol.PSP_PutItem && mrp <= MiniRoomProtocol.PSP_DeleteBlackList) {
      if (!(dialog instanceof PersonalShop)) {
        console.error(`[MiniRoom] Received personal shop action ${MiniRoomProtocol[mrp]} outside a personal shop`);
        return;
      }
      dialog.handlePacket(user, mrp, r);
      return;
    }
    // EntrustedShop protocol range
    if (mrp >= MiniRoomProtocol.ESP_PutItem && mrp <= MiniRoomProtocol.ESP_DeleteBlackList) {
      if (!(dialog instanceof EntrustedShop)) {
        console.error(`[MiniRoom] Received entrusted shop action ${MiniRoomProtocol[mrp]} outside an entrusted shop`);
        return;
      }
      dialog.handlePacket(user, mrp, r);
      return;
    }
    // Common MiniRoom actions
    switch (mrp) {
      case MiniRoomProtocol.MRP_Chat: {
        r.readInt(); // update_time
        const message = r.readMapleAsciiString();
        const userIndex = dialog.getUserIndex(user);
        if (userIndex < 0) {
          console.error('[MiniRoom] Received MRP_Chat with bad user index');
          return;
        }
        dialog.broadcastPacket(MiniRoomPacket.chatFromUser(userIndex, user.getCharacterName(), message));
        break;
      }
      case MiniRoomProtocol.MRP_Leave: {
        dialog.leave(user);
        break;
      }
      case MiniRoomProtocol.MRP_Balloon: {
        const open = r.readBoolean();
        if (dialog instanceof PersonalShop) {
          dialog.setOpen(open);
          dialog.updateBalloon();
        } else {
          console.error(`[MiniRoom] Received MRP_Balloon for unhandled room type ${dialog.getType()}`);
        }
        break;
      }
      default:
        console.error(`[MiniRoom] Unhandled in-room mini room action ${MiniRoomProtocol[mrp]}`);
    }
  }

  private static handleCreate(user: User, r: PacketReader): void {
    const field = user.getField();
    if (!field) return;
    if (user.hasDialog()) {
      user.write(MessagePacket.system('This request has failed due to an unknown error.'));
      return;
    }
    const typeByte = r.readByte();
    const mrt = miniRoomTypeByValue(typeByte);
    if (mrt === null) {
      console.error(`[MiniRoom] Tried to create unknown mini room type ${typeByte}`);
      return;
    }
    if (!field.getMiniRoomPool().canAddMiniRoom(mrt, user.getX(), user.getY())) {
      user.write(MiniRoomPacket.enterResultFail(EnterResultType.ExistMiniRoom));
      return;
    }
    switch (mrt) {
      case MiniRoomType.OmokRoom:
      case MiniRoomType.MemoryGameRoom: {
        const title = r.readMapleAsciiString();
        const isPrivate = r.readBoolean();
        const password = isPrivate ? r.readMapleAsciiString() : null;
        const gameSpec = r.readByte();
        if (mrt === MiniRoomType.OmokRoom) {
          const requiredItem = ItemConstants.OMOK_SET_BASE + gameSpec;
          if (requiredItem < ItemConstants.OMOK_SET_BASE ||
              requiredItem > ItemConstants.OMOK_SET_END ||
              !user.getInventoryManager().hasItem(requiredItem, 1)) {
            console.error('[MiniRoom] Tried to create omok room without the required item');
            return;
          }
        } else {
          if (!user.getInventoryManager().hasItem(ItemConstants.MATCH_CARDS, 1)) {
            console.error('[MiniRoom] Tried to create memory game room without the required item');
            return;
          }
        }
        const room = mrt === MiniRoomType.OmokRoom
          ? new OmokRoom(title, password, gameSpec)
          : new MemoryGameRoom(title, password, gameSpec);
        room.addUser(0, user);
        field.getMiniRoomPool().addMiniRoom(room);
        user.setDialog(room);
        user.write(MiniRoomPacket.MiniGame.enterResult(room, user));
        room.updateBalloon();
        break;
      }
      case MiniRoomType.PersonalShop:
      case MiniRoomType.EntrustedShop: {
        const title = r.readMapleAsciiString();
        r.readByte(); // 0
        r.readShort(); // nPOS (unused server-side)
        const itemId = r.readInt();
        if (!field.getMapInfo().shop) {
          console.error('[MiniRoom] Tried to create player shop outside of the free market');
          return;
        }
        if (mrt === MiniRoomType.PersonalShop) {
          if (itemId !== ItemConstants.REGULAR_STORE_PERMIT ||
              !user.getInventoryManager().hasItem(itemId, 1)) {
            console.error('[MiniRoom] Tried to create personal shop without the required item');
            return;
          }
          const shop = new PersonalShop(title);
          shop.addUser(0, user);
          field.getMiniRoomPool().addMiniRoom(shop);
          user.setDialog(shop);
          user.write(MiniRoomPacket.PlayerShop.enterResult(shop, user, shop.getItems()));
        } else {
          if (Math.floor(itemId / 10000) !== 503 ||
              !user.getInventoryManager().hasItem(itemId, 1)) {
            console.error('[MiniRoom] Tried to create entrusted shop without the required item');
            return;
          }
          // TODO: entrusted shop creation (matches kinoko stub)
        }
        break;
      }
      default:
        console.error(`[MiniRoom] Tried to create unhandled mini room type ${mrt}`);
    }
  }

  private static handleEnter(user: User, r: PacketReader): void {
    const field = user.getField();
    if (!field) return;
    if (user.hasDialog()) {
      user.write(MessagePacket.system('This request has failed due to an unknown error.'));
      return;
    }
    const miniRoomId = r.readInt();
    const isPrivate = r.readBoolean();
    const password = isPrivate ? r.readMapleAsciiString() : null;
    r.readByte(); // 0
    const miniRoom = field.getMiniRoomPool().getById(miniRoomId);
    if (!miniRoom) {
      user.write(MiniRoomPacket.enterResultFail(EnterResultType.NoRoom));
      return;
    }
    if (!miniRoom.checkPassword(password)) {
      user.write(MiniRoomPacket.enterResultFail(EnterResultType.InvalidPassword));
      return;
    }
    if (miniRoom instanceof MiniGameRoom) {
      if (miniRoom.getUser(1)) {
        user.write(MiniRoomPacket.enterResultFail(EnterResultType.Full));
        return;
      }
      miniRoom.broadcastPacket(MiniRoomPacket.MiniGame.enter(1, user, miniRoom.getType()));
      miniRoom.addUser(1, user);
      miniRoom.updateBalloon();
      user.setDialog(miniRoom);
      user.write(MiniRoomPacket.MiniGame.enterResult(miniRoom, user));
    } else if (miniRoom instanceof PersonalShop) {
      const userIndex = miniRoom.getOpenUserIndex();
      if (!miniRoom.isOpen() || userIndex < 0) {
        user.write(MiniRoomPacket.enterResultFail(EnterResultType.Full));
        return;
      }
      miniRoom.broadcastPacket(MiniRoomPacket.enterBase(userIndex, user));
      miniRoom.addUser(userIndex, user);
      miniRoom.updateBalloon();
      user.setDialog(miniRoom);
      user.write(MiniRoomPacket.PlayerShop.enterResult(miniRoom, user, miniRoom.getItems()));
    } else {
      console.error(`[MiniRoom] Tried to enter unhandled mini room type ${miniRoom.getType()}`);
      user.write(MessagePacket.system('This request has failed due to an unknown error.'));
    }
  }

  private static requestTrade(user: User, r: PacketReader): void {
    const _type = r.readByte();
    const targetName = r.readMapleAsciiString();
    const target = MiniRoomHandler.getUserByName(targetName);
    if (!target || target.getCharacterId() === user.getCharacterId()) {
      user.write(MessagePacket.system('Unable to find that character.'));
      return;
    }
    tradeManager.addPendingRequest(user, target);
    target.write(MiniRoomPacket.tradeRequest(user.getCharacterName()));
  }

  private static invite(user: User, r: PacketReader): void {
    // Invite response after accepting trade request
    const targetName = r.readMapleAsciiString();
    const target = MiniRoomHandler.getUserByName(targetName);
    if (!target) return;

    const pending = tradeManager.getPendingRequest(user.getCharacterId());
    if (!pending || pending.requester.getCharacterId() !== target.getCharacterId()) {
      user.write(MessagePacket.system('No pending trade request.'));
      return;
    }

    tradeManager.removePendingRequest(user.getCharacterId());

    const room = tradeManager.createRoom(pending.requester, pending.requestee);
    const ownName = user.getCharacterName();
    const partnerName = pending.requester.getCharacterName();
    user.write(MiniRoomPacket.openTrade(ownName, partnerName));
    pending.requester.write(MiniRoomPacket.openTrade(partnerName, ownName));
  }

  private static decline(user: User, r: PacketReader): void {
    const inviterName = r.readMapleAsciiString();
    const inviter = MiniRoomHandler.getUserByName(inviterName);
    if (inviter) {
      tradeManager.removePendingRequest(user.getCharacterId());
      inviter.write(MiniRoomPacket.tradeInviteResult(user.getCharacterName(), false));
    }
  }

  private static exit(user: User): void {
    const room = tradeManager.getRoomByUser(user);
    if (!room) return;

    const partner = room.getPartner(user);
    const idx = room.getIndex(user);

    MiniRoomHandler.returnOfferItems(user, room, idx);
    tradeManager.removeRoom(room.tradeId);

    user.write(MiniRoomPacket.exit(idx));
    if (partner) {
      const partnerIdx = room.getIndex(partner);
      MiniRoomHandler.returnOfferItems(partner, room, partnerIdx);
      partner.write(MiniRoomPacket.exit(partnerIdx));
      partner.write(MessagePacket.system('Your trade partner has left the trade.'));
    }
  }

  private static chat(user: User, r: PacketReader): void {
    const msg = r.readMapleAsciiString();
    const room = tradeManager.getRoomByUser(user);
    if (!room) return;
    const partner = room.getPartner(user);
    if (partner) {
      partner.write(MiniRoomPacket.chat(msg));
    }
  }

  private static setItem(user: User, r: PacketReader): void {
    const room = tradeManager.getRoomByUser(user);
    if (!room) return;
    const partner = room.getPartner(user);
    if (!partner) return;

    const tradeSlot = r.readByte();
    const rawItemType = r.readByte();
    const itemId = r.readInt();
    const quantity = r.readShort();
    const invPos = r.readShort();

    const idx = room.getIndex(user);
    if (room.getOffer(idx).locked) return;

    // Clearing a slot: itemId == 0 or quantity == 0
    if (itemId <= 0 || quantity <= 0) {
      const existing = room.removeItem(user, tradeSlot);
      if (existing) {
        const returned = MiniRoomHandler.returnItemsToOwner(user, [existing]);
        if (returned) {
          user.write(MiniRoomPacket.removeItem(idx, tradeSlot));
          partner.write(MiniRoomPacket.removeItem(idx, tradeSlot));
        }
      }
      return;
    }

    const invManager = user.getCharacterData()?.inventoryManager;
    if (!invManager) return;

    const taken = MiniRoomHandler.takeItemForTrade(invManager, invPos, itemId, quantity, rawItemType);
    if (!taken) {
      user.write(MessagePacket.system('Could not place that item in the trade.'));
      return;
    }

    // If this slot is already occupied, return the old item first.
    const existing = room.removeItem(user, tradeSlot);
    if (existing) {
      if (!MiniRoomHandler.returnItemsToOwner(user, [existing])) {
        // Roll back the newly-taken item if we cannot reclaim the old one.
        MiniRoomHandler.returnItemsToOwner(user, [{ item: taken.item, pos: invPos, quantity: taken.item.quantity, invType: taken.invType }]);
        return;
      }
      user.write(MiniRoomPacket.removeItem(idx, tradeSlot));
      partner.write(MiniRoomPacket.removeItem(idx, tradeSlot));
    }

    const entry = room.setItem(user, taken.invType, invPos, taken.item, taken.item.quantity, tradeSlot);
    if (!entry) {
      MiniRoomHandler.returnItemsToOwner(user, [{ item: taken.item, pos: invPos, quantity: taken.item.quantity, invType: taken.invType }]);
      return;
    }

    user.write(inventoryOperation(taken.ops, false));
    const packet = MiniRoomPacket.setItem(idx, tradeSlot, taken.item);
    user.write(packet);
    partner.write(packet);
  }

  private static setMesos(user: User, r: PacketReader): void {
    const room = tradeManager.getRoomByUser(user);
    if (!room) return;
    const partner = room.getPartner(user);
    if (!partner) return;

    const mesos = Number(r.readLong());
    const invManager = user.getCharacterData()?.inventoryManager;
    if (!invManager || mesos < 0 || mesos > invManager.money) return;

    if (!room.setMesos(user, mesos)) return;

    const idx = room.getIndex(user);
    user.write(MiniRoomPacket.setMesos(idx, mesos));
    partner.write(MiniRoomPacket.setMesos(idx, mesos));
  }

  private static confirm(user: User): void {
    const room = tradeManager.getRoomByUser(user);
    if (!room) return;
    const partner = room.getPartner(user);
    if (!partner) return;

    if (!room.lock(user)) return;
    const idx = room.getIndex(user);
    partner.write(MiniRoomPacket.confirm(idx));

    if (room.isBothLocked()) {
      MiniRoomHandler.executeTrade(room);
    }
  }

  private static cancelConfirm(user: User): void {
    const room = tradeManager.getRoomByUser(user);
    if (!room) return;
    const partner = room.getPartner(user);

    const idx = room.getIndex(user);
    if (!room.cancelLock(user)) return;
    if (partner) {
      partner.write(MiniRoomPacket.cancelConfirm(idx));
    }
  }

  private static executeTrade(room: TradeRoom): void {
    const [userA, userB] = room.getUsers();
    if (!userA || !userB) return;

    const invA = userA.getCharacterData()?.inventoryManager;
    const invB = userB.getCharacterData()?.inventoryManager;
    if (!invA || !invB) return;

    const offerA = room.getOffer(0);
    const offerB = room.getOffer(1);

    // Validate mesos.
    if (invA.money < offerA.mesos || invB.money < offerB.mesos) {
      MiniRoomHandler.cancelTrade(room, 'Trade failed: not enough mesos.');
      return;
    }

    // Validate inventory capacity for incoming items.
    const itemsAtoB = Array.from(room.getOfferItems(0)).map(e => [e.item.itemId, e.item.quantity] as [number, number]);
    const itemsBtoA = Array.from(room.getOfferItems(1)).map(e => [e.item.itemId, e.item.quantity] as [number, number]);
    if (!invB.canAddItemsByIdQty(itemsAtoB) || !invA.canAddItemsByIdQty(itemsBtoA)) {
      MiniRoomHandler.cancelTrade(room, 'Trade failed: not enough inventory space.');
      return;
    }

    // Transfer mesos.
    invA.gainMoney(-offerA.mesos);
    invA.gainMoney(offerB.mesos);
    invB.gainMoney(-offerB.mesos);
    invB.gainMoney(offerA.mesos);

    // Transfer items.
    const opsA: InventoryOperation[] = [];
    const opsB: InventoryOperation[] = [];

    for (const entry of room.getOfferItems(0)) {
      const addOps = invB.addItem(entry.item);
      if (addOps) opsB.push(...addOps);
    }
    for (const entry of room.getOfferItems(1)) {
      const addOps = invA.addItem(entry.item);
      if (addOps) opsA.push(...addOps);
    }

    userA.write(inventoryOperation(opsA, false));
    userB.write(inventoryOperation(opsB, false));

    userA.write(statChangedPacket(Stat.MONEY, invA.money));
    userB.write(statChangedPacket(Stat.MONEY, invB.money));

    userA.write(MiniRoomPacket.success());
    userB.write(MiniRoomPacket.success());

    tradeManager.removeRoom(room.tradeId);
  }

  private static cancelTrade(room: TradeRoom, message: string): void {
    const [userA, userB] = room.getUsers();
    if (userA) {
      MiniRoomHandler.returnOfferItems(userA, room, 0);
      userA.write(MessagePacket.system(message));
    }
    if (userB) {
      MiniRoomHandler.returnOfferItems(userB, room, 1);
      userB.write(MessagePacket.system(message));
    }
    tradeManager.removeRoom(room.tradeId);
  }

  private static returnOfferItems(user: User, room: TradeRoom, index: number): boolean {
    const items: TradeOfferItem[] = [];
    for (const entry of room.getOfferItems(index)) {
      items.push(entry);
    }
    return MiniRoomHandler.returnItemsToOwner(user, items);
  }

  private static returnItemsToOwner(user: User, items: TradeOfferItem[]): boolean {
    const invManager = user.getCharacterData()?.inventoryManager;
    if (!invManager) return false;

    const ops: InventoryOperation[] = [];
    for (const entry of items) {
      const addOps = invManager.addItem(entry.item);
      if (!addOps) return false;
      ops.push(...addOps);
    }
    if (ops.length > 0) {
      user.write(inventoryOperation(ops, false));
    }
    return true;
  }

  private static takeItemForTrade(
    invManager: InventoryManager,
    invPos: number,
    itemId: number,
    quantity: number,
    rawItemType: number,
  ): TakeItemResult | null {
    if (quantity < 1) return null;
    const invType = inventoryTypeByItemId(itemId);
    const inv = invManager.getInventoryByType(invType);
    const item = inv.getItem(invPos);
    if (!item || item.itemId !== itemId || item.quantity < quantity) return null;

    const itemType = itemTypeByValue(rawItemType);
    if (itemType !== null && item.itemType !== itemType) return null;

    const info = ItemProvider.getItemInfo(itemId);
    if (info?.isTradeBlock(item)) return null;

    const ops: InventoryOperation[] = [];
    if (item.quantity > quantity) {
      item.quantity -= quantity;
      const traded = item.copy();
      traded.quantity = quantity;
      ops.push(InventoryOperation.itemNumber(invType, invPos, item.quantity));
      return { item: traded, invType, ops };
    } else {
      const removed = inv.removeItem(invPos);
      if (!removed) return null;
      ops.push(InventoryOperation.delItem(invType, invPos));
      return { item: removed, invType, ops };
    }
  }

  private static getUserByName(name: string): User | null {
    const cs = MiniRoomHandler.channelServerOverride
      ?? (require('../../server/channel/channelServer').ChannelServer.instance ?? null);
    return cs?.getUserByCharacterName(name) ?? null;
  }
}
