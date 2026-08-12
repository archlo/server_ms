import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  BURST_FIRE: 15211000,
  OCTOPUS: 15211001,
  GAVIOTA: 15211002,
  FLAMETHROWER: 15211003,
  ICE_SPLITTER: 15211004,
  HOMING_BEACON: 15211005,
  ROLL_OF_THE_DICE: 15211006,
};

export class Outlaw implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.BURST_FIRE,
      SKILL.OCTOPUS,
      SKILL.GAVIOTA,
      SKILL.FLAMETHROWER,
      SKILL.ICE_SPLITTER,
      SKILL.HOMING_BEACON,
      SKILL.ROLL_OF_THE_DICE,
    ].includes(skillId);
  }
}
