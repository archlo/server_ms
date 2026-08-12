import { QuestAct } from './QuestAct';
import { User, statChangedPacket } from '../../../world/user/User';
import { JobConstants } from '../../../world/job/JobConstants';
import { Stat } from '../../../world/user/stat/Stat';
import { NXNode } from '../../../wz-utils/NXNode';
import { questFailedUnknown } from '../../../world/quest/QuestPacket';

export class QuestSpAct implements QuestAct {
  constructor(private readonly job: number, private readonly sp: number) {}

  canAct(user: User, _rewardIndex: number): boolean {
    if (!JobConstants.getSkillRootFromJob(user.getJob()).includes(this.job)) {
      user.write(questFailedUnknown());
      return false;
    }
    return true;
  }

  doAct(user: User, _rewardIndex: number): boolean {
    const cs = user.getCharacterStat();
    if (JobConstants.isExtendSpJob(cs.job)) {
      cs.sp.addSp(JobConstants.getJobLevel(this.job), this.sp);
      user.write(statChangedPacket(Stat.SP, cs.sp));
    } else {
      cs.sp.addNonExtendSp(this.sp);
      user.write(statChangedPacket(Stat.SP, cs.sp.getNonExtendSp()));
    }
    return true;
  }

  static from(spList: NXNode): QuestSpAct {
    const spProp = spList.nGet('0') as NXNode | undefined;
    if (!spProp) throw new Error('Failed to resolve quest sp act data');
    const jobProp = spProp.nGet('job') as NXNode | undefined;
    if (!jobProp || jobProp.nChildren.length !== 1) {
      throw new Error('Failed to resolve quest sp act data');
    }
    return new QuestSpAct(
      Number(jobProp.nChildren[0].nValue),
      spProp.nGet('sp_value', 0) as number,
    );
  }
}
