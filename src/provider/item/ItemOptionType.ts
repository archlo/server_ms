export enum ItemOptionType {
  ANY_EQUIP    = 0,
  WEAPON       = 10,
  EXCEPT_WEAPON= 11,
  ANY_ARMOR    = 20,
  ACCESSORY    = 40,
  CAP          = 51,
  COAT         = 52,
  PANTS        = 53,
  GLOVE        = 54,
  SHOES        = 55,
  UNK_90       = 90,
}

export function itemOptionTypeFromValue(value: number): ItemOptionType {
  if (Object.values(ItemOptionType).includes(value as ItemOptionType)) return value as ItemOptionType;
  return ItemOptionType.ANY_EQUIP;
}
