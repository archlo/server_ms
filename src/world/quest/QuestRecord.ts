import { QuestState } from './QuestState';

export class QuestRecord {
  state: QuestState = QuestState.NONE;
  value = '';
  completedTime: Date | null = null;

  constructor(public readonly questId: number) {}
}
