import { InPacket } from '../../../protocol/packets/packetReader';
import { Char } from '../../../world/user/Char';
import { Life } from '../../../world/field/life/Life';
import { MovementPathAttr } from './MovementPathAttr';
import { Movement } from './Movement';
import { NormalMovement } from './parsers/NormalMovement';
import { JumpMovement } from './parsers/JumpMovement';
import { ActionMovement } from './parsers/ActionMovement';
import { TeleportMovement } from './parsers/TeleportMovement';
import { StatChangeMovement } from './parsers/StatChangeMovement';
import { StartFallDownMovement } from './parsers/StartFallDownMovement';
import { FlyingBlockMovement } from './parsers/FlyingBlockMovement';

export class MovementInfo {
  oldPos: [number, number] = [0, 0];
  oldVPos: [number, number] = [0, 0];
  movements: Movement[] = [];

  constructor(inPacket: InPacket) {
    this.decode(inPacket);
  }

  decode(inPacket: InPacket): void {
    this.oldPos = [inPacket.readShort(), inPacket.readShort()];
    this.oldVPos = [inPacket.readShort(), inPacket.readShort()];
    const size = inPacket.readByte();
    for (let i = 0; i < size; i++) {
      const attr = inPacket.readByte();
      let movement: Movement;
      switch (attr) {
        case MovementPathAttr.NORMAL:
        case MovementPathAttr.HANG_ON_BACK:
        case MovementPathAttr.FALL_DOWN:
        case MovementPathAttr.WINGS:
        case MovementPathAttr.MOB_ATK_RUSH:
        case MovementPathAttr.MOB_ATK_RUSH_STOP:
          movement = new NormalMovement(inPacket, attr);
          break;
        case MovementPathAttr.JUMP:
        case MovementPathAttr.IMPACT:
        case MovementPathAttr.START_WINGS:
        case MovementPathAttr.MOB_TOSS:
        case MovementPathAttr.DASH_SLIDE:
        case MovementPathAttr.MOB_LADDER:
        case MovementPathAttr.MOB_RIGHT_ANGLE:
        case MovementPathAttr.MOB_STOP_NODE_START:
        case MovementPathAttr.MOB_BEFORE_NODE:
          movement = new JumpMovement(inPacket, attr);
          break;
        case MovementPathAttr.FLASH_JUMP:
        case MovementPathAttr.ROCKET_BOOSTER:
        case MovementPathAttr.BACK_STEP_SHOT:
        case MovementPathAttr.MOB_POWER_KNOCK_BACK:
        case MovementPathAttr.VERTICAL_JUMP:
        case MovementPathAttr.CUSTOM_IMPACT:
        case MovementPathAttr.COMBAT_STEP:
        case MovementPathAttr.HIT:
        case MovementPathAttr.TIME_BOMB_ATK:
        case MovementPathAttr.SNOW_BALL_TOUCH:
        case MovementPathAttr.BUFF_ZONE_EFFECT:
          movement = new ActionMovement(inPacket, attr);
          break;
        case MovementPathAttr.IMMEDIATE:
        case MovementPathAttr.TELEPORT:
        case MovementPathAttr.ASSAULTER:
        case MovementPathAttr.ASSASSINATION:
        case MovementPathAttr.RUSH:
        case MovementPathAttr.SIT_DOWN:
          movement = new TeleportMovement(inPacket, attr);
          break;
        case MovementPathAttr.STAT_CHANGE:
          movement = new StatChangeMovement(inPacket, attr);
          break;
        case MovementPathAttr.START_FALL_DOWN:
          movement = new StartFallDownMovement(inPacket, attr);
          break;
        case MovementPathAttr.FLYING_BLOCK:
          movement = new FlyingBlockMovement(inPacket, attr);
          break;
        default:
          movement = new NormalMovement(inPacket, attr);
          break;
      }
      this.movements.push(movement);
    }
  }

  applyTo(chr: Char): void;
  applyTo(life: Life): void;
  applyTo(target: Char | Life): void {
    for (const movement of this.movements) {
      if (target instanceof Char) {
        movement.applyTo(target);
      } else {
        movement.applyTo(target);
      }
    }
  }
}
