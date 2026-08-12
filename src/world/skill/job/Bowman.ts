import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { BurnedInfo } from '../../field/mob/BurnedInfo';
import { User } from '../../user/User';
import { Attack } from '../Attack';

/** Skill IDs referenced by Bowman.handleAttack (kinoko Bowman.java). */
const SKILL = {
  ARROW_BOMB: 3101005,
  SILVER_HAWK: 3111005,
  INFERNO: 3111003,
  VENGEANCE: 3120010,
  PHOENIX: 3121006,
  GOLDEN_EAGLE: 3211005,
  BLIZZARD: 3211003,
};

/** Port of kinoko's Bowman (job/explorer/Bowman.java). Only handleAttack is ported. */
export class Bowman {
  /** Port of Bowman.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.ARROW_BOMB:
      case SKILL.SILVER_HAWK:
      case SKILL.GOLDEN_EAGLE:
      case SKILL.PHOENIX:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.INFERNO:
        mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        return;
      case SKILL.VENGEANCE:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.BLIZZARD:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Freeze, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
    }
  }
}
