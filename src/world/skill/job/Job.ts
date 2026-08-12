import { Char } from '../../user/Char';
import { Skill } from '../Skill';

export interface Job {
  handleSkill?(chr: Char, skill: Skill): void;
  handleAttack?(chr: Char, skill: Skill, attackInfo: any): void;
  handleBuff?(chr: Char, skill: Skill, option: any): void;
  isHandlerOfSkill(skillId: number): boolean;
}
