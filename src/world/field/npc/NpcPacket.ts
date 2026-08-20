import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { Npc } from './Npc';
import { MovePath } from '../life/MovePath';
import { ScriptMessage } from '../../script/ScriptMessage';
import { QuestProvider } from '../../../provider/QuestProvider';

/** Port of kinoko's CNpcPool::OnPacket / OnNpcPacket. */
export class NpcPacket {
  static npcEnterField(npc: Npc, questIds: number[] = []): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.NPC_ENTER_FIELD.code);
    w.writeInt(npc.getId());
    w.writeInt(npc.getTemplateId());
    npc.encode(w);
    // Quest list: count followed by quest IDs
    w.writeShort(questIds.length);
    for (const questId of questIds) {
      w.writeInt(questId);
    }
    return w.getPacket();
  }

  static npcLeaveField(npc: Npc): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.NPC_LEAVE_FIELD.code);
    w.writeInt(npc.getId());
    return w.getPacket();
  }

  static npcChangeController(npc: Npc, forController: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.NPC_CHANGE_CONTROLLER.code);
    w.writeBoolean(forController);
    w.writeInt(npc.getId());
    if (forController) {
      w.writeInt(npc.getTemplateId());
      npc.encode(w);
    }
    return w.getPacket();
  }

  static npcMove(npc: Npc, oneTimeAction: number, chatIndex: number, movePath: MovePath | null): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.NPC_MOVE.code);
    w.writeInt(npc.getId());
    w.writeByte(oneTimeAction);
    w.writeByte(chatIndex);
    if (movePath !== null) {
      movePath.encode(w);
    }
    return w.getPacket();
  }

  static npcSpecialAction(npc: Npc, action: string | number, delay?: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.NPC_SPECIAL_ACTION.code);
    w.writeInt(npc.getId());
    if (typeof action === 'number') {
      w.writeInt(action);
      if (delay !== undefined) w.writeInt(delay);
    } else {
      w.writeMapleAsciiString(action);
    }
    return w.getPacket();
  }

  /** Port of kinoko's FieldPacket::scriptMessage. */
  static scriptMessage(message: ScriptMessage): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SCRIPT_MESSAGE.code);
    message.encode(w);
    return w.getPacket();
  }
}
