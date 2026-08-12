import { Char } from '../../../user/Char';
import { Skill } from '../../Skill';
import { Job } from '../Job';

export class ILMage implements Job {
  static readonly SKILL_ID = 221;

  handleSkill(chr: Char, skill: Skill): void {}
  handleAttack(chr: Char, skill: Skill, attackInfo: number): void {}
  handleBuff(chr: Char, skill: Skill, option: number): void {}
  isHandlerOfSkill(skillId: number): boolean { return false; }
}
