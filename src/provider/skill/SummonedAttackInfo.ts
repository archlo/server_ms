import { NXNode } from '../../wz-utils/NXNode';
import { Rect } from '../../util/Rect';

export class SummonedAttackInfo {
  constructor(
    public readonly sp: boolean,
    public readonly spX: number,
    public readonly spY: number,
    public readonly range: number,
    public readonly mobCount: number,
    public readonly rect: Rect | null,
  ) {}

  static from(attackProp: NXNode): SummonedAttackInfo {
    const rangeProp = attackProp.nGet('range') as NXNode | undefined;
    if (!rangeProp) throw new Error('SummonedAttackInfo: missing range');

    let sp = false, spX = 0, spY = 0, range = 0;
    const spNode = rangeProp.nGet('sp') as NXNode | undefined;
    if (spNode) {
      sp    = true;
      spX   = spNode.nX;
      spY   = spNode.nY;
      range = rangeProp.nGet('r', 0) as number;
    }

    let rect: Rect | null = null;
    const ltNode = rangeProp.nGet('lt') as NXNode | undefined;
    const rbNode = rangeProp.nGet('rb') as NXNode | undefined;
    if (ltNode && rbNode) {
      rect = Rect.of(ltNode.nX, ltNode.nY, rbNode.nX, rbNode.nY);
    }

    return new SummonedAttackInfo(
      sp, spX, spY, range,
      attackProp.nGet('mobCount', 1) as number,
      rect,
    );
  }
}
