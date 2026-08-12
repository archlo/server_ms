import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { CharacterTemporaryStat } from '../../../world/user/stat/CharacterTemporaryStat';

export class QuestMorphCheck implements QuestCheck {
  constructor(private readonly morph: number) {}

  check(user: User): boolean {
    return user.getSecondaryStat().getOption(CharacterTemporaryStat.Morph).nOption === this.morph;
  }
}
