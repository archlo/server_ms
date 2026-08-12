export enum CashItemType {
  WEATHER = 'weather',
  PET_NAME_CHANGE = 'pet_name_change',
  COLOR_LENS = 'color_lens',
  AP_RESET = 'ap_reset',
  SP_RESET = 'sp_reset',
  VICIOUS_HAMMER = 'vicious_hammer',
  KARMA_SCISSORS = 'karma_scissors',
  EFFECT_ITEM = 'effect_item',
  REWARD_ITEM = 'reward_item',
  MAP_TELEPORT = 'map_teleport',
}

export function cashItemTypeByItemId(itemId: number): CashItemType | null {
  if (itemId >= 5160000 && itemId < 5170000) return CashItemType.WEATHER;
  if (itemId >= 5040000 && itemId < 5050000) return CashItemType.PET_NAME_CHANGE;
  if (itemId >= 5150000 && itemId < 5160000) return CashItemType.COLOR_LENS;
  if (itemId === 5080000) return CashItemType.AP_RESET;
  if (itemId === 5080001) return CashItemType.SP_RESET;
  if (itemId === 5100000) return CashItemType.VICIOUS_HAMMER;
  if (itemId === 5110000 || itemId === 5111000 || itemId === 5112000) return CashItemType.KARMA_SCISSORS;
  if (itemId >= 5010000 && itemId < 5020000) return CashItemType.EFFECT_ITEM;
  if (itemId >= 5220000 && itemId < 5230000) return CashItemType.REWARD_ITEM;
  if (itemId >= 5170000 && itemId < 5180000) return CashItemType.MAP_TELEPORT;
  return null;
}
