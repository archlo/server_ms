import { Job } from '../Job';
import { Char } from '../../../user/Char';

const CYGNUS_BLESSING = 20000022;

export class Noblesse implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return false;
  }
}
