export enum FuncKeyType {
  NONE = 0,
  SKILL = 1,
  ITEM = 2,
  EMOTION = 3,
  MENU = 4,
  BASICACTION = 5,
  BASICMOTION = 6,
  EFFECT = 7,
  MACROSKILL = 8,
  COUNT = 8,
}

export function getFuncKeyTypeByValue(value: number): FuncKeyType | undefined {
  for (const t of Object.values(FuncKeyType)) {
    if (typeof t === 'number' && t === value) return t as FuncKeyType;
  }
  return undefined;
}
