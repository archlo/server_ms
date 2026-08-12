import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';

export class QuestInfoAct implements QuestAct {
  constructor(private readonly questId: number, private readonly info: string) {}

  canAct(_user: User, _rewardIndex: number): boolean { return true; }

  doAct(user: User, _rewardIndex: number): boolean {
    user.getQuestManager().setQuestInfoEx(this.questId, this.info);
    return true;
  }
}
