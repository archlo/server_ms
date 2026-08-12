import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';

export class PartyInfo {
  static readonly EMPTY = new PartyInfo(0, 0, false);

  constructor(
    public readonly partyId: number,
    public readonly memberIndex: number,
    public readonly boss: boolean,
  ) {}

  encode(w: PacketWriter): void {
    w.writeInt(this.partyId);
    w.writeByte(this.memberIndex);
    w.writeBoolean(this.boss);
  }

  static decode(r: PacketReader): PartyInfo {
    const partyId = r.readInt();
    const memberIndex = r.readByte();
    const boss = r.readBoolean();
    return new PartyInfo(partyId, memberIndex, boss);
  }
}
