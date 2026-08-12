export enum SummonedActionType {
  STAND = 0,
  MOVE = 1,
  FLY = 2,
  SUMMONED = 3,
  ATTACK1 = 4,
  ATTACK2 = 5,
  ATTACK_TRIANGLE = 6,
  SKILL1 = 7,
  SKILL2 = 8,
  SKILL3 = 9,
  SKILL4 = 10,
  SKILL5 = 11,
  SKILL6 = 12,
  HEAL = 13,
  SUBSUMMON = 14,
  HIT = 15,
  DIE = 16,
  SAY = 17,
  PREPARE = 18,
  NO = 19,
}

export function summonedActionTypeByValue(value: number): SummonedActionType | null {
  return value >= SummonedActionType.STAND && value <= SummonedActionType.NO
    ? value as SummonedActionType
    : null;
}
