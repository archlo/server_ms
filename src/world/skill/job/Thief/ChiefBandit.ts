import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  SHIELD_MASTERY: 14110000,
  CHAKRA: 14110004,
  ASSAULTER: 14111002,
  PICKPOCKET: 14111003,
  BAND_OF_THIEVES: 14110005,
  MESO_GUARD: 14111006,
  MESO_EXPLOSION: 14111007,
  DARK_FLARE: 14111008,
  SHADOW_PARTNER: 14111009,
  FLASH_JUMP_CB: 14111010,
};

export class ChiefBandit implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.SHIELD_MASTERY,
      SKILL.CHAKRA,
      SKILL.ASSAULTER,
      SKILL.PICKPOCKET,
      SKILL.BAND_OF_THIEVES,
      SKILL.MESO_GUARD,
      SKILL.MESO_EXPLOSION,
      SKILL.DARK_FLARE,
      SKILL.SHADOW_PARTNER,
      SKILL.FLASH_JUMP_CB,
    ].includes(skillId);
  }
}
