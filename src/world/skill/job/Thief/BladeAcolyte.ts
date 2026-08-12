import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  SHADOW_RESISTANCE: 14310000,
  SELF_HASTE: 14311001,
  FATAL_BLOW: 14311002,
  SLASH_STORM: 14311003,
};

export class BladeAcolyte implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.SHADOW_RESISTANCE,
      SKILL.SELF_HASTE,
      SKILL.FATAL_BLOW,
      SKILL.SLASH_STORM,
    ].includes(skillId);
  }
}
