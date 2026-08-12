export enum ShopRequestType {
  Buy = 0,
  Sell = 1,
  Recharge = 2,
  Close = 3,
}

export function getShopRequestType(value: number): ShopRequestType | null {
  for (const type of Object.values(ShopRequestType)) {
    if (typeof type === 'number' && type === value) {
      return type as ShopRequestType;
    }
  }
  return null;
}
