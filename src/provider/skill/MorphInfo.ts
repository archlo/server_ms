import { NXNode } from '../../wz-utils/NXNode';

export class MorphInfo {
  constructor(
    public readonly id: number,
    public readonly superman: boolean,
    public readonly attackable: boolean,
  ) {}

  static from(morphId: number, infoNode: NXNode): MorphInfo {
    return new MorphInfo(
      morphId,
      (infoNode.nGet('superman',   0) as number) !== 0,
      (infoNode.nGet('attackable', 0) as number) !== 0,
    );
  }
}
