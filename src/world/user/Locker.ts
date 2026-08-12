import { Item } from '../item/Item';

export class Locker {
  private readonly items = new Map<number, Item>();
  slotCount = 96;

  addItem(item: Item): void {
    this.items.set(Number(item.itemSn), item);
  }

  removeItem(sn: number): void {
    this.items.delete(sn);
  }

  getItem(sn: number): Item | undefined {
    return this.items.get(sn);
  }

  getItems(): Item[] {
    return [...this.items.values()];
  }

  load(items: Item[]): void {
    this.items.clear();
    for (const item of items) {
      this.items.set(Number(item.itemSn), item);
    }
  }

  hasSlot(): boolean {
    return this.items.size < this.slotCount;
  }
}
