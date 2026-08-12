import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { User } from '../../user/User';
import { Attack } from '../Attack';
import { Job } from './Job';
import { Char } from '../../user/Char';

const SKILL = {
  BODY_PRESSURE: 21101003,
  FINAL_TOSS: 21110003,
  COMBO_TEMPEST: 21120006,
};

export class Aran implements Job {
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.BODY_PRESSURE:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          // x = 5 seconds
          mob.setTemporaryStat(new Map([
            [MobTemporaryStat.Stun, MobStatOption.of(1, skillId, 5000)],
            [MobTemporaryStat.BodyPressure, MobStatOption.of(1, skillId, 5000)],
          ]), delay);
        }
        return;
      case SKILL.FINAL_TOSS:
        if (!mob.isBoss() && !mob.getMobStat().hasOption(MobTemporaryStat.RiseByToss)) {
          mob.setTemporaryStat(MobTemporaryStat.RiseByToss, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, 1000), delay);
        }
        return;
      case SKILL.COMBO_TEMPEST:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Freeze, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
    }
  }

  isHandlerOfSkill(skillId: number): boolean {
    return [SKILL.BODY_PRESSURE, SKILL.FINAL_TOSS, SKILL.COMBO_TEMPEST].includes(skillId);
  }
}
