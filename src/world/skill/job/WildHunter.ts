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
  RICOCHET: 33101001,
  JAGUAR_RAWR: 33101002,
  DASH_N_SLASH: 33111002,
  SILVER_HAWK: 33111005,
  SONIC_ROAR: 33121002,
  STINK_BOMB_SHOT: 33121005,
};

export class WildHunter implements Job {
  /** Port of WildHunter.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.RICOCHET:
      case SKILL.DASH_N_SLASH:
      case SKILL.SILVER_HAWK:
      case SKILL.SONIC_ROAR:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.JAGUAR_RAWR:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.STINK_BOMB_SHOT:
        if (!mob.isBoss()) {
          const x = si.getValue(SkillStat.x, slv);
          mob.setTemporaryStat(new Map([
            [MobTemporaryStat.Showdown, MobStatOption.of(x, skillId, si.getDuration(slv))],
            [MobTemporaryStat.PDR, MobStatOption.of(x, skillId, si.getDuration(slv))],
            [MobTemporaryStat.MDR, MobStatOption.of(x, skillId, si.getDuration(slv))],
          ]), delay);
        }
        return;
    }
  }

  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.RICOCHET,
      SKILL.JAGUAR_RAWR,
      SKILL.DASH_N_SLASH,
      SKILL.SILVER_HAWK,
      SKILL.SONIC_ROAR,
      SKILL.STINK_BOMB_SHOT,
    ].includes(skillId);
  }
}
