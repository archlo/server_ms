export enum InventoryType {
  EQUIPPED = 0,
  EQUIP    = 1,
  CONSUME  = 2,
  INSTALL  = 3,
  ETC      = 4,
  CASH     = 5,
}

export function inventoryTypeByValue(v: number): InventoryType | null {
  if (v >= 0 && v <= 5) return v as InventoryType;
  return null;
}

export function inventoryTypeByItemId(itemId: number): InventoryType {
  const m = Math.floor(itemId / 1000000);
  if (m === 1) return InventoryType.EQUIP;
  if (m === 2) return InventoryType.CONSUME;
  if (m === 3) return InventoryType.INSTALL;
  if (m === 4) return InventoryType.ETC;
  return InventoryType.CASH;
}

export function inventoryTypeByPosition(type: InventoryType, position: number): InventoryType {
  return type === InventoryType.EQUIP && position < 0 ? InventoryType.EQUIPPED : type;
}
