import { Stat } from '../world/user/stat/Stat';
import { CharacterTemporaryStat } from '../world/user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../world/user/stat/TemporaryStatOption';

export enum BaseStat {
  UNK,
  STR, STRr,
  DEX, DEXr,
  INT, INTr,
  LUK, LUKr,
  PAD, PADr,
  MAD, MADr,
  PDD, PDDr,
  MDD, MDDr,
  MHP, MHPr,
  MMP, MMPr,
  Cr,
  CriticaldamageMin,
  CriticaldamageMax,
  DAMr,
  BossDamage,
  ignoreTargetDEF,
  AsrR,
  TerR,
  ACC, ACCr,
  EVA, EVAr,
  Jump,
  Speed,
  EXPr,
  RewardProp,
  MesoProp,
  booster,
  stance,
  mastery,
  damageOver,
  AllStat,
  AllStatr,
  RecoveryHP,
  RecoveryMP,
  Allskill,
  STRlv,
  DEXlv,
  INTlv,
  LUKlv,
  buffTimeR,
  RecoveryUP,
  mpconReduce,
  reduceCooltime,
  PADlv,
  MADlv,
  MHPlv,
  MMPlv,
  dmgReduce,
  magicGuard,
  invincibleAfterRevive,
  shopDiscountR,
  pqShopDiscountR,
}

export function baseStatFromStat(s: Stat): BaseStat {
  switch (s) {
    case Stat.STR:  return BaseStat.STR;
    case Stat.DEX:  return BaseStat.DEX;
    case Stat.INT:  return BaseStat.INT;
    case Stat.LUK:  return BaseStat.LUK;
    case Stat.MHP:  return BaseStat.MHP;
    case Stat.MMP:  return BaseStat.MMP;
    default:        return BaseStat.UNK;
  }
}

export function baseStatGetRateVar(bs: BaseStat): BaseStat | null {
  switch (bs) {
    case BaseStat.STR: return BaseStat.STRr;
    case BaseStat.DEX: return BaseStat.DEXr;
    case BaseStat.INT: return BaseStat.INTr;
    case BaseStat.LUK: return BaseStat.LUKr;
    case BaseStat.PAD: return BaseStat.PADr;
    case BaseStat.MAD: return BaseStat.MADr;
    case BaseStat.PDD: return BaseStat.PDDr;
    case BaseStat.MDD: return BaseStat.MDDr;
    case BaseStat.MHP: return BaseStat.MHPr;
    case BaseStat.MMP: return BaseStat.MMPr;
    case BaseStat.ACC: return BaseStat.ACCr;
    case BaseStat.EVA: return BaseStat.EVAr;
    default:           return null;
  }
}

export function baseStatGetLevelVar(bs: BaseStat): BaseStat | null {
  switch (bs) {
    case BaseStat.STR: return BaseStat.STRlv;
    case BaseStat.DEX: return BaseStat.DEXlv;
    case BaseStat.INT: return BaseStat.INTlv;
    case BaseStat.LUK: return BaseStat.LUKlv;
    case BaseStat.PAD: return BaseStat.PADlv;
    case BaseStat.MAD: return BaseStat.MADlv;
    case BaseStat.MHP: return BaseStat.MHPlv;
    case BaseStat.MMP: return BaseStat.MMPlv;
    default:           return null;
  }
}

export function baseStatToStat(bs: BaseStat): Stat | null {
  switch (bs) {
    case BaseStat.STR: return Stat.STR;
    case BaseStat.DEX: return Stat.DEX;
    case BaseStat.INT: return Stat.INT;
    case BaseStat.LUK: return Stat.LUK;
    case BaseStat.MHP: return Stat.MHP;
    case BaseStat.MMP: return Stat.MMP;
    default:           return null;
  }
}

export function baseStatFromCTS(ctsArg: CharacterTemporaryStat, o: TemporaryStatOption): Map<BaseStat, number> {
  const stats = new Map<BaseStat, number>();
  switch (ctsArg) {
    case CharacterTemporaryStat.EPAD:
    case CharacterTemporaryStat.PAD:
      stats.set(BaseStat.PAD, o.nOption);
      break;
    case CharacterTemporaryStat.MAD:
      stats.set(BaseStat.MAD, o.nOption);
      break;
    case CharacterTemporaryStat.PDD:
    case CharacterTemporaryStat.EPDD:
      stats.set(BaseStat.PDD, o.nOption);
      break;
    case CharacterTemporaryStat.MDD:
    case CharacterTemporaryStat.EMDD:
      stats.set(BaseStat.MDD, o.nOption);
      break;
    case CharacterTemporaryStat.MaxHP:
      stats.set(BaseStat.MHPr, o.nOption);
      break;
    case CharacterTemporaryStat.MaxMP:
      stats.set(BaseStat.MMPr, o.nOption);
      break;
    case CharacterTemporaryStat.ACC:
      stats.set(BaseStat.ACC, o.nOption);
      break;
    case CharacterTemporaryStat.EVA:
      stats.set(BaseStat.EVA, o.nOption);
      break;
    case CharacterTemporaryStat.Speed:
      stats.set(BaseStat.Speed, o.nOption);
      break;
    case CharacterTemporaryStat.Jump:
      stats.set(BaseStat.Jump, o.nOption);
      break;
    case CharacterTemporaryStat.HolySymbol:
    case CharacterTemporaryStat.ExpBuffRate:
      stats.set(BaseStat.EXPr, o.nOption);
      break;
    case CharacterTemporaryStat.Booster:
    case CharacterTemporaryStat.PartyBooster:
      stats.set(BaseStat.booster, o.nOption);
      break;
    case CharacterTemporaryStat.DamR:
      stats.set(BaseStat.DAMr, o.nOption);
      break;
    case CharacterTemporaryStat.MesoUp:
    case CharacterTemporaryStat.MesoUpByItem:
      stats.set(BaseStat.MesoProp, o.nOption);
      break;
    case CharacterTemporaryStat.Stance:
      stats.set(BaseStat.stance, o.nOption);
      break;
    case CharacterTemporaryStat.SharpEyes:
      stats.set(BaseStat.Cr, o.nOption);
      break;
    case CharacterTemporaryStat.ItemUpByItem:
      stats.set(BaseStat.RewardProp, o.nOption);
      break;
    case CharacterTemporaryStat.EMHP:
      stats.set(BaseStat.MHP, o.nOption);
      break;
    case CharacterTemporaryStat.EMMP:
      stats.set(BaseStat.MMP, o.nOption);
      break;
    default:
      stats.set(BaseStat.UNK, o.nOption);
      break;
  }
  return stats;
}
