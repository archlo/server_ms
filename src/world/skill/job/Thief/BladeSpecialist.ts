import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  TORNADO_SPIN: 14311004,
  TORNADO_SPIN_ATT: 14311005,
  FLASHBANG: 14311006,
  FLASH_JUMP_DB: 14311007,
};

export class BladeSpecialist implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.TORNADO_SPIN,
      SKILL.TORNADO_SPIN_ATT,
      SKILL.FLASHBANG,
      SKILL.FLASH_JUMP_DB,
    ].includes(skillId);
  }
}
