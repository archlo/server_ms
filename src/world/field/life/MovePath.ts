import { PacketReader } from '../../../protocol/packets/packetReader';
import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { Life } from './Life';

enum MoveType {
  NORMAL,
  JUMP,
  TELEPORT,
  STAT_CHANGE,
  START_FALL_DOWN,
  FLYING_BLOCK,
  ACTION,
}

function moveTypeFromAttr(attr: number): MoveType {
  switch (attr) {
    case 0: case 5: case 12: case 14: case 35: case 36:
      return MoveType.NORMAL;
    case 1: case 2: case 13: case 16: case 18: case 31: case 32: case 33: case 34:
      return MoveType.JUMP;
    case 3: case 4: case 6: case 7: case 8: case 10:
      return MoveType.TELEPORT;
    case 9:
      return MoveType.STAT_CHANGE;
    case 11:
      return MoveType.START_FALL_DOWN;
    case 17:
      return MoveType.FLYING_BLOCK;
    default:
      return MoveType.ACTION;
  }
}

export class MoveElem {
  attr = 0;
  x = 0; y = 0;
  vx = 0; vy = 0;
  fh = 0;
  fhFallStart = 0;
  xOffset = 0; yOffset = 0;
  stat = 0;
  moveAction = 0;
  elapse = 0;

  constructor(attr: number) { this.attr = attr; }
}

export class MovePath {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly vx: number,
    public readonly vy: number,
    public readonly moveElems: MoveElem[],
  ) {}

  getDuration(): number {
    return this.moveElems.reduce((sum, e) => sum + e.elapse, 0);
  }

  applyTo(life: Life): void {
    for (const elem of this.moveElems) {
      switch (moveTypeFromAttr(elem.attr)) {
        case MoveType.NORMAL:
        case MoveType.TELEPORT:
          life.setX(elem.x);
          life.setY(elem.y);
          life.setFoothold(elem.fh);
          break;
        case MoveType.JUMP:
        case MoveType.START_FALL_DOWN:
        case MoveType.FLYING_BLOCK:
          life.setX(elem.x);
          life.setY(elem.y);
          break;
        case MoveType.STAT_CHANGE:
          continue;
        case MoveType.ACTION:
          break;
      }
      life.setMoveAction(elem.moveAction);
    }
  }

  encode(w: PacketWriter): void {
    w.writeShort(this.x);
    w.writeShort(this.y);
    w.writeShort(this.vx);
    w.writeShort(this.vy);
    w.writeByte(this.moveElems.length);
    for (const elem of this.moveElems) {
      w.writeByte(elem.attr);
      switch (moveTypeFromAttr(elem.attr)) {
        case MoveType.NORMAL:
          w.writeShort(elem.x);
          w.writeShort(elem.y);
          w.writeShort(elem.vx);
          w.writeShort(elem.vy);
          w.writeShort(elem.fh);
          if (elem.attr === 12) {
            w.writeShort(elem.fhFallStart);
          }
          w.writeShort(elem.xOffset);
          w.writeShort(elem.yOffset);
          break;
        case MoveType.JUMP:
          w.writeShort(elem.vx);
          w.writeShort(elem.vy);
          break;
        case MoveType.TELEPORT:
          w.writeShort(elem.x);
          w.writeShort(elem.y);
          w.writeShort(elem.fh);
          break;
        case MoveType.STAT_CHANGE:
          w.writeByte(elem.stat);
          continue; // moveAction and elapse not encoded
        case MoveType.START_FALL_DOWN:
          w.writeShort(elem.vx);
          w.writeShort(elem.vy);
          w.writeShort(elem.fhFallStart);
          break;
        case MoveType.FLYING_BLOCK:
          w.writeShort(elem.x);
          w.writeShort(elem.y);
          w.writeShort(elem.vx);
          w.writeShort(elem.vy);
          break;
        case MoveType.ACTION:
          break;
      }
      w.writeByte(elem.moveAction);
      w.writeShort(elem.elapse);
    }
  }

  static decode(r: PacketReader): MovePath {
    // Header: 4 shorts + 1 byte count = 9 bytes minimum
    if (r.remaining() < 9) {
      return new MovePath(0, 0, 0, 0, []);
    }

    const x = r.readShort();
    const y = r.readShort();
    const vx = r.readShort();
    const vy = r.readShort();

    const moveElems: MoveElem[] = [];
    const count = r.readByte();
    for (let i = 0; i < count; i++) {
      const startOffset = r.offset;
      try {
        const attr = r.readByte();
        const elem = new MoveElem(attr);
        switch (moveTypeFromAttr(attr)) {
          case MoveType.NORMAL:
            elem.x = r.readShort();
            elem.y = r.readShort();
            elem.vx = r.readShort();
            elem.vy = r.readShort();
            elem.fh = r.readShort();
            if (attr === 12) {
              elem.fhFallStart = r.readShort();
            }
            elem.xOffset = r.readShort();
            elem.yOffset = r.readShort();
            break;
          case MoveType.JUMP:
            elem.x = x;
            elem.y = y;
            elem.vx = r.readShort();
            elem.vy = r.readShort();
            break;
          case MoveType.TELEPORT:
            elem.x = r.readShort();
            elem.y = r.readShort();
            elem.fh = r.readShort();
            break;
          case MoveType.STAT_CHANGE:
            elem.stat = r.readByte();
            elem.x = x;
            elem.y = y;
            moveElems.push(elem);
            continue;
          case MoveType.START_FALL_DOWN:
            elem.x = x;
            elem.y = y;
            elem.vx = r.readShort();
            elem.vy = r.readShort();
            elem.fhFallStart = r.readShort();
            break;
          case MoveType.FLYING_BLOCK:
            elem.x = r.readShort();
            elem.y = r.readShort();
            elem.vx = r.readShort();
            elem.vy = r.readShort();
            break;
          case MoveType.ACTION:
            elem.x = x;
            elem.y = y;
            elem.vx = vx;
            elem.vy = vy;
            break;
        }
        elem.moveAction = r.readByte();
        elem.elapse = r.readShort();
        moveElems.push(elem);
      } catch {
        r.seek(startOffset);
        break;
      }
    }
    return new MovePath(x, y, vx, vy, moveElems);
  }
}
