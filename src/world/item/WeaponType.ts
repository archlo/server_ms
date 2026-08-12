import { ItemConstants } from './ItemConstants';

export enum WeaponType {
  NONE             = 0,
  COUNT            = 17,
  EXCOUNT          = 18,
  OH_SWORD         = 30,
  OH_AXE           = 31,
  OH_MACE          = 32,
  DAGGER           = 33,
  SUB_DAGGER       = 34,
  WAND             = 37,
  STAFF            = 38,
  BAREHAND         = 39,
  TH_SWORD         = 40,
  TH_AXE           = 41,
  TH_MACE          = 42,
  SPEAR            = 43,
  POLEARM          = 44,
  BOW              = 45,
  CROSSBOW         = 46,
  THROWINGGLOVE    = 47,
  KNUCKLE          = 48,
  GUN              = 49,
  NOTCHECK_SUBWEPPON = -1,
}

const byValue = new Map<number, WeaponType>();
for (const v of Object.values(WeaponType) as WeaponType[]) {
  byValue.set(v as number, v);
}

export function weaponTypeByValue(v: number): WeaponType | null {
  return byValue.get(v) ?? null;
}

export function weaponTypeByItemId(itemId: number): WeaponType {
  if (!ItemConstants.isWeapon(itemId)) return WeaponType.NONE;
  const v = Math.floor(itemId / 10000) % 100;
  return weaponTypeByValue(v) ?? WeaponType.NONE;
}
