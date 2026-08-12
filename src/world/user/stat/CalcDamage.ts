import { Rand32 } from '../../../util/Rand32';
import { GameConstants } from '../../GameConstants';
import { JobConstants } from '../../job/JobConstants';
import { WeaponType } from '../../item/WeaponType';
import { BasicStat } from './BasicStat';
import { CharacterTemporaryStat } from './CharacterTemporaryStat';
import { DamagedAttribute } from '../../../provider/mob/DamagedAttribute';
import { ElementAttribute } from '../../../provider/skill/ElementAttribute';
import { SkillInfo } from '../../../provider/skill/SkillInfo';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { SkillConstants } from '../../skill/SkillConstants';
import { User } from '../User';

/**
 * Port of kinoko's CalcDamage. Per-user RNG seed state plus the pure-math
 * helpers used by damage calc (CalcDamagePAD.ts holds the user/mob-aware
 * calcPDamage/calcMDamage/getPad/getMad/getWeaponMastery methods, split out
 * to keep this file focused on stateless math primitives).
 */
export class CalcDamage {
  private readonly rndGenForCharacter = new Rand32();
  private nextAttackCritical = false;

  setSeed(s1: number, s2: number, s3: number): void {
    this.rndGenForCharacter.setSeed(s1 | 0x100000, s2 | 0x1000, s3 | 0x10);
  }

  isNextAttackCritical(): boolean {
    return this.nextAttackCritical;
  }

  setNextAttackCritical(value: boolean): void {
    this.nextAttackCritical = value;
  }

  getNextAttackRandom(): bigint[] {
    const random: bigint[] = [];
    for (let i = 0; i < 7; i++) {
      random.push(BigInt(this.rndGenForCharacter.random() >>> 0));
    }
    return random;
  }

  // ---- HELPER METHODS -------------------------------------------------

  /** kinoko trusts client damage and only logs on mismatch - no-op stub here. */
  static assertDamage(_expected: number, _actual: number): void {
    // Intentionally no-op: kinoko logs a warning, server stays client-authoritative.
  }

  /** Port of kinoko's CalcDamage::getRand / `get_rand`. rand must be >= 0. */
  static getRand(rand: bigint, f0: number, f1: number): number {
    if (f0 === f1) return f0;
    const r = Number(rand % 10_000_000n);
    if (f0 < f1) {
      return f0 + (r * (f1 - f0)) / 9_999_999.0;
    }
    return f1 + (r * (f0 - f1)) / 9_999_999.0;
  }

  // ---- COMMON -----------------------------------------------------------

  /** Port of kinoko's CalcDamage::CalcDamageByWT. */
  static calcDamageByWT(wt: WeaponType, bs: BasicStat, pad: number, mad: number): number {
    const jobId = bs.getJob();
    if (JobConstants.isBeginnerJob(jobId)) {
      return CalcDamage.calcBaseDamage(bs.getStr(), bs.getDex(), 0, pad, 1.2);
    }
    if (JobConstants.getJobCategory(jobId) === 2) { // is_mage_job
      return CalcDamage.calcBaseDamage(bs.getInt(), bs.getLuk(), 0, mad, 1.0);
    }
    switch (wt) {
      case WeaponType.OH_SWORD: case WeaponType.OH_AXE: case WeaponType.OH_MACE:
        return CalcDamage.calcBaseDamage(bs.getStr(), bs.getDex(), 0, pad, 1.2);
      case WeaponType.DAGGER:
        return CalcDamage.calcBaseDamage(bs.getLuk(), bs.getDex(), bs.getStr(), pad, 1.3);
      case WeaponType.BAREHAND:
        return CalcDamage.calcBaseDamage(bs.getStr(), bs.getDex(), 0, pad, 1.43);
      case WeaponType.TH_SWORD: case WeaponType.TH_AXE: case WeaponType.TH_MACE:
        return CalcDamage.calcBaseDamage(bs.getStr(), bs.getDex(), 0, pad, 1.32);
      case WeaponType.SPEAR: case WeaponType.POLEARM:
        return CalcDamage.calcBaseDamage(bs.getStr(), bs.getDex(), 0, pad, 1.49);
      case WeaponType.BOW:
        return CalcDamage.calcBaseDamage(bs.getDex(), bs.getStr(), 0, pad, 1.2);
      case WeaponType.CROSSBOW:
        return CalcDamage.calcBaseDamage(bs.getDex(), bs.getStr(), 0, pad, 1.35);
      case WeaponType.THROWINGGLOVE:
        return CalcDamage.calcBaseDamage(bs.getLuk(), bs.getDex(), 0, pad, 1.75);
      case WeaponType.KNUCKLE:
        return CalcDamage.calcBaseDamage(bs.getStr(), bs.getDex(), 0, pad, 1.7);
      case WeaponType.GUN:
        return CalcDamage.calcBaseDamage(bs.getDex(), bs.getStr(), 0, pad, 1.5);
      default:
        return 0.0;
    }
  }

  /** Port of `anonymous namespace'::calc_base_damage. */
  private static calcBaseDamage(p1: number, p2: number, p3: number, ad: number, k: number): number {
    return Math.floor((p3 + p2 + 4 * p1) / 100.0 * (ad * k) + 0.5);
  }

  /** Port of `anonymous namespace'::adjust_ramdom_damage. */
  static adjustRandomDamage(damage: number, rand: bigint, k: number, mastery: number): number {
    const totalMastery = Math.min(mastery / 100.0 + k, GameConstants.MASTERY_MAX);
    return CalcDamage.getRand(rand, damage, totalMastery * damage + 0.5);
  }

  /** Port of CalcDamage::getMasteryConstByWT. */
  static getMasteryConstByWT(wt: WeaponType): number {
    switch (wt) {
      case WeaponType.WAND: case WeaponType.STAFF:
        return 0.25;
      case WeaponType.BOW: case WeaponType.CROSSBOW:
      case WeaponType.THROWINGGLOVE: case WeaponType.GUN:
        return 0.15;
      default:
        return 0.2;
    }
  }

  // ---- ELEMENT METHODS ----------------------------------------------------

  /** Port of CalcDamage::getDamageAdjustedByElemAttr (private overload, `get_damage_adjusted_by_elemAttr`). */
  static getDamageAdjustedByElemAttrRaw(damage: number, damagedAttr: DamagedAttribute, adjust: number, boost: number): number {
    switch (damagedAttr) {
      case DamagedAttribute.DAMAGE0:
        return (1.0 - adjust) * damage;
      case DamagedAttribute.DAMAGE50:
        return (1.0 - (adjust * 0.5 + boost)) * damage;
      case DamagedAttribute.DAMAGE150: {
        const result = (adjust * 0.5 + boost + 1.0) * damage;
        if (damage >= result) return damage;
        return Math.min(result, GameConstants.DAMAGE_MAX);
      }
      default:
        return damage;
    }
  }

  /**
   * Port of kinoko's CalcDamage::getDamageAdjustedByElemAttr (public overload).
   * Dispatches on skill-specific element combos before falling through to
   * the raw overload.
   */
  static getDamageAdjustedByElemAttr(user: User, damage: number, si: SkillInfo, slv: number, damagedElemAttr: Map<ElementAttribute, DamagedAttribute>): number {
    const adjust = 1.0 - user.getSecondaryStat().getOption(CharacterTemporaryStat.ElementalReset).nOption / 100.0;
    const boost = 0.0;
    const skillId = si.skillId;
    if (skillId === 3111003 /* Bowman.INFERNO */ || skillId === 3211003 /* Bowman.BLIZZARD */) {
      return CalcDamage.getDamageAdjustedByElemAttrRaw(damage, damagedElemAttr.get(si.elemAttr) ?? DamagedAttribute.NONE, si.getValue(SkillStat.x, slv) / 100.0, boost);
    } else if (skillId === 2111006 /* Magician.ELEMENT_COMPOSITION_FP */) {
      const half = damage * 0.5;
      return CalcDamage.getDamageAdjustedByElemAttrRaw(half, damagedElemAttr.get(ElementAttribute.FIRE) ?? DamagedAttribute.NONE, 1.0, 0.0)
           + CalcDamage.getDamageAdjustedByElemAttrRaw(half, damagedElemAttr.get(ElementAttribute.POISON) ?? DamagedAttribute.NONE, 1.0, boost);
    } else if (skillId === 2211006 /* Magician.ELEMENT_COMPOSITION_IL */) {
      const half = damage * 0.5;
      return CalcDamage.getDamageAdjustedByElemAttrRaw(half, damagedElemAttr.get(ElementAttribute.ICE) ?? DamagedAttribute.NONE, 1.0, 0.0)
           + CalcDamage.getDamageAdjustedByElemAttrRaw(half, damagedElemAttr.get(ElementAttribute.LIGHT) ?? DamagedAttribute.NONE, 1.0, boost);
    }
    return CalcDamage.getDamageAdjustedByElemAttrRaw(damage, damagedElemAttr.get(si.elemAttr) ?? DamagedAttribute.NONE, adjust, boost);
  }

  /**
   * Port of kinoko's CalcDamage::getDamageAdjustedByChargedElemAttr.
   * Adjusts damage based on the weapon charge element.
   */
  static getDamageAdjustedByChargedElemAttr(user: User, damage: number, damagedElemAttr: Map<ElementAttribute, DamagedAttribute>): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.WeaponCharge)) {
      return damage;
    }
    const chargeSkillId = user.getSecondaryStat().getOption(CharacterTemporaryStat.WeaponCharge).rOption;
    const elemAttr = SkillConstants.getElementByWeaponChargeSkill(chargeSkillId);
    if (elemAttr === ElementAttribute.PHYSICAL) {
      return damage;
    }
    const adjust = user.getSkillStatValue(chargeSkillId, SkillStat.z) / 100.0;
    const amp = user.getSkillStatValue(chargeSkillId, SkillStat.damage) / 100.0;
    return CalcDamage.getDamageAdjustedByElemAttrRaw(amp * damage, damagedElemAttr.get(elemAttr) ?? DamagedAttribute.NONE, adjust, 0.0);
  }

  /**
   * Port of kinoko's CalcDamage::getDamageAdjustedByAssistChargedElemAttr.
   * Adjusts damage based on an assist charge element (e.g. Dawn Warrior soul).
   */
  static getDamageAdjustedByAssistChargedElemAttr(user: User, damage: number, damagedElemAttr: Map<ElementAttribute, DamagedAttribute>): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.AssistCharge)) {
      return damage;
    }
    const chargeSkillId = user.getSecondaryStat().getOption(CharacterTemporaryStat.AssistCharge).rOption;
    const elemAttr = SkillConstants.getElementByWeaponChargeSkill(chargeSkillId);
    if (elemAttr === ElementAttribute.PHYSICAL) {
      return damage;
    }
    const adjust = user.getSkillStatValue(chargeSkillId, SkillStat.z) / 100.0;
    const amp = user.getSkillStatValue(chargeSkillId, SkillStat.damage) / 100.0;
    return CalcDamage.getDamageAdjustedByElemAttrRaw((amp - 1.0) * damage * 0.5, damagedElemAttr.get(elemAttr) ?? DamagedAttribute.NONE, adjust, 0.0);
  }
}
