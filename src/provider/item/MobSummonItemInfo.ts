import { NXNode } from '../../wz-utils/NXNode';

export class MobSummonItemInfo {
  constructor(
    public readonly itemId: number,
    public readonly entries: Array<{ mobId: number; prob: number }>,
  ) {}

  static from(itemId: number, mobSummonListNode: NXNode): MobSummonItemInfo {
    const entries: Array<{ mobId: number; prob: number }> = [];
    for (const child of mobSummonListNode.nChildren) {
      entries.push({
        mobId: child.nGet('id',   0) as number,
        prob:  child.nGet('prob', 0) as number,
      });
    }
    return new MobSummonItemInfo(itemId, entries);
  }
}
