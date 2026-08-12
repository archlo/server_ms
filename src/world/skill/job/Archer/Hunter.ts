import { Job } from '../Job';
import { Char } from '../../../user/Char';

export class Hunter implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return false;
  }
}
