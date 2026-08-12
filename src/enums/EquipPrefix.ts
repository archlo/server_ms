export function getEquipPrefix(itemId: number): number {
  return Math.floor(itemId / 10000);
}
