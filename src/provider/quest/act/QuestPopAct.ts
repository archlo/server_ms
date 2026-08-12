import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';
import { MessagePacket } from '../../../world/user/MessagePacket';

export class QuestPopAct implements QuestAct {
  constructor(private readonly pop: number) {}

  canAct(_user: User, _rewardIndex: number): boolean { return true; }

  doAct(user: User, _rewardIndex: number): boolean {
    user.addPop(this.pop);
    user.write(MessagePacket.incPop(this.pop));
    return true;
  }
}
