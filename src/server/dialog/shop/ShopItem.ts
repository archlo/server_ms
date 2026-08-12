export class ShopItem {
  constructor(
    public readonly itemId: number,
    public readonly price: number,
    public readonly quantity: number,
    public readonly maxPerSlot: number,
    public readonly tokenItemId: number = 0,
    public readonly tokenPrice: number = 0,
    public readonly unitPrice: number = 0,
  ) {}

  static from(itemId: number, price: number, quantity: number, maxPerSlot: number): ShopItem {
    return new ShopItem(itemId, price, quantity, maxPerSlot, 0, 0, 0);
  }

  static rechargeable(itemId: number, maxPerSlot: number, unitPrice: number): ShopItem {
    return new ShopItem(itemId, 0, 0, maxPerSlot, 0, 0, unitPrice);
  }
}
