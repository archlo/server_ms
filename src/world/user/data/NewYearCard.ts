import { PacketWriter } from '../../../protocol/packets/packetWriter';

export class NewYearCard {
  constructor(
    public readonly cardId: number,
    public readonly senderId: number,
    public readonly senderName: string,
    public readonly message: string,
    public readonly year: number,
    public readonly received: boolean,
  ) {}

  encode(w: PacketWriter): void {
    w.writeInt(this.cardId);
    w.writeInt(this.senderId);
    w.writeMapleAsciiString(this.senderName);
    w.writeMapleAsciiString(this.message);
    w.writeInt(this.year);
    w.writeBoolean(this.received);
  }
}
