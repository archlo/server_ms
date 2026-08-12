import { Char } from '../../../user/Char';
import { Skill } from '../../Skill';
import { Job } from '../Job';

export class Paladin implements Job {
  static readonly SKILL_ID = 122;
  static readonly DIVINE_SHIELD = 1220013;

  handleSkill(chr: Char, skill: Skill): void {}
  handleAttack(chr: Char, skill: Skill, attackInfo: number): void {}
  handleBuff(chr: Char, skill: Skill, option: number): void {}
  isHandlerOfSkill(skillId: number): boolean { return skillId === Paladin.SKILL_ID || skillId === Paladin.DIVINE_SHIELD; }
}
