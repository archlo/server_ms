import { ItemConstants } from './ItemConstants';

export enum BodyPart {
  HAIR          = 0,
  CAP           = 1,
  FACEACC       = 2,
  EYEACC        = 3,
  EARACC        = 4,
  CLOTHES       = 5,
  PANTS         = 6,
  SHOES         = 7,
  GLOVES        = 8,
  CAPE          = 9,
  SHIELD        = 10,
  WEAPON        = 11,
  RING1         = 12,
  RING2         = 13,
  PETWEAR       = 14,
  RING3         = 15,
  RING4         = 16,
  PENDANT       = 17,
  TAMINGMOB     = 18,
  SADDLE        = 19,
  MOBEQUIP      = 20,
  PETRING_LABEL     = 21,
  PETABIL_ITEM      = 22,
  PETABIL_MESO      = 23,
  PETABIL_HPCONSUME = 24,
  PETABIL_MPCONSUME = 25,
  PETABIL_SWEEPFORDROP  = 26,
  PETABIL_LONGRANGE     = 27,
  PETABIL_PICKUPOTHERS  = 28,
  PETRING_QUOTE = 29,
  PETWEAR2      = 30,
  PETRING_LABEL2 = 31,
  PETRING_QUOTE2 = 32,
  PETABIL_ITEM2  = 33,
  PETABIL_MESO2  = 34,
  PETABIL_SWEEPFORDROP2 = 35,
  PETABIL_LONGRANGE2    = 36,
  PETABIL_PICKUPOTHERS2 = 37,
  PETWEAR3      = 38,
  PETRING_LABEL3 = 39,
  PETRING_QUOTE3 = 40,
  PETABIL_ITEM3  = 41,
  PETABIL_MESO3  = 42,
  PETABIL_SWEEPFORDROP3 = 43,
  PETABIL_LONGRANGE3    = 44,
  PETABIL_PICKUPOTHERS3 = 45,
  PETABIL_IGNOREITEMS1  = 46,
  PETABIL_IGNOREITEMS2  = 47,
  PETABIL_IGNOREITEMS3  = 48,
  MEDAL         = 49,
  BELT          = 50,
  SHOULDER      = 51,
  EXT_PENDANT1  = 59,
  EQUIPPED_END  = 100, // exclusive upper bound for normal equip slots
  // cash
  CASH_BASE     = 100,
  CASH_WEAPON   = 111,
  CASH_END      = 160,
  // dragon
  DRAGON_MASK    = 1000,
  DRAGON_PENDANT = 1001,
  DRAGON_WING    = 1002,
  DRAGON_TAIL    = 1003,
  // mechanic
  MECHANIC_ENGINE     = 1100,
  MECHANIC_ARM        = 1101,
  MECHANIC_LEG        = 1102,
  MECHANIC_FRAME      = 1103,
  MECHANIC_TRANSISTOR = 1104,
}

const ARMOR_PARTS = new Set([
  BodyPart.CAP, BodyPart.CLOTHES, BodyPart.PANTS, BodyPart.SHOES,
  BodyPart.GLOVES, BodyPart.CAPE,
]);
const ACCESSORY_PARTS = new Set([
  BodyPart.FACEACC, BodyPart.EYEACC, BodyPart.EARACC,
  BodyPart.RING1, BodyPart.RING2, BodyPart.RING3, BodyPart.RING4,
  BodyPart.PENDANT, BodyPart.EXT_PENDANT1,
]);
const PET_MULTI: Partial<Record<BodyPart, BodyPart[]>> = {
  [BodyPart.PETWEAR]:              [BodyPart.PETWEAR, BodyPart.PETWEAR2, BodyPart.PETWEAR3],
  [BodyPart.PETRING_LABEL]:        [BodyPart.PETRING_LABEL, BodyPart.PETRING_LABEL2, BodyPart.PETRING_LABEL3],
  [BodyPart.PETRING_QUOTE]:        [BodyPart.PETRING_QUOTE, BodyPart.PETRING_QUOTE2, BodyPart.PETRING_QUOTE3],
  [BodyPart.PETABIL_ITEM]:         [BodyPart.PETABIL_ITEM, BodyPart.PETABIL_ITEM2, BodyPart.PETABIL_ITEM3],
  [BodyPart.PETABIL_MESO]:         [BodyPart.PETABIL_MESO, BodyPart.PETABIL_MESO2, BodyPart.PETABIL_MESO3],
  [BodyPart.PETABIL_SWEEPFORDROP]: [BodyPart.PETABIL_SWEEPFORDROP, BodyPart.PETABIL_SWEEPFORDROP2, BodyPart.PETABIL_SWEEPFORDROP3],
  [BodyPart.PETABIL_LONGRANGE]:    [BodyPart.PETABIL_LONGRANGE, BodyPart.PETABIL_LONGRANGE2, BodyPart.PETABIL_LONGRANGE3],
  [BodyPart.PETABIL_PICKUPOTHERS]: [BodyPart.PETABIL_PICKUPOTHERS, BodyPart.PETABIL_PICKUPOTHERS2, BodyPart.PETABIL_PICKUPOTHERS3],
  [BodyPart.PETABIL_IGNOREITEMS1]: [BodyPart.PETABIL_IGNOREITEMS1, BodyPart.PETABIL_IGNOREITEMS2, BodyPart.PETABIL_IGNOREITEMS3],
};

export function bodyPartIsArmor(bp: BodyPart): boolean     { return ARMOR_PARTS.has(bp); }
export function bodyPartIsAccessory(bp: BodyPart): boolean { return ACCESSORY_PARTS.has(bp); }
export function bodyPartIsDragon(bp: BodyPart): boolean    { return bp >= 1000 && bp < 1100; }
export function bodyPartIsMechanic(bp: BodyPart): boolean  { return bp >= 1100 && bp < 1200; }

export function bodyPartByPetIndex(bp: BodyPart, petIndex: number): BodyPart {
  const list = PET_MULTI[bp];
  if (!list || petIndex < 0 || petIndex >= 3) return bp;
  return list[petIndex];
}

export function bodyPartsByItemId(itemId: number): Set<BodyPart> {
  const t10 = Math.floor(itemId / 10000);
  switch (t10) {
    case 100: return new Set([BodyPart.CAP]);
    case 101: return new Set([BodyPart.FACEACC]);
    case 102: return new Set([BodyPart.EYEACC]);
    case 103: return new Set([BodyPart.EARACC]);
    case 104: case 105: return new Set([BodyPart.CLOTHES]);
    case 106: return new Set([BodyPart.PANTS]);
    case 107: return new Set([BodyPart.SHOES]);
    case 108: return new Set([BodyPart.GLOVES]);
    case 109: case 119: case 134: return new Set([BodyPart.SHIELD]);
    case 110: return new Set([BodyPart.CAPE]);
    case 111: return new Set([BodyPart.RING1, BodyPart.RING2, BodyPart.RING3, BodyPart.RING4]);
    case 112: return new Set([BodyPart.PENDANT, BodyPart.EXT_PENDANT1]);
    case 113: return new Set([BodyPart.BELT]);
    case 114: return new Set([BodyPart.MEDAL]);
    case 115: return new Set([BodyPart.SHOULDER]);
    case 161: return new Set([BodyPart.MECHANIC_ENGINE]);
    case 162: return new Set([BodyPart.MECHANIC_ARM]);
    case 163: return new Set([BodyPart.MECHANIC_LEG]);
    case 164: return new Set([BodyPart.MECHANIC_FRAME]);
    case 165: return new Set([BodyPart.MECHANIC_TRANSISTOR]);
    case 180:
      if (itemId === 1802100) return new Set([BodyPart.PETRING_LABEL, BodyPart.PETRING_LABEL2, BodyPart.PETRING_LABEL3]);
      return new Set([BodyPart.PETWEAR, BodyPart.PETWEAR2, BodyPart.PETWEAR3]);
    case 181:
      switch (itemId) {
        case 1812000: return new Set([BodyPart.PETABIL_MESO, BodyPart.PETABIL_MESO2, BodyPart.PETABIL_MESO3]);
        case 1812001: return new Set([BodyPart.PETABIL_ITEM, BodyPart.PETABIL_ITEM2, BodyPart.PETABIL_ITEM3]);
        case 1812002: return new Set([BodyPart.PETABIL_HPCONSUME]);
        case 1812003: return new Set([BodyPart.PETABIL_MPCONSUME]);
        case 1812004: return new Set([BodyPart.PETABIL_SWEEPFORDROP, BodyPart.PETABIL_SWEEPFORDROP2, BodyPart.PETABIL_SWEEPFORDROP3]);
        case 1812005: return new Set([BodyPart.PETABIL_LONGRANGE, BodyPart.PETABIL_LONGRANGE2, BodyPart.PETABIL_LONGRANGE3]);
        case 1812006: return new Set([BodyPart.PETABIL_PICKUPOTHERS, BodyPart.PETABIL_PICKUPOTHERS2, BodyPart.PETABIL_PICKUPOTHERS3]);
        case 1812007: return new Set([BodyPart.PETABIL_IGNOREITEMS1, BodyPart.PETABIL_IGNOREITEMS2, BodyPart.PETABIL_IGNOREITEMS3]);
        default:      return new Set([BodyPart.PETRING_LABEL, BodyPart.PETRING_LABEL2, BodyPart.PETRING_LABEL3]);
      }
    case 182: return new Set([BodyPart.PETRING_LABEL, BodyPart.PETRING_LABEL2, BodyPart.PETRING_LABEL3]);
    case 183: return new Set([BodyPart.PETRING_QUOTE, BodyPart.PETRING_QUOTE2, BodyPart.PETRING_QUOTE3]);
    case 190: return new Set([BodyPart.TAMINGMOB]);
    case 191: return new Set([BodyPart.SADDLE]);
    case 192: return new Set([BodyPart.MOBEQUIP]);
    case 194: return new Set([BodyPart.DRAGON_MASK]);
    case 195: return new Set([BodyPart.DRAGON_PENDANT]);
    case 196: return new Set([BodyPart.DRAGON_WING]);
    case 197: return new Set([BodyPart.DRAGON_TAIL]);
    default:
      if (!ItemConstants.isWeapon(itemId)) return new Set();
      return new Set([BodyPart.WEAPON]);
  }
}
