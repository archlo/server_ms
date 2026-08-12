import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { BurnedInfo } from '../../field/mob/BurnedInfo';
import { User } from '../../user/User';
import { Attack } from '../Attack';

/** Skill IDs referenced by Magician.handleAttack (kinoko Magician.java). */
const SKILL = {
  ELEMENT_COMPOSITION_FP: 2111006,
  PARALYZE: 2121006,
  COLD_BEAM: 2201004,
  ICE_STRIKE: 2211002,
  THUNDER_SPEAR: 2211003,
  ELEMENT_COMPOSITION_IL: 2211006,
  ELQUINES: 2221005,
  SHINING_RAY: 2311004,
};

/** Port of kinoko's Magician (job/explorer/Magician.java). Only handleAttack is ported. */
export class Magician {
  static readonly MP_BOOST = 2000000;
  static readonly MAGIC_GUARD = 2001001;
  static readonly MAGIC_ARMOR = 2001002;
  static readonly ENERGY_BOLT = 2001003;
  static readonly MAGIC_CLAW = 2001004;

  /** Port of Magician.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.THUNDER_SPEAR:
      case SKILL.SHINING_RAY:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.ELEMENT_COMPOSITION_FP:
        if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        }
        return;
      case SKILL.PARALYZE:
        if (mob.isBoss()) {
          mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        } else {
          mob.setTemporaryStat(
            new Map([[MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv))]]),
            BurnedInfo.from(user, si, slv, mob),
            delay,
          );
        }
        return;
      case SKILL.COLD_BEAM:
      case SKILL.ICE_STRIKE:
      case SKILL.ELEMENT_COMPOSITION_IL:
      case SKILL.ELQUINES:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Freeze, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
    }
  }
}
