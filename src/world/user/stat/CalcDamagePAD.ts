import { GameConstants } from '../../GameConstants';
import { JobConstants } from '../../job/JobConstants';
import { SkillConstants } from '../../skill/SkillConstants';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Evan } from '../../skill/job/Evan';
import { WeaponType, weaponTypeByItemId } from '../../item/WeaponType';
import { BodyPart } from '../../item/BodyPart';
import { ItemConstants } from '../../item/ItemConstants';
import { ItemProvider } from '../../../provider/ItemProvider';
import { ItemInfoType } from '../../../provider/item/ItemInfoType';
import { CharacterTemporaryStat } from './CharacterTemporaryStat';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { Mob } from '../../field/mob/Mob';
import { User } from '../User';
import { Attack, AttackHeaderType } from '../../skill/Attack';
import { AttackInfo } from '../../skill/AttackInfo';
import { CalcDamage } from './CalcDamage';

// Job-specific skill IDs used by CalcDamage (mastery / critical-rate
// resolution). Ported as raw constants here rather than full per-job
// constant files (kinoko's kinoko.world.job.* packages) - see PORT_GAPS.md
// "CalcDamage (#10) scope notes".
const SKILL = {
  WARRIOR_WEAPON_MASTERY_HERO: 1100000,
  WARRIOR_WEAPON_MASTERY_PALADIN: 1200000,
  WARRIOR_ADVANCED_CHARGE: 1220010,
  WARRIOR_WEAPON_MASTERY_DRK: 1300000,
  DAWNWARRIOR_SWORD_MASTERY: 11100000,
  THIEF_DAGGER_MASTERY: 4200000,
  THIEF_KATARA_MASTERY: 4300000,
  THIEF_CLAW_MASTERY: 4100000,
  THIEF_CRITICAL_THROW: 4100001,
  THIEF_ASSASSINATE: 4221001,
  EVAN_MAGIC_MASTERY: 22170001,
  EVAN_SPELL_MASTERY: 22120002,
  EVAN_CRITICAL_MAGIC: 22140000,
  BATTLEMAGE_STAFF_MASTERY: 32100006,
  BLAZEWIZARD_SPELL_MASTERY: 12100007,
  MAGICIAN_SPELL_MASTERY_FP: 2100006,
  MAGICIAN_SPELL_MASTERY_IL: 2200006,
  MAGICIAN_SPELL_MASTERY_BISH: 2300006,
  ARAN_HIGH_MASTERY: 21120001,
  ARAN_POLEARM_MASTERY: 21100000,
  ARAN_COMBO_CRITICAL: 21110000,
  WINDARCHER_BOW_EXPERT: 13110003,
  WINDARCHER_BOW_MASTERY: 13100000,
  WINDARCHER_CRITICAL_SHOT: 13000000,
  BOWMAN_BOW_EXPERT: 3120005,
  BOWMAN_BOW_MASTERY: 3100000,
  BOWMAN_MARKSMAN_BOOST: 3220004,
  BOWMAN_CROSSBOW_MASTERY: 3200000,
  BOWMAN_CRITICAL_SHOT: 3000001,
  WILDHUNTER_CROSSBOW_EXPERT: 33120000,
  WILDHUNTER_CROSSBOW_MASTERY: 33100000,
  WILDHUNTER_JAGUAR_RIDER: 33001001,
  NIGHTWALKER_CLAW_MASTERY: 14100000,
  NIGHTWALKER_CRITICAL_THROW: 14100001,
  THUNDERBREAKER_KNUCKLE_MASTERY: 15100001,
  THUNDERBREAKER_CRITICAL_PUNCH: 15110000,
  PIRATE_KNUCKLE_MASTERY: 5100001,
  PIRATE_CRITICAL_PUNCH: 5100008,
  PIRATE_GUN_MASTERY: 5200000,
  MECHANIC_EXTREME_MECH: 35120000,
  MECHANIC_MECHANIC_MASTERY: 35100000,
  CITIZEN_DEADLY_CRITS: 30000022,
};

const ASSASSINATIONS_ACTION = 0x4F; // ActionType.ASSASSINATIONS (kinoko ActionType.java)

/**
 * Port of kinoko's CalcDamage secondary-stat / mastery / main damage-calc
 * methods. Split from CalcDamage.ts (pure-math helpers) to keep file size
 * manageable. See PORT_GAPS.md "CalcDamage (#10) scope notes" for what's
 * stubbed (PassiveSkillData, ChargedElemAttr).
 */
export class CalcDamagePAD {
  // ---- SECONDARY STAT METHODS -----------------------------------------

  /** Port of CalcDamage::getPad / SecondaryStat::GetPAD. */
  static getPad(user: User): number {
    const ss = user.getSecondaryStat();
    const psd = user.getPassiveSkillData();
    let pad = ss.pad + CalcDamagePAD.getIncPad(user) + CalcDamagePAD.getIncEpad(user) + psd.getPadX()
      + ss.getOption(CharacterTemporaryStat.BlessingArmorIncPAD).nOption;
    // CItemInfo::GetBulletPAD - add the equipped bullet's incPAD (mechanics
    // use pellets which are handled separately and are excluded here, matching
    // kinoko's JobConstants.isMechanicJob guard).
    const bulletItemId = CalcDamagePAD.getBulletItemId(user);
    if (bulletItemId !== 0 && !JobConstants.isMechanicJob(user.getJob())) {
      const bulletInfo = ItemProvider.getItemInfo(bulletItemId);
      if (bulletInfo) {
        pad += bulletInfo.getInfo(ItemInfoType.incPAD);
      }
    }
    const comboAbilityBuff = ss.getOption(CharacterTemporaryStat.ComboAbilityBuff).nOption;
    if (comboAbilityBuff !== 0) {
      const comboSkillId = SkillConstants.getComboAbilitySkill(user.getJob());
      const maxStacks = user.getSkillStatValue(comboSkillId, SkillStat.x);
      const stacks = Math.max(Math.floor(comboAbilityBuff / 10), maxStacks);
      pad += stacks * user.getSkillStatValue(comboSkillId, SkillStat.y);
    }
    const statPadR = ss.getOption(CharacterTemporaryStat.MaxLevelBuff).nOption
      + ss.getOption(CharacterTemporaryStat.DarkAura).nOption
      + ss.getOption(CharacterTemporaryStat.MorewildDamageUp).nOption
      + ss.getOption(CharacterTemporaryStat.SwallowAttackDamage).nOption;
    const totalPadR = statPadR + psd.getPadR() + ss.itemPadR;
    if (totalPadR > 0) {
      pad += Math.floor(pad * totalPadR / 100);
    }
    return Math.max(0, Math.min(pad, GameConstants.PAD_MAX));
  }

  /** Port of CalcDamage::getMad / SecondaryStat::GetMAD. */
  static getMad(user: User): number {
    const ss = user.getSecondaryStat();
    const psd = user.getPassiveSkillData();
    let mad = ss.mad + ss.getOption(CharacterTemporaryStat.MAD).nOption + psd.getMadX();
    const dragonFury = Evan.isDragonFury(user) ? user.getSkillStatValue(22160000, SkillStat.madR) : 0;
    const statMadR = ss.getOption(CharacterTemporaryStat.MaxLevelBuff).nOption
      + ss.getOption(CharacterTemporaryStat.DarkAura).nOption
      + ss.getOption(CharacterTemporaryStat.SwallowAttackDamage).nOption
      + dragonFury;
    const totalMadR = statMadR + psd.getMadR() + ss.itemMadR;
    if (totalMadR > 0) {
      mad += Math.floor(mad * totalMadR / 100);
    }
    return Math.max(0, Math.min(mad, GameConstants.MAD_MAX));
  }

  /** Port of CalcDamage::getAcc / SecondaryStat::GetAcc. */
  static getAcc(user: User): number {
    const bs = user.getBasicStat();
    const ss = user.getSecondaryStat();
    const psd = user.getPassiveSkillData();
    const baseAcc = Math.floor(bs.getLuk() + bs.getDex() * 1.2);
    let acc = baseAcc + ss.acc + CalcDamagePAD.getIncAcc(user);
    const totalAccR = psd.getAccR() + ss.itemAccR;
    if (totalAccR > 0) {
      acc += Math.floor(acc * totalAccR / 100);
    }
    return Math.max(0, Math.min(acc, GameConstants.ACC_MAX));
  }

  private static getIncPad(user: User): number {
    const ss = user.getSecondaryStat();
    const incPad = ss.getOption(CharacterTemporaryStat.PAD).nOption;
    if (ss.getOption(CharacterTemporaryStat.EnergyCharged).nOption < 10000) {
      return incPad;
    }
    const ecPad = user.getSkillStatValue(SkillConstants.getEnergyChargeSkill(user.getJob()), SkillStat.pad);
    return Math.max(incPad, ecPad);
  }

  private static getIncEpad(user: User): number {
    const ss = user.getSecondaryStat();
    const incEpad = ss.getOption(CharacterTemporaryStat.EPAD).nOption;
    if (ss.getOption(CharacterTemporaryStat.EnergyCharged).nOption < 10000) {
      return incEpad;
    }
    const ecEpad = user.getSkillStatValue(SkillConstants.getEnergyChargeSkill(user.getJob()), SkillStat.epad);
    return Math.max(incEpad, ecEpad);
  }

  private static getIncAcc(user: User): number {
    const ss = user.getSecondaryStat();
    const incAcc = ss.getOption(CharacterTemporaryStat.ACC).nOption;
    if (ss.getOption(CharacterTemporaryStat.EnergyCharged).nOption < 10000) {
      return incAcc;
    }
    const ecAcc = user.getSkillStatValue(SkillConstants.getEnergyChargeSkill(user.getJob()), SkillStat.acc);
    return Math.max(incAcc, ecAcc);
  }

  /**
   * Port of CalcDamage::getBulletItemId. Resolves the equipped ammo item id
   * for the user's weapon by scanning the consume inventory for the first
   * item that (a) matches the weapon via ItemConstants.isCorrectBulletItem,
   * (b) has an ItemInfo whose req level the user meets, and (c) has
   * quantity >= 1. Returns 0 when no suitable bullet is found.
   */
  static getBulletItemId(user: User): number {
    const weaponItem = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
    if (!weaponItem) {
      return 0;
    }
    for (const item of user.getInventoryManager().consumeInventory.getItems().values()) {
      if (!ItemConstants.isCorrectBulletItem(weaponItem.itemId, item.itemId)) {
        continue;
      }
      const itemInfo = ItemProvider.getItemInfo(item.itemId);
      if (!itemInfo || itemInfo.getReqLevel() > user.getLevel()) {
        continue;
      }
      if (item.quantity < 1) {
        continue;
      }
      return item.itemId;
    }
    return 0;
  }

  // ---- ACC / EVA -------------------------------------------------------

  /** Port of CalcDamage::calcAccR / `anonymous namespace'::calc_accr. */
  static calcAccR(user: User, mobEva: number, mobLevel: number): number {
    const ar = user.getPassiveSkillData().getAr();
    const a = Math.floor(Math.sqrt(CalcDamagePAD.getAcc(user)));
    const b = Math.floor(Math.sqrt(mobEva));
    let result = a - b + 100 + Math.floor(ar * (a - b + 100) / 100);
    if (result >= 100) result = 100;
    if (mobLevel > user.getLevel()) {
      const c = 5 * (mobLevel - user.getLevel());
      result = Math.max(result - c, 0);
    }
    return result;
  }

  // ---- CRITICAL ----------------------------------------------------------

  /** Port of CalcDamage::getCriticalSkillId / get_critical_skill_level. */
  static getCriticalSkillId(user: User, attack: Attack): number {
    if (attack.getAction() === ASSASSINATIONS_ACTION) {
      return SKILL.THIEF_ASSASSINATE;
    }
    if (JobConstants.isResistanceJob(user.getJob())) {
      return SKILL.CITIZEN_DEADLY_CRITS;
    }
    const weapon = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
    if (!weapon) return 0;
    const wt = weaponTypeByItemId(weapon.itemId);
    switch (wt) {
      case WeaponType.BOW:
      case WeaponType.CROSSBOW:
        if (!attack.isShootAttack()) return 0;
        return JobConstants.isCygnusJob(user.getJob()) ? SKILL.WINDARCHER_CRITICAL_SHOT : SKILL.BOWMAN_CRITICAL_SHOT;
      case WeaponType.THROWINGGLOVE:
        if (!attack.isShootAttack()) return 0;
        return JobConstants.isCygnusJob(user.getJob()) ? SKILL.NIGHTWALKER_CRITICAL_THROW : SKILL.THIEF_CRITICAL_THROW;
      case WeaponType.KNUCKLE:
        return SKILL.PIRATE_CRITICAL_PUNCH;
      default:
        return 0;
    }
  }

  /** Port of CalcDamage::getCriticalRate. */
  static getCriticalRate(user: User, attack: Attack): number {
    let criticalRate = user.getSkillStatValue(CalcDamagePAD.getCriticalSkillId(user, attack), SkillStat.prop) + 5;
    if (attack.isMagicAttack()) {
      criticalRate += user.getSecondaryStat().getOption(CharacterTemporaryStat.SwallowCritical).nOption;
    }
    const sharpEyes = user.getSecondaryStat().getOption(CharacterTemporaryStat.SharpEyes).nOption;
    const thornsEffect = user.getSecondaryStat().getOption(CharacterTemporaryStat.ThornsEffect).nOption;
    criticalRate += Math.max(sharpEyes >> 8, thornsEffect >> 8);
    const comboCount = user.getSecondaryStat().getOption(CharacterTemporaryStat.ComboAbilityBuff).nOption;
    if (comboCount > 0) {
      const comboCriticalSkillId = user.getJob() !== 2000 ? SKILL.ARAN_COMBO_CRITICAL : 20000018;
      const stacks = Math.min(Math.floor(comboCount / 10), user.getSkillStatValue(comboCriticalSkillId, SkillStat.x));
      criticalRate += stacks * user.getSkillStatValue(comboCriticalSkillId, SkillStat.y);
    }
    criticalRate += user.getSecondaryStat().itemCriR;
    criticalRate += user.getPassiveSkillData().getCr();
    if (SkillConstants.WILD_HUNTER_JAGUARS.has(user.getSecondaryStat().getRidingVehicle())) {
      criticalRate += user.getSkillStatValue(SKILL.WILDHUNTER_JAGUAR_RIDER, SkillStat.w);
    }
    if (JobConstants.isEvanJob(user.getJob())) {
      criticalRate += user.getSkillStatValue(SKILL.EVAN_CRITICAL_MAGIC, SkillStat.prop);
    }
    return criticalRate;
  }

  // ---- MASTERY -----------------------------------------------------------

  private static getMasteryFromSkill(user: User, ...skillIds: number[]): number {
    for (const skillId of skillIds) {
      const mastery = user.getSkillStatValue(skillId, SkillStat.mastery);
      if (mastery > 0) return mastery;
    }
    return 0;
  }

  /** Port of CalcDamage::getWeaponMastery / get_weapon_mastery. */
  static getWeaponMastery(user: User, weaponType: WeaponType): number {
    switch (weaponType) {
      case WeaponType.OH_SWORD:
      case WeaponType.TH_SWORD: {
        let mastery = CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_WEAPON_MASTERY_HERO);
        if (mastery > 0) return mastery;
        mastery = CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_WEAPON_MASTERY_PALADIN);
        if (mastery > 0) {
          if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.WeaponCharge)) {
            const masteryFromCharge = CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_ADVANCED_CHARGE);
            if (masteryFromCharge > 0) return masteryFromCharge;
          }
          return mastery;
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.DAWNWARRIOR_SWORD_MASTERY);
      }
      case WeaponType.OH_AXE:
      case WeaponType.TH_AXE:
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_WEAPON_MASTERY_HERO);
      case WeaponType.OH_MACE:
      case WeaponType.TH_MACE:
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_WEAPON_MASTERY_PALADIN);
      case WeaponType.DAGGER: {
        const shield = user.getInventoryManager().equipped.getItem(BodyPart.SHIELD);
        if (shield && weaponTypeByItemId(shield.itemId) === WeaponType.SUB_DAGGER) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.THIEF_KATARA_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.THIEF_DAGGER_MASTERY);
      }
      case WeaponType.WAND:
      case WeaponType.STAFF:
        // get_magic_mastery
        if (JobConstants.isEvanJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.EVAN_MAGIC_MASTERY, SKILL.EVAN_SPELL_MASTERY);
        } else if (JobConstants.isBattleMageJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.BATTLEMAGE_STAFF_MASTERY);
        } else if (JobConstants.isBlazeWizardJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.BLAZEWIZARD_SPELL_MASTERY);
        } else if (JobConstants.isFirePoisonJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.MAGICIAN_SPELL_MASTERY_FP);
        } else if (JobConstants.isIceLightningJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.MAGICIAN_SPELL_MASTERY_IL);
        } else if (JobConstants.isBishopJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.MAGICIAN_SPELL_MASTERY_BISH);
        }
        return 0;
      case WeaponType.SPEAR:
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_WEAPON_MASTERY_DRK)
          + user.getSecondaryStat().getOption(CharacterTemporaryStat.Beholder).nOption;
      case WeaponType.POLEARM:
        if (JobConstants.isAranJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.ARAN_HIGH_MASTERY, SKILL.ARAN_POLEARM_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.WARRIOR_WEAPON_MASTERY_DRK)
          + user.getSecondaryStat().getOption(CharacterTemporaryStat.Beholder).nOption;
      case WeaponType.BOW:
        if (JobConstants.isCygnusJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.WINDARCHER_BOW_EXPERT, SKILL.WINDARCHER_BOW_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.BOWMAN_BOW_EXPERT, SKILL.BOWMAN_BOW_MASTERY);
      case WeaponType.CROSSBOW:
        if (JobConstants.isWildHunterJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.WILDHUNTER_CROSSBOW_EXPERT, SKILL.WILDHUNTER_CROSSBOW_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.BOWMAN_MARKSMAN_BOOST, SKILL.BOWMAN_CROSSBOW_MASTERY);
      case WeaponType.THROWINGGLOVE:
        if (JobConstants.isCygnusJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.NIGHTWALKER_CLAW_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.THIEF_CLAW_MASTERY);
      case WeaponType.KNUCKLE:
        if (JobConstants.isCygnusJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.THUNDERBREAKER_KNUCKLE_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.PIRATE_KNUCKLE_MASTERY);
      case WeaponType.GUN:
        if (JobConstants.isMechanicJob(user.getJob())) {
          return CalcDamagePAD.getMasteryFromSkill(user, SKILL.MECHANIC_EXTREME_MECH, SKILL.MECHANIC_MECHANIC_MASTERY);
        }
        return CalcDamagePAD.getMasteryFromSkill(user, SKILL.PIRATE_GUN_MASTERY);
      default:
        return 0;
    }
  }

  // ---- DAMAGE MAX/MIN -----------------------------------------------------

  /** Port of CalcDamage::calcDamageMax. */
  static calcDamageMax(user: User): number {
    const weapon = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
    const weaponType = weaponTypeByItemId(weapon ? weapon.itemId : 0);
    return CalcDamage.calcDamageByWT(weaponType, user.getBasicStat(), CalcDamagePAD.getPad(user), CalcDamagePAD.getMad(user));
  }

  /** Port of CalcDamage::calcDamageMin. */
  static calcDamageMin(user: User): number {
    const weapon = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
    const weaponType = weaponTypeByItemId(weapon ? weapon.itemId : 0);
    const k = CalcDamage.getMasteryConstByWT(weaponType);
    const mastery = CalcDamagePAD.getWeaponMastery(user, weaponType);
    return (k + Math.min(mastery / 100.0, GameConstants.MASTERY_MAX)) * CalcDamagePAD.calcDamageMax(user) + 0.5;
  }

  // ---- MAIN DAMAGE CALC ----------------------------------------------------

  /**
   * Port of CalcDamage::calcPDamage. Since kinoko is client-authoritative
   * (assertDamage just logs), this does NOT overwrite ai.damage[i] - it
   * mirrors the branch logic so per-hit "should this hit land for 0 / be a
   * critical" decisions can be reused by AttackHandler. critical[] IS
   * written, matching kinoko (used for UserRemote.attack's critical flags).
   *
   * Deferred branches (no-op, fall through to "hit lands as client sent"):
   * Aran.COMBO_TEMPEST, Bowman.SNIPE fixed-damage, Thief.NINJA_STORM/
   * Aran.ROLLING_SPIN prop roll, Thief.OWL_SPIRIT/STRAFE_MM freeze proc,
   * Warrior.HEAVENS_HAMMER, ShadowPartner mirroring, Thief.SHADOW_MESO -
   * all need job-specific skill IDs and/or subsystems not ported. See
   * PORT_GAPS.md.
   */
  static calcPDamage(user: User, mob: Mob, attack: Attack, ai: AttackInfo): void {
    const ss = user.getSecondaryStat();
    const ms = mob.getMobStat();
    const skillId = attack.skillId;
    const noviceSkill = Math.max(skillId - JobConstants.getNoviceSkillRootFromJob(user.getJob()) * 1000, 0);
    const psd = user.getPassiveSkillData();
    const criticalRate = CalcDamagePAD.getCriticalRate(user, attack) + psd.getAdditionCr(skillId);
    const damagePerMob = attack.getDamagePerMob();

    let counter = 0;
    for (let i = 0; i < damagePerMob; i++) {
      if (noviceSkill === 1009 || noviceSkill === 1020) {
        continue;
      }
      if (!JobConstants.isAdminJob(user.getJob()) && ms.hasOption(MobTemporaryStat.Disable)) {
        continue;
      }
      if (ms.hasOption(MobTemporaryStat.Freeze)) {
        continue; // Aran.COMBO_TEMPEST special-case not ported
      }
      if (ms.hasOption(MobTemporaryStat.PImmune) && (Number(ai.random[counter++ % 7] % 100n)) > ss.getOption(CharacterTemporaryStat.RespectPImmune).nOption) {
        continue;
      }
      counter++;
      if (attack.headerType !== AttackHeaderType.UserBodyAttack && skillId !== 0 && ss.hasOption(CharacterTemporaryStat.Seal)) {
        continue;
      }
      const mobEva = Math.max(0, Math.min(mob.template.eva + ms.getOption(MobTemporaryStat.EVA).nOption, GameConstants.EVA_MAX));
      const accR = CalcDamagePAD.calcAccR(user, mobEva, mob.getLevel());
      if (!JobConstants.isAdminJob(user.getJob())) {
        const rand = CalcDamage.getRand(ai.random[counter++ % 7], 100.0, 0.0);
        if (accR < rand) continue; // miss
      }
      if (skillId !== 0) {
        const fixDamage = user.getSkillStatValue(skillId, SkillStat.fixdamage);
        if (noviceSkill === 1066 || noviceSkill === 1067 || fixDamage !== 0) continue;
      }
      if (ss.hasOption(CharacterTemporaryStat.Darkness)) {
        const rand = CalcDamage.getRand(ai.random[counter++ % 7], 100.0, 0.0);
        if (rand > 20.0) {
          counter += Math.floor(CalcDamage.getRand(ai.random[counter % 7], 0.0, 5.0)) + 1;
          continue;
        }
      }
      counter++; // adjust random damage
      if (skillId !== SKILL.THIEF_ASSASSINATE || attack.getAction() !== ASSASSINATIONS_ACTION) {
        if (user.getCalcDamage().isNextAttackCritical()
          || (criticalRate > 0 && criticalRate > CalcDamage.getRand(ai.random[counter++ % 7], 0.0, 100.0))) {
          ai.critical[i] = 1;
          counter++; // adjust critical damage
        }
      }
      if (mob.isBoss()) counter++; // cd->boss.nProb
    }
    user.getCalcDamage().setNextAttackCritical(false);
  }

  /** Port of CalcDamage::calcMDamage. Same client-authoritative model as calcPDamage. */
  static calcMDamage(user: User, mob: Mob, attack: Attack, ai: AttackInfo): void {
    const ss = user.getSecondaryStat();
    const ms = mob.getMobStat();
    const skillId = attack.skillId;
    const noviceSkill = Math.max(skillId - JobConstants.getNoviceSkillRootFromJob(user.getJob()) * 1000, 0);
    const criticalRate = CalcDamagePAD.getCriticalRate(user, attack);
    const damagePerMob = attack.getDamagePerMob();

    let counter = 0;
    for (let i = 0; i < damagePerMob; i++) {
      if (ms.hasOption(MobTemporaryStat.Disable)) continue;
      if (ms.hasOption(MobTemporaryStat.MImmune)) {
        const rand = Number(ai.random[counter % 7] % 100n);
        if (rand > ss.getOption(CharacterTemporaryStat.RespectMImmune).nOption) continue;
      }
      counter++;
      if (ss.hasOption(CharacterTemporaryStat.Seal)) continue;
      const mobEva = Math.max(0, Math.min(mob.template.eva + ms.getOption(MobTemporaryStat.EVA).nOption, GameConstants.EVA_MAX));
      const accR = CalcDamagePAD.calcAccR(user, mobEva, mob.getLevel());
      const rand = CalcDamage.getRand(ai.random[counter++ % 7], 100.0, 0.0);
      if (accR < rand) continue;
      if (skillId !== 0) {
        const fixDamage = user.getSkillStatValue(skillId, SkillStat.fixdamage);
        if (noviceSkill === 1066 || noviceSkill === 1067 || fixDamage !== 0) continue;
      }
      counter++; // adjust random damage
      if (user.getCalcDamage().isNextAttackCritical()
        || (criticalRate > 0 && criticalRate > CalcDamage.getRand(ai.random[counter++ % 7], 0.0, 100.0))) {
        ai.critical[i] = 1;
        counter++; // adjust critical damage
      }
      if (mob.isBoss()) counter++; // cd->boss.nProb
      user.getCalcDamage().setNextAttackCritical(false);
    }
  }
}
