import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { QuestInfo } from './quest/QuestInfo';

export const QuestProvider = {
  initialize(): void {
    questInfos.clear();
    loadQuestInfos();
  },

  getQuestInfo(questId: number): QuestInfo | undefined {
    return questInfos.get(questId);
  },

  registerQuestInfo(info: QuestInfo): void {
    questInfos.set(info.questId, info);
  },

  hasQuestItem(questId: number, itemId: number): boolean {
    const info = questInfos.get(questId);
    if (!info) return false;
    for (const check of info.completeChecks) {
      if (check.constructor.name !== 'QuestItemCheck') continue;
      const items = (check as any).getItems() as Array<{ itemId: number; count: number }>;
      for (const itemData of items) {
        if (itemData.itemId === itemId) return true;
      }
    }
    return false;
  },
};

const questInfos = new Map<number, QuestInfo>();

function loadQuestInfos(): void {
  const questInfoImg = NXManager.getOrThrow('Quest.wz/QuestInfo.img') as NXNode;
  const actImg = NXManager.getOrThrow('Quest.wz/Act.img') as NXNode;
  const checkImg = NXManager.getOrThrow('Quest.wz/Check.img') as NXNode;

  for (const questNode of questInfoImg.nChildren) {
    const questId = parseInt(questNode.nName);
    if (isNaN(questId)) continue;
    const actNode = actImg.nGet(questNode.nName) as NXNode | undefined;
    const checkNode = checkImg.nGet(questNode.nName) as NXNode | undefined;
    if (!actNode || !checkNode) continue;
    questInfos.set(questId, QuestInfo.from(questId, questNode, actNode, checkNode));
  }
}
