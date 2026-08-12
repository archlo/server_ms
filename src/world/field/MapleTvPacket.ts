import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { MapleTvMessage } from './MapleTvMessage';

/**
 * Port of kinoko's MapleTvPacket (CMapleTVMan::OnPacket).
 */
export class MapleTvPacket {
  /** Port of kinoko's MapleTvPacket::updateMessage. */
  static updateMessage(message: MapleTvMessage, totalWaitTime: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MAPLE_TV_UPDATE_MESSAGE.code);
    w.writeByte(message.flag);
    w.writeByte(message.type); // m_nMessageType (0 : MAPLETV, 1 : MAPLESOLETV, 2 : MAPLELOVETV)
    message.sender.encode(w); // m_alSender
    w.writeMapleAsciiString(message.senderName); // sSender
    w.writeMapleAsciiString(message.receiverName ?? ''); // sReceiver
    w.writeMapleAsciiString(message.s1);
    w.writeMapleAsciiString(message.s2);
    w.writeMapleAsciiString(message.s3);
    w.writeMapleAsciiString(message.s4);
    w.writeMapleAsciiString(message.s5);
    w.writeInt(totalWaitTime); // m_nTotalWaitTime
    if ((message.flag & 2) !== 0 && message.receiver) {
      message.receiver.encode(w); // m_alReceiver
    }
    return w.getPacket();
  }

  /** Port of kinoko's MapleTvPacket::clearMessage. */
  static clearMessage(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MAPLE_TV_CLEAR_MESSAGE.code);
    return w.getPacket();
  }

  /** Port of kinoko's WvsContext::mapleTvUseRes (failure result message). */
  static useRes(message: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MAPLE_TV_USE_RES.code);
    w.writeMapleAsciiString(message);
    return w.getPacket();
  }
}
