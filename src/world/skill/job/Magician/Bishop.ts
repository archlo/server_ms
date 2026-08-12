import { Char } from '../../../user/Char';
import { Skill } from '../../Skill';
import { Job } from '../Job';

export class Bishop implements Job {
  static readonly SKILL_ID = 232;
  static readonly BUFF_MASTERY_BISHOP = 2321010;

  handleSkill(chr: Char, skill: Skill): void {}
  handleAttack(chr: Char, skill: Skill, attackInfo: number): void {}
  handleBuff(chr: Char, skill: Skill, option: number): void {}
  isHandlerOfSkill(skillId: number): boolean { return skillId === Bishop.SKILL_ID || skillId === Bishop.BUFF_MASTERY_BISHOP; }
}
