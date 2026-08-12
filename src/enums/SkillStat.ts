import { BaseStat } from './BaseStat';

export enum SkillStat {
  acc, emdd, criticaldamageMin, hp, bulletCount, subTime, itemConsume, mhpR,
  padX, pad, moneyCon, action, criticaldamageMax, jump, emhp, epad, mp,
  dotInterval, mdd, er, rb, selfDestruction, mmpR, hpCon, madX, mobCount,
  morph, damage, ignoreMobpdpR, itemConNo, epdd, dot, range, itemCon, speed,
  mastery, mad, eva, dotTime, pddR, prop, bulletConsume, subProp, attackCount,
  emmp, terR, mpCon, damR, cooltime, cr, pdd, mesoR, t, u, v, mddR, w, x, y, z,
  expR, time, asrR,
}

export function skillStatByString(s: string): SkillStat | null {
  for (const ss of Object.values(SkillStat)) {
    if (typeof ss === 'string' && ss.toLowerCase() === s.toLowerCase()) {
      return SkillStat[ss as keyof typeof SkillStat] as unknown as SkillStat;
    }
  }
  return null;
}

export function skillStatToBaseStat(ss: SkillStat): BaseStat | null {
  switch (ss) {
    case SkillStat.pdd:
    case SkillStat.epdd:   return BaseStat.PDD;
    case SkillStat.pddR:   return BaseStat.PDDr;
    case SkillStat.emdd:
    case SkillStat.mdd:    return BaseStat.MDD;
    case SkillStat.mddR:   return BaseStat.MDDr;
    case SkillStat.emhp:   return BaseStat.MHP;
    case SkillStat.mhpR:   return BaseStat.MHPr;
    case SkillStat.emmp:   return BaseStat.MMP;
    case SkillStat.mmpR:   return BaseStat.MMPr;
    case SkillStat.speed:  return BaseStat.Speed;
    case SkillStat.jump:   return BaseStat.Jump;
    case SkillStat.asrR:   return BaseStat.AsrR;
    case SkillStat.pad:
    case SkillStat.padX:
    case SkillStat.epad:   return BaseStat.PAD;
    case SkillStat.mad:
    case SkillStat.madX:   return BaseStat.MAD;
    case SkillStat.terR:   return BaseStat.TerR;
    case SkillStat.eva:    return BaseStat.EVA;
    case SkillStat.mastery: return BaseStat.mastery;
    case SkillStat.ignoreMobpdpR: return BaseStat.ignoreTargetDEF;
    case SkillStat.criticaldamageMin: return BaseStat.CriticaldamageMin;
    case SkillStat.criticaldamageMax: return BaseStat.CriticaldamageMax;
    case SkillStat.cr:
    case SkillStat.expR:
    case SkillStat.mesoR:  return BaseStat.MesoProp;
    case SkillStat.hp:     return BaseStat.RecoveryHP;
    case SkillStat.mp:     return BaseStat.RecoveryMP;
    default:               return null;
  }
}
