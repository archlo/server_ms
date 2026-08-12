import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';

export class QuestDateCheck implements QuestCheck {
  private readonly date: Date;
  private readonly isStart: boolean;

  constructor(date: Date, isStart: boolean) {
    this.date = date;
    this.isStart = isStart;
  }

  check(_user: User): boolean {
    const now = Date.now();
    return this.isStart ? now >= this.date.getTime() : now < this.date.getTime();
  }

  static from(dateString: string, isStart: boolean): QuestDateCheck {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10);
    const day = parseInt(dateString.substring(6, 8), 10);
    const hour = parseInt(dateString.substring(8, 10), 10);
    const minute = dateString.length >= 12 ? parseInt(dateString.substring(10, 12), 10) : 0;
    return new QuestDateCheck(new Date(Date.UTC(year, month - 1, day, hour, minute, 0)), isStart);
  }
}
