import { NXNode } from '../../wz-utils/NXNode';

export class LadderRope {
  constructor(
    public readonly sn: number,
    public readonly l: number,   // bLadder
    public readonly uf: number,  // bUpperFoothold
    public readonly x: number,
    public readonly y1: number,
    public readonly y2: number,
    public readonly page: number,
  ) {}

  static from(sn: number, n: NXNode): LadderRope {
    return new LadderRope(
      sn,
      n.nGet('l', 0), n.nGet('uf', 0),
      n.nGet('x', 0), n.nGet('y1', 0), n.nGet('y2', 0),
      n.nGet('page', 0),
    );
  }
}
