import { NXNode } from '../../wz-utils/NXNode';

export interface Rect {
  left: number; top: number; right: number; bottom: number;
}

export class Foothold {
  constructor(
    public readonly layerId: number,
    public readonly groupId: number,
    public readonly sn: number,
    public readonly x1: number,
    public readonly y1: number,
    public readonly x2: number,
    public readonly y2: number,
    public readonly drag: number,
    public readonly force: number,
    public readonly forbidFallDown: number,
    public readonly cantThrough: number,
    public readonly prev: number,
    public readonly next: number,
  ) {}

  getYFromX(x: number): number {
    const f = (x - this.x1) / (this.x2 - this.x1);
    return Math.ceil(this.y1 + f * (this.y2 - this.y1));
  }

  isWall(): boolean {
    return this.x1 === this.x2;
  }

  static from(layerId: number, groupId: number, sn: number, n: NXNode): Foothold {
    return new Foothold(
      layerId, groupId, sn,
      n.nGet('x1', 0), n.nGet('y1', 0),
      n.nGet('x2', 0), n.nGet('y2', 0),
      n.nGet('drag', 0), n.nGet('force', 0),
      n.nGet('forbidFallDown', 0), n.nGet('cantThrough', 0),
      n.nGet('prev', 0), n.nGet('next', 0),
    );
  }
}
