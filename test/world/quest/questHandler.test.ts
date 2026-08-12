import { expect } from 'chai';
import { QuestProvider } from '../../../src/provider/QuestProvider';
import { QuestInfo } from '../../../src/provider/quest/QuestInfo';
import { QuestMobData } from '../../../src/provider/quest/QuestMobData';
import { QuestMobCheck } from '../../../src/provider/quest/check/QuestMobCheck';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { QuestHandler } from '../../../src/world/quest/QuestHandler';
import { QuestManager } from '../../../src/world/quest/QuestManager';
import { QuestRequestType } from '../../../src/world/quest/QuestRequestType';
import { QuestResultType } from '../../../src/world/quest/QuestResultType';
import { QuestState } from '../../../src/world/quest/QuestState';

function makeQuestInfo(questId: number, mobs: QuestMobData[]): QuestInfo {
  return new QuestInfo(
    questId, '', '', 0, 0, 0, false, false,
    [], [],
    [],
    mobs.length > 0 ? [new QuestMobCheck(questId, mobs)] : [],
  );
}

describe('world/quest/QuestHandler.ts', () => {
  it('should accept quests and write a success result', () => {
    const questId = 31001;
    QuestProvider.registerQuestInfo(makeQuestInfo(questId, []));
    const qm = new QuestManager();
    const writes: Buffer[] = [];
    const user = fakeUser(qm, writes);

    QuestHandler.handleUserQuestRequest(user as any, new PacketReader(questRequestPacket(QuestRequestType.AcceptQuest, questId, 1000)));

    expect(qm.getQuestRecord(questId)?.state).to.equal(QuestState.PERFORM);
    expect(lastQuestResult(writes)).to.equal(QuestResultType.Success);
  });

  it('should reject completion when registered mob progress is incomplete', () => {
    const questId = 31002;
    QuestProvider.registerQuestInfo(makeQuestInfo(questId, [new QuestMobData(0, 100100, 2)]));

    const qm = new QuestManager();
    const qr = qm.forceStartQuest(questId);
    qr.value = '001';
    const writes: Buffer[] = [];

    QuestHandler.handleUserQuestRequest(fakeUser(qm, writes) as any, new PacketReader(questRequestPacket(QuestRequestType.CompleteQuest, questId, 1000, 0)));

    expect(qm.getQuestRecord(questId)?.state).to.equal(QuestState.PERFORM);
    expect(lastQuestResult(writes)).to.equal(QuestResultType.Failed_Unknown);
  });

  it('should complete quests when required mob progress is satisfied', () => {
    const questId = 31003;
    QuestProvider.registerQuestInfo(makeQuestInfo(questId, [new QuestMobData(0, 100100, 2)]));

    const qm = new QuestManager();
    const qr = qm.forceStartQuest(questId);
    qr.value = '002';
    const writes: Buffer[] = [];

    QuestHandler.handleUserQuestRequest(fakeUser(qm, writes) as any, new PacketReader(questRequestPacket(QuestRequestType.CompleteQuest, questId, 1000, 0)));

    expect(qm.getQuestRecord(questId)?.state).to.equal(QuestState.COMPLETE);
    expect(lastQuestResult(writes)).to.equal(QuestResultType.Success);
  });

  it('should resign quests and remove the quest record', () => {
    const questId = 31004;
    QuestProvider.registerQuestInfo(makeQuestInfo(questId, []));
    const qm = new QuestManager();
    qm.forceStartQuest(questId);
    const writes: Buffer[] = [];

    QuestHandler.handleUserQuestRequest(fakeUser(qm, writes) as any, new PacketReader(resignQuestPacket(questId)));

    expect(qm.getQuestRecord(questId)).to.equal(undefined);
    expect(writes.some(p => p.readInt16LE(0) === MapleSendOpcode.RESIGN_QUEST_RETURN.code)).to.equal(true);
  });
});

function fakeUser(qm: QuestManager, writes: Buffer[]): object {
  return {
    getQuestManager: (): QuestManager => qm,
    getSkillManager: (): any => ({ getSkill: (): null => null, addSkill: (): void => undefined }),
    getInventoryManager: (): any => ({
      canAddItem: (): boolean => true,
      canAddMoney: (): boolean => true,
      addItem: (): null => null,
      addMoney: (): void => undefined,
      getItemCount: (): number => 0,
      hasItem: (): boolean => false,
      getInventoryByType: (): any => ({ getRemaining: (): number => 100 }),
      equipped: { getItems: (): Map<number, any> => new Map() },
      money: 1000,
    }),
    getSecondaryStat: (): any => ({ getOption: (): any => ({ nOption: 0 }), getTemporaryStats: (): Map<any, any> => new Map() }),
    getCharacterStat: (): any => ({ hp: 1000, mp: 500, maxHp: 1000, maxMp: 500, level: 20, job: 0, subJob: 0, sp: { addSp: (): void => undefined, addNonExtendSp: (): void => undefined, getNonExtendSp: (): number => 0 } }),
    getLevel: (): number => 20,
    getJob: (): number => 0,
    getGender: (): number => 0,
    addExp: (): void => undefined,
    addPop: (): void => undefined,
    updatePassiveSkillData: (): void => undefined,
    getField: (): null => null,
    write: (packet: Buffer): void => { writes.push(packet); },
    validateStat: (): void => undefined,
    getSkillLevel: (): number => 0,
  };
}

function questRequestPacket(type: QuestRequestType, questId: number, templateId: number, rewardIndex = 0): Buffer {
  const w = new PacketWriter();
  w.writeByte(type);
  w.writeShort(questId);
  w.writeInt(templateId);
  w.writeInt(0); // itemPos
  if (type === QuestRequestType.CompleteQuest) {
    w.writeInt(rewardIndex);
  }
  return w.getPacket();
}

function resignQuestPacket(questId: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(QuestRequestType.ResignQuest);
  w.writeShort(questId);
  return w.getPacket();
}

function lastQuestResult(writes: Buffer[]): QuestResultType {
  const packet = [...writes].reverse().find(p => p.readInt16LE(0) === MapleSendOpcode.USER_QUEST_RESULT.code);
  expect(packet).to.not.equal(undefined);
  return packet!.readUInt8(2) as QuestResultType;
}
