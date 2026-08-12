import { PacketWriter } from '../../protocol/packets/packetWriter';

export class MessengerMember {
  constructor(
    readonly characterId: number,
    readonly characterName: string,
    readonly position: number,
    readonly channelId = 0,
    readonly user: { write(packet: Buffer): void } | null = null,
  ) {}

  encode(w: PacketWriter): void {
    w.writeByte(this.position);
    w.writeInt(this.characterId);
    w.writeMapleAsciiString(this.characterName);
    w.writeByte(this.channelId);
  }
}
