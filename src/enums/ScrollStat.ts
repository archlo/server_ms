import { BaseStat } from './BaseStat';
import { EquipBaseStatKey } from './EquipBaseStat';

export enum ScrollStat {
  success,
  incSTR, incDEX, incINT, incLUK,
  incPAD, incMAD, incPDD, incMDD,
  incACC, incEVA,
  incMHP, incMMP,
  incSpeed, incJump,
  incIUC,
  incPERIOD,
  incReqLevel,
  reqRUC,
  randOption,
  randStat,
  tuc,
  speed,
  forceUpgrade,
  cursed,
  maxSuperiorEqp,
  noNegative,
  incRandVol,
  reqEquipLevelMax,
  createType,
  optionType,
  recover,
  reset,
  perfectReset,
  reduceCooltime,
  boss,
  ignoreTargetDEF,
  incSTRr, incDEXr, incINTr, incLUKr,
  incCriticaldamageMin,
  incCriticaldamageMax,
  cCr,
  incDAMr,
  incPDDr, incMDDr,
  incEVAr, incACCr,
  incMHPr, incMMPr,
  incTerR, incAsrR,
  incMesoProp, incRewardProp,
  setItemCategory,
}

export function scrollStatByString(name: string): ScrollStat | null {
  for (const ss of Object.values(ScrollStat)) {
    if (typeof ss === 'string' && ss.toLowerCase() === name.toLowerCase()) {
      return ScrollStat[ss as keyof typeof ScrollStat] as unknown as ScrollStat;
    }
  }
  return null;
}

export function scrollStatToEquipStat(ss: ScrollStat): EquipBaseStatKey | null {
  switch (ss) {
    case ScrollStat.incSTR:  return 'iStr';
    case ScrollStat.incDEX:  return 'iDex';
    case ScrollStat.incINT:  return 'iInt';
    case ScrollStat.incLUK:  return 'iLuk';
    case ScrollStat.incPAD:  return 'iPAD';
    case ScrollStat.incMAD:  return 'iMAD';
    case ScrollStat.incPDD:  return 'iPDD';
    case ScrollStat.incMDD:  return 'iMDD';
    case ScrollStat.incACC:  return 'iACC';
    case ScrollStat.incEVA:  return 'iEVA';
    case ScrollStat.incMHP:  return 'iMaxHP';
    case ScrollStat.incMMP:  return 'iMaxMP';
    case ScrollStat.incSpeed:
    case ScrollStat.speed:   return 'iSpeed';
    case ScrollStat.incJump: return 'iJump';
    case ScrollStat.incReqLevel: return 'iReduceReq';
    default:                 return null;
  }
}

export function scrollStatToBaseStat(ss: ScrollStat): BaseStat | null {
  switch (ss) {
    case ScrollStat.incSTR:  return BaseStat.STR;
    case ScrollStat.incDEX:  return BaseStat.DEX;
    case ScrollStat.incINT:  return BaseStat.INT;
    case ScrollStat.incLUK:  return BaseStat.LUK;
    case ScrollStat.incPAD:  return BaseStat.PAD;
    case ScrollStat.incMAD:  return BaseStat.MAD;
    case ScrollStat.incPDD:  return BaseStat.PDD;
    case ScrollStat.incMDD:  return BaseStat.MDD;
    case ScrollStat.incACC:  return BaseStat.ACC;
    case ScrollStat.incEVA:  return BaseStat.EVA;
    case ScrollStat.incMHP:  return BaseStat.MHP;
    case ScrollStat.incMMP:  return BaseStat.MMP;
    case ScrollStat.incSpeed:
    case ScrollStat.speed:   return BaseStat.Speed;
    case ScrollStat.incJump: return BaseStat.Jump;
    case ScrollStat.incSTRr: return BaseStat.STRr;
    case ScrollStat.incDEXr: return BaseStat.DEXr;
    case ScrollStat.incINTr: return BaseStat.INTr;
    case ScrollStat.incLUKr: return BaseStat.LUKr;
    case ScrollStat.incMHPr: return BaseStat.MHPr;
    case ScrollStat.incMMPr: return BaseStat.MMPr;
    default:                 return null;
  }
}
