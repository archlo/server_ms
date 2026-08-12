import { NXNode } from '../../wz-utils/NXNode';
import { ItemOptionLevelData } from './ItemOptionLevelData';
import { ItemOptionType, itemOptionTypeFromValue } from './ItemOptionType';

export class ItemOptionInfo {
  constructor(
    public readonly itemOptionId: number,
    public readonly reqLevel: number,
    public readonly optionType: ItemOptionType,
    public readonly levelData: Map<number, ItemOptionLevelData>,
  ) {}

  getLevelData(optionLevel: number): ItemOptionLevelData | undefined {
    return this.levelData.get(optionLevel);
  }

  isMatchingGrade(grade: 'NORMAL'|'RARE'|'EPIC'|'UNIQUE'): boolean {
    const id = this.itemOptionId;
    switch (grade) {
      case 'NORMAL': return id < 10000;
      case 'RARE':   return id >= 10000 && id < 20000;
      case 'EPIC':   return id >= 20000 && id < 30000;
      case 'UNIQUE': return id >= 30000 && id < 40000;
    }
  }

  isMatchingLevel(itemReqLevel: number): boolean { return this.reqLevel <= itemReqLevel; }

  static from(itemOptionId: number, itemOptionProp: NXNode): ItemOptionInfo {
    let reqLevel = 0;
    let optionType = ItemOptionType.ANY_EQUIP;
    const infoNode = itemOptionProp.nGet('info') as NXNode | undefined;
    if (infoNode) {
      reqLevel   = infoNode.nGet('reqLevel', 0) as number;
      optionType = itemOptionTypeFromValue(infoNode.nGet('optionType', 0) as number);
    }
    const levelNode = itemOptionProp.nGet('level') as NXNode | undefined;
    const levelData = levelNode ? ItemOptionLevelData.resolveLevelData(levelNode) : new Map();
    return new ItemOptionInfo(itemOptionId, reqLevel, optionType, levelData);
  }
}
