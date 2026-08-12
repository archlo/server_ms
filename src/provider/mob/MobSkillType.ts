export enum MobSkillType {
  POWERUP = 100, MAGICUP = 101, PGUARDUP = 102, MGUARDUP = 103, HASTE = 104,
  POWERUP_M = 110, MAGICUP_M = 111, PGUARDUP_M = 112, MGUARDUP_M = 113,
  HEAL_M = 114, HASTE_M = 115,
  SEAL = 120, DARKNESS = 121, WEAKNESS = 122, STUN = 123, CURSE = 124,
  POISON = 125, SLOW = 126, DISPEL = 127, ATTRACT = 128, BANMAP = 129,
  AREA_FIRE = 130, AREA_POISON = 131, REVERSE_INPUT = 132, UNDEAD = 133,
  STOPPORTION = 134, STOPMOTION = 135, FEAR = 136, FROZEN = 137,
  PHYSICALIMMUNE = 140, MAGICIMMUNE = 141, HARDSKIN = 142,
  PCOUNTER = 143, MCOUNTER = 144, PMCOUNTER = 145,
  PAD = 150, MAD = 151, PDR = 152, MDR = 153, ACC = 154, EVA = 155,
  SPEED = 156, SEALSKILL = 157, BALROGCOUNTER = 158,
  SPREADSKILLFROMUSER = 160, HEALBYDAMAGE = 161, BIND = 162,
  SUMMON = 200, SUMMON_CUBE = 201,
}

const typeMap = new Map<number, MobSkillType>();
for (const v of Object.values(MobSkillType)) {
  if (typeof v === 'number') typeMap.set(v, v as MobSkillType);
}

export function mobSkillTypeFromValue(value: number): MobSkillType | null {
  return typeMap.get(value) ?? null;
}
