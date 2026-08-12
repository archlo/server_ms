import { NXNode } from '../../wz-utils/NXNode';

export class ReactorInfo {
  constructor(
    public readonly templateId: number,
    public readonly name: string,
    public readonly x: number,
    public readonly y: number,
    public readonly flip: boolean,
    public readonly reactorTime: number,
  ) {}

  static from(n: NXNode): ReactorInfo {
    return new ReactorInfo(
      parseInt(n.nGet('id', '0')),
      n.nGet('name', '') as string,
      n.nGet('x', 0), n.nGet('y', 0),
      (n.nGet('f', 0) as number) !== 0,
      n.nGet('reactorTime', 0),
    );
  }
}
