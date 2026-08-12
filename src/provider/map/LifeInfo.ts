import { NXNode } from '../../wz-utils/NXNode';
import { LifeType, lifeTypeFromString } from './LifeType';

export class LifeInfo {
  constructor(
    public readonly lifeType: LifeType,
    public readonly templateId: number,
    public readonly x: number,
    public readonly y: number,
    public readonly rx0: number,
    public readonly rx1: number,
    public readonly cy: number,
    public readonly fh: number,
    public readonly flip: boolean,
    public readonly hide: boolean,
    public readonly mobTime: number,
  ) {}

  static from(lifeType: LifeType, n: NXNode): LifeInfo {
    return new LifeInfo(
      lifeType,
      parseInt(n.nGet('id', '0')),
      n.nGet('x', 0), n.nGet('y', 0),
      n.nGet('rx0', 0), n.nGet('rx1', 0),
      n.nGet('cy', 0), n.nGet('fh', 0),
      (n.nGet('f', 0) as number) !== 0,
      (n.nGet('hide', 0) as number) !== 0,
      n.nGet('mobTime', 0),
    );
  }
}
