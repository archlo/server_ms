import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';
import { QuestMobData } from '../QuestMobData';

export class QuestMobCheck implements QuestCheck {
  constructor(private readonly questId: number, private readonly mobs: QuestMobData[]) {}

  getMobs(): QuestMobData[] { return this.mobs; }

  check(user: User): boolean {
    const qr = user.getQuestManager().getQuestRecord(this.questId);
    if (!qr) return false;
    const value = qr.value;
    if (!value || value.length === 0) return false;
    const required = this.mobs.map(m => String(m.count).padStart(3, '0')).join('');
    return value === required;
  }

  static from(questId: number, mobList: NXNode): QuestMobCheck {
    const mobs: QuestMobData[] = [];
    for (const mobProp of mobList.nChildren) {
      mobs.push(new QuestMobData(
        parseInt(mobProp.nName),
        mobProp.nGet('id', 0) as number,
        mobProp.nGet('count', 0) as number,
      ));
    }
    return new QuestMobCheck(questId, mobs);
  }
}
