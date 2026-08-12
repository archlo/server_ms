import { NXNode } from '../../wz-utils/NXNode';
import { ItemOptionStat, itemOptionStatFromName, itemOptionStatIsIgnored } from './ItemOptionStat';

export class ItemOptionLevelData {
  constructor(public readonly stats: Map<ItemOptionStat, number>) {}

  static resolveLevelData(levelListNode: NXNode): Map<number, ItemOptionLevelData> {
    const result = new Map<number, ItemOptionLevelData>();
    for (const child of levelListNode.nChildren) {
      const level = parseInt(child.nName);
      if (!isNaN(level)) result.set(level, ItemOptionLevelData.from(child));
    }
    return result;
  }

  static from(levelProp: NXNode): ItemOptionLevelData {
    const stats = new Map<ItemOptionStat, number>();
    for (const child of levelProp.nChildren) {
      if (itemOptionStatIsIgnored(child.nName)) continue;
      const stat = itemOptionStatFromName(child.nName);
      if (stat !== null) stats.set(stat, child.nValue as number ?? 0);
    }
    return new ItemOptionLevelData(stats);
  }
}
