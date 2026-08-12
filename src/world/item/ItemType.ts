export enum ItemType {
  EQUIP = 1,
  BUNDLE = 2,
  PET = 3,
}

export function itemTypeByValue(v: number): ItemType | null {
  return Object.values(ItemType).includes(v as ItemType) ? (v as ItemType) : null;
}

export function itemTypeByItemId(itemId: number): ItemType {
  if (Math.floor(itemId / 1000000) === 1) return ItemType.EQUIP;
  if (Math.floor(itemId / 10000) === 500) return ItemType.PET;
  return ItemType.BUNDLE;
}
