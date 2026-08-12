import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { QuestResultType } from './QuestResultType';

function of(resultType: QuestResultType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.USER_QUEST_RESULT.code);
  w.writeByte(resultType);
  return w;
}

export function questResult(questId: number, templateId: number, nextQuestId: number): Buffer {
  const w = of(QuestResultType.Success);
  w.writeShort(questId);
  w.writeInt(templateId);
  w.writeShort(nextQuestId);
  return w.getPacket();
}

export function questFailedUnknown(): Buffer {
  return of(QuestResultType.Failed_Unknown).getPacket();
}

export function questFailedInventory(questId: number): Buffer {
  const w = of(QuestResultType.Failed_Inventory);
  w.writeShort(questId);
  return w.getPacket();
}

export function questFailedMeso(): Buffer {
  return of(QuestResultType.Failed_Meso).getPacket();
}

export function resignQuestReturn(questId: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.RESIGN_QUEST_RETURN.code);
  w.writeShort(questId);
  return w.getPacket();
}

/** Port of kinoko's QuestPacket::startTimeKeepQuestTimer. Sends a time-keep
 *  quest timer to the client, which displays a timer overlay for the given
 *  quest. The timer starts counting down from `durationMs`. */
export function startTimeKeepQuestTimer(questId: number, durationMs: number): Buffer {
  const w = of(QuestResultType.Start_TimeKeepQuestTimer);
  w.writeShort(questId);
  w.writeInt(durationMs);
  return w.getPacket();
}
