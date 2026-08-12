import { Job } from '../Job';
import { Char } from '../../../user/Char';

export class GM implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return false;
  }
}
