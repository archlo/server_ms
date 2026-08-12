import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  ALCHEMIST: 14110000,
  MESO_UP: 14110004,
  SHADOW_PARTNER: 14111002,
  SHADOW_WEB: 14111003,
  SHADOW_MESO: 14111005,
  AVENGER: 14111006,
  FLASH_JUMP_NL: 14111007,
  DARK_FLARE: 14111008,
};

export class Hermit implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.ALCHEMIST,
      SKILL.MESO_UP,
      SKILL.SHADOW_PARTNER,
      SKILL.SHADOW_WEB,
      SKILL.SHADOW_MESO,
      SKILL.AVENGER,
      SKILL.FLASH_JUMP_NL,
      SKILL.DARK_FLARE,
    ].includes(skillId);
  }
}
