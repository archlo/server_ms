import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { SecondaryStat } from '../../../world/user/stat/SecondaryStat';

export class QuestBuffCheck implements QuestCheck {
  constructor(private readonly buffItemId: number, private readonly isExcept: boolean) {}

  check(user: User): boolean {
    return this.isSetted(user.getSecondaryStat(), -this.buffItemId) !== this.isExcept;
  }

  private isSetted(secondaryStat: SecondaryStat, rOption: number): boolean {
    for (const option of secondaryStat.getTemporaryStats().values()) {
      if (option.rOption === rOption) return true;
    }
    return false;
  }
}
