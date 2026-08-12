import { NXNode } from '../../wz-utils/NXNode';

export class SetItemEffect {
  incPad = 0;
  incMad = 0;
  incPdd = 0;
  incMdd = 0;
  incAcc = 0;
  incEva = 0;
  incSpeed = 0;
  incJump = 0;
  incMhp = 0;
  incMmp = 0;
  incStr = 0;
  incDex = 0;
  incInt = 0;
  incLuk = 0;
  incAllStat = 0;
  incDamage = 0;
}

export class SetItemInfo {
  constructor(
    public readonly setItemId: number,
    public readonly completeCount: number,
    public readonly itemIds: number[],
    public readonly effects: Map<number, SetItemEffect>,
  ) {}

  static from(node: NXNode): SetItemInfo {
    const completeCount = node.nGet('completeCount', 0) as number;

    const itemIds: number[] = [];
    const itemIDsNode = node.nGet('ItemIDs') as NXNode | undefined;
    if (itemIDsNode) {
      for (const child of itemIDsNode.nChildren) {
        const id = child.nValue as number;
        if (id != null) itemIds.push(id);
      }
    }

    const effects = new Map<number, SetItemEffect>();
    const effectNode = node.nGet('effect') as NXNode | undefined;
    if (effectNode) {
      for (const child of effectNode.nChildren) {
        const parts = parseInt(child.nName);
        if (isNaN(parts)) continue;
        const effect = new SetItemEffect();
        effect.incPad = child.nGet('incPAD', 0) as number;
        effect.incMad = child.nGet('incMAD', 0) as number;
        effect.incPdd = child.nGet('incPDD', 0) as number;
        effect.incMdd = child.nGet('incMDD', 0) as number;
        effect.incAcc = child.nGet('incACC', 0) as number;
        effect.incEva = child.nGet('incEVA', 0) as number;
        effect.incSpeed = child.nGet('incSpeed', 0) as number;
        effect.incJump = child.nGet('incJump', 0) as number;
        effect.incMhp = child.nGet('incMHP', 0) as number;
        effect.incMmp = child.nGet('incMMP', 0) as number;
        effect.incStr = child.nGet('incSTR', 0) as number;
        effect.incDex = child.nGet('incDEX', 0) as number;
        effect.incInt = child.nGet('incINT', 0) as number;
        effect.incLuk = child.nGet('incLUK', 0) as number;
        effect.incAllStat = child.nGet('incAllStat', 0) as number;
        effect.incDamage = child.nGet('incDamage', 0) as number;
        effects.set(parts, effect);
      }
    }

    return new SetItemInfo(parseInt(node.nName) || 0, completeCount, itemIds, effects);
  }
}
