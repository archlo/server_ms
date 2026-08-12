import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { Memo } from './Memo';
import { MemoResultType } from './Memo';

/**
 * Port of kinoko's MemoPacket (packet.world.MemoPacket).
 * CWvsContext::OnMemoResult packet builders.
 */
export class MemoPacket {
  // MemoRes::Load — sends the receiver's full memo list.
  static load(memos: Memo[]): Buffer {
    const w = MemoPacket.of(MemoResultType.Load);
    w.writeByte(memos.length); // lReceivedMemo
    for (const memo of memos) {
      memo.encode(w);
    }
    return w.getPacket();
  }

  static sendSucceed(): Buffer {
    return MemoPacket.of(MemoResultType.Send_Succeed).getPacket();
  }

  static sendWarningOnline(): Buffer {
    return MemoPacket.sendWarning(0);
  }

  static sendWarningName(): Buffer {
    return MemoPacket.sendWarning(1);
  }

  static sendWarningFull(): Buffer {
    return MemoPacket.sendWarning(2);
  }

  // 0 : The other character is online now.\r\nPlease use the whisper function%2C
  // 1 : Please check the name of the receiving character.
  // 2 : The receiver's inbox is full.\r\nPlease try again.
  static sendWarning(warningType: number): Buffer {
    const w = MemoPacket.of(MemoResultType.Send_Warning);
    w.writeByte(warningType);
    return w.getPacket();
  }

  // MemoNotify::Receive — prompts the client to refresh its memo list.
  static receive(): Buffer {
    return MemoPacket.of(MemoResultType.Receive).getPacket();
  }

  private static of(resultType: MemoResultType): PacketWriter {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MEMO_RESULT.code);
    w.writeByte(resultType);
    return w;
  }
}
