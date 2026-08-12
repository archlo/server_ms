import { PacketWriter } from '../../protocol/packets/packetWriter';

// MemoType (kinoko server.memo.MemoType)
export enum MemoType {
  DEFAULT = 0,
  INCPOP = 1,
  NOTIFY_RECEIPT_GIFT = 2,
  INVITATION = 3,
  BROKEUP = 4,
  DIVORCED = 5,
  FROMGM = 6,
}

export function memoTypeByValue(value: number): MemoType | null {
  for (const t of Object.values(MemoType)) {
    if (typeof t === 'number' && t === value) return t as MemoType;
  }
  return null;
}

// MemoRequestType (kinoko server.memo.MemoRequestType)
export enum MemoRequestType {
  Send = 0,
  Delete = 1,
  Load = 2,
}

export function memoRequestTypeByValue(value: number): MemoRequestType | null {
  for (const t of Object.values(MemoRequestType)) {
    if (typeof t === 'number' && t === value) return t as MemoRequestType;
  }
  return null;
}

// MemoResultType (kinoko server.memo.MemoResultType)
export enum MemoResultType {
  Load = 3,
  Send_Succeed = 4,
  Send_Warning = 5,
  Send_ConfirmOnline = 6,
  Receive = 7,
}

/**
 * Port of kinoko's Memo (server.memo.Memo).
 * A stored memo/note delivered to a character's inbox.
 */
export class Memo {
  readonly type: MemoType;
  readonly memoId: number;
  readonly sender: string;
  readonly content: string;
  readonly dateSent: Date;

  constructor(type: MemoType, memoId: number, sender: string, content: string, dateSent: Date) {
    this.type = type;
    this.memoId = memoId;
    this.sender = sender;
    this.content = content;
    this.dateSent = dateSent;
  }

  /** Port of kinoko's Memo::encode. */
  encode(w: PacketWriter): void {
    w.writeInt(this.memoId);             // dwSN
    w.writeMapleAsciiString(this.sender);  // sSender
    w.writeMapleAsciiString(this.content); // sContent
    w.writeFT(this.dateSent);            // dateSent
    w.writeByte(this.type);              // nFlag
  }
}
