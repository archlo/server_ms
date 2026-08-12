import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  DAGGER_MASTERY: 14100000,
  DAGGER_BOOSTER: 14101004,
  HASTE: 14101005,
  STEAL: 14101006,
  SAVAGE_BLOW: 14101007,
};

export class Bandit implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.DAGGER_MASTERY,
      SKILL.DAGGER_BOOSTER,
      SKILL.HASTE,
      SKILL.STEAL,
      SKILL.SAVAGE_BLOW,
    ].includes(skillId);
  }
}
