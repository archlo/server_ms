import { InPacket } from '../../../protocol/packets/packetReader';
import { OutPacket } from '../../../protocol/packets/packetWriter';
import { Char } from '../../../world/user/Char';
import { Life } from '../../../world/field/life/Life';
import { Movement } from './Movement';

export abstract class BaseMovement implements Movement {
  protected position: [number, number] = [0, 0];
  protected vPosition: [number, number] = [0, 0];
  protected offset: [number, number] = [0, 0];
  protected footStart: number = 0;
  protected command: number = 0;
  protected moveAction: number = 0;
  protected forcedStop: number = 0;
  protected stat: number = 0;
  protected fh: number = 0;
  protected duration: number = 0;

  constructor(inPacket: InPacket, attr: number) {
    this.command = attr;
    this.footStart = inPacket.readShort();
  }

  abstract encode(packet: OutPacket): void;

  getPosition(): [number, number] {
    return this.position;
  }

  getCommand(): number {
    return this.command;
  }

  getMoveAction(): number {
    return this.moveAction;
  }

  getForcedStop(): number {
    return this.forcedStop;
  }

  getStat(): number {
    return this.stat;
  }

  getFh(): number {
    return this.fh;
  }

  getFootStart(): number {
    return this.footStart;
  }

  getDuration(): number {
    return this.duration;
  }

  getVPosition(): [number, number] {
    return this.vPosition;
  }

  getOffset(): [number, number] {
    return this.offset;
  }

  applyTo(chr: Char): void;
  applyTo(life: Life): void;
  applyTo(target: Char | Life): void {
    if (target instanceof Char) {
      target.setPosition(this.position);
      target.setMoveAction(this.moveAction);
      target.setFoothold(this.fh);
    } else {
      target.setX(this.position[0]);
      target.setY(this.position[1]);
      target.setMoveAction(this.moveAction);
      target.setFoothold(this.fh);
    }
  }
}
