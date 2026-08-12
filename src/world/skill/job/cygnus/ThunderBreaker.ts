import { Job } from '../Job';
import { Char } from '../../../user/Char';

export class ThunderBreaker implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return false;
  }
}
