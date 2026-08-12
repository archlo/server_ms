export enum QuestRequestType {
  LostItem = 0,
  AcceptQuest = 1,
  CompleteQuest = 2,
  ResignQuest = 3,
  OpeningScript = 4,
  CompleteScript = 5,
}

export function getQuestRequestType(value: number): QuestRequestType | null {
  switch (value) {
    case 0: return QuestRequestType.LostItem;
    case 1: return QuestRequestType.AcceptQuest;
    case 2: return QuestRequestType.CompleteQuest;
    case 3: return QuestRequestType.ResignQuest;
    case 4: return QuestRequestType.OpeningScript;
    case 5: return QuestRequestType.CompleteScript;
    default: return null;
  }
}
