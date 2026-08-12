export enum ItemGrade {
  NORMAL   = 0,
  RARE     = 1,
  EPIC     = 2,
  UNIQUE   = 3,
  RELEASED = 4,
}

export function itemGradeLower(grade: ItemGrade): ItemGrade {
  switch (grade) {
    case ItemGrade.EPIC:   return ItemGrade.RARE;
    case ItemGrade.UNIQUE: return ItemGrade.EPIC;
    default:               return ItemGrade.NORMAL;
  }
}

export enum HenesyItemGrade {
  LegendaryBonusHidden = -12,
  UniqueBonusHidden    = -13,
  EpicBonusHidden      = -14,
  RareBonusHidden      = -15,
  HiddenLegendary      = 4,
  HiddenUnique         = 3,
  HiddenEpic           = 2,
  HiddenRare           = 1,
  Hidden               = -1,
  None                 = 0,
  RareSecondary        = 16,
  Rare                 = 17,
  Epic                 = 18,
  Unique               = 19,
  Legendary            = 20,
}

export function heneseItemGradeHiddenBonusByBaseGrade(grade: HenesyItemGrade): HenesyItemGrade {
  switch (grade) {
    case HenesyItemGrade.HiddenRare:
    case HenesyItemGrade.Rare:               return HenesyItemGrade.RareBonusHidden;
    case HenesyItemGrade.HiddenEpic:
    case HenesyItemGrade.Epic:               return HenesyItemGrade.EpicBonusHidden;
    case HenesyItemGrade.HiddenUnique:
    case HenesyItemGrade.Unique:             return HenesyItemGrade.UniqueBonusHidden;
    case HenesyItemGrade.HiddenLegendary:
    case HenesyItemGrade.Legendary:          return HenesyItemGrade.LegendaryBonusHidden;
    default:                                 return HenesyItemGrade.None;
  }
}

export function heneseItemGradeByVal(grade: number): HenesyItemGrade {
  for (const [k, v] of Object.entries(HenesyItemGrade)) {
    if (typeof k === 'string' && v === grade) return v as HenesyItemGrade;
  }
  return HenesyItemGrade.None;
}

export function heneseItemGradeByOption(option: number): HenesyItemGrade {
  if (option < 0) return heneseItemGradeByVal(Math.abs(option));
  if (option > 0 && option < 10000)  return HenesyItemGrade.RareSecondary;
  if (option > 10000 && option < 20000) return HenesyItemGrade.Rare;
  if (option > 20000 && option < 30000) return HenesyItemGrade.Epic;
  if (option > 30000 && option < 40000) return HenesyItemGrade.Unique;
  if (option > 40000 && option < 50000) return HenesyItemGrade.Legendary;
  return HenesyItemGrade.None;
}

export function heneseItemGradeIsMatching(first: number, second: number): boolean {
  const firstGrade = heneseItemGradeByVal(first);
  const other = heneseItemGradeByVal(second);
  switch (firstGrade) {
    case HenesyItemGrade.None:         return other === HenesyItemGrade.None;
    case HenesyItemGrade.RareSecondary: return other === HenesyItemGrade.RareSecondary;
    case HenesyItemGrade.HiddenRare:
    case HenesyItemGrade.Rare:         return other === HenesyItemGrade.HiddenRare || other === HenesyItemGrade.Rare;
    case HenesyItemGrade.HiddenEpic:
    case HenesyItemGrade.Epic:         return other === HenesyItemGrade.HiddenEpic || other === HenesyItemGrade.Epic;
    case HenesyItemGrade.HiddenUnique:
    case HenesyItemGrade.Unique:       return other === HenesyItemGrade.HiddenUnique || other === HenesyItemGrade.Unique;
    case HenesyItemGrade.HiddenLegendary:
    case HenesyItemGrade.Legendary:    return other === HenesyItemGrade.HiddenLegendary || other === HenesyItemGrade.Legendary;
    default:                           return false;
  }
}

export function heneseItemGradeHiddenByVal(val: number): HenesyItemGrade {
  const arg = heneseItemGradeByVal(val);
  switch (arg) {
    case HenesyItemGrade.Rare:
    case HenesyItemGrade.HiddenRare:      return HenesyItemGrade.HiddenRare;
    case HenesyItemGrade.Epic:
    case HenesyItemGrade.HiddenEpic:      return HenesyItemGrade.HiddenEpic;
    case HenesyItemGrade.Unique:
    case HenesyItemGrade.HiddenUnique:    return HenesyItemGrade.HiddenUnique;
    case HenesyItemGrade.Legendary:
    case HenesyItemGrade.HiddenLegendary: return HenesyItemGrade.HiddenLegendary;
    default:                              return HenesyItemGrade.None;
  }
}

export function heneseItemGradeOneTierLower(val: number): HenesyItemGrade {
  const arg = heneseItemGradeByVal(val);
  switch (arg) {
    case HenesyItemGrade.Rare:             return HenesyItemGrade.RareSecondary;
    case HenesyItemGrade.Epic:             return HenesyItemGrade.Rare;
    case HenesyItemGrade.HiddenRare:
    case HenesyItemGrade.HiddenEpic:       return HenesyItemGrade.HiddenRare;
    case HenesyItemGrade.Unique:           return HenesyItemGrade.Epic;
    case HenesyItemGrade.HiddenUnique:     return HenesyItemGrade.HiddenEpic;
    case HenesyItemGrade.Legendary:        return HenesyItemGrade.Unique;
    case HenesyItemGrade.HiddenLegendary:  return HenesyItemGrade.HiddenUnique;
    default:                               return HenesyItemGrade.None;
  }
}

export function heneseItemGradeIsHidden(grade: HenesyItemGrade): boolean {
  switch (grade) {
    case HenesyItemGrade.Hidden:
    case HenesyItemGrade.HiddenRare:
    case HenesyItemGrade.HiddenEpic:
    case HenesyItemGrade.HiddenUnique:
    case HenesyItemGrade.HiddenLegendary:
      return true;
    default:
      return false;
  }
}
