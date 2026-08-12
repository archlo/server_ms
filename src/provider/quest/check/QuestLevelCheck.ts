import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';

export class QuestLevelCheck implements QuestCheck {
  constructor(private readonly level: number, private readonly isMinimum: boolean) {}

  check(user: User): boolean {
    return this.isMinimum ? user.getLevel() >= this.level : user.getLevel() <= this.level;
  }
}
