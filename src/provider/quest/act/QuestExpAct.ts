import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';
import { MessagePacket } from '../../../world/user/MessagePacket';

export class QuestExpAct implements QuestAct {
  constructor(private readonly exp: number) {}

  canAct(_user: User, _rewardIndex: number): boolean { return true; }

  doAct(user: User, _rewardIndex: number): boolean {
    user.addExp(this.exp);
    user.write(MessagePacket.incExp(this.exp, 0, true, true));
    return true;
  }
}
