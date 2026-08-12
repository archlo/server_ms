import { InPacket } from '../../../../protocol/packets/packetReader';
import { OutPacket } from '../../../../protocol/packets/packetWriter';
import { BaseMovement } from '../BaseMovement';

export class TeleportMovement extends BaseMovement {
  constructor(inPacket: InPacket, attr: number) {
    super(inPacket, attr);
    this.decode(inPacket);
  }

  decode(inPacket: InPacket): void {
    this.position = [inPacket.readShort(), inPacket.readShort()];
    this.vPosition = [inPacket.readShort(), inPacket.readShort()];
    this.offset = [inPacket.readShort(), inPacket.readShort()];
  }

  encode(packet: OutPacket): void {
    packet.writeByte(this.command);
    packet.writeByte(this.forcedStop);
    packet.writeByte(this.stat);
    packet.writeByte(this.moveAction);
    packet.writeShort(this.fh);
  }
}
