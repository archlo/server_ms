export enum SpecStat {
  runOnPickup, consumeOnPickup,
  hp, mp, hpR, mpR, eva, time, speed, mad, pad, acc, pdd, mdd, jump,
  imhp, immp, indieAllStat, indieSpeed, indieJump,
  indieSTR, indieDEX, indieINT, indieLUK,
  indiePad, indiePdd, indieMad, indieMdd,
  indieBDR, indieDamR, indieIgnoreMobpdpR, indieStatR,
  indieMhp, indieMmp, indieBooster, indieScriptBuff,
  incEffectHPPotion, indieAcc, indieEva, indieAllSkill,
  indieMhpR, indieMmpR, indieStance, indieForceSpeed, indieForceJump,
  indieQrPointTerm, indieWaterSmashBuff,
  padRate, madRate, pddRate, mddRate, accRate, evaRate, speedRate,
  mhpR, mhpRRate, mmpR, mmpRRate,
  booster, expinc, str, dex, inte, luk, asrR, bdR, prob, party,
  inflation, morph, repeatEffect, recipe, reqSkillLevel,
}

export function specStatByName(name: string): SpecStat | null {
  if (name.toLowerCase() === 'int') return SpecStat.inte;
  for (const ss of Object.values(SpecStat)) {
    if (typeof ss === 'string' && ss.toLowerCase() === name.toLowerCase()) {
      return SpecStat[ss as keyof typeof SpecStat] as unknown as SpecStat;
    }
  }
  return null;
}
