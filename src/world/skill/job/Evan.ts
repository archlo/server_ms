import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../../user/stat/TemporaryStatOption';
import { Attack } from '../Attack';
import { Effect } from '../../user/effect/Effect';
import { UserLocal } from '../../user/UserLocal';
import { UserRemote } from '../../user/UserRemote';
import { User } from '../../user/User';
import { Job } from './Job';
import { Char } from '../../user/Char';

const SKILL = {
  ICE_BREATH: 22121000,
  FIRE_BREATH: 22151001,
  KILLER_WINGS: 22151002,
  PHANTOM_IMPRINT: 22161002,
  BLAZE: 22181001,
  DRAGON_FURY: 22160000,
};

export class Evan implements Job {
  /** Port of Evan.handleDragonFuryEffect. */
  static handleDragonFuryEffect(user: User): void {
    const slv = user.getSkillLevel(SKILL.DRAGON_FURY);
    if (slv === 0) return;
    const effect = Effect.skillUseEnable(SKILL.DRAGON_FURY, slv, user.getLevel(), Evan.isDragonFury(user));
    user.write(UserLocal.effect(effect));
    user.getField()?.broadcastPacket(UserRemote.effect(user, effect), user);
  }

  /** Port of Evan.isDragonFury. */
  static isDragonFury(user: User): boolean {
    const slv = user.getSkillLevel(SKILL.DRAGON_FURY);
    if (slv === 0) return false;
    const si = SkillProvider.getSkillInfoById(SKILL.DRAGON_FURY);
    if (!si) return false;
    const rangeMin = si.getValue(SkillStat.x, slv);
    const rangeMax = si.getValue(SkillStat.y, slv);
    const percentage = Math.floor((user.getMp() / user.getMaxMp()) * 100);
    return percentage >= rangeMin && percentage <= rangeMax;
  }
  /** Port of Evan.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.ICE_BREATH:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Freeze, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.FIRE_BREATH:
      case SKILL.BLAZE:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.KILLER_WINGS:
        if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.GuidedBullet)) {
          user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.GuidedBullet);
        }
        user.setTemporaryStat(CharacterTemporaryStat.GuidedBullet, TemporaryStatOption.ofTwoState(1, skillId, si.getDuration(slv), mob.getId()));
        return;
      case SKILL.PHANTOM_IMPRINT:
        mob.setTemporaryStat(MobTemporaryStat.Weakness, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)), delay);
        return;
    }
  }

  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.ICE_BREATH,
      SKILL.FIRE_BREATH,
      SKILL.KILLER_WINGS,
      SKILL.PHANTOM_IMPRINT,
      SKILL.BLAZE,
      SKILL.DRAGON_FURY,
    ].includes(skillId);
  }
}
