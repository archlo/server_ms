import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  ADVANCED_DARKSIGHT: 14312000,
  BLOODY_STORM: 14311004,
  MIRROR_IMAGE: 14311005,
  OWL_SPIRIT: 14311006,
  UPPER_STAB: 14311007,
  FLYING_ASSAULTER: 14311008,
};

export class BladeLord implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.ADVANCED_DARKSIGHT,
      SKILL.BLOODY_STORM,
      SKILL.MIRROR_IMAGE,
      SKILL.OWL_SPIRIT,
      SKILL.UPPER_STAB,
      SKILL.FLYING_ASSAULTER,
    ].includes(skillId);
  }
}
