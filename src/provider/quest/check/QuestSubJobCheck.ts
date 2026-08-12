import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';

export class QuestSubJobCheck implements QuestCheck {
  constructor(private readonly subJobFlags: number) {}

  check(user: User): boolean {
    return ((1 << user.getCharacterStat().subJob) & this.subJobFlags) !== 0;
  }
}
