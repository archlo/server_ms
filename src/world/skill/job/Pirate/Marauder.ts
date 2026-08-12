import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  STUN_MASTERY: 15110000,
  ENERGY_CHARGE: 15111001,
  BRAWLING_MASTERY: 15110002,
  ENERGY_BLAST: 15111003,
  ENERGY_DRAIN: 15111004,
  TRANSFORMATION: 15111005,
  SHOCKWAVE: 15111006,
  ROLL_OF_THE_DICE: 15111007,
};

export class Marauder implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.STUN_MASTERY,
      SKILL.ENERGY_CHARGE,
      SKILL.BRAWLING_MASTERY,
      SKILL.ENERGY_BLAST,
      SKILL.ENERGY_DRAIN,
      SKILL.TRANSFORMATION,
      SKILL.SHOCKWAVE,
      SKILL.ROLL_OF_THE_DICE,
    ].includes(skillId);
  }
}
