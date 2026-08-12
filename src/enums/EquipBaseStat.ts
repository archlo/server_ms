export const EquipBaseStat = {
  tuc:           { val: 0x1, pos: 0 },
  cuc:           { val: 0x2, pos: 0 },
  iStr:          { val: 0x4, pos: 0 },
  iDex:          { val: 0x8, pos: 0 },
  iInt:          { val: 0x10, pos: 0 },
  iLuk:          { val: 0x20, pos: 0 },
  iMaxHP:        { val: 0x40, pos: 0 },
  iMaxMP:        { val: 0x80, pos: 0 },
  iPAD:          { val: 0x100, pos: 0 },
  iMAD:          { val: 0x200, pos: 0 },
  iPDD:          { val: 0x400, pos: 0 },
  iMDD:          { val: 0x800, pos: 0 },
  iACC:          { val: 0x1000, pos: 0 },
  iEVA:          { val: 0x2000, pos: 0 },
  iCraft:        { val: 0x4000, pos: 0 },
  iSpeed:        { val: 0x8000, pos: 0 },
  iJump:         { val: 0x10000, pos: 0 },
  attribute:     { val: 0x20000, pos: 0 },
  levelUpType:   { val: 0x40000, pos: 0 },
  level:         { val: 0x80000, pos: 0 },
  exp:           { val: 0x100000, pos: 0 },
  durability:    { val: 0x200000, pos: 0 },
  iuc:           { val: 0x400000, pos: 0 },
  iPvpDamage:    { val: 0x800000, pos: 0 },
  iReduceReq:    { val: 0x1000000, pos: 0 },
  specialAttribute: { val: 0x2000000, pos: 0 },
  durabilityMax: { val: 0x4000000, pos: 0 },
  iIncReq:       { val: 0x8000000, pos: 0 },
  growthEnchant: { val: 0x10000000, pos: 0 },
  psEnchant:     { val: 0x20000000, pos: 0 },
  imdr:          { val: 0x80000000, pos: 0 },
  damR:          { val: 0x1, pos: 1 },
  exGradeOption: { val: 0x8, pos: 1 },
} as const;

export type EquipBaseStatKey = keyof typeof EquipBaseStat;

export function getEquipBaseStatByVal(val: number, pos: number): EquipBaseStatKey | null {
  for (const [key, info] of Object.entries(EquipBaseStat)) {
    if (info.val === val && info.pos === pos) return key as EquipBaseStatKey;
  }
  return null;
}

export const EQUIP_RAND_STATS: EquipBaseStatKey[] = [
  'iStr', 'iDex', 'iInt', 'iLuk', 'iMaxHP', 'iMaxMP', 'iPAD', 'iMAD', 'iPDD', 'iMDD', 'iACC', 'iEVA',
];
