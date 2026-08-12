import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';
import { QuestState } from '../../../world/quest/QuestState';

export class QuestExCheck implements QuestCheck {
  constructor(private readonly questId: number, private readonly allowedValues: Set<string>) {}

  getQuestId(): number { return this.questId; }
  getAllowedValues(): Set<string> { return this.allowedValues; }

  check(user: User): boolean {
    const qr = user.getQuestManager().getQuestRecord(this.questId);
    if (!qr) return false;
    return qr.state === QuestState.PERFORM && this.allowedValues.has(qr.value);
  }

  static from(questId: number, exList: NXNode): QuestExCheck {
    const allowedValues = new Set<string>();
    for (const exProp of exList.nChildren) {
      const value = exProp.nGet('value', '') as string;
      allowedValues.add(value);
    }
    return new QuestExCheck(questId, allowedValues);
  }
}
