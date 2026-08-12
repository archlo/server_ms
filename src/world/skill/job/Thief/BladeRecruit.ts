import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  KATARA_MASTERY: 14300000,
  TRIPLE_STAB: 1431002,
  KATARA_BOOSTER: 1431004,
};

export class BladeRecruit implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.KATARA_MASTERY,
      SKILL.TRIPLE_STAB,
      SKILL.KATARA_BOOSTER,
    ].includes(skillId);
  }
}
