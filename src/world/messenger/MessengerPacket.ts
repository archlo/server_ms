import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MessengerMember } from './MessengerMember';
import { MessengerRoom } from './MessengerRoom';

export enum MessengerResultType {
  Open = 0,
  Join = 1,
  Leave = 2,
  Invite = 3,
  Chat = 4,
}

export class MessengerPacket {
  static open(room: MessengerRoom, self: MessengerMember): Buffer {
    const w = begin(MessengerResultType.Open);
    w.writeInt(room.messengerId);
    w.writeByte(self.position);
    MessengerPacket.encodeMembers(w, room);
    return w.getPacket();
  }

  static join(member: MessengerMember): Buffer {
    const w = begin(MessengerResultType.Join);
    member.encode(w);
    return w.getPacket();
  }

  static leave(position: number): Buffer {
    const w = begin(MessengerResultType.Leave);
    w.writeByte(position);
    return w.getPacket();
  }

  static invite(senderName: string, roomId: number): Buffer {
    const w = begin(MessengerResultType.Invite);
    w.writeInt(roomId);
    w.writeMapleAsciiString(senderName);
    return w.getPacket();
  }

  static chat(senderName: string, text: string): Buffer {
    const w = begin(MessengerResultType.Chat);
    w.writeMapleAsciiString(senderName);
    w.writeMapleAsciiString(text);
    return w.getPacket();
  }

  private static encodeMembers(w: PacketWriter, room: MessengerRoom): void {
    const members = room.getMembers();
    w.writeByte(members.length);
    for (const member of members) member.encode(w);
  }
}

function begin(type: MessengerResultType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.MESSENGER.code);
  w.writeByte(type);
  return w;
}
