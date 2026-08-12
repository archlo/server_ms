import { QuestRecord } from './QuestRecord';
import { QuestState } from './QuestState';

export class QuestManager {
  private readonly questRecords = new Map<number, QuestRecord>();

  getQuestRecords(): QuestRecord[]  { return [...this.questRecords.values()]; }
  getStartedQuests(): QuestRecord[] { return this.getQuestRecords().filter(q => q.state === QuestState.PERFORM); }
  getCompletedQuests(): QuestRecord[] { return this.getQuestRecords().filter(q => q.state === QuestState.COMPLETE); }
  getExQuests(): QuestRecord[]      { return this.getQuestRecords().filter(q => q.state === QuestState.PARTYQUEST); }

  addQuestRecord(qr: QuestRecord): void      { this.questRecords.set(qr.questId, qr); }
  removeQuestRecord(questId: number): QuestRecord | undefined {
    const qr = this.questRecords.get(questId);
    if (qr) this.questRecords.delete(questId);
    return qr;
  }
  getQuestRecord(questId: number): QuestRecord | undefined    { return this.questRecords.get(questId); }

  hasQuestStarted(questId: number): boolean   { return this.questRecords.get(questId)?.state === QuestState.PERFORM; }
  hasQuestCompleted(questId: number): boolean { return this.questRecords.get(questId)?.state === QuestState.COMPLETE; }

  forceStartQuest(questId: number): QuestRecord {
    const qr = new QuestRecord(questId);
    qr.state = QuestState.PERFORM;
    this.addQuestRecord(qr);
    return qr;
  }

  forceCompleteQuest(questId: number): QuestRecord {
    const qr = this.questRecords.get(questId) ?? new QuestRecord(questId);
    qr.state = QuestState.COMPLETE;
    qr.completedTime = new Date();
    this.addQuestRecord(qr);
    return qr;
  }

  setQuestInfoEx(questId: number, value: string): QuestRecord {
    const qr = this.questRecords.get(questId) ?? new QuestRecord(questId);
    qr.state = QuestState.PARTYQUEST;
    qr.value = value;
    this.addQuestRecord(qr);
    return qr;
  }
}
