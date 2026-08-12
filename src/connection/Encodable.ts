import { OutPacket } from '../protocol/packets/packetWriter';

export interface Encodable {
  encode(packet: OutPacket): void;
}
