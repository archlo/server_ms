import { PacketWriter } from '../../../protocol/packets/packetWriter';

export class CoupleRecord {
  static EMPTY = new CoupleRecord(0, 0, 0, '', '', 0);

  constructor(
    public readonly coupleId: number,
    public readonly husbandId: number,
    public readonly wifeId: number,
    public readonly husbandName: string,
    public readonly wifeName: string,
    public readonly status: number = 0,
  ) {}

  encode(w: PacketWriter): void {
    w.writeInt(this.coupleId);
    w.writeInt(this.husbandId);
    w.writeInt(this.wifeId);
    w.writeMapleAsciiString(this.husbandName);
    w.writeMapleAsciiString(this.wifeName);
    w.writeShort(this.status);
  }

  encodeForLocal(w: PacketWriter, isLocal: boolean): void {
    w.writeInt(this.coupleId);
    if (isLocal) {
      w.writeInt(this.wifeId);
      w.writeInt(this.husbandId);
      w.writeMapleAsciiString(this.wifeName);
      w.writeMapleAsciiString(this.husbandName);
    } else {
      w.writeInt(this.husbandId);
      w.writeInt(this.wifeId);
      w.writeMapleAsciiString(this.husbandName);
      w.writeMapleAsciiString(this.wifeName);
    }
    w.writeShort(this.status);
  }

  static from(
    coupleId: number,
    husbandId: number,
    wifeId: number,
    husbandName: string,
    wifeName: string,
    status = 0,
  ): CoupleRecord {
    return new CoupleRecord(coupleId, husbandId, wifeId, husbandName, wifeName, status);
  }
}
