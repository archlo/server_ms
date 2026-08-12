import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { BurnedInfo } from '../../field/mob/BurnedInfo';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../../user/stat/TemporaryStatOption';
import { User } from '../../user/User';
import { Attack } from '../Attack';
import { Job } from './Job';
import { Char } from '../../user/Char';

const SKILL = {
  ATOMIC_HAMMER: 35101003,
  ENHANCED_FLAME_LAUNCHER: 35101009,
  PUNCH_LAUNCHER: 35111015,
  MECH_PROTOTYPE: 35001002,
  MECH_SIEGE_MODE: 35111001,
  MECH_MISSILE_TANK: 35121005,
  MECH_EXTREME_MECH: 35121003,
  MECHANIC_VEHICLE: 35100000,
};

export class Mechanic implements Job {
  /** Port of Mechanic.handleMech. */
  static handleMech(user: User, skillId: number): void {
    const statSkillId = user.getSkillLevel(SKILL.MECH_EXTREME_MECH) > 0 ? SKILL.MECH_EXTREME_MECH : SKILL.MECH_PROTOTYPE;
    const slv = user.getSkillLevel(statSkillId);
    const si = SkillProvider.getSkillInfoById(statSkillId);
    if (!si) return;
    user.setTemporaryStats(new Map([
      [CharacterTemporaryStat.RideVehicle, TemporaryStatOption.ofTwoState(CharacterTemporaryStat.RideVehicle, SKILL.MECHANIC_VEHICLE, skillId, 0)],
      [CharacterTemporaryStat.Mechanic, TemporaryStatOption.of(slv, skillId, 0)],
      [CharacterTemporaryStat.EMHP, TemporaryStatOption.of(si.getValue(SkillStat.emhp, slv), skillId, 0)],
      [CharacterTemporaryStat.EMMP, TemporaryStatOption.of(si.getValue(SkillStat.emmp, slv), skillId, 0)],
      [CharacterTemporaryStat.EPAD, TemporaryStatOption.of(si.getValue(SkillStat.epad, slv), skillId, 0)],
      [CharacterTemporaryStat.EPDD, TemporaryStatOption.of(si.getValue(SkillStat.epdd, slv), skillId, 0)],
      [CharacterTemporaryStat.EMDD, TemporaryStatOption.of(si.getValue(SkillStat.emdd, slv), skillId, 0)],
    ]));
  }

  /** Port of Mechanic.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.ATOMIC_HAMMER:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.PUNCH_LAUNCHER:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.ENHANCED_FLAME_LAUNCHER:
        mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        return;
    }
  }

  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.ATOMIC_HAMMER,
      SKILL.ENHANCED_FLAME_LAUNCHER,
      SKILL.PUNCH_LAUNCHER,
      SKILL.MECH_PROTOTYPE,
      SKILL.MECH_SIEGE_MODE,
      SKILL.MECH_MISSILE_TANK,
      SKILL.MECH_EXTREME_MECH,
      SKILL.MECHANIC_VEHICLE,
    ].includes(skillId);
  }
}
