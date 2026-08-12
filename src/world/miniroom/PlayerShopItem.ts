import { Item } from '../item/Item';

export class PlayerShopItem {
  constructor(
    public readonly item: Item,
    public readonly price: number,
    public readonly setSize: number,
  ) {}

  getSetCount(): number {
    return Math.floor(this.item.quantity / this.setSize);
  }
}
