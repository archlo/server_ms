import { Char } from '../../../user/Char';
import { Skill } from '../../Skill';
import { Job } from '../Job';

export class Hero implements Job {
  static readonly SKILL_ID = 112;
  static readonly COMBAT_MASTERY = 1120012;

  handleSkill(chr: Char, skill: Skill): void {}
  handleAttack(chr: Char, skill: Skill, attackInfo: number): void {}
  handleBuff(chr: Char, skill: Skill, option: number): void {}
  isHandlerOfSkill(skillId: number): boolean { return skillId === Hero.SKILL_ID || skillId === Hero.COMBAT_MASTERY; }
}
