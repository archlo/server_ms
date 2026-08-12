import { Job } from '../Job';
import { Char } from '../../../user/Char';

export class Legend implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return false;
  }
}
