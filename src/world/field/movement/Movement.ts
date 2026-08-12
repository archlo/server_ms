import { OutPacket } from '../../../protocol/packets/packetWriter';
import { Char } from '../../../world/user/Char';
import { Life } from '../../../world/field/life/Life';

export interface Movement {
  encode(packet: OutPacket): void;
  getPosition(): [number, number];
  getCommand(): number;
  getMoveAction(): number;
  getForcedStop(): number;
  getStat(): number;
  getFh(): number;
  getFootStart(): number;
  getDuration(): number;
  getVPosition(): [number, number];
  getOffset(): [number, number];
  applyTo(chr: Char): void;
  applyTo(life: Life): void;
}
