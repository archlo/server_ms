import { Item } from './Item';
import { InventoryType } from './InventoryType';
import { ItemProvider } from '../../provider/ItemProvider';
import { ItemConstants } from './ItemConstants';
import { ItemType } from './ItemType';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { DBChar } from '../user/DBChar';

export const TRUNK_INVENTORY_TYPES = [
  InventoryType.EQUIP, InventoryType.CONSUME, InventoryType.INSTALL,
  InventoryType.ETC,   InventoryType.CASH,
];

export class Trunk {
  private readonly items: Item[] = [];
  private money = 0;

  constructor(private size: number) {}

  getItems(): Item[]   { return this.items; }
  getSize():  number   { return this.size; }
  setSize(n:  number): void { this.size = n; }
  getRemaining(): number   { return Math.max(this.size - this.items.length, 0); }
  getMoney(): number   { return this.money; }
  setMoney(n: number): void { this.money = n; }

  canAddMoney(money: number): boolean {
    const n = this.money + money;
    return n >= 0 && n <= 0x7FFFFFFF;
  }

  addMoney(money: number): boolean {
    if (!this.canAddMoney(money)) return false;
    this.money += money;
    return true;
  }

  canAddItem(item: Item, quantity: number): boolean {
    if (item.itemType !== ItemType.BUNDLE || ItemConstants.isRechargeableItem(item.itemId)) {
      return this.getRemaining() > 0;
    }
    let count = quantity;
    const slotMax = ItemProvider.getItemInfo(item.itemId)?.getInfo('slotMax' as any, 0) || 0;
    for (const existingItem of this.items) {
      if (existingItem.itemId !== item.itemId) continue;
      if (existingItem.quantity >= slotMax) continue;
      const newQuantity = Math.min(existingItem.quantity + count, slotMax);
      const delta = newQuantity - existingItem.quantity;
      count -= delta;
      if (count === 0) break;
    }
    const remainingStacks = Math.ceil(count / Math.max(slotMax, 1));
    return this.getRemaining() >= remainingStacks;
  }

  addItem(item: Item): boolean {
    if (this.getRemaining() <= 0) return false;
    this.items.push(item);
    return true;
  }

  addItemWithMerge(item: Item): void {
    if (item.itemType !== ItemType.BUNDLE || ItemConstants.isRechargeableItem(item.itemId)) {
      this.items.push(item);
      return;
    }
    const slotMax = ItemProvider.getItemInfo(item.itemId)?.getInfo('slotMax' as any, 0) || 0;
    for (const existingItem of this.items) {
      if (existingItem.itemId !== item.itemId) continue;
      if (existingItem.quantity >= slotMax) continue;
      const newQuantity = Math.min(existingItem.quantity + item.quantity, slotMax);
      const delta = newQuantity - existingItem.quantity;
      existingItem.quantity = newQuantity;
      item.quantity -= delta;
      if (item.quantity === 0) break;
    }
    if (item.quantity > 0) {
      this.items.push(item);
    }
  }

  /** Get item by inventory type and index position within that type's items. */
  getItem(inventoryType: InventoryType, position: number): Item | null {
    const filtered = this.items.filter(i => inventoryTypeByItemId(i.itemId) === inventoryType);
    if (position < 0 || position >= filtered.length) return null;
    return filtered[position];
  }

  removeItem(index: number): Item | null {
    if (index < 0 || index >= this.items.length) return null;
    return this.items.splice(index, 1)[0];
  }

  encode(w: PacketWriter): void {
    // CTrunkDlg::SetGetItems
    w.writeByte(this.size); // nSlotCount
    w.writeLong(BigInt(DBChar.ALL));
    w.writeInt(this.money);
    for (const invType of TRUNK_INVENTORY_TYPES) {
      const filtered = this.items.filter(i => inventoryTypeByItemId(i.itemId) === invType);
      w.writeByte(filtered.length);
      for (const item of filtered) {
        item.encode(w);
      }
    }
  }
}

function inventoryTypeByItemId(itemId: number): InventoryType {
  const m = Math.floor(itemId / 1000000);
  if (m === 1) return InventoryType.EQUIP;
  if (m === 2) return InventoryType.CONSUME;
  if (m === 3) return InventoryType.INSTALL;
  if (m === 4) return InventoryType.ETC;
  return InventoryType.CASH;
}
