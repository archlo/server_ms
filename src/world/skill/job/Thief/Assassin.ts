import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  CLAW_MASTERY: 14100000,
  CRITICAL_THROW: 14100001,
  SHADOW_RESISTANCE: 14101003,
  CLAW_BOOSTER: 14101004,
  HASTE: 14101005,
  DRAIN: 14101006,
};

export class Assassin implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.CLAW_MASTERY,
      SKILL.CRITICAL_THROW,
      SKILL.SHADOW_RESISTANCE,
      SKILL.CLAW_BOOSTER,
      SKILL.HASTE,
      SKILL.DRAIN,
    ].includes(skillId);
  }
}
