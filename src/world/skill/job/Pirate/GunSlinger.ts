import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  GUN_MASTERY: 15200000,
  CRITICAL_SHOT: 15200001,
  INVISIBLE_SHOT: 15200002,
  GRENADE: 15201003,
  GUN_BOOSTER: 15201004,
  BLANK_SHOTS: 15201005,
  WINGS: 15201006,
  RECOIL_SHOT: 15201007,
};

export class GunSlinger implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.GUN_MASTERY,
      SKILL.CRITICAL_SHOT,
      SKILL.INVISIBLE_SHOT,
      SKILL.GRENADE,
      SKILL.GUN_BOOSTER,
      SKILL.BLANK_SHOTS,
      SKILL.WINGS,
      SKILL.RECOIL_SHOT,
    ].includes(skillId);
  }
}
