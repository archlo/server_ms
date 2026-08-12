import { Item } from './Item';

export class Inventory {
  private readonly items = new Map<number, Item>();

  constructor(private size: number) {}

  getItems(): Map<number, Item>  { return this.items; }
  getSize():  number             { return this.size; }
  setSize(n:  number): void      { this.size = n; }
  getRemaining(): number         { return Math.max(this.size - this.items.size, 0); }

  getItem(position: number): Item | undefined   { return this.items.get(Math.abs(position)); }

  putItem(position: number, item: Item | null): void {
    const pos = Math.abs(position);
    if (item !== null) this.items.set(pos, item!);
    else               this.items.delete(pos);
  }

  removeItem(position: number): Item | undefined {
    const pos = Math.abs(position);
    const item = this.items.get(pos);
    this.items.delete(pos);
    return item;
  }

  removeItemExact(position: number, item: Item): boolean {
    const pos = Math.abs(position);
    if (this.items.get(pos) !== item) return false;
    this.items.delete(pos);
    return true;
  }

  // returns sorted positions
  getSortedPositions(): number[] {
    return [...this.items.keys()].sort((a, b) => a - b);
  }

  // find first free slot (1-based)
  findFreeSlot(): number | null {
    for (let i = 1; i <= this.size; i++) {
      if (!this.items.has(i)) return i;
    }
    return null;
  }
}
