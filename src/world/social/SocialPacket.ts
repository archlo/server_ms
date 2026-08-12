import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { ChatType } from '../user/ChatType';
import { User } from '../user/User';

enum WhisperResult {
  Reply = 10,
  Receive = 18,
}

export class SocialPacket {
  static groupMessage(sender: User, type: ChatType, text: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.GROUP_MESSAGE.code);
    w.writeByte(type);
    w.writeMapleAsciiString(sender.getCharacterName());
    w.writeMapleAsciiString(text);
    w.writeInt(sender.getCharacterId());
    return w.getPacket();
  }

  static whisper(sender: User, text: string, channelId = 0): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.WHISPER.code);
    w.writeByte(WhisperResult.Receive);
    w.writeMapleAsciiString(sender.getCharacterName());
    w.writeShort(channelId);
    w.writeMapleAsciiString(text);
    return w.getPacket();
  }

  static whisperResult(targetName: string, success: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.WHISPER.code);
    w.writeByte(WhisperResult.Reply);
    w.writeMapleAsciiString(targetName);
    w.writeByte(success ? 1 : 0);
    return w.getPacket();
  }
}
