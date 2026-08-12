import { User } from '../../../world/user/User';

export interface QuestCheck {
  check(user: User): boolean;
}
