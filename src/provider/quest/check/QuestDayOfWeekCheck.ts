import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';

export class QuestDayOfWeekCheck implements QuestCheck {
  private readonly allowed: Set<number>;

  constructor(allowed: Set<number>) {
    this.allowed = allowed;
  }

  check(_user: User): boolean {
    const dayOfWeek = new Date().getUTCDay();
    return this.allowed.has(dayOfWeek);
  }

  static from(dayOfWeekList: NXNode): QuestDayOfWeekCheck {
    const allowed = new Set<number>();
    for (const entry of dayOfWeekList.nChildren) {
      if (Number(entry.nValue) === 0) continue;
      switch (entry.nName) {
        case 'sun': allowed.add(0); break;
        case 'mon': allowed.add(1); break;
        case 'tue': allowed.add(2); break;
        case 'wed': allowed.add(3); break;
        case 'thu': allowed.add(4); break;
        case 'fri': allowed.add(5); break;
        case 'sat': allowed.add(6); break;
      }
    }
    return new QuestDayOfWeekCheck(allowed);
  }
}
