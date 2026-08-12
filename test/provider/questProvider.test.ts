import { expect } from 'chai';
import { QuestProvider } from '../../src/provider/QuestProvider';
import { QuestInfo } from '../../src/provider/quest/QuestInfo';
import { QuestMobData } from '../../src/provider/quest/QuestMobData';
import { QuestMobCheck } from '../../src/provider/quest/check/QuestMobCheck';
import { QuestRecord } from '../../src/world/quest/QuestRecord';
import { QuestState } from '../../src/world/quest/QuestState';

function makeQuestInfo(questId: number, mobs: QuestMobData[]): QuestInfo {
  return new QuestInfo(
    questId, '', '', 0, 0, 0, false, false,
    [], [],
    [],
    mobs.length > 0 ? [new QuestMobCheck(questId, mobs)] : [],
  );
}

describe('provider/QuestProvider.ts', () => {
  it('should register quest info and progress matching mob kills', () => {
    const questId = 910001;
    const info = makeQuestInfo(questId, [
      new QuestMobData(0, 100100, 2),
      new QuestMobData(1, 100101, 1),
    ]);
    QuestProvider.registerQuestInfo(info);

    const qr = new QuestRecord(questId);
    qr.state = QuestState.PERFORM;

    expect(QuestProvider.getQuestInfo(questId)).to.equal(info);
    expect(info.progressQuest(qr, 100100)).to.equal(qr);
    expect(qr.value).to.equal('001000');
    expect(info.progressQuest(qr, 100101)).to.equal(qr);
    expect(qr.value).to.equal('001001');
    expect(info.progressQuest(qr, 100100)).to.equal(qr);
    expect(qr.value).to.equal('002001');
    expect(info.progressQuest(qr, 100100)).to.equal(null);
    expect(qr.value).to.equal('002001');
  });

  it('should ignore non-performing quests and non-matching mobs', () => {
    const info = makeQuestInfo(910002, [new QuestMobData(0, 100100, 1)]);
    const qr = new QuestRecord(910002);

    expect(info.progressQuest(qr, 100100)).to.equal(null);
    qr.state = QuestState.PERFORM;
    expect(info.progressQuest(qr, 999999)).to.equal(null);
    expect(qr.value).to.equal('');
  });

  it('should report registered quest item ownership with the current broad matcher', () => {
    const questId = 910003;
    QuestProvider.registerQuestInfo(makeQuestInfo(questId, []));

    expect(QuestProvider.hasQuestItem(questId, 4000000)).to.equal(false);
    expect(QuestProvider.hasQuestItem(999999, 4000000)).to.equal(false);
  });
});
