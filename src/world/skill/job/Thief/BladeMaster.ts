import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  VENOM: 14312000,
  MAPLE_WARRIOR: 14312100,
  FINAL_CUT: 14312101,
  MONSTER_BOMB: 14312102,
  SUDDEN_RAID: 14312103,
  CHAINS_OF_HELL: 14312104,
  MIRRORED_TARGET: 14312105,
  THORNS: 14312106,
  HEROS_WILL: 14312107,
};

export class BladeMaster implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.VENOM,
      SKILL.MAPLE_WARRIOR,
      SKILL.FINAL_CUT,
      SKILL.MONSTER_BOMB,
      SKILL.SUDDEN_RAID,
      SKILL.CHAINS_OF_HELL,
      SKILL.MIRRORED_TARGET,
      SKILL.THORNS,
      SKILL.HEROS_WILL,
    ].includes(skillId);
  }
}
