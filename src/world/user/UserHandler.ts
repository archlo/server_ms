import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { ChannelServer } from '../../server/channel/channelServer';
import { User, statChangedPacket, statChangedMapPacket } from './User';
import { ChatType } from './ChatType';
import { UserPacket } from './UserPacket';
import { UserRemote } from './UserRemote';
import { DragonPacket } from './DragonPacket';
import { UserLocal } from './UserLocal';
import { MovePath } from '../field/life/MovePath';
import { Stat } from './stat/Stat';
import { CharacterTemporaryStat } from './stat/CharacterTemporaryStat';
import { ItemConstants } from '../item/ItemConstants';
import { ItemSpecType } from '../../provider/item/ItemSpecType';
import { ItemProvider } from '../../provider/ItemProvider';
import { Drop } from '../field/drop/Drop';
import { DropOwnType } from '../field/drop/DropOwnType';
import { DropPacket } from '../field/drop/DropPacket';
import { DropEnterType } from '../field/drop/DropEnterType';
import { GameConstants } from '../GameConstants';
import { InventoryType, inventoryTypeByPosition, inventoryTypeByItemId } from '../item/InventoryType';
import { InventoryOperation } from '../item/InventoryOperation';
import { InventoryManager } from '../item/InventoryManager';
import { Item } from '../item/Item';
import { ItemType } from '../item/ItemType';
import { BodyPart, bodyPartsByItemId } from '../item/BodyPart';
import { inventoryOperation, gatherItemResult, sortItemResult } from '../item/ItemPacket';
import { SingleMacro } from './data/SingleMacro';
import { FuncKeyMapped } from './data/FuncKeyMapped';
import { getFuncKeyTypeByValue, FuncKeyType } from './data/FuncKeyType';
import { PopularityRecord } from './data/PopularityRecord';
import { PopularityResultType } from './data/PopularityResultType';
import { givePopularityResult, characterInfo } from './WvsContext';
import { MessagePacket } from './MessagePacket';
import { ScriptManager } from '../script/ScriptManager';
import { CommandProcessor } from '../../server/command/CommandProcessor';
import { temporaryStatSetPacket } from './User';
import { TemporaryStatOption } from './stat/TemporaryStatOption';
import { Util } from '../../util/Util';
import { ItemRewardInfo } from '../../provider/item/ItemRewardInfo';
import { FamilyPacket } from '../family/FamilyPacket';
import { Memo, MemoType, MemoRequestType, memoRequestTypeByValue, memoTypeByValue } from '../memo/Memo';
import { MemoPacket } from '../memo/MemoPacket';
import { MemoDB } from '../../server/channel/db/MemoDB';
import { CharacterDB } from '../../server/channel/db/CharacterDB';
import { PartyPacket } from '../party/PartyPacket';
import { ShopProvider } from '../../provider/ShopProvider';
import { openShopDialog } from '../../server/dialog/shop/ShopDialog';
import { NewYearCard } from './data/NewYearCard';

/**
 * Port of kinoko's UserHandler (subset).
 * NPC/inventory/quest/social/mini-room/item-maker handlers are deferred to
 * their owning systems (NPC dialog engine #15, ItemHandler #16, etc).
 * UserSkillUpRequest deferred to SkillHandler (#12) - needs
 * updatePassiveSkillData() and beginner-job sp bookkeeping not yet ported.
 */
export class UserHandler {
  static handleUserMove(user: User, r: PacketReader): void {
    r.readInt(); // 0
    r.readInt(); // 0
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    r.readInt(); // 0
    r.readInt(); // 0
    r.readInt(); // dwCrc
    r.readInt(); // 0
    r.readInt(); // Crc32

    const movePath = MovePath.decode(r);
    movePath.applyTo(user);
    user.getField()?.broadcastPacket(UserRemote.move(user, movePath), user);
  }

  static handleUserSitRequest(user: User, r: PacketReader): void {
    const fieldSeatId = r.readShort();
    user.setPortableChairId(0);
    user.write(UserLocal.sitResult(fieldSeatId !== -1, fieldSeatId));
    user.getField()?.broadcastPacket(UserRemote.setActivePortableChair(user, 0), user);
  }

  static handleUserPortableChairSitRequest(user: User, r: PacketReader): void {
    const itemId = r.readInt();
    if (!ItemConstants.isPortableChairItem(itemId)) {
      user.dispose();
      return;
    }
    user.setPortableChairId(itemId);
    user.getField()?.broadcastPacket(UserRemote.setActivePortableChair(user, itemId), user);
    user.dispose();
  }

  static handleUserChat(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const text = r.readMapleAsciiString();
    const onlyBalloon = r.readBoolean();
    // GM/admin command interception (port of kinoko CommandProcessor).
    // `!`-prefixed messages from GM accounts are treated as commands and
    // never broadcast as normal chat; non-GM `!` messages fall through.
    if (CommandProcessor.isCommand(text)) {
      if (user.isGm()) {
        CommandProcessor.tryProcessCommand(user, text);
        return;
      }
    }
    user.getField()?.broadcastPacket(UserPacket.userChat(user, ChatType.NORMAL, text, onlyBalloon));
  }

  static handleUserAdBoardClose(user: User, r: PacketReader): void {
    user.setAdBoard(null);
    user.getField()?.broadcastPacket(UserPacket.userAdBoard(user, null));
  }

  static handleUserEmotion(user: User, r: PacketReader): void {
    const emotion = r.readInt();
    const duration = r.readInt();
    const isByItemOption = r.readBoolean();
    user.getField()?.broadcastPacket(UserRemote.emotion(user, emotion, duration, isByItemOption), user);
  }

  static handleUserActivateEffectItem(user: User, r: PacketReader): void {
    const itemId = r.readInt();
    if (itemId !== 0 && !ItemConstants.isCashEffectItem(itemId) && !ItemConstants.isNonCashEffectItem(itemId)) {
      user.dispose();
      return;
    }
    user.setEffectItemId(itemId);
    user.getField()?.broadcastPacket(UserRemote.setActiveEffectItem(user, itemId), user);
  }

  static handleUserUpgradeTombEffect(user: User, r: PacketReader): void {
    const itemId = r.readInt(); // 5510000 (Wheel of Destiny)
    const x = r.readInt();
    const y = r.readInt();
    user.getField()?.broadcastPacket(UserRemote.showUpgradeTombEffect(user, itemId, x, y), user);
  }

  // ---- STAT HANDLERS ----------------------------------------------------

  static handleUserAbilityUpRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const flag = r.readInt(); // dwFlag
    const stat: Stat | undefined = flag in Stat ? (flag as Stat) : undefined;
    if (stat === undefined || !isAbilityUpStat(stat)) {
      user.dispose();
      return;
    }
    const cs = user.getCharacterStat();
    if (cs.ap < 1) {
      user.dispose();
      return;
    }
    if (!cs.isValidAp(stat, 1)) {
      user.dispose();
      return;
    }
    const addApResult = cs.addAp(stat, cs.baseInt);
    cs.ap -= 1;
    addApResult.set(Stat.AP, cs.ap);
    user.validateStat();
    user.write(statChangedMapPacket(addApResult));
  }

  static handleUserAbilityMassUpRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const size = r.readInt();
    const stats = new Map<Stat, number>();
    for (let i = 0; i < size; i++) {
      const flag = r.readInt(); // dwStatFlag
      const value = r.readInt(); // nValue
      const stat: Stat | undefined = flag in Stat ? (flag as Stat) : undefined;
      if (stat === undefined || !isAbilityUpStat(stat)) {
        user.dispose();
        return;
      }
      stats.set(stat, value);
    }
    const cs = user.getCharacterStat();
    let requiredAp = 0;
    for (const v of stats.values()) requiredAp += v;
    if (cs.ap < requiredAp) {
      user.dispose();
      return;
    }
    for (const [stat, value] of stats) {
      if (!cs.isValidAp(stat, value)) {
        user.dispose();
        return;
      }
    }
    const addApResult = new Map<Stat, any>();
    for (const [stat, value] of stats) {
      for (let i = 0; i < value; i++) {
        const result = cs.addAp(stat, cs.baseInt);
        for (const [k, v] of result) addApResult.set(k, v);
      }
    }
    cs.ap -= requiredAp;
    addApResult.set(Stat.AP, cs.ap);
    user.validateStat();
    user.write(statChangedMapPacket(addApResult));
  }

  static handleUserChangeStatRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const mask = r.readInt(); // 0x1400
    if (mask !== 0x1400) {
      return;
    }
    const hp = r.readShort() & 0xFFFF; // nHP
    const mp = r.readShort() & 0xFFFF; // nMP
    if (hp > 0) {
      user.addHp(hp);
    }
    if (mp > 0) {
      user.addMp(mp);
    }
  }

  // ---- OTHER HANDLERS -----------------------------------------------------

  static handleUserDropMoneyRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const money = r.readInt(); // nAmount
    const im = user.getInventoryManager();
    if (money <= 0 || !im.addMoney(-money)) {
      user.dispose();
      return;
    }
    const field = user.getField();
    const drop = Drop.money(DropOwnType.NOOWN, user, money, user.getCharacterId());
    field?.addDrop(drop, user.getX(), user.getY() - GameConstants.DROP_HEIGHT);
    field?.broadcastPacket(DropPacket.dropEnterField(drop, DropEnterType.CREATE, 0));
    user.write(statChangedPacket(Stat.MONEY, im.money));
  }

  // ---- INVENTORY MANAGEMENT HANDLERS ------------------------------------

  static handleUserGatherItemRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const type = r.readByte();
    const inventoryType = type >= 0 && type <= 5 ? (type as InventoryType) : null;
    if (inventoryType === null || inventoryType === InventoryType.EQUIPPED) {
      user.dispose();
      return;
    }
    const im = user.getInventoryManager();
    const inventory = im.getInventoryByType(inventoryType);
    // Find stackable items: itemId -> [[position, item], ...]
    const stackable = new Map<number, Array<[number, Item]>>();
    for (const [pos, item] of inventory.getItems()) {
      if (item.itemType !== ItemType.BUNDLE || ItemConstants.isRechargeableItem(item.itemId)) continue;
      const itemInfo = ItemProvider.getItemInfo(item.itemId);
      if (!itemInfo || itemInfo.getSlotMax() <= 1) continue;
      if (!stackable.has(item.itemId)) stackable.set(item.itemId, []);
      stackable.get(item.itemId)!.push([pos, item]);
    }
    // Build operations
    const ops: InventoryOperation[] = [];
    for (const [itemId, items] of stackable) {
      if (items.length <= 1) continue;
      const slotMax = ItemProvider.getItemInfo(itemId)?.getSlotMax() ?? 0;
      const sorted = items.sort((a, b) => a[0] - b[0]);
      let total = sorted.reduce((sum, [, item]) => sum + item.quantity, 0);
      for (const [pos] of sorted) {
        if (total > slotMax) {
          ops.push(InventoryOperation.itemNumber(inventoryType, pos, slotMax));
          total -= slotMax;
        } else {
          if (total > 0) {
            ops.push(InventoryOperation.itemNumber(inventoryType, pos, total));
            total = 0;
          } else {
            ops.push(InventoryOperation.delItem(inventoryType, pos));
          }
        }
      }
    }
    im.applyInventoryOperations(ops);
    user.write(inventoryOperation(ops, true));
    user.write(gatherItemResult(inventoryType));
  }

  static handleUserSortItemRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const type = r.readByte();
    const inventoryType = type >= 0 && type <= 5 ? (type as InventoryType) : null;
    if (inventoryType === null || inventoryType === InventoryType.EQUIPPED) {
      user.dispose();
      return;
    }
    const im = user.getInventoryManager();
    // Build array indexed by position (positions are 1-based in client)
    const items: (Item | undefined)[] = new Array(GameConstants.INVENTORY_SLOT_MAX);
    for (const [pos, item] of im.getInventoryByType(inventoryType).getItems()) {
      items[pos - 1] = item;
    }
    // Selection sort: by itemId (asc), then quantity (desc)
    const ops: InventoryOperation[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      let k = i;
      for (let j = i + 1; j < items.length; j++) {
        if (items[j] === undefined) continue;
        if (items[k] === undefined ||
            items[j]!.itemId < items[k]!.itemId ||
            (items[j]!.itemId === items[k]!.itemId &&
             items[j]!.quantity > items[k]!.quantity)) {
          k = j;
        }
      }
      const temp = items[k];
      items[k] = items[i];
      items[i] = temp;
      ops.push(InventoryOperation.position(inventoryType, k + 1, i + 1));
    }
    im.applyInventoryOperations(ops);
    user.write(inventoryOperation(ops, true));
    user.write(sortItemResult(inventoryType));
  }

  static handleUserChangeSlotPositionRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const type = r.readByte();
    const inventoryType = type >= 0 && type <= 5 ? (type as InventoryType) : null;
    if (inventoryType === null) {
      user.dispose();
      return;
    }
    const oldPos = r.readShort();
    const newPos = r.readShort();
    const count = r.readShort();

    const im = user.getInventoryManager();
    const inventory = im.getInventoryByType(inventoryTypeByPosition(inventoryType, oldPos));
    const item = inventory.getItem(oldPos);
    if (!item) {
      user.dispose();
      return;
    }
    const itemInfo = ItemProvider.getItemInfo(item.itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }

    if (newPos === 0) {
      // Drop item
      const dropEnterType = (itemInfo.isTradeBlock(item) || itemInfo.isAccountSharable())
        ? DropEnterType.FADING_OUT : DropEnterType.CREATE;
      if (item.itemType === ItemType.BUNDLE && !ItemConstants.isRechargeableItem(item.itemId) &&
          item.quantity > count) {
        // Partial drop
        item.quantity -= count;
        user.write(inventoryOperation(InventoryOperation.itemNumber(inventoryType, oldPos, item.quantity), true));
        const partialItem = item.copy();
        partialItem.itemSn = user.getNextItemSn();
        partialItem.quantity = count;
        partialItem.setPossibleTrading(false);
        const drop = Drop.item(DropOwnType.NOOWN, user, partialItem, user.getCharacterId());
        user.getField()?.addDrop(drop, user.getX(), user.getY() - GameConstants.DROP_HEIGHT);
        user.getField()?.broadcastPacket(DropPacket.dropEnterField(drop, dropEnterType, 0));
      } else {
        // Full drop
        if (!inventory.removeItemExact(oldPos, item)) {
          user.dispose();
          return;
        }
        user.write(inventoryOperation(InventoryOperation.delItem(inventoryType, oldPos), true));
        item.setPossibleTrading(false);
        const drop = Drop.item(DropOwnType.NOOWN, user, item, user.getCharacterId());
        user.getField()?.addDrop(drop, user.getX(), user.getY() - GameConstants.DROP_HEIGHT);
        user.getField()?.broadcastPacket(DropPacket.dropEnterField(drop, dropEnterType, 0));
      }
    } else {
      // Move / equip / merge / swap
      const secondInventoryType = inventoryTypeByPosition(inventoryType, newPos);
      const secondInventory = im.getInventoryByType(secondInventoryType);

      if (secondInventoryType === InventoryType.EQUIPPED) {
        // Equipping
        const absPos = Math.abs(newPos);
        const isCash = absPos >= BodyPart.CASH_BASE && absPos < BodyPart.CASH_END;
        const partValue = isCash ? absPos - BodyPart.CASH_BASE : absPos;
        if (!isCorrectBodyPart(item.itemId, partValue, user.getGender())) {
          user.dispose();
          return;
        }
        // Move exclusive equip item to inventory
        const exclusiveBodyPart = getExclusiveEquipItemBodyPart(secondInventory, item.itemId, isCash);
        if (exclusiveBodyPart !== null) {
          const exclusiveItemPosition = exclusiveBodyPart + (isCash ? BodyPart.CASH_BASE : 0);
          const exclusiveEquipItem = secondInventory.getItem(exclusiveItemPosition);
          if (!exclusiveEquipItem) {
            user.dispose();
            return;
          }
          const availablePosition = InventoryManager.getAvailablePosition(im.equipInventory);
          if (availablePosition === null) {
            user.dispose();
            return;
          }
          if (!secondInventory.removeItemExact(exclusiveItemPosition, exclusiveEquipItem)) {
            user.dispose();
            return;
          }
          im.equipInventory.putItem(availablePosition, exclusiveEquipItem);
          user.write(inventoryOperation(
            InventoryOperation.position(InventoryType.EQUIP, -exclusiveItemPosition, availablePosition), false));
        }
        // Bind on equip
        if (itemInfo.isEquipTradeBlock() && !item.hasAttribute(0x08)) {
          item.addAttribute(0x08);
          user.write(inventoryOperation(InventoryOperation.newItem(InventoryType.EQUIP, oldPos, item), false));
        }
      } else if (secondInventory.getSize() < newPos) {
        user.dispose();
        return;
      }

      const secondItem = secondInventory.getItem(newPos);
      if (secondItem && secondItem.itemId === item.itemId &&
          item.itemType === ItemType.BUNDLE && !ItemConstants.isRechargeableItem(item.itemId) &&
          item.quantity < itemInfo.getSlotMax() && secondItem.quantity < itemInfo.getSlotMax()) {
        // Merge bundles
        const combined = item.quantity + secondItem.quantity;
        if (combined <= itemInfo.getSlotMax()) {
          if (!inventory.removeItemExact(oldPos, item)) {
            user.dispose();
            return;
          }
          secondItem.quantity = combined;
          user.write(inventoryOperation([
            InventoryOperation.position(inventoryType, oldPos, newPos),
            InventoryOperation.delItem(inventoryType, oldPos),
            InventoryOperation.itemNumber(secondInventoryType, newPos, secondItem.quantity),
          ], true));
        } else {
          item.quantity = combined - itemInfo.getSlotMax();
          secondItem.quantity = itemInfo.getSlotMax();
          user.write(inventoryOperation([
            InventoryOperation.position(inventoryType, oldPos, newPos),
            InventoryOperation.itemNumber(inventoryType, oldPos, item.quantity),
            InventoryOperation.itemNumber(secondInventoryType, newPos, secondItem.quantity),
          ], true));
        }
      } else {
        // Swap positions
        inventory.putItem(oldPos, secondItem ?? null);
        secondInventory.putItem(newPos, item);
        user.write(inventoryOperation(InventoryOperation.position(inventoryType, oldPos, newPos), true));
      }
    }
    // Post-update for equip tab changes
    if (inventoryType === InventoryType.EQUIP) {
      user.validateStat();
      user.getField()?.broadcastPacket(UserRemote.avatarModified(user), user);
    }
  }

  static handleUserMacroSysDataModified(user: User, r: PacketReader): void {
    const size = r.readByte();
    const macros: SingleMacro[] = [];
    for (let i = 0; i < size; i++) {
      macros.push(SingleMacro.decode(r));
    }
    user.getConfigManager().updateMacroSysData(macros);
  }

  static handleFuncKeyMappedModified(user: User, r: PacketReader): void {
    const size = r.readByte();
    const updates = new Map<number, FuncKeyMapped>();
    for (let i = 0; i < size; i++) {
      const key = r.readByte();
      const type = r.readByte();
      const id = r.readInt();
      const ft = getFuncKeyTypeByValue(type) ?? FuncKeyType.NONE;
      updates.set(key, FuncKeyMapped.of(ft, id));
    }
    user.getConfigManager().updateFuncKeyMap(updates);
  }

  static handleQuickslotKeyMappedModified(user: User, r: PacketReader): void {
    const quickslot = new Array<number>(GameConstants.QUICKSLOT_KEY_MAP_SIZE);
    for (let i = 0; i < quickslot.length; i++) {
      quickslot[i] = r.readByte();
    }
    user.getConfigManager().updateQuickslotKeyMap(quickslot);
  }

  static handleUserPortalTeleportRequest(user: User, r: PacketReader): void {
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    r.readMapleAsciiString(); // portal name
    r.readShort(); // x
    r.readShort(); // y
    r.readShort(); // portal x
    r.readShort(); // portal y
    // position is updated via USER_MOVE packets
  }

  static handleUserPortalScriptRequest(user: User, r: PacketReader): void {
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }

    const portalName = r.readMapleAsciiString();
    const field = user.getField();
    const portal = field?.getPortalByName(portalName);
    if (!field || !portal || portal.script === '') {
      user.dispose();
      return;
    }

    if (!ScriptManager.startPortalScript(user, field, portal.script)) {
      user.dispose();
    }
  }

  static handleUserGivePopularityRequest(user: User, r: PacketReader): void {
    const targetId = r.readInt();
    const inc = r.readBoolean();

    if (user.getLevel() < 15) {
      user.write(givePopularityResult(PopularityResultType.LevelLow));
      return;
    }

    const pr = user.getCharacterData().popularityRecord;
    if (pr.hasGivenPopularityToday()) {
      user.write(givePopularityResult(PopularityResultType.AlreadyDoneToday));
      return;
    }
    if (pr.hasGivenPopularityTarget(targetId)) {
      user.write(givePopularityResult(PopularityResultType.AlreadyDoneTarget));
      return;
    }

    const target = user.getField()?.getUserPool().getById(targetId);
    if (!target) {
      user.write(MessagePacket.system('Unable to find the character.'));
      return;
    }

    target.addPop(inc ? 1 : -1);
    pr.addRecord(targetId, Date.now());

    target.write(givePopularityResult(PopularityResultType.Notify, user.getCharacterName(), inc));
    user.write(givePopularityResult(PopularityResultType.Success, target.getCharacterName(), inc, target.getPop()));
  }

  static handleUserCharacterInfoRequest(user: User, r: PacketReader): void {
    r.readInt(); // update time
    const characterId = r.readInt();
    r.readBoolean(); // bPetInfo

    const target = user.getField()?.getUserPool().getById(characterId);
    if (!target) {
      user.dispose();
      return;
    }
    user.write(characterInfo(target));
  }

  // ---- DRAGON -----------------------------------------------------------

  static handleUserDragonMove(user: User, r: PacketReader): void {
    user.getField()?.broadcastPacket(DragonPacket.dragonMove(user, MovePath.decode(r)), user);
  }

  // ---- PASSIVE SKILL INFO UPDATE ---------------------------------------

  static handlePassiveSkillInfoUpdate(user: User, _r: PacketReader): void {
    user.updatePassiveSkillData();
  }

  // ---- MAP TRANSFER -----------------------------------------------------

  static handleUserMapTransferRequest(user: User, r: PacketReader): void {
    const fieldId = r.readInt();
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) return;
    switch (fieldId) {
      case 0: { // Register current map
        const curFieldId = user.getField()?.getMapId() ?? 0;
        if (curFieldId === 0) return;
        user.getConfigManager().addMapTransfer(curFieldId);
        break;
      }
      case -1: { // Delete all registered maps
        user.getConfigManager().clearMapTransfers();
        break;
      }
      default: { // Delete specific map
        user.getConfigManager().removeMapTransfer(fieldId);
        break;
      }
    }
    user.write(UserLocal.mapTransferResult(user.getConfigManager().getMapTransfers()));
  }

  // ---- TOWN PORTAL ------------------------------------------------------

  static handleEnterTownPortalRequest(user: User, r: PacketReader): void {
    const ownerId = r.readInt(); // dwCharacterId
    r.readBoolean();
    const field = user.getField();
    if (!field) {
      user.dispose();
      return;
    }
    const townPortal = field.getTownPortalPool().getById(ownerId);
    if (!townPortal) {
      user.dispose();
      return;
    }
    // Port of kinoko: townPortalId = 0x80 | owner.getTownPortalIndex() (CUserLocal::Init)
    const townPortalId = 0x80 | townPortal.getOwner().getTownPortalIndex();
    if (townPortal.townField === field) {
      // Entering from the town side -> warp to the priest's field portal position
      user.warpTo(townPortal.getField(), townPortal.getX(), townPortal.getY(), townPortalId, false, false);
    } else {
      // Entering from the field side -> warp to the town's town-portal point
      const portalInfo = townPortal.getTownPortalPoint();
      user.warpTo(townPortal.townField, portalInfo.x, portalInfo.y, townPortalId, false, false);
    }
  }

  // ---- OPEN GATE --------------------------------------------------------

  static handleEnterOpenGateRequest(user: User, r: PacketReader): void {
    const objectId = r.readInt();
    r.readInt(); // 0
    const field = user.getField();
    if (!field) return;
    const gate = field.getOpenGate(objectId);
    if (!gate) return;
    const fs = field.getFieldStorage();
    if (!fs) return;
    const target = fs.getFieldById(gate.targetFieldId);
    if (!target) return;
    const portal = target.getPortalByName(gate.targetPortalName) ?? target.getRandomStartPoint();
    if (!portal) return;
    user.warp(target, portal, true, false);
  }

  // ---- CHANGE STAT BY ITEM OPTION ---------------------------------------

  static handleUserChangeStatRequestByItemOption(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const mask = r.readInt();
    const hp = r.readShort() & 0xFFFF;
    const mp = r.readShort() & 0xFFFF;
    if (hp > 0) user.addHp(hp);
    if (mp > 0) user.addMp(mp);
  }

  // ---- MEMO -------------------------------------------------------------
  // Port of kinoko's UserHandler::handleMemoRequest (InHeader.MemoRequest).
  // The Send path in kinoko is tied to the CashShop gift system; since that
  // is not yet ported, Send here resolves the receiver by name and creates
  // the memo directly (gift validation is skipped).

  static async handleMemoRequest(user: User, r: PacketReader): Promise<void> {
    const type = r.readByte();
    const requestType = memoRequestTypeByValue(type);
    switch (requestType) {
      case MemoRequestType.Send: {
        // CCashShop::OnCashItemResLoadGiftDone
        const receiverName = r.readNullTerminatedAsciiString(); // sReceiverName
        const message = r.readNullTerminatedAsciiString();      // sMsg
        const flag = r.readByte();                              // nFlag
        const _index = r.readInt();                             // nIdx
        const _itemSn = r.readLong();                           // GW_GiftList->liSN
        const memoType = memoTypeByValue(flag);
        if (memoType === null) {
          ChannelServer.instance?.logger.warn(`handleMemoRequest: unknown memo type ${flag} from char ${user.getCharacterId()}`);
          user.dispose();
          return;
        }
        // Resolve receiver character by name (gift validation skipped — no CashShop port).
        const receiverId = await CharacterDB.findCharacterIdByName(receiverName);
        if (receiverId === null) {
          user.write(MemoPacket.sendWarningName()); // Please check the name of the receiving character.
          return;
        }
        // Allocate a new memo id and persist.
        const memoId = await MemoDB.nextMemoId();
        if (memoId === null) {
          user.write(MemoPacket.sendWarningName());
          return;
        }
        const memo = new Memo(
          memoType,
          memoId,
          user.getCharacterName(),
          message,
          new Date(),
        );
        if (!await MemoDB.newMemo(memo, receiverId)) {
          return;
        }
        // user.write(MemoPacket.sendSucceed()); // memo result not required (kinoko)
        // Notify memo recipient if currently online (single-process: direct lookup).
        const receiver = ChannelServer.instance?.getUserByCharacterId(receiverId);
        if (receiver) {
          receiver.write(MemoPacket.receive());
        }
        return;
      }
      case MemoRequestType.Delete: {
        // CMemoListDlg::SetRet
        const size = r.readByte();                                   // size
        r.readByte();                                                // # of INVITATION memos (slots required)
        r.readByte();                                                // nEmptySlotCount
        for (let i = 0; i < size; i++) {
          const memoId = r.readInt();                                // dwSN
          const flag = r.readByte();                                 // nFlag
          const memoType = memoTypeByValue(flag);
          if (!await MemoDB.deleteMemo(memoId, user.getCharacterId())) {
            ChannelServer.instance?.logger.error(`handleMemoRequest: failed to delete memo ${memoId} from DB`);
            return;
          }
          user.removeMemo(memoId);
          if (memoType === MemoType.INVITATION) {
            const marriageId = r.readInt();                          // atoi(strMarriageNo)
            ChannelServer.instance?.logger.warn(`handleMemoRequest: unhandled Marriage invitation memo for marriage ID ${marriageId}`);
          } else if (memoType === MemoType.INCPOP) {
            user.addPop(1);
            user.write(MessagePacket.incPop(1));
          }
        }
        return;
      }
      case MemoRequestType.Load: {
        // CWvsContext::OnMemoNotify_Receive
        const memos = await MemoDB.getMemosByCharacterId(user.getCharacterId());
        user.setMemos(memos);
        user.write(MemoPacket.load(memos));
        return;
      }
      default: {
        ChannelServer.instance?.logger.warn(`handleMemoRequest: unknown memo request type ${type}`);
      }
    }
  }

  // ---- TALK TO TUTOR ----------------------------------------------------

  static handleTalkToTutor(user: User, r: PacketReader): void {
    r.readInt(); // npcId
    r.readByte(); // 0
    r.readMapleAsciiString(); // message — no-op tutorial response
  }

  // ---- UPDATE SCREEN SETTING --------------------------------------------

  static handleUpdateScreenSetting(user: User, _r: PacketReader): void {
    // No-op port of kinoko
  }

  // ---- UPDATE GM BOARD --------------------------------------------------

  static handleUpdateGmBoard(user: User, _r: PacketReader): void {
    // No-op port of kinoko
  }

  // ---- USER HP SYNC -----------------------------------------------------

  static handleUserHp(user: User, r: PacketReader): void {
    const hp = r.readInt();
    const mp = r.readInt();
    if (hp < 0 || hp > user.getMaxHp()) return;
    if (mp < 0 || mp > user.getMaxMp()) return;
    user.getCharacterStat().hp = Math.max(0, Math.min(hp, user.getMaxHp()));
    user.getCharacterStat().mp = Math.max(0, Math.min(mp, user.getMaxMp()));
  }

  // ---- UNHANDLED OPCODE STUBS -------------------------------------------
  // Ported from kinoko UserHandler.java; most are no-ops that consume
  // the packet to prevent client desync or log-spam.

  static handleUserAttackUser(user: User, r: PacketReader): void {
    r.readInt(); r.readByte(); r.readInt(); r.readByte();
    r.readByte(); r.readByte(); r.readInt();
    // PvP attack — no PvP system ported
  }

  static handlePremium(user: User, r: PacketReader): void {
    r.readByte(); // type — no PC Bang system; acknowledge with failure
    user.write(UserLocal.premiumResult());
  }

  static handleUserBanMapByMob(user: User, r: PacketReader): void {
    const mobId = r.readInt();
    const field = user.getField();
    if (user.getHp() <= 0) {
      const returnMap = field?.getReturnMap() ?? 0;
      const portal = field?.getRandomStartPoint();
      const fs = field?.getFieldStorage();
      const target = fs?.getFieldById(returnMap);
      if (target && portal) user.warp(target, portal, true, false);
    }
  }

  static handleUserMonsterBookSetCover(user: User, r: PacketReader): void {
    const cardId = r.readInt();
    user.getCharacterData().monsterBookCover = cardId;
  }

  static handleUserRemoteShopOpenRequest(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // shopName — no HiredMerchant system; fail gracefully
    user.write(UserLocal.destroyShopResult(false));
  }

  static handleUserEntrustedShopRequest(user: User, r: PacketReader): void {
    r.readByte(); // type — no commissioned store system; acknowledge with failure
    user.write(UserLocal.entrustShopCheckResult());
  }

  static handleUserStoreBankRequest(user: User, r: PacketReader): void {
    r.readByte(); // type — no store bank system; acknowledge with failure
    user.write(UserLocal.storeBankResult());
  }

  static handleUserParcelRequest(user: User, r: PacketReader): void {
    r.readByte(); // type — no parcel/delivery system; acknowledge with failure
    user.write(UserLocal.parcelResult());
  }

  static handleShopScannerRequest(user: User, r: PacketReader): void {
    r.readInt(); // itemId — no shop scanner system; return empty result
    user.write(UserLocal.shopScannerResult());
  }

  static handleShopLinkRequest(user: User, r: PacketReader): void {
    const npcTemplateId = r.readInt();
    user.write(UserLocal.shopLinkResult(npcTemplateId));
  }

  static handleAdminShopRequest(user: User, r: PacketReader): void {
    const npcTemplateId = r.readInt();
    const items = ShopProvider.getNpcShopItems(npcTemplateId);
    if (items.length > 0) {
      openShopDialog(user, npcTemplateId, items);
    }
  }

  static handleUserTemporaryStatUpdateRequest(user: User, _r: PacketReader): void {
    const ss = user.getSecondaryStat();
    const allStats = ss.getTemporaryStats();
    if (allStats.size > 0) {
      user.setTemporaryStats(new Map(allStats), 0);
    }
  }

  static handleUserAntiMacroItemUseRequest(user: User, r: PacketReader): void {
    const itemId = r.readInt();
    r.readInt(); // templateId
    const pos = r.readShort();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const item = im.consumeInventory.getItem(pos);
    if (!item || item.itemId !== itemId) { user.dispose(); return; }

    const consumeOp = im.removeItemAt(pos, item, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));
    user.write(UserLocal.antiMacroResult(true));
  }

  static handleUserAntiMacroSkillUseRequest(user: User, r: PacketReader): void {
    const skillId = r.readInt();
    r.readInt(); // templateId

    if (user.getHp() <= 0) { user.dispose(); return; }
    // Anti-macro skill use — cast the skill to verify human (no-op; skill system handles it)
    user.write(UserLocal.antiMacroResult(true));
  }

  static handleUserAntiMacroQuestionResult(user: User, r: PacketReader): void {
    const questionId = r.readShort();
    const answer = r.readMapleAsciiString();
    user.write(UserLocal.antiMacroResult(true));
  }

  static handleUserClaimRequest(user: User, r: PacketReader): void {
    r.readByte(); // type — no claim system; acknowledge with failure
    user.write(UserLocal.claimResult());
  }

  static handleUserSueCharacterRequest(user: User, r: PacketReader): void {
    const characterName = r.readMapleAsciiString();
    const target = ChannelServer.instance.getUserByCharacterName(characterName);
    // Sue requires target to exist — file report to server (no-op here)
    user.write(UserLocal.sueCharacterResult(target !== undefined));
  }

  static handleUserUseGachaponBoxRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const item = im.consumeInventory.getItem(position);
    if (!item || item.itemId !== itemId) { user.dispose(); return; }

    const rewardInfo = ItemProvider.getItemRewardInfo(itemId);
    if (!rewardInfo) { user.dispose(); return; }

    if (!rewardInfo.canAddReward(im)) {
      user.write(MessagePacket.system('You do not have enough inventory space.'));
      user.dispose(); return;
    }

    const rewardEntry = Util.getRandomFromCollection(rewardInfo.entries, (e) => e.probability);
    if (!rewardEntry) { user.dispose(); return; }

    const rewardItemInfo = ItemProvider.getItemInfo(rewardEntry.itemId);
    if (!rewardItemInfo) { user.dispose(); return; }

    const consumeOp = im.removeItemAt(position, item, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    const rewardItem = rewardItemInfo.createItem(user.getNextItemSn(), rewardEntry.count);
    if (rewardEntry.period > 0) {
      rewardItem.dateExpire = new Date(Date.now() + rewardEntry.period * 60000);
    }
    const addResult = im.addItem(rewardItem);
    if (!addResult) { user.dispose(); return; }
    user.write(inventoryOperation(addResult, true));

    const field = user.getField();
    if (field) {
      field.broadcastPacket(UserLocal.gachaponBoxResult(
        user.getCharacterId(), rewardEntry.itemId, rewardEntry.count, 0,
      ), user);
    }
  }

  static handleUserUseGachaponRemoteRequest(user: User, r: PacketReader): void {
    r.readInt(); r.readShort(); r.readInt();
    // No cash shop gachapon system — acknowledge with failure
    user.write(UserLocal.cashGachaponOpenResult(0, 0));
  }

  static handleUserUseWaterOfLife(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();
    r.readInt(); // petId

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const item = im.consumeInventory.getItem(position);
    if (!item || item.itemId !== itemId) { user.dispose(); return; }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) { user.dispose(); return; }

    const hpRecovery = itemInfo.getSpec(ItemSpecType.hp);
    const mpRecovery = itemInfo.getSpec(ItemSpecType.mp);

    if (hpRecovery <= 0 && mpRecovery <= 0) { user.dispose(); return; }

    const consumeOp = im.removeItemAt(position, item, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    if (hpRecovery > 0) {
      user.addHp(hpRecovery);
    }
    if (mpRecovery > 0) {
      user.addMp(mpRecovery);
    }
  }

  static handleUserFollowCharacterRequest(user: User, r: PacketReader): void {
    const targetId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const field = user.getField();
    if (!field) return;

    const target = field.getUserPool().getUserByCharacterId(targetId);
    if (!target) return;

    user.startFollowing(targetId);
  }

  static handleUserFollowCharacterWithdraw(user: User, _r: PacketReader): void {
    user.stopFollowing();
  }

  static handleUserSelectPqReward(user: User, r: PacketReader): void {
    r.readInt(); r.readByte(); // npcId, slot — no PQ system; fail gracefully
    user.write(PartyPacket.of(42).getPacket()); // ReceivePQReward = 42 (nack)
  }

  static handleUserRequestPqReward(user: User, r: PacketReader): void {
    r.readInt(); r.readByte(); r.readShort(); r.readInt(); // npcId, slot, index, itemId
    user.write(PartyPacket.of(43).getPacket()); // FailToRequestPQReward = 43 (nack)
  }

  static handleSetPassengerResult(user: User, r: PacketReader): void {
    const result = r.readByte();
    const field = user.getField();
    if (field) {
      field.broadcastPacket(UserLocal.setPassengerResult(user.getCharacterId(), result), user);
    }
  }

  static handleCoupleMessage(user: User, r: PacketReader): void {
    const ringId = r.readInt();
    const text = r.readMapleAsciiString();
    r.readByte(); // type — no couple/ring registry; broadcast to field for visibility
    const field = user.getField();
    if (field) {
      field.broadcastPacket(UserLocal.coupleMessage(user.getCharacterName(), text, ringId), user);
    }
  }

  static handleExpeditionRequest(user: User, r: PacketReader): void {
    r.readByte(); r.readInt(); // type, expeditionId
  }

  static handlePartyAdverRequest(user: User, r: PacketReader): void {
    r.readByte(); // type
  }

  static handleAdmin(user: User, r: PacketReader): void {
    r.readInt(); r.readInt(); r.readByte(); r.readByte();
    // GM commands — no admin system ported
  }

  static handleLog(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // log message
  }

  static handleMemoFlagRequest(user: User, r: PacketReader): void {
    const memoId = r.readInt();
    // Mark memo as read by removing it
    user.removeMemo(memoId);
  }

  static handleSlideRequest(user: User, r: PacketReader): void {
    r.readInt(); // fieldId (ignored - user is already on this field)
    const direction = r.readByte(); // 0=right, 1=left

    if (user.getHp() <= 0) { user.dispose(); return; }

    const field = user.getField();
    if (!field) return;

    const SKILL_SLIDE_DISTANCE = 100;
    const currentX = user.getX();
    const currentY = user.getY();
    const newX = direction === 0 ? currentX + SKILL_SLIDE_DISTANCE : currentX - SKILL_SLIDE_DISTANCE;

    user.warpTo(field, newX, currentY, 0, false, false);
  }

  static handleRpsGame(user: User, r: PacketReader): void {
    const action = r.readByte();

    if (action === 0) {
      user.startRps();
      user.write(UserLocal.rpsGame(3, 0, 0));
    } else if (action === 1) {
      const throw_ = r.readByte();
      const rps = user.getRpsState();
      if (rps.state !== 'playing') {
        user.write(UserLocal.rpsGame(3, 0, 0));
        return;
      }

      const serverThrow = Math.floor(Math.random() * 3);
      let result: number;
      if (throw_ === serverThrow) {
        result = 2;
      } else if ((throw_ === 0 && serverThrow === 2) ||
                 (throw_ === 1 && serverThrow === 0) ||
                 (throw_ === 2 && serverThrow === 1)) {
        result = 1;
      } else {
        result = 0;
      }

      const wins = rps.wins + (result === 1 ? 1 : 0);
      const losses = rps.losses + (result === 0 ? 1 : 0);
      user.setRpsResult(wins, losses, throw_);
      user.write(UserLocal.rpsGame(4, wins, losses, throw_, serverThrow));
    } else if (action === 2) {
      const rps = user.getRpsState();
      user.write(UserLocal.rpsGame(0, rps.wins, rps.losses));
      user.resetRps();
    }
  }

  static handleMarriageRequest(user: User, r: PacketReader): void {
    r.readByte(); r.readInt(); // type, targetId — no marriage system; acknowledge failure
    user.write(UserLocal.marriageResult(false));
  }

  static handleWeddingWishListRequest(user: User, r: PacketReader): void {
    r.readInt(); // npcId
    const wishlist: number[] = [];
    for (let i = 0; i < 8; i++) {
      wishlist.push(r.readInt());
    }
    // Wishlist is persisted on the account, sent to client via WvsContext
    if (user.account) {
      user.account.wishlist = wishlist;
    }
  }

  static handleWeddingProgress(user: User, r: PacketReader): void {
    const step = r.readByte();
    user.write(UserLocal.weddingProgress(step));
  }

  static handleGuestBless(user: User, r: PacketReader): void {
    r.readInt(); // bless level — no wedding system; read and discard
  }

  static handleBoobyTrapAlert(user: User, r: PacketReader): void {
    r.readInt(); r.readByte(); r.readInt(); r.readInt();
  }

  static handleStalkBegin(user: User, r: PacketReader): void {
    const targetId = r.readInt();

    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.STALK_RESULT.getValue());

    const target = ChannelServer.instance?.getUserByCharacterId(targetId);
    if (!target) {
      w.writeByte(1); // failed
      user.write(w.getPacket());
      return;
    }

    w.writeByte(0); // success
    w.writeInt(target.getField()?.getFieldId() ?? 0);
    w.writeInt(target.getX());
    w.writeInt(target.getY());
    w.writeByte(target.getLevel());
    w.writeMapleAsciiString(target.getCharacterName());
    user.write(w.getPacket());
  }

  static handleFamilyChartRequest(user: User, r: PacketReader): void {
    r.readByte(); r.readInt(); r.readInt(); // type, characterId, familyId
    // No family system — send empty chart
    user.write(FamilyPacket.familyChartResult(0, 0, 0));
  }

  static handleFamilyInfoRequest(user: User, r: PacketReader): void {
    r.readInt(); // familyId
    // No family system — send empty info
    user.write(FamilyPacket.familyInfoResult('', 0));
  }

  static handleFamilyRegisterJunior(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // juniorName — no family system
  }

  static handleFamilyUnregisterJunior(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleFamilyUnregisterParent(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleFamilyJoinResult(user: User, r: PacketReader): void {
    const accepted = r.readBoolean();
    r.readMapleAsciiString(); // name
    // No family system — send join result ack
    user.write(FamilyPacket.familyJoinAccepted(accepted, ''));
  }

  static handleFamilyUsePrivilege(user: User, r: PacketReader): void {
    r.readByte(); // privilege — no family system
  }

  static handleFamilySetPrecept(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // precept — no family system
  }

  static handleFamilySummonResult(user: User, r: PacketReader): void {
    const accepted = r.readBoolean();
    // No family system — acknowledge
    user.write(FamilyPacket.familyResult(10)); // FamilyResultType.Delete = 10 (generic ack)
  }

  static handleChatBlockUserReq(user: User, r: PacketReader): void {
    const characterName = r.readMapleAsciiString().toLowerCase();
    const blocked = user.getCharacterData().chatBlockedList;
    const idx = blocked.indexOf(characterName);
    if (idx >= 0) {
      blocked.splice(idx, 1);
      user.write(MessagePacket.system(`'${characterName}' has been unblocked.`));
    } else {
      if (blocked.length >= 10) {
        user.write(MessagePacket.system('Your block list is full.'));
        return;
      }
      blocked.push(characterName);
      user.write(MessagePacket.system(`'${characterName}' has been blocked.`));
    }
  }

  static handleUserMigrateToItcRequest(user: User, _r: PacketReader): void {
    // ITC migration — no ITC server; fail gracefully
    user.write(UserLocal.itcResult());
  }

  static handleNewYearCardRequest(user: User, r: PacketReader): void {
    const action = r.readByte();
    if (action === 1) {
      const targetId = r.readInt();
      const message = r.readMapleAsciiString();
      const year = r.readInt();
      const targetUser = ChannelServer.instance?.getUserByCharacterId(targetId);
      if (targetUser) {
        targetUser.addNewYearCard(new NewYearCard(0, user.getCharacterId(), user.getCharacterName(), message, year, true));
      }
      user.write(UserLocal.newYearCardResult(1));
    }
  }

  static handleRandomMorphRequest(user: User, r: PacketReader): void {
    const itemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) { user.dispose(); return; }

    const morphRandom = itemInfo.getSpec(ItemSpecType.morphRandom);
    if (morphRandom <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const invType = inventoryTypeByItemId(itemId);
    const pos = r.readShort();
    const item = im.getInventoryByType(invType).getItem(pos);
    if (!item || item.itemId !== itemId) { user.dispose(); return; }

    const consumeOp = im.removeItemAt(pos, item, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    const duration = itemInfo.getSpec(ItemSpecType.time) * 1000;
    const morphOption = Math.floor(Math.random() * morphRandom);
    user.setTemporaryStat(CharacterTemporaryStat.Morph, TemporaryStatOption.of(morphOption, itemId, duration));
  }

  static handleCashGachaponOpenRequest(user: User, r: PacketReader): void {
    r.readInt(); // itemId — no cash shop gachapon system; acknowledge with failure
    user.write(UserLocal.cashGachaponOpenResult(0, 0));
  }

  static handleChangeMaplePointRequest(user: User, r: PacketReader): void {
    r.readByte(); r.readInt(); // type, amount — no NX conversion system; fail gracefully
    user.write(UserLocal.changeMaplePointResult(0));
  }

  static handleRequestIncCombo(user: User, r: PacketReader): void {
    const combo = r.readShort();
    const field = user.getField();
    if (field && combo > 0) {
      field.broadcastPacket(UserLocal.incCombo(combo), user);
    }
  }

  static handleRequestSessionValue(user: User, r: PacketReader): void {
    r.readInt(); // sessionValue type (not used — no session state persisted)
    user.write(UserLocal.sessionValueResult('', ''));
  }

  static handleAccountMoreInfo(user: User, r: PacketReader): void {
    r.readByte(); // type
    user.write(UserLocal.accountMoreInfoResult(0, 0));
  }

  static handleFindFriend(user: User, r: PacketReader): void {
    const name = r.readMapleAsciiString();
    const target = ChannelServer.instance.getUserByCharacterName(name);
    if (target) {
      user.write(UserLocal.findFriendResult(target.getCharacterId(), target.getCharacterName(), target.getLevel(), target.getJob()));
    } else {
      user.write(UserLocal.findFriendResult(0, '', 0, 0));
    }
  }

  static handleAcceptApspEvent(user: User, r: PacketReader): void {
    const accept = r.readBoolean();
    if (user.account) {
      user.account.acceptApspEvent = accept;
    }
  }

  static handleUserDragonBallBoxRequest(user: User, r: PacketReader): void {
    const itemId = r.readInt();
    const quantity = r.readShort();
    r.readInt(); // npcId

    if (user.getHp() <= 0) { user.dispose(); return; }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const invType = inventoryTypeByItemId(itemId);
    const position = r.readShort();
    const item = im.getInventoryByType(invType).getItem(position);
    if (!item || item.itemId !== itemId) { user.dispose(); return; }

    const consumeOp = im.removeItemAt(position, item, quantity);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    if (user.account && quantity > 0) {
      const pieces = user.account.dragonBallPieces;
      for (let i = 0; i < quantity; i++) {
        const piece = Math.floor(Math.random() * 7) + 1;
        if (!pieces.includes(piece)) {
          pieces.push(piece);
        }
      }
    }
  }

  static handleUserDragonBallSummonRequest(user: User, r: PacketReader): void {
    const skillId = r.readInt();
    r.readByte(); // stance

    if (user.getHp() <= 0) { user.dispose(); return; }

    const account = user.account;
    if (!account || account.dragonBallPieces.length < 7) {
      user.dispose();
      return;
    }
    // Clear pieces after successful summon
    account.dragonBallPieces = [];
  }

  static handleUserAttackUserSpecific(user: User, r: PacketReader): void {
    r.readInt(); r.readByte(); r.readInt(); r.readByte();
    r.readByte(); r.readByte(); r.readInt();
  }

  static handleUserRepeatEffectRemove(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleCheckSsn2OnCreateNewCharacter(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // ssn
  }

  static handleCheckSpwOnCreateNewCharacter(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // spw
  }

  static handleFirstSsnOnCreateNewCharacter(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // ssn
  }

  static handleRaiseRefresh(user: User, r: PacketReader): void {
    r.readInt(); // action
  }

  static handleRaiseUiState(user: User, r: PacketReader): void {
    r.readByte(); // action
  }

  static handleRaiseIncExp(user: User, r: PacketReader): void {
    r.readInt(); r.readInt();
  }

  static handleRaiseAddPiece(user: User, r: PacketReader): void {
    r.readInt(); r.readInt(); r.readInt(); r.readShort();
  }

  static handleSendMateMail(user: User, r: PacketReader): void {
    r.readMapleAsciiString(); // message
  }

  static handleRequestGuildBoardAuthKey(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleRequestConsultAuthKey(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleRequestClassCompetitionAuthKey(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleRequestWebBoardAuthKey(user: User, _r: PacketReader): void {
    // no-op
  }

  static handleBattleRecordOnOffRequest(user: User, r: PacketReader): void {
    const self = r.readBoolean();
    const party = r.readBoolean();
    user.write(UserLocal.battleRecordRequestResult(self, party));
  }

  static handleLogoutGiftSelect(user: User, r: PacketReader): void {
    const rewardItemId = r.readInt();
    // Logout gift selection — no reward system ported; acknowledge selection
  }
}

function isAbilityUpStat(stat: Stat): boolean {
  return stat === Stat.MHP || stat === Stat.MMP || stat === Stat.STR
    || stat === Stat.DEX || stat === Stat.INT || stat === Stat.LUK;
}

function isCorrectBodyPart(itemId: number, bodyPartValue: number, gender: number): boolean {
  return ItemConstants.isMatchedItemIdGender(itemId, gender)
    && [...bodyPartsByItemId(itemId)].some(bp => bp === bodyPartValue);
}

function getExclusiveEquipItemBodyPart(equipped: import('../item/Inventory').Inventory, itemId: number, isCash: boolean): number | null {
  const offset = isCash ? BodyPart.CASH_BASE : 0;
  const weapon = equipped.getItem(BodyPart.WEAPON + offset);
  const shield = equipped.getItem(BodyPart.SHIELD + offset);
  if (Math.floor(itemId / 100000) === 14 && shield) return BodyPart.SHIELD;
  if (Math.floor(itemId / 10000) === 109 && weapon && Math.floor(weapon.itemId / 100000) === 14) return BodyPart.WEAPON;

  const clothes = equipped.getItem(BodyPart.CLOTHES + offset);
  const pants = equipped.getItem(BodyPart.PANTS + offset);
  if (Math.floor(itemId / 10000) === 105 && pants) return BodyPart.PANTS;
  if (Math.floor(itemId / 10000) === 106 && clothes && Math.floor(clothes.itemId / 10000) === 105) return BodyPart.CLOTHES;

  return null;
}
