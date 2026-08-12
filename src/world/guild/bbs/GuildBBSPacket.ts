import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { BBSThread, BBSReply } from './BBSThread';

export enum BBSResultType {
  ListThreads = 0x06,
  LoadThread = 0x07,
  WriteThread = 0x08,
  DeleteThread = 0x09,
  NoticeThread = 0x0A,
  ReplyThread = 0x0B,
  UnknownError = 0x0C,
}

export class GuildBBSPacket {
  static listThreads(threads: BBSThread[], page: number, totalPages: number): Buffer {
    const w = begin(BBSResultType.ListThreads);
    w.writeInt(threads.length);
    w.writeInt(page);
    w.writeInt(totalPages);
    for (const t of threads) {
      w.writeInt(t.localThreadId);
      w.writeMapleAsciiString(t.name);
      w.writeLong(t.timestamp);
      w.writeInt(t.icon);
      w.writeMapleAsciiString(t.posterName);
      w.writeInt(t.replyCount);
    }
    return w.getPacket();
  }

  static loadThread(thread: BBSThread): Buffer {
    const w = begin(BBSResultType.LoadThread);
    w.writeInt(thread.localThreadId);
    w.writeMapleAsciiString(thread.name);
    w.writeLong(thread.timestamp);
    w.writeInt(thread.icon);
    w.writeMapleAsciiString(thread.posterName);
    w.writeMapleAsciiString(thread.startPost);
    w.writeInt(thread.replyCount);
    for (const r of thread.replies) {
      w.writeInt(r.replyId);
      w.writeLong(r.timestamp);
      w.writeMapleAsciiString(r.posterName);
      w.writeMapleAsciiString(r.content);
    }
    return w.getPacket();
  }

  static writeThreadDone(localThreadId: number, notice: boolean): Buffer {
    const w = begin(BBSResultType.WriteThread);
    w.writeBoolean(notice);
    w.writeInt(localThreadId);
    return w.getPacket();
  }

  static deleteThreadDone(localThreadId: number): Buffer {
    const w = begin(BBSResultType.DeleteThread);
    w.writeInt(localThreadId);
    return w.getPacket();
  }

  static replyDone(localThreadId: number): Buffer {
    const w = begin(BBSResultType.ReplyThread);
    w.writeInt(localThreadId);
    return w.getPacket();
  }

  static error(): Buffer {
    return beginSimple(BBSResultType.UnknownError);
  }
}

function begin(type: BBSResultType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.GUILD_BBS.code);
  w.writeByte(type);
  return w;
}

function beginSimple(type: BBSResultType): Buffer {
  return begin(type).getPacket();
}
