import { JobConstants } from '../job/JobConstants';
import { ElementAttribute } from '../../provider/skill/ElementAttribute';
import { CharacterTemporaryStat } from '../user/stat/CharacterTemporaryStat';

const IGNORE_MASTER_LEVEL_FOR_COMMON = new Set([
  1120012, 1220013, 1320011,
  2120009, 2220009, 2320010,
  3120010, 3120011, 3220009, 3220010,
  4120010, 4220009,
  5120011, 5220012,
  32120009, 33120010,
]);

/** Port of SkillConstants::isAntiRepeatBuffSkill. */
const ANTI_REPEAT_BUFF_SKILLS = new Set([
  1001003, 1101006, 1111007, 1121000, 1201006, 1211009, 1211010, 1221000,
  1301006, 1301007, 1311007, 1321000,
  2101001, 2101003, 2121000, 2201001, 2201003, 2221000,
  2301004, 2311001, 2311003, 2321000, 2321005,
  3121000, 3121002, 3221000,
  4101004, 4111001, 4121000, 4201003, 4221000, 4311001, 4341000, 4341007,
  5111007, 5121000, 5121009, 5211007, 5221000,
  11001001, 11101003, 12101000, 12101001, 14101003, 15111005,
  21121000, 22141003, 22171000, 22181000,
  32111004, 32121007, 33121007, 35111013,
]);

/** Port of SkillConstants::isSummonSkill (CUserLocal::DoActiveSkill_Summon and friends). */
const SUMMON_SKILLS = new Set([
  1321007 /* Warrior.BEHOLDER */, 2121005 /* Magician.IFRIT */, 2221005 /* Magician.ELQUINES */,
  2311006 /* Magician.SUMMON_DRAGON */, 2321003 /* Magician.BAHAMUT */,
  3111002 /* Bowman.PUPPET_BM */, 3211002 /* Bowman.PUPPET_MM */,
  3111005 /* Bowman.SILVER_HAWK */, 3211005 /* Bowman.GOLDEN_EAGLE */,
  3121006 /* Bowman.PHOENIX */, 3221005 /* Bowman.FROSTPREY */,
  4111007 /* Thief.DARK_FLARE_NL */, 4211007 /* Thief.DARK_FLARE_SHAD */, 4341006 /* Thief.MIRRORED_TARGET */,
  5211001 /* Pirate.OCTOPUS */, 5211002 /* Pirate.GAVIOTA */, 5220002 /* Pirate.WRATH_OF_THE_OCTOPI */,
  11001004 /* DawnWarrior.SOUL */,
  12001004 /* BlazeWizard.FLAME */, 12111004 /* BlazeWizard.IFRIT */,
  13001004 /* WindArcher.STORM */, 13111004 /* WindArcher.PUPPET */,
  14001005 /* NightWalker.DARKNESS */,
  15001004 /* ThunderBreaker.LIGHTNING */,
  33111003 /* WildHunter.WILD_TRAP */, 33111005 /* WildHunter.SILVER_HAWK */,
  35111005 /* Mechanic.ACCELERATION_BOT_EX_7 */,
  35111001 /* Mechanic.SATELLITE */, 35111009 /* Mechanic.SATELLITE_2 */, 35111010 /* Mechanic.SATELLITE_3 */,
  35111002 /* Mechanic.ROCK_N_SHOCK */, 35111011 /* Mechanic.HEALING_ROBOT_H_LX */,
  35121009 /* Mechanic.BOTS_N_TOTS */, 35121010 /* Mechanic.AMPLIFIER_ROBOT_AF_11 */,
  33101008 /* WildHunter.ITS_RAINING_MINES_HIDDEN - CUserLocal::TryDoingMine */,
  35121003 /* Mechanic.GIANT_ROBOT_SG_88 - CUserLocal::DoActiveSkill_RepeatSkill */,
]);

/** Port of SkillConstants::isPartySkill (CUserLocal::DoActiveSkill_StatChange with SCT_Party). */
const PARTY_SKILLS = new Set([
  1101006 /* Warrior.RAGE */, 1211011 /* Warrior.COMBAT_ORDERS */, 1301006 /* Warrior.IRON_WILL */, 1301007 /* Warrior.HYPER_BODY */,
  2101001 /* Magician.MEDITATION_FP */, 2201001 /* Magician.MEDITATION_IL */, 2301004 /* Magician.BLESS */,
  2311001 /* Magician.DISPEL */, 2311003 /* Magician.HOLY_SYMBOL */, 2321005 /* Magician.HOLY_SHIELD */, 2321006 /* Magician.RESURRECTION */,
  3121002 /* Bowman.SHARP_EYES_BM */, 3221002 /* Bowman.SHARP_EYES_MM */,
  4101004 /* Thief.HASTE_NL */, 4201003 /* Thief.HASTE_SHAD */, 4111001 /* Thief.MESO_UP */, 4341007 /* Thief.THORNS */,
  5121009 /* Pirate.SPEED_INFUSION */, 5121010 /* Pirate.TIME_LEAP */,
  11101003 /* DawnWarrior.RAGE */,
  12101000 /* BlazeWizard.MEDITATION */,
  14101003 /* NightWalker.HASTE */,
  15111005 /* ThunderBreaker.SPEED_INFUSION */,
  21120007 /* Aran.COMBO_BARRIER */,
  22131001 /* Evan.MAGIC_SHIELD */, 22151003 /* Evan.MAGIC_RESISTANCE */, 22181000 /* Evan.BLESSING_OF_THE_ONYX */, 22181003 /* Evan.SOUL_STONE */,
  33121004 /* WildHunter.SHARP_EYES_WH */,
  1121000 /* Warrior.MAPLE_WARRIOR_HERO */, 1221000 /* Warrior.MAPLE_WARRIOR_PALADIN */, 1321000 /* Warrior.MAPLE_WARRIOR_DRK */,
  2121000 /* Magician.MAPLE_WARRIOR_FP */, 2221000 /* Magician.MAPLE_WARRIOR_IL */, 2321000 /* Magician.MAPLE_WARRIOR_BISH */,
  3121000 /* Bowman.MAPLE_WARRIOR_BM */, 3221000 /* Bowman.MAPLE_WARRIOR_MM */,
  4121000 /* Thief.MAPLE_WARRIOR_NL */, 4221000 /* Thief.MAPLE_WARRIOR_SHAD */, 4341000 /* Thief.MAPLE_WARRIOR_DB */,
  5121000 /* Pirate.MAPLE_WARRIOR_BUCC */, 5221000 /* Pirate.MAPLE_WARRIOR_SAIR */,
  21121000 /* Aran.MAPLE_WARRIOR_ARAN */, 22171000 /* Evan.MAPLE_WARRIOR_EVAN */,
  32121007 /* BattleMage.MAPLE_WARRIOR_BAM */, 33121007 /* WildHunter.MAPLE_WARRIOR_WH */, 35121007 /* Mechanic.MAPLE_WARRIOR_MECH */,
  33101006 /* WildHunter.JAGUAR_OSHI_DIGESTED - CUserLocal::TryDoingSwallowBuff */,
]);
const PARTY_SKILL_HEAL = 2301002; // Magician.HEAL

/** Port of SkillConstants::isKeydownSkill. */
const KEYDOWN_SKILLS = new Set([
  2121001, 2221001, 2321001, 3121004, 3221001, 4341002, 4341003,
  5101004, 5201002, 5221004,
  13111002, 14111006, 15101003,
  22121000, 22151001,
  33101005, 33121009,
  35001001, 35101009,
]);

/** Port of SkillConstants::getRequiredComboCount (Aran.* combo skills). */
const COMBO_SMASH = 21100004, COMBO_DRAIN = 21100005, COMBO_FENRIR = 21110004, COMBO_TEMPEST = 21120006, COMBO_BARRIER = 21120007;

/** Port of SkillConstants::isNoCooltimeSkill. */
const NO_COOLTIME_SKILLS = new Set([
  5221006 /* Pirate.BATTLESHIP */,
  35111002 /* Mechanic.ROCK_N_SHOCK */,
  35121006 /* Mechanic.SATELLITE_SAFETY */,
]);

const THIEF_SMOKESCREEN = 4221006;
const BATTLEMAGE_PARTY_SHIELD = 32121006;
const MAGICIAN_MYSTIC_DOOR = 2311002;
const EVAN_RECOVERY_AURA = 22161003;
const CITIZEN_CALL_OF_THE_HUNTER = 30001062;
const MECHANIC_OPEN_PORTAL_GX_9 = 35101005;

export const SkillConstants = {
  /** Port of SkillConstants::ENERGY_CHARGE_MAX. */
  ENERGY_CHARGE_MAX: 10000,
  isIgnoreMasterLevelForCommon(skillId: number): boolean {
    return IGNORE_MASTER_LEVEL_FOR_COMMON.has(skillId);
  },

  isSkillNeedMasterLevel(skillId: number): boolean {
    if (SkillConstants.isIgnoreMasterLevelForCommon(skillId)) return false;
    const jobId = Math.floor(skillId / 10000);
    if (JobConstants.isEvanJob(jobId)) {
      const jobLevel = JobConstants.getJobLevel(jobId);
      return jobLevel === 9 || jobLevel === 10 || skillId === 22111001 || skillId === 22141002 || skillId === 22140000;
    }
    if (JobConstants.isDualJob(jobId)) {
      return JobConstants.getJobLevel(jobId) === 4
        || skillId === 4311003 || skillId === 4321000 || skillId === 4331002 || skillId === 4331005;
    }
    if (jobId === 100 * Math.floor(jobId / 100)) return false;
    return jobId % 10 === 2;
  },

  BATTLESHIP_DURABILITY: 5221999,
  BATTLESHIP_VEHICLE: 1932000,

  WILD_HUNTER_JAGUARS: new Set([1932015, 1932030, 1932031, 1932032, 1932033, 1932036]),

  /** Port of SkillConstants::getComboAbilitySkill. */
  getComboAbilitySkill(jobId: number): number {
    return jobId !== 2000 ? 21000000 /* Aran.COMBO_ABILITY */ : 20000017; // tutorial skill
  },

  /** Port of SkillConstants::getComboAttackSkill. */
  getComboAttackSkill(jobId: number): number {
    return JobConstants.isCygnusJob(jobId) ? 11111001 /* DawnWarrior.COMBO_ATTACK */ : 1111002 /* Warrior.COMBO_ATTACK */;
  },

  /** Port of SkillConstants::getAdvancedComboSkill. */
  getAdvancedComboSkill(jobId: number): number {
    return JobConstants.isCygnusJob(jobId) ? 11110005 /* DawnWarrior.ADVANCED_COMBO */ : 1120003 /* Warrior.ADVANCED_COMBO_ATTACK */;
  },

  /** Port of SkillConstants::getEnergyChargeSkill. */
  getEnergyChargeSkill(jobId: number): number {
    return JobConstants.isCygnusJob(jobId) ? 15100004 /* ThunderBreaker.ENERGY_CHARGE */ : 5110001 /* Pirate.ENERGY_CHARGE */;
  },

  /** Port of SkillConstants::getPiratesRevengeSkill. */
  getPiratesRevengeSkill(jobId: number): number {
    if (JobConstants.isBuccaneerJob(jobId)) {
      return 5120011; // Buccaneer.PIRATES_REVENGE_BUCC
    } else if (JobConstants.isCorsairJob(jobId)) {
      return 5220012; // Corsair.PIRATES_REVENGE_SAIR
    }
    return 0;
  },

  /** Port of SkillConstants::getMpEaterSkill. */
  getMpEaterSkill(jobId: number): number {
    if (JobConstants.isFirePoisonJob(jobId)) {
      return 2100000; // Magician.MP_EATER_FP
    } else if (JobConstants.isIceLightningJob(jobId)) {
      return 2200000; // Magician.MP_EATER_IL
    } else if (JobConstants.isBishopJob(jobId)) {
      return 2300000; // Magician.MP_EATER_BISH
    }
    return 0;
  },

  /** Port of SkillConstants::getElementByWeaponChargeSkill. */
  getElementByWeaponChargeSkill(skillId: number): ElementAttribute {
    switch (skillId) {
      case 1211004: /* Warrior.FIRE_CHARGE */             return ElementAttribute.FIRE;
      case 1121006: /* Warrior.ICE_CHARGE */
      case 21121002: /* Aran.SNOW_CHARGE */               return ElementAttribute.ICE;
      case 1211008: /* Warrior.LIGHTNING_CHARGE */
      case 15101006: /* ThunderBreaker.LIGHTNING_CHARGE */ return ElementAttribute.LIGHT;
      case 1221004: /* Warrior.DIVINE_CHARGE */
      case 11111007: /* DawnWarrior.SOUL_CHARGE */        return ElementAttribute.HOLY;
      default:                                             return ElementAttribute.PHYSICAL;
    }
  },

  /** Port of SkillConstants::getVenomSkill. */
  getVenomSkill(jobId: number): number {
    if (JobConstants.isNightLordJob(jobId)) {
      return 4120005; // Thief.VENOMOUS_STAR
    } else if (JobConstants.isShadowerJob(jobId)) {
      return 4220005; // Thief.VENOMOUS_STAB
    } else if (JobConstants.isDualJob(jobId)) {
      return 4340001; // Thief.VENOM_DB
    }
    return 0;
  },

  /** Port of SkillConstants::getMortalBlowSkill. */
  getMortalBlowSkill(jobId: number): number {
    if (JobConstants.isBowmasterJob(jobId)) {
      return 3121004; // Bowman.MORTAL_BLOW_BM
    } else if (JobConstants.isMarksmanJob(jobId)) {
      return 3211003; // Bowman.MORTAL_BLOW_MM
    }
    return 0;
  },

  /** Port of SkillConstants::getItemBonusRateSkill (used by User::setConsumeItemEffect, #16). */
  getItemBonusRateSkill(jobId: number): number {
    if (JobConstants.isNightLordJob(jobId)) {
      return 4110000; // Thief.ALCHEMIST
    } else if (JobConstants.isNightWalkerJob(jobId)) {
      return 14110003; // NightWalker.ALCHEMIST
    } else if (JobConstants.isResistanceJob(jobId)) {
      return 30000002; // Citizen.POTION_MASTERY
    }
    return 0;
  },

  /** Port of SkillConstants::getSkillRoot. */
  getSkillRoot(skillId: number): number {
    return Math.floor(skillId / 10000);
  },

  isAntiRepeatBuffSkill(skillId: number): boolean {
    return ANTI_REPEAT_BUFF_SKILLS.has(skillId);
  },

  isSummonSkill(skillId: number): boolean {
    return SUMMON_SKILLS.has(skillId);
  },

  /** Port of SkillConstants::isPartySkill. */
  isPartySkill(skillId: number): boolean {
    return skillId === PARTY_SKILL_HEAL || PARTY_SKILLS.has(skillId);
  },

  isKeydownSkill(skillId: number): boolean {
    return KEYDOWN_SKILLS.has(skillId);
  },

  /** Port of SkillConstants::getStatByAuraSkill. */
  getStatByAuraSkill(skillId: number): CharacterTemporaryStat | null {
    switch (skillId) {
      case 32001003: case 32120000: return CharacterTemporaryStat.DarkAura;   // DARK_AURA / ADVANCED_DARK_AURA
      case 32101002: case 32110000: return CharacterTemporaryStat.BlueAura;  // BLUE_AURA / ADVANCED_BLUE_AURA
      case 32101003: case 32120001: return CharacterTemporaryStat.YellowAura; // YELLOW_AURA / ADVANCED_YELLOW_AURA
      default: return null;
    }
  },

  /** Port of SkillConstants::isNoCooltimeSkill. */
  isNoCooltimeSkill(skillId: number): boolean {
    return NO_COOLTIME_SKILLS.has(skillId);
  },

  /** Port of SkillConstants::getRequiredComboCount. */
  getRequiredComboCount(skillId: number): number {
    switch (skillId) {
      case COMBO_SMASH:
      case COMBO_DRAIN:
      case COMBO_FENRIR:
        return 100;
      case COMBO_TEMPEST:
      case COMBO_BARRIER:
        return 200;
      default:
        return 0;
    }
  },

  /** Port of SkillConstants::isEncodePositionSkill. */
  isEncodePositionSkill(skillId: number): boolean {
    if (SkillConstants.isAntiRepeatBuffSkill(skillId)) return true;
    if (SkillConstants.isSummonSkill(skillId)) return true;
    switch (skillId) {
      case THIEF_SMOKESCREEN:
      case BATTLEMAGE_PARTY_SHIELD:
      case MAGICIAN_MYSTIC_DOOR:
      case EVAN_RECOVERY_AURA:
      case CITIZEN_CALL_OF_THE_HUNTER:
      case MECHANIC_OPEN_PORTAL_GX_9:
        return true;
      default:
        return false;
    }
  },

  /** Port of SkillConstants::isNotSwallowableMob. */
  isNotSwallowableMob(mobTemplateId: number): boolean {
    const mobType = Math.floor(mobTemplateId / 100000);
    return (mobType >= 90 && (mobType <= 95 || mobType === 97)) || Math.floor(mobTemplateId / 10000) === 999;
  },

  /** Port of SkillConstants::isBeginnerSpAddableSkill. */
  isBeginnerSpAddableSkill(skillId: number): boolean {
    const skillRoot = SkillConstants.getSkillRoot(skillId);
    if (!JobConstants.isBeginnerJob(skillRoot)) return false;
    if (skillRoot === 3000 /* Job.CITIZEN */) {
      return skillId === 30000002 /* Citizen.POTION_MASTERY */
        || skillId === 30001000 /* Citizen.CRYSTAL_THROW */
        || skillId === 30001001 /* Citizen.INFILTRATE */;
    }
    const skillType = skillId % 10000;
    return skillType === 1000 || skillType === 1001 || skillType === 1002;
  },
};
