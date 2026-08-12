import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';
import { ItemProvider } from '../../ItemProvider';
import { questFailedUnknown } from '../../../world/quest/QuestPacket';

export class QuestBuffAct implements QuestAct {
  constructor(private readonly buffItemId: number) {}

  canAct(user: User, _rewardIndex: number): boolean {
    if (!ItemProvider.getItemInfo(this.buffItemId)) {
      user.write(questFailedUnknown());
      return false;
    }
    return true;
  }

  doAct(user: User, _rewardIndex: number): boolean {
    const info = ItemProvider.getItemInfo(this.buffItemId);
    if (!info) return false;
    user.setConsumeItemEffect(info);
    return true;
  }
}
