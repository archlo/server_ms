import { User } from '../../../world/user/User';

export interface QuestAct {
  canAct(user: User, rewardIndex: number): boolean;
  doAct(user: User, rewardIndex: number): boolean;
}
