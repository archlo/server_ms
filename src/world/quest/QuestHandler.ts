import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { getQuestRequestType, QuestRequestType } from './QuestRequestType';
import { QuestProvider } from '../../provider/QuestProvider';
import { NpcProvider } from '../../provider/NpcProvider';
import { ScriptManager } from '../script/ScriptManager';
import { MessagePacket } from '../user/MessagePacket';
import { questResult, questFailedUnknown, resignQuestReturn } from './QuestPacket';

export class QuestHandler {
  static handleUserQuestRequest(user: User, r: PacketReader): void {
    const action = r.readByte();
    const questId = r.readShort();
    const requestType = getQuestRequestType(action);
    if (requestType === null) return;

    const questInfo = QuestProvider.getQuestInfo(questId);

    switch (requestType) {
      case QuestRequestType.AcceptQuest: {
        const templateId = r.readInt();
        r.readInt(); // itemPos
        if (!questInfo) {
          user.write(questFailedUnknown());
          return;
        }
        const qr = questInfo.startQuest(user);
        if (!qr) {
          user.write(questFailedUnknown());
          return;
        }
        user.write(MessagePacket.questRecord(qr));
        user.write(questResult(questId, templateId, 0));
        user.validateStat();
        return;
      }
      case QuestRequestType.CompleteQuest: {
        const templateId = r.readInt();
        r.readInt(); // itemPos
        const rewardIndex = r.readInt();
        if (!questInfo) {
          user.write(questFailedUnknown());
          return;
        }
        const result = questInfo.completeQuest(user, rewardIndex);
        if (!result) {
          user.write(questFailedUnknown());
          return;
        }
        user.write(MessagePacket.questRecord(result.record));
        user.write(questResult(questId, templateId, result.nextQuest));
        user.validateStat();
        return;
      }
      case QuestRequestType.ResignQuest: {
        if (questInfo) {
          const qr = questInfo.resignQuest(user);
          if (qr) {
            user.write(MessagePacket.questRecord(qr));
          }
        }
        user.write(resignQuestReturn(questId));
        user.validateStat();
        return;
      }
      case QuestRequestType.OpeningScript:
      case QuestRequestType.CompleteScript: {
        if (!questInfo || questInfo.npc === 0) {
          user.write(questFailedUnknown());
          return;
        }
        const npcTemplate = NpcProvider.getNpcTemplate(questInfo.npc);
        if (!npcTemplate || !npcTemplate.hasScript()) {
          user.write(questFailedUnknown());
          return;
        }
        const field = user.getField();
        if (!field) {
          user.write(questFailedUnknown());
          return;
        }
        ScriptManager.startNpcScript(user, field, npcTemplate.script!, questInfo.npc);
        return;
      }
      default:
        user.write(questFailedUnknown());
        return;
    }
  }

  static handleUserQuestRecordSetState(user: User, r: PacketReader): void {
    const questId = r.readShort();
    const _state = r.readByte();
    r.readByte(); // value (unknown usage)
    const qr = user.getQuestManager().getQuestRecord(questId);
    if (qr) {
      user.write(MessagePacket.questRecord(qr));
    }
  }

  static handleQuestGuideRequest(_user: User, _r: PacketReader): void {
    // Stub: quest guide request (opcode 221) - no handler in reference implementation
  }
}
