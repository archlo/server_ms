import { Option } from '../../user/stat/Option';
import { MobStat } from '../../../enums/MobStat';

/** Port of kinoko's MobTemporaryStat. */
export enum MobTemporaryStat {
  PAD = 0, PDR = 1, MAD = 2, MDR = 3, ACC = 4, EVA = 5, Speed = 6, Stun = 7,
  Freeze = 8, Poison = 9, Seal = 10, Darkness = 11, PowerUp = 12, MagicUp = 13,
  PGuardUp = 14, MGuardUp = 15, Doom = 16, Web = 17, PImmune = 18, MImmune = 19,
  Showdown = 20, HardSkin = 21, Ambush = 22, DamagedElemAttr = 23, Venom = 24,
  Blind = 25, SealSkill = 26, Burned = 27, Dazzle = 28, PCounter = 29, MCounter = 30,
  Disable = 31, RiseByToss = 32, BodyPressure = 33, Weakness = 34, TimeBomb = 35,
  MagicCrash = 36, HealByDamage = 37,
}

export class MobTemporaryStatHolder {
  stats: Map<MobStat, Option> = new Map();

  addStat(stat: MobStat, option: Option): void {
    this.stats.set(stat, option);
  }

  removeStat(stat: MobStat): void {
    this.stats.delete(stat);
  }

  hasStat(stat: MobStat): boolean {
    return this.stats.has(stat);
  }

  getStat(stat: MobStat): Option | undefined {
    return this.stats.get(stat);
  }

  clear(): void {
    this.stats.clear();
  }
}

export const MOB_TEMPORARY_STAT_FLAG_SIZE = 128;

export const MOB_TEMPORARY_STAT_ENCODE_ORDER: MobTemporaryStat[] = [
  MobTemporaryStat.PAD, MobTemporaryStat.PDR, MobTemporaryStat.MAD, MobTemporaryStat.MDR,
  MobTemporaryStat.ACC, MobTemporaryStat.EVA, MobTemporaryStat.Speed, MobTemporaryStat.Stun,
  MobTemporaryStat.Freeze, MobTemporaryStat.Poison, MobTemporaryStat.Seal, MobTemporaryStat.Darkness,
  MobTemporaryStat.PowerUp, MobTemporaryStat.MagicUp, MobTemporaryStat.PGuardUp, MobTemporaryStat.MGuardUp,
  MobTemporaryStat.PImmune, MobTemporaryStat.MImmune, MobTemporaryStat.Doom, MobTemporaryStat.Web,
  MobTemporaryStat.HardSkin, MobTemporaryStat.Ambush, MobTemporaryStat.Venom, MobTemporaryStat.Blind,
  MobTemporaryStat.SealSkill, MobTemporaryStat.Burned, MobTemporaryStat.Dazzle, MobTemporaryStat.PCounter, MobTemporaryStat.MCounter,
  MobTemporaryStat.RiseByToss, MobTemporaryStat.BodyPressure, MobTemporaryStat.Weakness, MobTemporaryStat.TimeBomb,
  MobTemporaryStat.Showdown, MobTemporaryStat.MagicCrash, MobTemporaryStat.DamagedElemAttr, MobTemporaryStat.HealByDamage,
];

export const MOVEMENT_AFFECTING_MOB_STAT: MobTemporaryStat[] = [
  MobTemporaryStat.Speed, MobTemporaryStat.Stun, MobTemporaryStat.Freeze, MobTemporaryStat.Doom, MobTemporaryStat.RiseByToss,
];
