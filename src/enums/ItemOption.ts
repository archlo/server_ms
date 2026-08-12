import { BaseStat } from './BaseStat';
import { heneseItemGradeByOption, heneseItemGradeIsMatching } from '../world/item/ItemGrade';

export enum ItemOptionType {
  prop,
  attackType,
  level,
  ignoreDAM,
  ignoreDAMr,
  time,
}

export class ItemOption {
  optionType = 0;
  weight = 0;
  id = 0;
  reqLevel = 0;
  string = '';
  private statValuesPerLevel = new Map<number, Map<BaseStat, number>>();
  private miscValuesPerLevel = new Map<number, Map<ItemOptionType, number>>();

  hasMatchingGrade(itemState: number): boolean {
    return heneseItemGradeIsMatching(itemState, heneseItemGradeByOption(this.id));
  }

  isBonus(): boolean {
    return this.id > 2000 && Math.floor(this.id / 1000) % 10 === 2;
  }

  addStatValue(level: number, baseStat: BaseStat, value: number): void {
    let valMap = this.statValuesPerLevel.get(level);
    if (!valMap) {
      valMap = new Map();
      this.statValuesPerLevel.set(level, valMap);
    }
    valMap.set(baseStat, value);
  }

  addMiscValue(level: number, type: ItemOptionType, value: number): void {
    let valMap = this.miscValuesPerLevel.get(level);
    if (!valMap) {
      valMap = new Map();
      this.miscValuesPerLevel.set(level, valMap);
    }
    valMap.set(type, value);
  }

  getStatValuesByLevel(level: number): Map<BaseStat, number> {
    return this.statValuesPerLevel.get(level) ?? new Map();
  }

  getMiscValuesByLevel(level: number): Map<ItemOptionType, number> {
    return this.miscValuesPerLevel.get(level) ?? new Map();
  }

  getString(level: number): string {
    const lvl = Math.floor(level / 10) + 1;
    let str = this.string;
    let opt = '';
    let val = -1;

    const hashIdx = str.indexOf('#');
    if (hashIdx >= 0) {
      const parts = str.substring(hashIdx + 1).split(/[% ]/);
      opt = parts[0];
      for (const [, v] of this.getStatValuesByLevel(lvl)) {
        val = v;
      }
    }

    for (const [type, v] of this.getMiscValuesByLevel(lvl)) {
      str = str.replace(`#${ItemOptionType[type]}`, v.toString());
    }

    return str.replace(`#${opt}`, val.toString());
  }
}
