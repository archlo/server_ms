import { Job } from '../Job';
import { Char } from '../../../user/Char';

export class Ranger implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return false;
  }
}
