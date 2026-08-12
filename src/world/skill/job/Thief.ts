import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { BurnedInfo } from '../../field/mob/BurnedInfo';
import { User } from '../../user/User';
import { Attack } from '../Attack';

/** Skill IDs referenced by Thief.handleAttack (kinoko Thief.java). */
const SKILL = {
  SHADOW_MESO: 4111004,
  STEAL: 4201004,
  ASSAULTER: 4211002,
  BOOMERANG_STEP: 4221007,
  TAUNT_NL: 4121003,
  TAUNT_SHAD: 4221003,
  FLASHBANG: 4321002,
  UPPER_STAB: 4331004,
  FLYING_ASSAULTER: 4331005,
  SUDDEN_RAID: 4341004,
};

/** Port of kinoko's Thief (job/explorer/Thief.java). Only handleAttack is ported. */
export class Thief {
  static readonly CLAW_MASTERY = 4100000;
  static readonly NIMBLE_BODY = 4000000;
  static readonly KEEN_EYES = 4000001;
  static readonly DISORDER = 4001002;
  static readonly DARK_SIGHT = 4001003;
  static readonly DOUBLE_STAB = 4001334;
  static readonly LUCKY_SEVEN = 4001344;

  /** Port of Thief.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.SHADOW_MESO:
        if (!mob.isBoss()) {
          mob.resetTemporaryStatBySet(new Set([MobTemporaryStat.PGuardUp, MobTemporaryStat.MGuardUp]));
        }
        return;
      case SKILL.TAUNT_NL:
      case SKILL.TAUNT_SHAD:
        if (!mob.isBoss()) {
          const x = si.getValue(SkillStat.x, slv);
          mob.setTemporaryStat(new Map([
            [MobTemporaryStat.Showdown, MobStatOption.of(x, skillId, si.getDuration(slv))],
            [MobTemporaryStat.PDR, MobStatOption.of(x, skillId, si.getDuration(slv))],
            [MobTemporaryStat.MDR, MobStatOption.of(x, skillId, si.getDuration(slv))],
          ]), delay);
        }
        return;
      case SKILL.ASSAULTER:
      case SKILL.BOOMERANG_STEP:
      case SKILL.FLYING_ASSAULTER:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.STEAL:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
          mob.steal(user);
        }
        return;
      case SKILL.FLASHBANG:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Blind, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.UPPER_STAB:
        if (!mob.isBoss() && !mob.getMobStat().hasOption(MobTemporaryStat.RiseByToss)) {
          mob.setTemporaryStat(MobTemporaryStat.RiseByToss, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, 1000), delay);
        }
        return;
      case SKILL.SUDDEN_RAID:
        mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        return;
    }
  }
}
