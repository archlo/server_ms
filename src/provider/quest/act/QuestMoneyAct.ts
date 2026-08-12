import { QuestAct } from './QuestAct';
import { User, statChangedPacket } from '../../../world/user/User';
import { MessagePacket } from '../../../world/user/MessagePacket';
import { Stat } from '../../../world/user/stat/Stat';
import { questFailedMeso } from '../../../world/quest/QuestPacket';

export class QuestMoneyAct implements QuestAct {
  constructor(private readonly money: number) {}

  canAct(user: User, _rewardIndex: number): boolean {
    const newMoney = user.getInventoryManager().money + this.money;
    if (newMoney > 0x7FFFFFFF || newMoney < 0) {
      user.write(questFailedMeso());
      return false;
    }
    return true;
  }

  doAct(user: User, _rewardIndex: number): boolean {
    const im = user.getInventoryManager();
    if (!im.addMoney(this.money)) return false;
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(MessagePacket.incMoney(this.money));
    return true;
  }
}
