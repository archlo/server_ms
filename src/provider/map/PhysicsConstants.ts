import { NXNode } from '../../wz-utils/NXNode';

export class PhysicsConstants {
  constructor(
    public readonly walkForce: number,
    public readonly walkSpeed: number,
    public readonly walkDrag: number,
    public readonly slipForce: number,
    public readonly slipSpeed: number,
    public readonly floatDrag1: number,
    public readonly floatDrag2: number,
    public readonly floatCoefficient: number,
    public readonly swimForce: number,
    public readonly swimSpeed: number,
    public readonly flyForce: number,
    public readonly flySpeed: number,
    public readonly gravityAcc: number,
    public readonly fallSpeed: number,
    public readonly jumpSpeed: number,
    public readonly maxFriction: number,
    public readonly minFriction: number,
    public readonly swimSpeedDec: number,
    public readonly flyJumpDec: number,
  ) {}

  static from(n: NXNode): PhysicsConstants {
    const d = (key: string) => n.nGet(key, 0) as number;
    return new PhysicsConstants(
      d('walkForce'), d('walkSpeed'), d('walkDrag'),
      d('slipForce'), d('slipSpeed'),
      d('floatDrag1'), d('floatDrag2'), d('floatCoefficient'),
      d('swimForce'), d('swimSpeed'),
      d('flyForce'), d('flySpeed'),
      d('gravityAcc'), d('fallSpeed'), d('jumpSpeed'),
      d('maxFriction'), d('minFriction'),
      d('swimSpeedDec'), d('flyJumpDec'),
    );
  }
}
