import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { statChangedPacket } from '../user/User';
import { UserPacket } from '../user/UserPacket';
import { GameConstants } from '../GameConstants';
import { inventoryOperation } from '../item/ItemPacket';
import { InventoryManager } from '../item/InventoryManager';
import { InventoryOperation } from '../item/InventoryOperation';
import { InventoryType, inventoryTypeByValue } from '../item/InventoryType';
import { Item } from '../item/Item';
import { ItemProvider } from '../../provider/ItemProvider';
import { Stat } from '../user/stat/Stat';
import { EnterResultType } from './EnterResultType';
import { MiniRoom } from './MiniRoom';
import { MiniRoomLeaveType } from './MiniRoomLeaveType';
import { MiniRoomPacket } from './MiniRoomPacket';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';
import { PlayerShopBuyResult } from './PlayerShopBuyResult';
import { PlayerShopItem } from './PlayerShopItem';

export class PersonalShop extends MiniRoom {
  private readonly items: PlayerShopItem[] = [];
  private readonly blockedList: string[] = [];
  private open = false;

  constructor(title: string) {
    super(title, null, 0);
  }

  getItems(): PlayerShopItem[] { return this.items; }
  getBlockedList(): string[] { return this.blockedList; }
  isOpen(): boolean { return this.open; }
  setOpen(open: boolean): void { this.open = open; }

  getOpenUserIndex(): number {
    for (let i = 0; i < this.getMaxUsers(); i++) {
      if (!this.getUsers().has(i)) return i;
    }
    return -1;
  }

  getType(): MiniRoomType { return MiniRoomType.PersonalShop; }
  getMaxUsers(): number { return 4; }

  handlePacket(user: User, mrp: MiniRoomProtocol, r: PacketReader): void {
    switch (mrp) {
      case MiniRoomProtocol.PSP_PutItem: {
        const targetType = r.readByte();
        const targetPosition = r.readShort();
        const setCount = r.readShort();
        const setSize = r.readShort();
        const price = r.readInt();
        const invType = inventoryTypeByValue(targetType);
        if (invType === null || invType === InventoryType.EQUIPPED ||
            targetPosition < 0 || setCount <= 0 || setSize <= 0 ||
            price <= 0 || this.items.length >= GameConstants.PLAYER_SHOP_SLOT_MAX ||
            this.isOpen() || !this.isOwner(user)) {
          console.error(`[PersonalShop] Received invalid personal shop action ${MiniRoomProtocol[mrp]}`);
          user.dispose();
          return;
        }
        const totalCount = setCount * setSize;
        const im = user.getInventoryManager();
        const inv = im.getInventoryByType(invType);
        const item = inv.getItem(targetPosition);
        if (!item || item.quantity < totalCount) {
          console.error(`[PersonalShop] Could not resolve item at inv ${invType} pos ${targetPosition}`);
          user.dispose();
          return;
        }
        const itemInfo = ItemProvider.getItemInfo(item.itemId);
        if (!itemInfo) {
          console.error(`[PersonalShop] Could not resolve item info for item ID ${item.itemId}`);
          user.dispose();
          return;
        }
        if (itemInfo.isTradeBlock(item) || itemInfo.isAccountSharable()) {
          console.error('[PersonalShop] Tried to put an untradable item into personal shop');
          user.dispose();
          return;
        }
        const removeOp = im.removeItemAt(targetPosition, item, totalCount);
        if (!removeOp) throw new Error('Could not remove item from inventory');
        let placed: PlayerShopItem;
        if (item.quantity > totalCount) {
          const partial = item.copy();
          partial.itemSn = user.getNextItemSn();
          partial.quantity = totalCount;
          placed = new PlayerShopItem(partial, price, setSize);
        } else {
          placed = new PlayerShopItem(item, price, setSize);
        }
        this.items.push(placed);
        user.write(inventoryOperation(removeOp, true));
        user.write(MiniRoomPacket.PlayerShop.refresh(this.items));
        break;
      }
      case MiniRoomProtocol.PSP_BuyItem: {
        const itemIndex = r.readByte();
        const setCount = r.readShort();
        r.readInt(); // ItemCRC
        if (itemIndex < 0 || itemIndex >= this.items.length || setCount <= 0 ||
            !this.isOpen() || this.isOwner(user)) {
          console.error(`[PersonalShop] Received invalid personal shop action ${MiniRoomProtocol[mrp]}`);
          user.write(MiniRoomPacket.PlayerShop.buyResult(PlayerShopBuyResult.Unknown));
          user.dispose();
          return;
        }
        const im = user.getInventoryManager();
        const psi = this.items[itemIndex];
        const totalCount = psi.setSize * setCount;
        if (totalCount <= 0 || psi.item.quantity < totalCount || !im.canAddItem(psi.item)) {
          user.write(MiniRoomPacket.PlayerShop.buyResult(PlayerShopBuyResult.NoSlot));
          user.dispose();
          return;
        }
        const totalPrice = psi.price * setCount;
        if (totalPrice <= 0 || totalPrice > 0x7FFFFFFF || !im.canAddMoney(-totalPrice)) {
          user.write(MiniRoomPacket.PlayerShop.buyResult(PlayerShopBuyResult.NoMoney));
          user.dispose();
          return;
        }
        const owner = this.getUser(0)!;
        const moneyForOwner = GameConstants.getPersonalShopTax(totalPrice);
        if (!owner.getInventoryManager().canAddMoney(moneyForOwner)) {
          user.write(MiniRoomPacket.PlayerShop.buyResult(PlayerShopBuyResult.OverPrice));
          user.dispose();
          return;
        }
        // Do transaction
        psi.item.quantity -= totalCount;
        const buyItem = psi.item.copy();
        buyItem.itemSn = owner.getNextItemSn();
        buyItem.quantity = totalCount;
        if (!im.gainMoney(-totalPrice)) throw new Error('Could not deduct total price from buyer');
        const addOps = im.addItem(buyItem);
        if (!addOps) throw new Error('Could not add bought item to buyer inventory');
        if (!owner.getInventoryManager().gainMoney(moneyForOwner)) throw new Error('Could not add money to shop owner');
        user.write(statChangedPacket(Stat.MONEY, im.money));
        user.write(inventoryOperation(addOps, true));
        owner.write(statChangedPacket(Stat.MONEY, owner.getInventoryManager().money));
        if (this.isNoMoreItem()) {
          this.closeShop(owner, MiniRoomLeaveType.NoMoreItem);
        } else {
          owner.write(MiniRoomPacket.PlayerShop.addSoldItem(itemIndex, setCount, user.getCharacterName()));
          this.broadcastPacket(MiniRoomPacket.PlayerShop.refresh(this.items));
        }
        break;
      }
      case MiniRoomProtocol.PSP_MoveItemToInventory: {
        const itemIndex = r.readShort();
        if (itemIndex < 0 || itemIndex >= this.items.length || this.isOpen() || !this.isOwner(user)) {
          console.error(`[PersonalShop] Received invalid personal shop action ${MiniRoomProtocol[mrp]}`);
          return;
        }
        const removed = this.items.splice(itemIndex, 1)[0];
        const im = user.getInventoryManager();
        const addOps = im.addItem(removed.item);
        if (!addOps) throw new Error('Could not add personal shop item back to inventory');
        user.write(inventoryOperation(addOps, true));
        user.write(MiniRoomPacket.PlayerShop.moveItemToInventory(this.items.length, itemIndex));
        break;
      }
      case MiniRoomProtocol.PSP_DeliverBlackList: {
        if (this.isOpen() || !this.isOwner(user) || this.items.length === 0) {
          console.error(`[PersonalShop] Received invalid personal shop action ${MiniRoomProtocol[mrp]}`);
          return;
        }
        const size = r.readShort();
        for (let i = 0; i < size; i++) {
          this.blockedList.push(r.readMapleAsciiString());
        }
        break;
      }
      default:
        console.error(`[PersonalShop] Unhandled personal shop action ${MiniRoomProtocol[mrp]}`);
    }
  }

  leave(user: User): void {
    const userIndex = this.getUserIndex(user);
    if (userIndex === 0) {
      this.closeShop(user, MiniRoomLeaveType.UserRequest);
    } else if (userIndex > 0) {
      this.broadcastPacket(MiniRoomPacket.leave(userIndex, MiniRoomLeaveType.UserRequest));
      this.removeUser(userIndex);
      user.setDialog(null);
      this.updateBalloon();
    }
  }

  updateBalloon(): void {
    const owner = this.getUser(0);
    if (owner && this.getField()) {
      this.getField().broadcastPacket(UserPacket.userMiniRoomBalloon(owner, this));
    }
  }

  closeShop(owner: User, leaveType: MiniRoomLeaveType): void {
    const im = owner.getInventoryManager();
    const ops: InventoryOperation[] = [];
    for (const psi of this.items) {
      if (psi.item.quantity === 0) continue;
      const addOps = im.addItem(psi.item);
      if (!addOps) throw new Error('Could not add personal shop item back to inventory on close');
      ops.push(...addOps);
    }
    owner.write(inventoryOperation(ops, false));
    // Remove guests
    for (let i = 1; i < this.getMaxUsers(); i++) {
      const guest = this.getUser(i);
      if (!guest) continue;
      guest.write(MiniRoomPacket.leave(i, MiniRoomLeaveType.HostOut));
      guest.setDialog(null);
    }
    // Remove shop
    this.broadcastPacket(MiniRoomPacket.leave(0, leaveType));
    owner.setDialog(null);
    const field = this.getField();
    field?.getMiniRoomPool().removeMiniRoom(this);
    field?.broadcastPacket(UserPacket.userMiniRoomBalloonRemove(owner));
  }

  private isNoMoreItem(): boolean {
    for (const psi of this.items) {
      if (psi.getSetCount() > 0) return false;
    }
    return true;
  }
}
