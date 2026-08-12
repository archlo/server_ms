import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  SHADOW_SHIFTER: 14120000,
  VENOMOUS_STAB: 14120001,
  MESO_MASTERY: 14120002,
  MAPLE_WARRIOR: 14121000,
  ASSASSINATE: 14121003,
  TAUNT: 14121004,
  NINJA_AMBUSH: 14121005,
  SMOKESCREEN: 14121006,
  BOOMERANG_STEP: 14121007,
  HEROS_WILL: 14121008,
};

export class Shadower implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.SHADOW_SHIFTER,
      SKILL.VENOMOUS_STAB,
      SKILL.MESO_MASTERY,
      SKILL.MAPLE_WARRIOR,
      SKILL.ASSASSINATE,
      SKILL.TAUNT,
      SKILL.NINJA_AMBUSH,
      SKILL.SMOKESCREEN,
      SKILL.BOOMERANG_STEP,
      SKILL.HEROS_WILL,
    ].includes(skillId);
  }
}
