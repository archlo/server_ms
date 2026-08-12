import { ItemVariationOption } from './ItemVariationOption';
import { WeaponType, weaponTypeByItemId } from './WeaponType';

export const ItemConstants = {
  // item IDs
  HORNTAIL_NECKLACE:                1122000,
  CHAOS_HORNTAIL_NECKLACE:          1122076,
  ADVANCED_EQUIP_ENHANCEMENT_SCROLL:2049300,
  EQUIP_ENHANCEMENT_SCROLL:         2049301,
  ADVANCED_POTENTIAL_SCROLL:        2049400,
  POTENTIAL_SCROLL:                 2049401,
  WHITE_SCROLL:                     2340000,
  MIRACLE_CUBE_FRAGMENT:            2430112,
  MAGNIFYING_GLASS_BASIC:           2460000,
  MAGNIFYING_GLASS_AVERAGE:         2460001,
  MAGNIFYING_GLASS_ADVANCED:        2460002,
  MAGNIFYING_GLASS_PREMIUM:         2460003,
  OMOK_SET_BASE:                    4080000,
  OMOK_SET_END:                     4080011,
  MATCH_CARDS:                      4080100,
  MIRACLE_CUBE:                     5062000,
  REGULAR_STORE_PERMIT:             5140000,
  WHEEL_OF_DESTINY:                 5510000,

  // upgrade constants
  EQUIP_ENHANCEMENT_STAT_BASE: 2,
  EQUIP_ENHANCEMENT_ATT_BASE:  2,
  EQUIP_ENHANCEMENT_DEF_BASE:  2,
  POTENTIAL_THIRD_LINE_PROP:   50,
  POTENTIAL_PRIME_LINE2_PROP:  10,
  POTENTIAL_PRIME_LINE3_PROP:  1,
  POTENTIAL_TIER_UP_EPIC:      0.06,
  POTENTIAL_TIER_UP_UNIQUE:    0.018,

  getGenderFromId(itemId: number): number {
    if (Math.floor(itemId / 1000000) !== 1) return 2;
    const t = Math.floor(itemId / 1000) % 10;
    return t === 0 ? 0 : t === 1 ? 1 : 2;
  },

  isEquip(itemId: number):          boolean { return Math.floor(itemId / 1000000) === 1; },
  isConsume(itemId: number):        boolean { return Math.floor(itemId / 1000000) === 2; },
  isInstall(itemId: number):        boolean { return Math.floor(itemId / 1000000) === 3; },
  isEtc(itemId: number):            boolean { return Math.floor(itemId / 1000000) === 4; },
  isWeapon(itemId: number):         boolean {
    const p = Math.floor(itemId / 100000);
    return p === 13 || p === 14 || p === 16 || p === 17;
  },
  isPet(itemId: number):            boolean { return Math.floor(itemId / 10000) === 500; },
  isPetEquipItem(itemId: number):   boolean { return Math.floor(itemId / 100000) === 18; },
  isPetFoodItem(itemId: number):    boolean { return Math.floor(itemId / 10000) === 212; },
  isMobSummonItem(itemId: number):  boolean { return Math.floor(itemId / 10000) === 210; },
  isPortalScrollItem(itemId: number):  boolean { return Math.floor(itemId / 10000) === 203; },
  isRechargeableItem(itemId: number):  boolean {
    const t = Math.floor(itemId / 10000);
    return t === 207 || t === 233;
  },
  isJavelinItem(itemId: number):    boolean { return Math.floor(itemId / 10000) === 207; },
  isPelletItem(itemId: number):     boolean { return Math.floor(itemId / 10000) === 233; },

  /**
   * Port of kinoko's ItemConstants::isCorrectBulletItem. Returns true when
   * `itemId` is an ammo item matching the weapon category of
   * `weaponItemId` (bow->arrows 2060xxx, crossbow->2061xxx, claw->207xxxx,
   * gun->233xxxx). The special 1472063 bow is treated as a bow.
   */
  isCorrectBulletItem(weaponItemId: number, itemId: number): boolean {
    const wt = weaponTypeByItemId(weaponItemId);
    if (wt === WeaponType.BOW || weaponItemId === 1472063) {
      return Math.floor(itemId / 1000) === 2060;
    }
    switch (wt) {
      case WeaponType.CROSSBOW:
        return Math.floor(itemId / 1000) === 2061;
      case WeaponType.THROWINGGLOVE:
        return Math.floor(itemId / 10000) === 207;
      case WeaponType.GUN:
        return Math.floor(itemId / 10000) === 233;
    }
    return false;
  },
  isScriptRunItem(itemId: number):  boolean { return Math.floor(itemId / 10000) === 243 || itemId === 3994225; },
  isSkillLearnItem(itemId: number): boolean {
    return Math.floor(itemId / 10000) === 228 || ItemConstants.isMasteryBookItem(itemId);
  },
  isMasteryBookItem(itemId: number):     boolean {
    const t = Math.floor(itemId / 10000);
    return t === 229 || t === 562;
  },
  isRecoverSlotItem(itemId: number):     boolean { return Math.floor(itemId / 100) === 20490; },
  isBlackUpgradeItem(itemId: number):    boolean {
    return Math.floor(itemId / 100) === 20491 && (itemId < 2049105 || itemId > 2049110);
  },
  isAccUpgradeItem(itemId: number):      boolean { return Math.floor(itemId / 100) === 20492; },
  isHyperUpgradeItem(itemId: number):    boolean { return Math.floor(itemId / 100) === 20493; },
  isItemOptionUpgradeItem(itemId: number): boolean { return Math.floor(itemId / 100) === 20494; },
  isReleaseItem(itemId: number):         boolean { return Math.floor(itemId / 10000) === 246; },
  isNewUpgradeItem(itemId: number):      boolean { return Math.floor(itemId / 1000) === 2046; },
  isDurabilityUpgradeItem(itemId: number): boolean { return Math.floor(itemId / 1000) === 2047; },
  isPortableChairItem(itemId: number):   boolean { return Math.floor(itemId / 10000) === 301; },
  isExpUpItem(itemId: number):           boolean { return Math.floor(itemId / 10000) === 521 || Math.floor(itemId / 10000) === 522; },
  isTamingMobFoodItem(itemId: number):   boolean { return Math.floor(itemId / 10000) === 422; },
  isCashEffectItem(itemId: number):      boolean { return Math.floor(itemId / 10000) === 501; },
  isNonCashEffectItem(itemId: number):   boolean { return Math.floor(itemId / 10000) === 429; },
  isCoupleEquipItem(itemId: number):     boolean { return Math.floor(itemId / 100) === 11120 && itemId !== 1112000; },
  isFriendshipEquipItem(itemId: number): boolean { return Math.floor(itemId / 100) === 11128 && itemId % 10 <= 2; },
  isMatchedItemIdGender(itemId: number, gender: number): boolean {
    const g = ItemConstants.getGenderFromId(itemId);
    return gender === 2 || g === 2 || gender === g;
  },
  isUpgradeScrollNoConsumeWhiteScroll(itemId: number): boolean {
    return itemId === 2040727 || itemId === 2041058 || ItemConstants.isRecoverSlotItem(itemId);
  },

  getHyperUpgradeSuccessProp(itemId: number, chuc: number): number {
    if (itemId === ItemConstants.ADVANCED_EQUIP_ENHANCEMENT_SCROLL) {
      const table = [100,90,80,70,60,50,40,30,20];
      return table[chuc] ?? 10;
    }
    if (itemId === ItemConstants.EQUIP_ENHANCEMENT_SCROLL) {
      const table = [80,70,60,50,40,30,20];
      return table[chuc] ?? 10;
    }
    return 0;
  },

  getItemOptionUpgradeSuccessProp(itemId: number): number {
    if (itemId === ItemConstants.ADVANCED_POTENTIAL_SCROLL) return 90;
    if (itemId === ItemConstants.POTENTIAL_SCROLL)          return 70;
    return 0;
  },

  getReleaseItemLevelLimit(itemId: number): number {
    if (itemId === ItemConstants.MAGNIFYING_GLASS_BASIC)    return 30;
    if (itemId === ItemConstants.MAGNIFYING_GLASS_AVERAGE)  return 70;
    if (itemId === ItemConstants.MAGNIFYING_GLASS_ADVANCED) return 120;
    if (itemId === ItemConstants.MAGNIFYING_GLASS_PREMIUM)  return 200;
    return -1;
  },

  getVariation(v: number, option: ItemVariationOption): number {
    if (v <= 0 || option === ItemVariationOption.NONE) return v;
    const isGacha = option === ItemVariationOption.GACHAPON;
    const a = Math.min(
      Math.floor(v / (isGacha ? 5 : 10)) + 1,
      isGacha ? 7 : 5,
    );
    const b = 1 << (a + 2);
    let c = Math.floor(Math.random() * b);
    let d = -2;
    let i = isGacha ? (a + 2) : 7;
    while (i-- > 0) {
      d += c & 1;
      c >>= 1;
    }
    return Math.max(v + (Math.random() < 0.5 ? d : -d), 0);
  },
};
