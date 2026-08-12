import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  CRYSTAL_THROW: 30001000,
  INFLITRATE: 30001001,
  POTION_MASTERY: 30000002,
  MASK_SKILL_A: 30001003,
  MASK_SKILL_B: 30001004,
  MASK_SKILL_C: 30001005,
  MASK_SKILL_D: 30001006,
  MASK_SKILL_E: 30001007,
};

export class Citizen implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.CRYSTAL_THROW,
      SKILL.INFLITRATE,
      SKILL.POTION_MASTERY,
      SKILL.MASK_SKILL_A,
      SKILL.MASK_SKILL_B,
      SKILL.MASK_SKILL_C,
      SKILL.MASK_SKILL_D,
      SKILL.MASK_SKILL_E,
    ].includes(skillId);
  }
}
