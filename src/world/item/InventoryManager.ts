import { ItemProvider } from '../../provider/ItemProvider';
import { ItemConstants } from './ItemConstants';
import { Inventory } from './Inventory';
import { InventoryOperation } from './InventoryOperation';
import { InventoryOperationType } from './InventoryOperationType';
import { InventoryType, inventoryTypeByItemId, inventoryTypeByPosition } from './InventoryType';
import { Item } from './Item';
import { ItemType } from './ItemType';

export class InventoryManager {
  equipped:         Inventory = new Inventory(0);
  equipInventory:   Inventory = new Inventory(24);
  consumeInventory: Inventory = new Inventory(24);
  installInventory: Inventory = new Inventory(24);
  etcInventory:     Inventory = new Inventory(24);
  cashInventory:    Inventory = new Inventory(96);
  money        = 0;
  extSlotExpire: Date | null = null;

  getInventoryByType(type: InventoryType): Inventory {
    switch (type) {
      case InventoryType.EQUIPPED:  return this.equipped;
      case InventoryType.EQUIP:     return this.equipInventory;
      case InventoryType.CONSUME:   return this.consumeInventory;
      case InventoryType.INSTALL:   return this.installInventory;
      case InventoryType.ETC:       return this.etcInventory;
      default:                      return this.cashInventory;
    }
  }

  getInventoryByItemId(itemId: number): Inventory {
    return this.getInventoryByType(inventoryTypeByItemId(itemId));
  }

  canAddMoney(money: number): boolean {
    const n = this.money + money;
    return n <= 0x7FFFFFFF && n >= 0;
  }

  addMoney(money: number): boolean {
    if (!this.canAddMoney(money)) return false;
    this.money += money;
    return true;
  }

  getItemCount(itemId: number): number {
    let qty = 0;
    for (const item of this.getInventoryByItemId(itemId).getItems().values()) {
      if (item.itemId === itemId) qty += item.quantity;
    }
    return qty;
  }

  hasItem(itemId: number, qty: number): boolean { return this.getItemCount(itemId) >= qty; }

  hasEquipped(itemId: number): boolean {
    for (const item of this.equipped.getItems().values()) {
      if (item.itemId === itemId) return true;
    }
    return false;
  }

  getItemBySn(type: InventoryType, itemSn: bigint): [number, Item] | null {
    for (const [pos, item] of this.getInventoryByType(type).getItems()) {
      if (item.itemSn === itemSn) return [pos, item];
    }
    return null;
  }

  updateItem(position: number, item: Item): InventoryOperation | null {
    const invType  = inventoryTypeByItemId(item.itemId);
    const inv      = this.getInventoryByType(inventoryTypeByPosition(invType, position));
    if (inv.getItem(position) !== item) return null;
    return InventoryOperation.newItem(invType, position, item);
  }

  removeItemAt(position: number, item: Item, quantity?: number): InventoryOperation | null {
    const qty      = quantity ?? item.quantity;
    const invType  = inventoryTypeByItemId(item.itemId);
    const inv      = this.getInventoryByType(inventoryTypeByPosition(invType, position));
    if (inv.getItem(position) !== item) return null;
    if (item.quantity < qty) return null;
    if (item.quantity > qty) {
      item.quantity -= qty;
      return InventoryOperation.itemNumber(invType, position, item.quantity);
    }
    if (!inv.removeItemExact(position, item)) return null;
    return InventoryOperation.delItem(invType, position);
  }

  removeItemById(itemId: number, quantity: number): InventoryOperation[] | null {
    if (quantity < 0) return null;
    const ops: InventoryOperation[] = [];
    const invType  = inventoryTypeByItemId(itemId);
    const inv      = this.getInventoryByType(invType);
    for (const [pos, existing] of inv.getItems()) {
      if (existing.itemId !== itemId) continue;
      const newQty = Math.max(existing.quantity - quantity, 0);
      ops.push(newQty > 0
        ? InventoryOperation.itemNumber(invType, pos, newQty)
        : InventoryOperation.delItem(invType, pos));
      quantity -= existing.quantity;
      if (quantity <= 0) break;
    }
    if (quantity > 0) return null;
    this.applyInventoryOperations(ops);
    return ops;
  }

  static getAvailablePosition(inventory: Inventory): number | null {
    for (let i = 1; i <= inventory.getSize(); i++) {
      if (inventory.getItem(i) != null) continue;
      return i;
    }
    return null;
  }

  addItem(originalItem: Item): InventoryOperation[] | null {
    const ops: InventoryOperation[] = [];
    const invType  = inventoryTypeByItemId(originalItem.itemId);
    const inv      = this.getInventoryByType(invType);
    const itemInfo = ItemProvider.getItemInfo(originalItem.itemId);
    const slotMax  = itemInfo?.getInfo('slotMax' as any) ?? 0;
    const item     = originalItem.copy();
    let merged     = false;

    if (item.itemType === ItemType.BUNDLE && !ItemConstants.isRechargeableItem(item.itemId)) {
      for (const [pos, existing] of inv.getItems()) {
        if (existing.itemId !== item.itemId || existing.quantity >= slotMax) continue;
        const newQty = Math.min(existing.quantity + item.quantity, slotMax);
        const delta  = newQty - existing.quantity;
        ops.push(InventoryOperation.itemNumber(invType, pos, newQty));
        item.quantity -= delta;
        if (item.quantity === 0) { merged = true; break; }
      }
    }

    if (item.quantity > 0) {
      const slot = inv.findFreeSlot();
      if (slot === null) return null;
      ops.push(InventoryOperation.newItem(invType, slot, item));
      merged = true;
    }

    if (!merged) return null;
    this.applyInventoryOperations(ops);
    return ops;
  }

  canAddItem(item: Item): boolean {
    return this.canAddItemsByIdQty([[item.itemId, item.quantity]]);
  }

  canAddItemsByIdQty(items: Array<[number, number]>): boolean {
    const requiredSlots = new Map<InventoryType, number>();
    const itemCounter   = new Map<number, number>();
    for (const [id, qty] of items) {
      const count = ItemConstants.isRechargeableItem(id) ? 1 : qty;
      itemCounter.set(id, (itemCounter.get(id) ?? 0) + count);
    }
    for (const [itemId, total] of itemCounter) {
      const invType  = inventoryTypeByItemId(itemId);
      const inv      = this.getInventoryByType(invType);
      const itemInfo = ItemProvider.getItemInfo(itemId);
      const slotMax  = ItemConstants.isRechargeableItem(itemId) ? 1 : (itemInfo?.getInfo('slotMax' as any) ?? 0);
      let remaining  = total;
      for (const existing of inv.getItems().values()) {
        if (existing.itemId !== itemId || existing.quantity >= slotMax) continue;
        remaining -= slotMax - existing.quantity;
        if (remaining <= 0) break;
      }
      if (remaining > 0) {
        const stacks = Math.ceil(remaining / Math.max(slotMax, 1));
        requiredSlots.set(invType, (requiredSlots.get(invType) ?? 0) + stacks);
      }
    }
    for (const [invType, needed] of requiredSlots) {
      if (this.getInventoryByType(invType).getRemaining() < needed) return false;
    }
    return true;
  }

  applyInventoryOperations(ops: InventoryOperation[]): void {
    for (const op of ops) {
      const invType = inventoryTypeByPosition(op.inventoryType, op.position);
      const inv     = this.getInventoryByType(invType);
      switch (op.operationType) {
        case InventoryOperationType.NewItem:
          inv.putItem(op.position, op.item!);
          break;
        case InventoryOperationType.ItemNumber:
          inv.getItem(op.position)!.quantity = op.newQuantity;
          break;
        case InventoryOperationType.Position: {
          const first  = inv.removeItem(op.position)!;
          const inv2   = this.getInventoryByType(inventoryTypeByPosition(op.inventoryType, op.newPosition));
          const second = inv2.removeItem(op.newPosition);
          inv.putItem(op.position, second ?? null);
          inv2.putItem(op.newPosition, first);
          break;
        }
        case InventoryOperationType.DelItem:
          inv.removeItem(op.position);
          break;
        case InventoryOperationType.EXP:
          inv.getItem(op.position)!.equipData!.exp = op.newExp;
          break;
      }
    }
  }

  gainMoney(amount: number): boolean {
    if (amount >= 0) return this.addMoney(amount);
    const deduct = -amount;
    if (this.money < deduct) return false;
    this.money -= deduct;
    return true;
  }

  /** Find an item by inventory position across all inventories. */
  getItemBySlot(pos: number): Item | undefined {
    for (const inv of [this.equipped, this.equipInventory, this.consumeInventory, this.installInventory, this.etcInventory, this.cashInventory]) {
      const item = inv.getItem(pos);
      if (item) return item;
    }
    return undefined;
  }

  /** Remove an item by inventory position and return it. */
  removeItem(pos: number): Item | undefined {
    for (const inv of [this.equipped, this.equipInventory, this.consumeInventory, this.installInventory, this.etcInventory, this.cashInventory]) {
      const item = inv.getItem(pos);
      if (item) return inv.removeItem(pos);
    }
    return undefined;
  }

  removeExpiredItems(): { ops: InventoryOperation[]; removedItemIds: number[] } {
    const ops: InventoryOperation[] = [];
    const removedItemIds: number[] = [];
    const now = new Date();
    const inventories: Array<{ type: InventoryType; inv: Inventory }> = [
      { type: InventoryType.EQUIPPED, inv: this.equipped },
      { type: InventoryType.EQUIP,    inv: this.equipInventory },
      { type: InventoryType.CONSUME,  inv: this.consumeInventory },
      { type: InventoryType.INSTALL,  inv: this.installInventory },
      { type: InventoryType.ETC,      inv: this.etcInventory },
      { type: InventoryType.CASH,     inv: this.cashInventory },
    ];
    for (const { type, inv } of inventories) {
      for (const [pos, item] of inv.getItems()) {
        if (item.isExpired(now)) {
          inv.removeItem(pos);
          ops.push(InventoryOperation.delItem(type, pos));
          removedItemIds.push(item.itemId);
        }
      }
    }
    return { ops, removedItemIds };
  }
}
