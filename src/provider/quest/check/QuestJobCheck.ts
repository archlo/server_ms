import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';
import { JobConstants } from '../../../world/job/JobConstants';

export class QuestJobCheck implements QuestCheck {
  constructor(private readonly jobs: Set<number>) {}

  check(user: User): boolean {
    if (JobConstants.isAdminJob(user.getJob())) return true;
    return this.jobs.has(user.getJob());
  }

  static from(jobList: NXNode): QuestJobCheck {
    const jobs = new Set<number>();
    for (const entry of jobList.nChildren) {
      jobs.add(Number(entry.nValue));
    }
    return new QuestJobCheck(jobs);
  }
}
