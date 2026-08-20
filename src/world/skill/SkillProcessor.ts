import { SkillProvider } from '../../provider/SkillProvider';
import { SkillStat } from '../../provider/skill/SkillStat';
import { Util } from '../../util/Util';
import { Mob } from '../field/mob/Mob';
import { MobStatOption } from '../field/mob/MobStatOption';
import { MobTemporaryStat } from '../field/mob/MobTemporaryStat';
import { MobLeaveType } from '../field/mob/MobLeaveType';
import { BurnedInfo } from '../field/mob/BurnedInfo';
import { User } from '../user/User';
import { Attack } from './Attack';
import { CharacterTemporaryStat } from '../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../user/stat/TemporaryStatOption';
import { DiceInfo } from '../user/stat/DiceInfo';
import { Effect } from '../user/effect/Effect';
import { UserLocal } from '../user/UserLocal';
import { UserRemote } from '../user/UserRemote';
import { SkillConstants } from './SkillConstants';
import { GameConstants } from '../GameConstants';
import { WildHunterInfo } from '../user/data/WildHunterInfo';
import { wildHunterInfoPacket } from '../user/WvsContext';
import { Warrior } from './job/Warrior';
import { Magician } from './job/Magician';
import { Bowman } from './job/Bowman';
import { Thief } from './job/Thief';
import { Pirate } from './job/Pirate';
import { Aran } from './job/Aran';
import { Evan } from './job/Evan';
import { BattleMage } from './job/BattleMage';
import { WildHunter } from './job/WildHunter';
import { Mechanic } from './job/Mechanic';
import { Summoned } from '../field/summoned/Summoned';
import { SummonedAssistType } from '../field/summoned/SummonedAssistType';
import { SummonedMoveAbility } from '../field/summoned/SummonedMoveAbility';
import { TownPortalPacket } from '../field/townportal/TownPortalPacket';
import { MessagePacket } from '../user/MessagePacket';

/**
 * Maps skillRoot (skillId / 10000, see SkillConstants.getSkillRoot) to a
 * job's handleAttack. Port of kinoko's `Job.getById(skillRoot)` switch in
 * SkillProcessor.processAttack/processSkill - only jobs with a ported
 * handleAttack are listed here. Roots: Warrior=100, Fighter=110,
 * Crusader=111, Hero=112, Page=120, WhiteKnight=121, Paladin=122,
 * Spearman=130, DragonKnight=131, DarkKnight=132 (kinoko Warrior.java
 * covers all of these via shared MONSTER_MAGNET/SHOUT/CHARGED_BLOW/BLAST).
 * Magician=200, WizardFP=210, MageFP=211, ArchMageFP=212, WizardIL=220,
 * MageIL=221, ArchMageIL=222, Cleric=230, Priest=231, Bishop=232 (kinoko
 * Magician.java). Archer=300, Hunter=310, Ranger=311, Bowmaster=312,
 * Crossbowman=320, Sniper=321, Marksman=322 (kinoko Bowman.java). Rogue=400,
 * Assassin=410, Hermit=411, NightLord=412, Bandit=420, ChiefBandit=421,
 * Shadower=422, BladeRecruit=430, BladeAcolyte=431, BladeSpecialist=432,
 * BladeLord=433, BladeMaster=434 (kinoko Thief.java). Pirate=500,
 * Brawler=510, Marauder=511, Buccaneer=512, Gunslinger=520, Outlaw=521,
 * Corsair=522 (kinoko Pirate.java). Aran1-4=2100/2110/2111/2112 (kinoko
 * Aran.java). Evan1-10=2200/2210-2218 (kinoko Evan.java). BattleMage1-4=
 * 3200/3210/3211/3212 (kinoko BattleMage.java). WildHunter1-4=
 * 3300/3310/3311/3312 (kinoko WildHunter.java). Mechanic1-4=
 * 3500/3510/3511/3512 (kinoko Mechanic.java). DawnWarrior/BlazeWizard/
 * WindArcher/NightWalker/ThunderBreaker handleAttack are empty no-ops in
 * kinoko - intentionally not in this table.
 */
const ATTACK_HANDLERS: Record<number, (user: User, mob: Mob, attack: Attack, delay: number) => void> = {
  100: Warrior.handleAttack, 110: Warrior.handleAttack, 111: Warrior.handleAttack, 112: Warrior.handleAttack,
  120: Warrior.handleAttack, 121: Warrior.handleAttack, 122: Warrior.handleAttack,
  130: Warrior.handleAttack, 131: Warrior.handleAttack, 132: Warrior.handleAttack,
  200: Magician.handleAttack, 210: Magician.handleAttack, 211: Magician.handleAttack, 212: Magician.handleAttack,
  220: Magician.handleAttack, 221: Magician.handleAttack, 222: Magician.handleAttack,
  230: Magician.handleAttack, 231: Magician.handleAttack, 232: Magician.handleAttack,
  300: Bowman.handleAttack, 310: Bowman.handleAttack, 311: Bowman.handleAttack, 312: Bowman.handleAttack,
  320: Bowman.handleAttack, 321: Bowman.handleAttack, 322: Bowman.handleAttack,
  400: Thief.handleAttack, 410: Thief.handleAttack, 411: Thief.handleAttack, 412: Thief.handleAttack,
  420: Thief.handleAttack, 421: Thief.handleAttack, 422: Thief.handleAttack,
  430: Thief.handleAttack, 431: Thief.handleAttack, 432: Thief.handleAttack, 433: Thief.handleAttack, 434: Thief.handleAttack,
  500: Pirate.handleAttack, 510: Pirate.handleAttack, 511: Pirate.handleAttack, 512: Pirate.handleAttack,
  520: Pirate.handleAttack, 521: Pirate.handleAttack, 522: Pirate.handleAttack,
  2100: Aran.handleAttack, 2110: Aran.handleAttack, 2111: Aran.handleAttack, 2112: Aran.handleAttack,
  2200: Evan.handleAttack, 2210: Evan.handleAttack, 2211: Evan.handleAttack, 2212: Evan.handleAttack,
  2213: Evan.handleAttack, 2214: Evan.handleAttack, 2215: Evan.handleAttack, 2216: Evan.handleAttack,
  2217: Evan.handleAttack, 2218: Evan.handleAttack,
  3200: BattleMage.handleAttack, 3210: BattleMage.handleAttack, 3211: BattleMage.handleAttack, 3212: BattleMage.handleAttack,
  3300: WildHunter.handleAttack, 3310: WildHunter.handleAttack, 3311: WildHunter.handleAttack, 3312: WildHunter.handleAttack,
  3500: Mechanic.handleAttack, 3510: Mechanic.handleAttack, 3511: Mechanic.handleAttack, 3512: Mechanic.handleAttack,
};

/**
 * Explicit skill IDs referenced by SkillProcessor.processAttack's
 * non-job-specific switch (kinoko SkillProcessor.java:54-92). Per-job
 * constant files (Warrior/Magician/Thief/etc, ~17 files) are not yet ported,
 * so only the IDs needed here are hardcoded - same pattern as
 * CalcDamagePAD's SKILL map (see PORT_GAPS.md).
 */
const SKILL = {
  BEGINNER_RECOVERY: 1001,
  NOBLESSE_RECOVERY: 10001001,
  ARAN_RECOVERY: 20001001,
  EVAN_RECOVER: 20011001,
  BEGINNER_NIMBLE_FEET: 1002,
  NOBLESSE_NIMBLE_FEET: 10001002,
  ARAN_AGILE_BODY: 20001002,
  EVAN_NIMBLE_FEET: 20011002,
  BEGINNER_SOARING: 1026,
  NOBLESSE_SOARING: 10001026,
  ARAN_SOARING: 20001026,
  EVAN_SOARING: 20011026,
  CITIZEN_SOARING: 30001026,
  BEGINNER_ECHO_OF_HERO: 1005,
  NOBLESSE_ECHO_OF_HERO: 10001005,
  ARAN_ECHO_OF_HERO: 20001005,
  EVAN_HEROS_ECHO: 20011005,
  CITIZEN_HEROS_ECHO: 30001005,

  WARRIOR_IRON_BODY: 1001003,
  DAWN_WARRIOR_IRON_BODY: 11001001,
  WARRIOR_RAGE: 1101006,
  DAWN_WARRIOR_RAGE: 11101003,
  WARRIOR_COMBO_ATTACK: 1111002,
  DAWN_WARRIOR_COMBO_ATTACK: 11111001,
  WARRIOR_POWER_GUARD_HERO: 1101007,
  WARRIOR_POWER_GUARD_PALADIN: 1201007,
  WARRIOR_MAGIC_CRASH_HERO: 1111007,
  WARRIOR_MAGIC_CRASH_PALADIN: 1211009,
  WARRIOR_MAGIC_CRASH_DRK: 1311007,
  WARRIOR_POWER_STANCE_HERO: 1121002,
  WARRIOR_POWER_STANCE_PALADIN: 1221002,
  WARRIOR_POWER_STANCE_DRK: 1321002,
  WARRIOR_ENRAGE: 1121010,
  WARRIOR_THREATEN: 1201006,
  WARRIOR_HP_RECOVERY: 1211010,
  WARRIOR_COMBAT_ORDERS: 1211011,
  WARRIOR_FIRE_CHARGE: 1211004,
  WARRIOR_ICE_CHARGE: 1211006,
  WARRIOR_LIGHTNING_CHARGE: 1211008,
  WARRIOR_DIVINE_CHARGE: 1221004,
  WARRIOR_IRON_WILL: 1301006,
  WARRIOR_HYPER_BODY: 1301007,
  WARRIOR_DRAGON_BLOOD: 1311008,
  WARRIOR_BEHOLDER: 1321007,
  WARRIOR_HEX_OF_THE_BEHOLDER: 1320009,

  WARRIOR_PANIC: 1111003,
  DAWN_WARRIOR_PANIC: 11111002,
  WARRIOR_COMA: 1111005,
  DAWN_WARRIOR_COMA: 11111003,

  MAGICIAN_MAGIC_GUARD: 2001002,
  BLAZE_WIZARD_MAGIC_GUARD: 12001001,
  EVAN_MAGIC_GUARD: 22111001,
  MAGICIAN_MAGIC_ARMOR: 2001003,
  BLAZE_WIZARD_MAGIC_ARMOR: 12001002,
  MAGICIAN_MEDITATION_FP: 2101001,
  MAGICIAN_MEDITATION_IL: 2201001,
  BLAZE_WIZARD_MEDITATION: 12101000,
  MAGICIAN_SLOW_FP: 2101003,
  MAGICIAN_SLOW_IL: 2201003,
  BLAZE_WIZARD_SLOW: 12101001,
  MAGICIAN_SEAL_FP: 2111004,
  MAGICIAN_SEAL_IL: 2211004,
  BLAZE_WIZARD_SEAL: 12111002,
  MAGICIAN_POISON_BREATH: 2101005,
  MAGICIAN_FIRE_DEMON: 2121003,
  MAGICIAN_ICE_DEMON: 2221003,
  MAGICIAN_METEOR_SHOWER: 2121007,
  MAGICIAN_BLIZZARD: 2221007,
  BLAZE_WIZARD_METEOR_SHOWER: 12111003,
  MAGICIAN_TELEPORT_MASTERY_FP: 2111007,
  MAGICIAN_TELEPORT_MASTERY_IL: 2211007,
  MAGICIAN_TELEPORT_MASTERY_BISH: 2311007,
  BATTLE_MAGE_TELEPORT_MASTERY: 32111010,
  MAGICIAN_ELEMENTAL_DECREASE_FP: 2111008,
  MAGICIAN_ELEMENTAL_DECREASE_IL: 2211008,
  BLAZE_WIZARD_ELEMENTAL_RESET: 12101005,
  EVAN_ELEMENTAL_RESET: 22121001,
  MAGICIAN_MANA_REFLECTION_FP: 2121002,
  MAGICIAN_MANA_REFLECTION_IL: 2221002,
  MAGICIAN_MANA_REFLECTION_BISH: 2321002,
  MAGICIAN_INFINITY_FP: 2121004,
  MAGICIAN_INFINITY_IL: 2221004,
  MAGICIAN_INFINITY_BISH: 2321004,
  MAGICIAN_HEAL: 2301002,
  MAGICIAN_INVINCIBLE: 2301003,
  MAGICIAN_BLESS: 2301004,
  MAGICIAN_DISPEL: 2311001,
  MAGICIAN_MYSTIC_DOOR: 2311002,
  MAGICIAN_HOLY_SYMBOL: 2311003,
  MAGICIAN_HOLY_SHIELD: 2321005,
  MAGICIAN_IFRIT: 2121005,
  MAGICIAN_ELQUINES: 2221005,
  MAGICIAN_SUMMON_DRAGON: 2311006,
  MAGICIAN_BAHAMUT: 2321003,
  BLAZE_WIZARD_IFRIT: 12111004,
  DAWN_WARRIOR_SOUL: 11001004,
  BLAZE_WIZARD_FLAME: 12001004,
  WIND_ARCHER_STORM: 13001004,
  NIGHT_WALKER_DARKNESS: 14001005,
  THUNDER_BREAKER_LIGHTNING: 15001004,

  BOWMAN_FOCUS: 3001003,
  WIND_ARCHER_FOCUS: 13001002,
  BOWMAN_SOUL_ARROW_BM: 3101004,
  BOWMAN_SOUL_ARROW_MM: 3201004,
  WIND_ARCHER_SOUL_ARROW: 13101003,
  WILDHUNTER_SOUL_ARROW: 33101003,
  BOWMAN_SHARP_EYES_BM: 3121002,
  BOWMAN_SHARP_EYES_MM: 3221002,
  BOWMAN_HAMSTRING: 3121007,
  BOWMAN_BLIND: 3221006,
  BOWMAN_CONCENTRATE: 3121008,
  BOWMAN_PUPPET_BM: 3111002,
  BOWMAN_PUPPET_MM: 3211002,
  WIND_ARCHER_PUPPET: 13111004,
  BOWMAN_SILVER_HAWK: 3111005,
  BOWMAN_GOLDEN_EAGLE: 3211005,
  BOWMAN_PHOENIX: 3121006,
  BOWMAN_FROSTPREY: 3221005,

  THIEF_DISORDER: 4001002,
  NIGHT_WALKER_DISORDER: 14001002,
  THIEF_DARK_SIGHT: 4001003,
  NIGHT_WALKER_DARK_SIGHT: 14001003,
  WIND_ARCHER_WIND_WALK: 13101006,
  THIEF_HASTE_NL: 4101004,
  THIEF_HASTE_SHAD: 4201003,
  THIEF_SELF_HASTE: 4311001,
  NIGHT_WALKER_HASTE: 14101003,
  THIEF_MESO_UP: 4111001,
  THIEF_SHADOW_PARTNER_NL: 4111002,
  THIEF_SHADOW_PARTNER_SHAD: 4211008,
  THIEF_MIRROR_IMAGE: 4331002,
  NIGHT_WALKER_SHADOW_PARTNER: 14111000,
  THIEF_SHADOW_WEB: 4111003,
  NIGHT_WALKER_SHADOW_WEB: 14111001,
  THIEF_SHADOW_STARS: 4121006,
  THIEF_PICKPOCKET: 4211003,
  THIEF_MESO_GUARD: 4211005,
  THIEF_THORNS: 4341007,
  THIEF_DARK_FLARE_NL: 4111007,
  THIEF_DARK_FLARE_SHAD: 4211007,
  THIEF_MIRRORED_TARGET: 4341006,

  PIRATE_MP_RECOVERY: 5101005,
  PIRATE_OAK_BARREL: 5101007,
  PIRATE_TRANSFORMATION: 5111005,
  PIRATE_SUPER_TRANSFORMATION: 5121003,
  PIRATE_ROLL_OF_THE_DICE_BUCC: 5111007,
  PIRATE_ROLL_OF_THE_DICE_SAIR: 5211007,
  THUNDER_BREAKER_TRANSFORMATION: 15111002,
  WIND_ARCHER_EAGLE_EYE: 13111005,
  PIRATE_OCTOPUS: 5211001,
  PIRATE_GAVIOTA: 5211002,
  PIRATE_WRATH_OF_THE_OCTOPI: 5220002,

  ARAN_COMBO_DRAIN: 21100005,
  ARAN_BODY_PRESSURE: 21101003,
  ARAN_SMART_KNOCKBACK: 21111001,
  ARAN_SNOW_CHARGE: 21111005,
  ARAN_COMBO_BARRIER: 21120007,
  ARAN_FREEZE_STANDING: 21121003,

  EVAN_MAGIC_SHIELD: 22131001,
  EVAN_SLOW: 22141003,
  EVAN_MAGIC_RESISTANCE: 22151003,
  EVAN_BLESSING_OF_THE_ONYX: 22181000,
  EVAN_SOUL_STONE: 22181003,

  DAWN_WARRIOR_FINAL_ATTACK: 11101002,
  DAWN_WARRIOR_SOUL_CHARGE: 11111007,
  WIND_ARCHER_FINAL_ATTACK: 13101002,

  BATTLE_MAGE_DARK_AURA: 32001003,
  BATTLE_MAGE_BLUE_AURA: 32101002,
  BATTLE_MAGE_YELLOW_AURA: 32101003,
  BATTLE_MAGE_BLOOD_DRAIN: 32101004,
  BATTLE_MAGE_CONVERSION: 32111004,
  BATTLE_MAGE_BODY_BOOST: 32111005,
  BATTLE_MAGE_SUMMON_REAPER_BUFF: 32111006,
  BATTLE_MAGE_TWISTER_SPIN: 32121003,
  BATTLE_MAGE_STANCE: 32121005,

  WILDHUNTER_ITS_RAINING_MINES: 33101004,
  WILDHUNTER_WILD_TRAP: 33111003,
  WILDHUNTER_BLIND: 33111004,
  WILDHUNTER_SILVER_HAWK: 33111005,
  WILDHUNTER_SHARP_EYES: 33121004,
  WILDHUNTER_FELINE_BERSERK: 33121006,

  MECH_PERFECT_ARMOR: 35101007,
  MECH_SATELLITE: 35111001,
  MECH_ROCK_N_SHOCK: 35111002,
  MECH_HEALING_ROBOT: 35111011,
  MECH_SATELLITE_2: 35111009,
  MECH_SATELLITE_3: 35111010,
  MECH_GIANT_ROBOT: 35121003,
  MECH_BOTS_N_TOTS: 35121009,
  MECH_SATELLITE_SAFETY: 35121006,
  MECH_MISSILE_TANK: 35121005,
  MECH_ROLL_OF_THE_DICE: 35111013,

  CITIZEN_INFILTRATE: 30001001,
  CITIZEN_CAPTURE: 30001061,
  CITIZEN_CALL_OF_THE_HUNTER: 30001062,
} as const;

const NOOP_SKILLS = new Set<number>([
  2101002, 2201002, 2301001, 4111006, 4211009, 4321003, 11101005,
  12101003, 14101004, 21001001, 22101001, 32001002, 33101004,
  35101004, 30001068,
]);

const BOOSTER_SKILLS = new Set<number>([
  1101004, 1201004, 1301004, 2111005, 2211005, 3101002, 3201002,
  4101003, 4201002, 4301002, 5101006, 5201003, 11101001, 12101004,
  13101001, 14101002, 15101002, 21001003, 22141002, 32101005,
  33101003, 35101006,
]);

const MAPLE_WARRIOR_SKILLS = new Set<number>([
  1121000, 1221000, 1321000, 2121000, 2221000, 2321000, 3121000,
  3221000, 4121000, 4221000, 4341000, 5121000, 5221000, 21121000,
  22171000, 32121007, 33121007, 35121007,
]);

const HEROS_WILL_SKILLS = new Set<number>([
  1121011, 1221012, 1321010, 2121008, 2221008, 2321009, 3121009,
  3221008, 4121009, 4221008, 4341008, 5121010, 5221010, 21121008,
  22171004, 32121008, 33121008, 35121008,
]);

/** Port of kinoko's SkillProcessor. */
export class SkillProcessor {
  /**
   * Port of SkillProcessor.processAttack. Only the non-job-specific switch
   * (lines 54-92 of kinoko's SkillProcessor.java) is ported - the per-job
   * `handleAttack` dispatch (Warrior/Magician/Thief/etc, ~17 job files) is
   * not yet ported and falls through as a no-op.
   */
  static processAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.WARRIOR_PANIC:
      case SKILL.DAWN_WARRIOR_PANIC:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Blind, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.WARRIOR_COMA:
      case SKILL.DAWN_WARRIOR_COMA:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.MAGICIAN_POISON_BREATH:
      case SKILL.MAGICIAN_FIRE_DEMON:
      case SKILL.MAGICIAN_ICE_DEMON:
      case SKILL.MAGICIAN_METEOR_SHOWER:
      case SKILL.MAGICIAN_BLIZZARD:
      case SKILL.BLAZE_WIZARD_METEOR_SHOWER:
        mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        return;
      case SKILL.MAGICIAN_TELEPORT_MASTERY_FP:
      case SKILL.MAGICIAN_TELEPORT_MASTERY_IL:
      case SKILL.MAGICIAN_TELEPORT_MASTERY_BISH:
      case SKILL.BATTLE_MAGE_TELEPORT_MASTERY:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.subProp, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.THIEF_DISORDER:
      case SKILL.NIGHT_WALKER_DISORDER:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(new Map([
            [MobTemporaryStat.PAD, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
            [MobTemporaryStat.PDR, MobStatOption.of(si.getValue(SkillStat.y, slv), skillId, si.getDuration(slv))],
          ]), delay);
        }
        return;
    }

    // CLASS SPECIFIC SKILLS - per-job handleAttack dispatch. All jobs with a
    // non-empty handleAttack in kinoko are ported (Warrior/Magician/Bowman/
    // Thief/Pirate/Aran/Evan/BattleMage/WildHunter/Mechanic, see job/*.ts) and
    // registered in ATTACK_HANDLERS. Cygnus jobs (DawnWarrior/BlazeWizard/
    // WindArcher/NightWalker/ThunderBreaker) have empty no-op handleAttack in
    // kinoko and are intentionally absent.
    const handler = ATTACK_HANDLERS[SkillConstants.getSkillRoot(skillId)];
    handler?.(user, mob, attack, delay);
  }

  /**
   * Partial port of SkillProcessor.processSkill. This covers temporary-stat
   * buffs and targeted mob debuffs that do not require Summoned, Pet, Party,
   * AffectedArea, or TwoStateTemporaryStat support.
   */
  static processSkill(user: User, skill: import('./Skill').Skill): void {
    const si = SkillProvider.getSkillInfoById(skill.skillId);
    if (!si) return;
    const skillId = skill.skillId;
    const slv = skill.slv;
    const field = user.getField();
    const duration = getBuffedDuration(user, si.getDuration(slv));

    switch (skillId) {
      case SKILL.BEGINNER_RECOVERY:
      case SKILL.NOBLESSE_RECOVERY:
      case SKILL.ARAN_RECOVERY:
      case SKILL.EVAN_RECOVER:
        user.setTemporaryStat(CharacterTemporaryStat.Regen, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        user.setSchedule(skillId, new Date(Date.now() + 5_000));
        return;
      case SKILL.BEGINNER_NIMBLE_FEET:
      case SKILL.NOBLESSE_NIMBLE_FEET:
      case SKILL.ARAN_AGILE_BODY:
      case SKILL.EVAN_NIMBLE_FEET:
        user.setTemporaryStat(CharacterTemporaryStat.Speed, TemporaryStatOption.of(si.getValue(SkillStat.speed, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.BEGINNER_SOARING:
      case SKILL.NOBLESSE_SOARING:
      case SKILL.ARAN_SOARING:
      case SKILL.EVAN_SOARING:
      case SKILL.CITIZEN_SOARING:
        if (field?.getMapInfo?.().fly) user.setTemporaryStat(CharacterTemporaryStat.Flying, TemporaryStatOption.of(1, skillId, 0));
        return;
      case SKILL.BEGINNER_ECHO_OF_HERO:
      case SKILL.NOBLESSE_ECHO_OF_HERO:
      case SKILL.ARAN_ECHO_OF_HERO:
      case SKILL.EVAN_HEROS_ECHO:
      case SKILL.CITIZEN_HEROS_ECHO:
        user.setTemporaryStat(CharacterTemporaryStat.MaxLevelBuff, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        if (field) {
          skill.forEachAffectedUser(field, (other) => {
            other.setTemporaryStat(CharacterTemporaryStat.MaxLevelBuff, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
            other.write(UserLocal.effect(Effect.skillAffected(skillId, slv)));
            field.broadcastPacket(UserRemote.effect(other, Effect.skillAffected(skillId, slv)), other);
          });
        }
        return;
      case SKILL.WARRIOR_IRON_BODY:
      case SKILL.DAWN_WARRIOR_IRON_BODY:
        user.setTemporaryStat(CharacterTemporaryStat.PDD, TemporaryStatOption.of(si.getValue(SkillStat.pdd, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_RAGE:
      case SKILL.DAWN_WARRIOR_RAGE:
        user.setTemporaryStat(CharacterTemporaryStat.PAD, TemporaryStatOption.of(si.getValue(SkillStat.pad, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_COMBO_ATTACK:
      case SKILL.DAWN_WARRIOR_COMBO_ATTACK:
        user.setTemporaryStat(CharacterTemporaryStat.ComboCounter, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_POWER_GUARD_HERO:
      case SKILL.WARRIOR_POWER_GUARD_PALADIN:
        user.setTemporaryStat(CharacterTemporaryStat.PowerGuard, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_MAGIC_CRASH_HERO:
      case SKILL.WARRIOR_MAGIC_CRASH_PALADIN:
      case SKILL.WARRIOR_MAGIC_CRASH_DRK:
        if (field) skill.forEachAffectedMob(field, (mob) => {
          if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
            mob.setTemporaryStat(MobTemporaryStat.MagicCrash, MobStatOption.of(1, skillId, si.getDuration(slv)), skill.delay);
          }
        });
        return;
      case SKILL.WARRIOR_POWER_STANCE_HERO:
      case SKILL.WARRIOR_POWER_STANCE_PALADIN:
      case SKILL.WARRIOR_POWER_STANCE_DRK:
        user.setTemporaryStat(CharacterTemporaryStat.Stance, TemporaryStatOption.of(si.getValue(SkillStat.prop, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_ENRAGE:
        user.setTemporaryStat(CharacterTemporaryStat.Enrage, TemporaryStatOption.of(si.getValue(SkillStat.x, slv) * 100 + si.getValue(SkillStat.mobCount, slv), skillId, si.getDuration(slv)));
        user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.ComboCounter);
        return;
      case SKILL.WARRIOR_THREATEN:
        if (field) skill.forEachAffectedMob(field, (mob) => {
          if (!mob.isBoss()) {
            mob.setTemporaryStat(new Map([
              [MobTemporaryStat.PAD, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
              [MobTemporaryStat.PDR, MobStatOption.of(si.getValue(SkillStat.y, slv), skillId, si.getDuration(slv))],
              [MobTemporaryStat.Blind, MobStatOption.of(si.getValue(SkillStat.z, slv), skillId, si.getValue(SkillStat.subTime, slv) * 1000)],
            ]), 0);
          }
        });
        return;
      case SKILL.WARRIOR_HP_RECOVERY: {
        const hpRecovery = Math.floor(user.getMaxHp() * si.getValue(SkillStat.x, slv) / 100);
        user.addHp(hpRecovery);
        user.write(UserLocal.effect(Effect.incDecHpEffect(hpRecovery)));
        field?.broadcastPacket(UserRemote.effect(user, Effect.incDecHpEffect(hpRecovery)), user);
        return;
      }
      case SKILL.WARRIOR_COMBAT_ORDERS:
        user.setTemporaryStat(CharacterTemporaryStat.CombatOrders, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_FIRE_CHARGE:
      case SKILL.WARRIOR_ICE_CHARGE:
      case SKILL.WARRIOR_DIVINE_CHARGE:
        user.setTemporaryStat(CharacterTemporaryStat.WeaponCharge, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_LIGHTNING_CHARGE:
        user.setTemporaryStat(CharacterTemporaryStat.AssistCharge, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.WARRIOR_IRON_WILL:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.PDD, TemporaryStatOption.of(si.getValue(SkillStat.pdd, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.MDD, TemporaryStatOption.of(si.getValue(SkillStat.mdd, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.WARRIOR_HYPER_BODY:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.MaxHP, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.MaxMP, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.WARRIOR_DRAGON_BLOOD:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.DragonBlood, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.PAD, TemporaryStatOption.of(si.getValue(SkillStat.pad, slv), skillId, si.getDuration(slv))],
        ]));
        user.setSchedule(skillId, new Date(Date.now() + 1_000));
        return;
      case SKILL.WARRIOR_HEX_OF_THE_BEHOLDER: {
        const statByType = [
          [CharacterTemporaryStat.EPDD, SkillStat.epdd],
          [CharacterTemporaryStat.EMDD, SkillStat.emdd],
          [CharacterTemporaryStat.ACC, SkillStat.acc],
          [CharacterTemporaryStat.EVA, SkillStat.eva],
          [CharacterTemporaryStat.EPAD, SkillStat.epad],
        ] as const;
        const selected = statByType[skill.summonBuffType];
        if (selected) {
          user.setTemporaryStat(selected[0], TemporaryStatOption.of(si.getValue(selected[1], slv), skillId, si.getDuration(slv)));
        }
        return;
      }
      case SKILL.WARRIOR_BEHOLDER:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK), skill);
        return;
      case SKILL.MAGICIAN_MAGIC_GUARD:
      case SKILL.BLAZE_WIZARD_MAGIC_GUARD:
      case SKILL.EVAN_MAGIC_GUARD:
        user.setTemporaryStat(CharacterTemporaryStat.MagicGuard, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, duration));
        return;
      case SKILL.MAGICIAN_MAGIC_ARMOR:
      case SKILL.BLAZE_WIZARD_MAGIC_ARMOR:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.PDD, TemporaryStatOption.of(si.getValue(SkillStat.pdd, slv), skillId, duration)],
          [CharacterTemporaryStat.MDD, TemporaryStatOption.of(si.getValue(SkillStat.mdd, slv), skillId, duration)],
        ]));
        return;
      case SKILL.MAGICIAN_MEDITATION_FP:
      case SKILL.MAGICIAN_MEDITATION_IL:
      case SKILL.BLAZE_WIZARD_MEDITATION:
        user.setTemporaryStat(CharacterTemporaryStat.MAD, TemporaryStatOption.of(si.getValue(SkillStat.mad, slv), skillId, duration));
        return;
      case SKILL.MAGICIAN_SLOW_FP:
      case SKILL.MAGICIAN_SLOW_IL:
      case SKILL.BLAZE_WIZARD_SLOW:
        if (field) skill.forEachAffectedMob(field, (mob) => {
          if (!mob.isSlowUsed()) {
            mob.setTemporaryStat(MobTemporaryStat.Speed, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)), skill.delay);
            mob.setSlowUsed(true);
          }
        });
        return;
      case SKILL.MAGICIAN_SEAL_FP:
      case SKILL.MAGICIAN_SEAL_IL:
      case SKILL.BLAZE_WIZARD_SEAL:
        if (field) skill.forEachAffectedMob(field, (mob) => {
          if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
            mob.setTemporaryStat(MobTemporaryStat.Seal, MobStatOption.of(1, skillId, si.getDuration(slv)), skill.delay);
          }
        });
        return;
      case SKILL.MAGICIAN_TELEPORT_MASTERY_FP:
      case SKILL.MAGICIAN_TELEPORT_MASTERY_IL:
      case SKILL.MAGICIAN_TELEPORT_MASTERY_BISH:
      case SKILL.BATTLE_MAGE_TELEPORT_MASTERY:
        user.setTemporaryStat(CharacterTemporaryStat.TeleportMasteryOn, TemporaryStatOption.of(si.getValue(SkillStat.y, slv), skillId, 0));
        return;
      case SKILL.MAGICIAN_ELEMENTAL_DECREASE_FP:
      case SKILL.MAGICIAN_ELEMENTAL_DECREASE_IL:
      case SKILL.BLAZE_WIZARD_ELEMENTAL_RESET:
      case SKILL.EVAN_ELEMENTAL_RESET:
        user.setTemporaryStat(CharacterTemporaryStat.ElementalReset, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, duration));
        return;
      case SKILL.MAGICIAN_MANA_REFLECTION_FP:
      case SKILL.MAGICIAN_MANA_REFLECTION_IL:
      case SKILL.MAGICIAN_MANA_REFLECTION_BISH:
        user.setTemporaryStat(CharacterTemporaryStat.ManaReflection, TemporaryStatOption.of(slv, skillId, duration));
        return;
      case SKILL.MAGICIAN_INFINITY_FP:
      case SKILL.MAGICIAN_INFINITY_IL:
      case SKILL.MAGICIAN_INFINITY_BISH:
        user.setTemporaryStat(CharacterTemporaryStat.Infinity, TemporaryStatOption.of(1, skillId, duration));
        user.setSchedule(skillId, new Date(Date.now() + 4_000));
        return;
      case SKILL.MAGICIAN_HEAL:
        user.addHp(Math.floor(user.getMaxHp() * Math.floor(si.getValue(SkillStat.hp, slv) / skill.getAffectedMemberCount()) / 100));
        return;
      case SKILL.MAGICIAN_INVINCIBLE:
        user.setTemporaryStat(CharacterTemporaryStat.Invincible, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, duration));
        return;
      case SKILL.MAGICIAN_BLESS:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.PAD, TemporaryStatOption.of(si.getValue(SkillStat.pad, slv), skillId, duration)],
          [CharacterTemporaryStat.MAD, TemporaryStatOption.of(si.getValue(SkillStat.mad, slv), skillId, duration)],
          [CharacterTemporaryStat.PDD, TemporaryStatOption.of(si.getValue(SkillStat.pdd, slv), skillId, duration)],
          [CharacterTemporaryStat.MDD, TemporaryStatOption.of(si.getValue(SkillStat.mdd, slv), skillId, duration)],
          [CharacterTemporaryStat.ACC, TemporaryStatOption.of(si.getValue(SkillStat.acc, slv), skillId, duration)],
          [CharacterTemporaryStat.EVA, TemporaryStatOption.of(si.getValue(SkillStat.eva, slv), skillId, duration)],
        ]));
        return;
      case SKILL.MAGICIAN_DISPEL:
        if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          const resetStats = new Set([
            CharacterTemporaryStat.Poison, CharacterTemporaryStat.Seal, CharacterTemporaryStat.Darkness,
            CharacterTemporaryStat.Weakness, CharacterTemporaryStat.Curse, CharacterTemporaryStat.Slow,
          ]);
          user.resetTemporaryStat((cts) => resetStats.has(cts));
        }
        return;
      case SKILL.MAGICIAN_HOLY_SYMBOL:
        user.setTemporaryStat(CharacterTemporaryStat.HolySymbol, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, duration));
        return;
      case SKILL.MAGICIAN_HOLY_SHIELD:
        user.setTemporaryStat(CharacterTemporaryStat.Holyshield, TemporaryStatOption.of(1, skillId, duration));
        return;
      case SKILL.MAGICIAN_MYSTIC_DOOR: {
        if (!field) return;
        const expireTime = new Date(Date.now() + si.getDuration(slv));
        const townPortal = field.getTownPortalPool().createFieldPortal(
          user,
          skillId,
          skill.positionX,
          skill.positionY,
          expireTime,
        );
        if (townPortal) {
          user.setTownPortal(townPortal);
          user.write(TownPortalPacket.townPortal(townPortal));
        } else {
          user.write(MessagePacket.system('You cannot use the Mystic Door skill here.'));
        }
        return;
      }
      case SKILL.MAGICIAN_IFRIT:
      case SKILL.MAGICIAN_ELQUINES:
      case SKILL.MAGICIAN_BAHAMUT:
      case SKILL.BLAZE_WIZARD_IFRIT:
      case SKILL.DAWN_WARRIOR_SOUL:
      case SKILL.BLAZE_WIZARD_FLAME:
      case SKILL.WIND_ARCHER_STORM:
      case SKILL.NIGHT_WALKER_DARKNESS:
      case SKILL.THUNDER_BREAKER_LIGHTNING:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK), skill);
        return;
      case SKILL.MAGICIAN_SUMMON_DRAGON:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.FLY, SummonedAssistType.ATTACK), skill);
        return;
      case SKILL.BOWMAN_FOCUS:
      case SKILL.WIND_ARCHER_FOCUS:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.ACC, TemporaryStatOption.of(si.getValue(SkillStat.acc, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.EVA, TemporaryStatOption.of(si.getValue(SkillStat.eva, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.BOWMAN_SOUL_ARROW_BM:
      case SKILL.BOWMAN_SOUL_ARROW_MM:
      case SKILL.WIND_ARCHER_SOUL_ARROW:
      case SKILL.WILDHUNTER_SOUL_ARROW:
        user.setTemporaryStat(CharacterTemporaryStat.SoulArrow, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.BOWMAN_SHARP_EYES_BM:
      case SKILL.BOWMAN_SHARP_EYES_MM:
        user.setTemporaryStat(CharacterTemporaryStat.SharpEyes, TemporaryStatOption.of((si.getValue(SkillStat.x, slv) << 8) + si.getValue(SkillStat.criticaldamageMax, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.BOWMAN_HAMSTRING:
        user.setTemporaryStat(CharacterTemporaryStat.HamString, TemporaryStatOption.of(slv, skillId, si.getDuration(slv)));
        return;
      case SKILL.BOWMAN_BLIND:
        user.setTemporaryStat(CharacterTemporaryStat.Blind, TemporaryStatOption.of(slv, skillId, si.getDuration(slv)));
        return;
      case SKILL.BOWMAN_CONCENTRATE:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.Concentration, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.EPAD, TemporaryStatOption.of(si.getValue(SkillStat.epad, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.BOWMAN_PUPPET_BM:
      case SKILL.BOWMAN_PUPPET_MM:
      case SKILL.WIND_ARCHER_PUPPET: {
        if (!field) return;
        const puppet = Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.NONE);
        puppet.hp = si.getValue(SkillStat.x, slv);
        addSummoned(user, field, puppet, skill);
        return;
      }
      case SKILL.BOWMAN_SILVER_HAWK:
      case SKILL.BOWMAN_GOLDEN_EAGLE:
      case SKILL.BOWMAN_PHOENIX:
      case SKILL.BOWMAN_FROSTPREY:
      case SKILL.WILDHUNTER_SILVER_HAWK:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.FLY, SummonedAssistType.ATTACK), skill);
        return;
      case SKILL.THIEF_DARK_SIGHT:
      case SKILL.NIGHT_WALKER_DARK_SIGHT:
      case SKILL.WIND_ARCHER_WIND_WALK: {
        const stat = skillId === SKILL.WIND_ARCHER_WIND_WALK ? CharacterTemporaryStat.WindWalk : CharacterTemporaryStat.DarkSight;
        if (slv === si.maxLevel) {
          user.setTemporaryStat(stat, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        } else {
          user.setTemporaryStats(new Map([
            [stat, TemporaryStatOption.of(1, skillId, si.getDuration(slv))],
            [CharacterTemporaryStat.Slow, TemporaryStatOption.of(100 - si.getValue(SkillStat.y, slv), skillId, si.getDuration(slv))],
          ]));
        }
        return;
      }
      case SKILL.THIEF_HASTE_NL:
      case SKILL.THIEF_HASTE_SHAD:
      case SKILL.THIEF_SELF_HASTE:
      case SKILL.NIGHT_WALKER_HASTE:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.Speed, TemporaryStatOption.of(si.getValue(SkillStat.speed, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.Jump, TemporaryStatOption.of(si.getValue(SkillStat.jump, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.THIEF_MESO_UP:
        user.setTemporaryStat(CharacterTemporaryStat.MesoUp, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.THIEF_SHADOW_PARTNER_NL:
      case SKILL.THIEF_SHADOW_PARTNER_SHAD:
      case SKILL.THIEF_MIRROR_IMAGE:
      case SKILL.NIGHT_WALKER_SHADOW_PARTNER:
        user.setTemporaryStat(CharacterTemporaryStat.ShadowPartner, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.THIEF_SHADOW_WEB:
      case SKILL.NIGHT_WALKER_SHADOW_WEB:
        if (field) skill.forEachAffectedMob(field, (mob) => {
          if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
            mob.setTemporaryStat(MobTemporaryStat.Web, MobStatOption.of(1, skillId, si.getDuration(slv)), skill.delay);
          }
        });
        return;
      case SKILL.THIEF_SHADOW_STARS:
        user.setTemporaryStat(CharacterTemporaryStat.SpiritJavelin, TemporaryStatOption.of(skill.spiritJavelinItemId % 10000 + 1, skillId, si.getDuration(slv)));
        return;
      case SKILL.THIEF_PICKPOCKET:
        user.setTemporaryStat(CharacterTemporaryStat.PickPocket, TemporaryStatOption.of(slv, skillId, si.getDuration(slv)));
        return;
      case SKILL.THIEF_MESO_GUARD:
        user.setTemporaryStat(CharacterTemporaryStat.MesoGuard, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.THIEF_THORNS:
        user.setTemporaryStat(CharacterTemporaryStat.ThornsEffect, TemporaryStatOption.of((si.getValue(SkillStat.x, slv) << 8) + si.getValue(SkillStat.criticaldamageMin, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.THIEF_DARK_FLARE_NL:
      case SKILL.THIEF_DARK_FLARE_SHAD: {
        if (!field) return;
        const darkFlare = Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK_COUNTER);
        addSummoned(user, field, darkFlare, skill);
        return;
      }
      case SKILL.THIEF_MIRRORED_TARGET: {
        if (!field) return;
        const mirroredTarget = new Summoned(skillId, slv, SummonedMoveAbility.STOP, SummonedAssistType.NONE, user.getAvatarLook(), new Date(Date.now() + si.getDuration(slv)));
        mirroredTarget.hp = si.getValue(SkillStat.x, slv);
        addSummoned(user, field, mirroredTarget, skill);
        user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.ShadowPartner);
        return;
      }
      case SKILL.PIRATE_MP_RECOVERY:
        user.addMp(Math.floor(user.getMaxHp() * si.getValue(SkillStat.x, slv) / 100 * si.getValue(SkillStat.y, slv) / 100));
        return;
      case SKILL.PIRATE_OAK_BARREL:
        user.setTemporaryStat(CharacterTemporaryStat.Morph, TemporaryStatOption.of(si.getValue(SkillStat.morph, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.PIRATE_TRANSFORMATION:
      case SKILL.PIRATE_SUPER_TRANSFORMATION:
      case SKILL.THUNDER_BREAKER_TRANSFORMATION:
      case SKILL.WIND_ARCHER_EAGLE_EYE:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.Morph, TemporaryStatOption.of(si.getValue(SkillStat.morph, slv) + user.getGender() * 100, skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.EPAD, TemporaryStatOption.of(si.getValue(SkillStat.epad, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.EPDD, TemporaryStatOption.of(si.getValue(SkillStat.epdd, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.EMDD, TemporaryStatOption.of(si.getValue(SkillStat.emdd, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.Speed, TemporaryStatOption.of(si.getValue(SkillStat.speed, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.Jump, TemporaryStatOption.of(si.getValue(SkillStat.jump, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.PIRATE_OCTOPUS:
      case SKILL.PIRATE_WRATH_OF_THE_OCTOPI:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK), skill);
        return;
      case SKILL.PIRATE_GAVIOTA:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.FLY, SummonedAssistType.ATTACK), skill);
        return;
      case SKILL.PIRATE_ROLL_OF_THE_DICE_BUCC:
      case SKILL.PIRATE_ROLL_OF_THE_DICE_SAIR:
      case SKILL.MECH_ROLL_OF_THE_DICE: {
        // Port of Pirate/Mechanic Roll of the Dice: roll 1-6, broadcast the
        // skill-affected-select effect, and set the Dice CTS with a DiceInfo
        // built from the rolled face (roll 1 = no bonus, no stat set).
        const roll = Util.getRandom(1, 6);
        user.write(UserLocal.effect(Effect.skillAffectedSelect(roll, skillId, slv)));
        field?.broadcastPacket(UserRemote.effect(user, Effect.skillAffectedSelect(roll, skillId, slv)), user);
        if (roll !== 1) {
          const diceInfo = DiceInfo.from(roll, si, slv);
          user.setTemporaryStat(CharacterTemporaryStat.Dice, TemporaryStatOption.ofDice(roll, skillId, si.getDuration(slv), diceInfo));
        }
        return;
      }
      case SKILL.CITIZEN_INFILTRATE:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.Speed, TemporaryStatOption.of(si.getValue(SkillStat.speed, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.Sneak, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.CITIZEN_CAPTURE: {
        // Port of Citizen.handleSkill CAPTURE branch - tames a Wild Hunter
        // jaguar (sets riding type) or captures a mob into the captured-mob
        // list (max 5). skill.captureTargetMobId is read in SkillHandler.
        if (!field) return;
        const capturedMob = field.getMobPool().getById(skill.captureTargetMobId);
        if (!capturedMob) {
          user.write(UserLocal.effect(Effect.skillUseInfo(skillId, slv, user.getLevel(), 2))); // Monster cannot be captured.
          return;
        }
        const templateId = capturedMob.getTemplateId();
        const capturedMobs = user.getWildHunterInfo().getCapturedMobs();
        if (capturedMob.isBoss() || capturedMob.getLevel() > user.getLevel() || capturedMobs.includes(templateId)) {
          user.write(UserLocal.effect(Effect.skillUseInfo(skillId, slv, user.getLevel(), 2))); // Monster cannot be captured.
          return;
        }
        // Check hp below the skill's x threshold (typically 50%)
        const percentage = Math.floor(capturedMob.getHp() / capturedMob.getMaxHp() * 100);
        if (percentage > si.getValue(SkillStat.x, slv)) {
          user.write(UserLocal.effect(Effect.skillUseInfo(skillId, slv, user.getLevel(), 1))); // Capture failed. Monster HP too high.
          return;
        }
        // Capture success
        user.write(UserLocal.effect(Effect.skillUseInfo(skillId, slv, user.getLevel(), 0))); // Monster successfully captured.
        field.getMobPool().removeMob(capturedMob, MobLeaveType.ETC);
        if (GameConstants.isJaguarMob(templateId)) {
          user.getWildHunterInfo().setRidingType((templateId % 10) + 1);
        } else {
          capturedMobs.push(templateId);
          if (capturedMobs.length > WildHunterInfo.MAX_CAPTURED) {
            capturedMobs.shift();
          }
        }
        user.write(wildHunterInfoPacket(user.getWildHunterInfo()));
        return;
      }
      case SKILL.CITIZEN_CALL_OF_THE_HUNTER: {
        // Port of Citizen.handleSkill CALL_OF_THE_HUNTER - removes the mob
        // from the captured list and notifies the client. The kinoko mob-
        // spawn (dazzled mob via MobProvider) is deferred; this wires up the
        // WildHunterInfo update which is the data-structure concern here.
        const capturedMobs = user.getWildHunterInfo().getCapturedMobs();
        const idx = capturedMobs.indexOf(skill.randomCapturedMobId);
        if (idx < 0) {
          return;
        }
        capturedMobs.splice(idx, 1);
        user.write(wildHunterInfoPacket(user.getWildHunterInfo()));
        return;
      }
      case SKILL.ARAN_COMBO_DRAIN:
        user.setTemporaryStat(CharacterTemporaryStat.ComboDrain, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.ARAN_BODY_PRESSURE:
        user.setTemporaryStat(CharacterTemporaryStat.BodyPressure, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.ARAN_SMART_KNOCKBACK:
        user.setTemporaryStat(CharacterTemporaryStat.SmartKnockback, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.ARAN_SNOW_CHARGE:
        user.setTemporaryStat(CharacterTemporaryStat.WeaponCharge, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.ARAN_COMBO_BARRIER:
        user.setTemporaryStat(CharacterTemporaryStat.ComboBarrier, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.ARAN_FREEZE_STANDING:
        user.setTemporaryStat(CharacterTemporaryStat.Stance, TemporaryStatOption.of(si.getValue(SkillStat.prop, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.EVAN_MAGIC_SHIELD:
        user.setTemporaryStat(CharacterTemporaryStat.MagicShield, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.EVAN_SLOW:
        user.setTemporaryStat(CharacterTemporaryStat.EvanSlow, TemporaryStatOption.of(slv, skillId, si.getDuration(slv)));
        return;
      case SKILL.EVAN_MAGIC_RESISTANCE:
        user.setTemporaryStat(CharacterTemporaryStat.MagicResistance, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.EVAN_BLESSING_OF_THE_ONYX:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.PDD, TemporaryStatOption.of(si.getValue(SkillStat.pdd, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.MDD, TemporaryStatOption.of(si.getValue(SkillStat.mdd, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.MAD, TemporaryStatOption.of(si.getValue(SkillStat.mad, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.EVAN_SOUL_STONE:
        user.setTemporaryStat(CharacterTemporaryStat.SoulStone, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.DAWN_WARRIOR_FINAL_ATTACK:
        user.setTemporaryStat(CharacterTemporaryStat.SoulMasterFinal, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.DAWN_WARRIOR_SOUL_CHARGE:
        user.setTemporaryStat(CharacterTemporaryStat.WeaponCharge, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.WIND_ARCHER_FINAL_ATTACK:
        user.setTemporaryStat(CharacterTemporaryStat.WindBreakerFinal, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.BATTLE_MAGE_DARK_AURA:
      case SKILL.BATTLE_MAGE_BLUE_AURA:
      case SKILL.BATTLE_MAGE_YELLOW_AURA:
        user.setTemporaryStat(CharacterTemporaryStat.Aura, TemporaryStatOption.of(slv, skillId, 0));
        user.setSchedule(skillId, new Date());
        return;
      case SKILL.BATTLE_MAGE_BLOOD_DRAIN:
        user.setTemporaryStat(CharacterTemporaryStat.ComboDrain, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.BATTLE_MAGE_CONVERSION:
        user.setTemporaryStat(CharacterTemporaryStat.Conversion, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.BATTLE_MAGE_BODY_BOOST: {
        const aura = user.getSecondaryStat().getOption(CharacterTemporaryStat.Aura);
        if (aura.rOption === SKILL.BATTLE_MAGE_DARK_AURA) {
          user.setTemporaryStats(new Map([
            [CharacterTemporaryStat.SuperBody, TemporaryStatOption.of(slv, skillId, 60_000)],
            [CharacterTemporaryStat.DarkAura, TemporaryStatOption.of(aura.nOption + si.getValue(SkillStat.v, slv), aura.rOption, 60_000)],
          ]));
        } else if (aura.rOption === SKILL.BATTLE_MAGE_YELLOW_AURA) {
          user.setTemporaryStat(CharacterTemporaryStat.SuperBody, TemporaryStatOption.of(slv, skillId, 60_000));
        } else if (aura.rOption === SKILL.BATTLE_MAGE_BLUE_AURA) {
          user.setTemporaryStat(CharacterTemporaryStat.SuperBody, TemporaryStatOption.of(slv, skillId, si.getValue(SkillStat.z, slv) * 1000));
        }
        return;
      }
      case SKILL.BATTLE_MAGE_SUMMON_REAPER_BUFF:
        user.setTemporaryStat(CharacterTemporaryStat.Revive, TemporaryStatOption.of(slv, skillId, si.getDuration(slv)));
        return;
      case SKILL.BATTLE_MAGE_TWISTER_SPIN:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.Cyclone, TemporaryStatOption.of(1, skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.NotDamaged, TemporaryStatOption.of(1, skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.BATTLE_MAGE_STANCE:
        user.setTemporaryStat(CharacterTemporaryStat.Stance, TemporaryStatOption.of(si.getValue(SkillStat.prop, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WILDHUNTER_ITS_RAINING_MINES:
        user.setTemporaryStat(CharacterTemporaryStat.Mine, TemporaryStatOption.of(1, skillId, si.getDuration(slv)));
        return;
      case SKILL.WILDHUNTER_WILD_TRAP: {
        if (!field) return;
        const wildTrap = Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK);
        wildTrap.hp = si.getValue(SkillStat.x, slv);
        addSummoned(user, field, wildTrap, skill);
        return;
      }
      case SKILL.WILDHUNTER_BLIND:
        user.setTemporaryStat(CharacterTemporaryStat.Blind, TemporaryStatOption.of(slv, skillId, si.getDuration(slv)));
        return;
      case SKILL.WILDHUNTER_SHARP_EYES:
        user.setTemporaryStat(CharacterTemporaryStat.SharpEyes, TemporaryStatOption.of((si.getValue(SkillStat.x, slv) << 8) + si.getValue(SkillStat.criticaldamageMax, slv), skillId, si.getDuration(slv)));
        return;
      case SKILL.WILDHUNTER_FELINE_BERSERK:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.MorewildMaxHP, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.MorewildDamageUp, TemporaryStatOption.of(si.getValue(SkillStat.y, slv), skillId, si.getDuration(slv))],
          [CharacterTemporaryStat.Speed, TemporaryStatOption.of(si.getValue(SkillStat.z, slv), skillId, si.getDuration(slv))],
        ]));
        return;
      case SKILL.MECH_PERFECT_ARMOR:
        if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.ManaReflection)) {
          user.resetTemporaryStatBySkill(skillId);
        } else {
          user.setTemporaryStat(CharacterTemporaryStat.ManaReflection, TemporaryStatOption.of(slv, skillId, 0));
        }
        return;
      case SKILL.MECH_SATELLITE:
      case SKILL.MECH_SATELLITE_2:
      case SKILL.MECH_SATELLITE_3:
        if (field) addSummoned(user, field, new Summoned(skillId, slv, SummonedMoveAbility.WALK, SummonedAssistType.ATTACK_EX), skill);
        return;
      case SKILL.MECH_ROCK_N_SHOCK:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.NONE), skill);
        return;
      case SKILL.MECH_HEALING_ROBOT:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.HEAL), skill);
        return;
      case SKILL.MECH_GIANT_ROBOT:
        if (field) addSummoned(user, field, new Summoned(skillId, slv, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK_MANUAL), { ...skill, summonLeft: false });
        return;
      case SKILL.MECH_BOTS_N_TOTS:
        if (field) addSummoned(user, field, Summoned.from(si, slv, SummonedMoveAbility.STOP, SummonedAssistType.SUMMON), skill);
        return;
      case SKILL.MECH_SATELLITE_SAFETY:
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.SafetyDamage, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, 0)],
          [CharacterTemporaryStat.SafetyAbsorb, TemporaryStatOption.of(si.getValue(SkillStat.y, slv), skillId, 0)],
        ]));
        return;
    }

    if (NOOP_SKILLS.has(skillId)) return;
    if (BOOSTER_SKILLS.has(skillId)) {
      user.setTemporaryStat(CharacterTemporaryStat.Booster, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
      return;
    }
    if (MAPLE_WARRIOR_SKILLS.has(skillId)) {
      user.setTemporaryStat(CharacterTemporaryStat.BasicStatUp, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv)));
      return;
    }
    if (HEROS_WILL_SKILLS.has(skillId)) {
      const resetStats = new Set([
        CharacterTemporaryStat.Poison, CharacterTemporaryStat.Seal, CharacterTemporaryStat.Darkness,
        CharacterTemporaryStat.Weakness, CharacterTemporaryStat.Curse, CharacterTemporaryStat.Slow,
        CharacterTemporaryStat.Attract, CharacterTemporaryStat.ReverseInput, CharacterTemporaryStat.StopPortion,
        CharacterTemporaryStat.StopMotion,
      ]);
      user.resetTemporaryStat((cts) => resetStats.has(cts));
      return;
    }
  }

  /** Port of SkillProcessor.processUpdate. */
  static processUpdate(user: User, now: Date): void {
    if (user.getHp() <= 0) return;
    SkillProcessor.handleRecovery(user, now);
    SkillProcessor.handleDragonBlood(user, now);
    SkillProcessor.handlePoison(user, now);
    SkillProcessor.handleInfinity(user, now);
    SkillProcessor.handleAura(user, now);
    SkillProcessor.handleMissileTank(user, now);
  }

  private static handleRecovery(user: User, now: Date): void {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Regen)) return;
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.Regen);
    const skillId = option.rOption;
    if (now > user.getSchedule(skillId)) {
      const hpRecovery = option.nOption;
      user.addHp(hpRecovery);
      user.write(UserLocal.effect(Effect.incDecHpEffect(hpRecovery)));
      user.getField()?.broadcastPacket(UserRemote.effect(user, Effect.incDecHpEffect(hpRecovery)), user);
      user.setSchedule(skillId, new Date(now.getTime() + 5_000));
    }
  }

  private static handleDragonBlood(user: User, now: Date): void {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.DragonBlood)) return;
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.DragonBlood);
    const skillId = option.rOption;
    if (now > user.getSchedule(skillId)) {
      const hpConsume = option.nOption;
      if (user.getHp() < hpConsume * 4) {
        // Skill canceled when not enough HP to be consumed in next 4 seconds
        user.resetTemporaryStatBySkill(skillId);
        return;
      }
      user.addHp(-hpConsume);
      user.setSchedule(skillId, new Date(now.getTime() + 1_000));
    }
  }

  // OG: Mob poison DoT — nOption = damage-per-tick (from mob skill x stat),
  // tOption = remaining duration in ms. Ticks once per second via schedule.
  // The client shows the HP loss as a red damage number over the character.
  private static handlePoison(user: User, now: Date): void {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Poison)) return;
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.Poison);
    const poisonSkillId = option.rOption;
    const damagePerTick = option.nOption;
    if (now > user.getSchedule(poisonSkillId)) {
      if (user.getHp() <= damagePerTick) {
        // Poison would kill — cancel the debuff instead (OG behavior)
        user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.Poison);
        return;
      }
      user.addHp(-damagePerTick);
      user.setSchedule(poisonSkillId, new Date(now.getTime() + 1_000));
    }
  }

  private static handleInfinity(user: User, now: Date): void {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Infinity)) return;
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.Infinity);
    const skillId = option.rOption;
    if (now > user.getSchedule(skillId)) {
      const si = SkillProvider.getSkillInfoById(skillId);
      if (!si) return;
      const slv = user.getSkillLevel(skillId);
      const percentage = si.getValue(SkillStat.y, slv);
      // Recover hp and mp
      user.addHp(Math.floor(user.getMaxHp() * percentage / 100));
      user.addMp(Math.floor(user.getMaxMp() * percentage / 100));
      // Increase magic att %
      const damage = si.getValue(SkillStat.damage, slv);
      user.setTemporaryStat(CharacterTemporaryStat.Infinity, option.update(option.nOption + damage));
      user.setSchedule(skillId, new Date(now.getTime() + 4_000));
    }
  }

  private static handleAura(user: User, now: Date): void {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Aura)) return;
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.Aura);
    const auraSkillId = option.rOption;
    if (now <= user.getSchedule(auraSkillId)) return;
    const field = user.getField();
    if (!field) return;
    const skillId = BattleMage.getAdvancedAuraSkill(user, auraSkillId);
    const slv = user.getSkillLevel(skillId);
    if (slv === 0) return;
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) return;
    const cts = SkillConstants.getStatByAuraSkill(skillId);
    if (!cts) return;
    const rect = si.getRect(slv);
    const relativeRect = rect ? user.getRelativeRect(rect) : null;
    const x = cts === CharacterTemporaryStat.DarkAura ? si.getValue(SkillStat.x, slv) : slv;
    if (!user.getSecondaryStat().hasOption(cts)) {
      user.setTemporaryStat(cts, TemporaryStatOption.of(x, skillId, 0));
    }
    field.getUserPool().forEachPartyMemberOf(user, (member: User) => {
      if (relativeRect && relativeRect.isInsideRect(member.getX(), member.getY())) {
        if (!member.getSecondaryStat().hasOption(cts)) {
          member.setTemporaryStat(cts, TemporaryStatOption.of(x, skillId, 0));
        }
      } else if (member.getSecondaryStat().hasOption(cts)) {
        const memberOption = member.getSecondaryStat().getOption(CharacterTemporaryStat.Aura);
        if (memberOption.rOption !== auraSkillId) {
          member.resetTemporaryStat((s: CharacterTemporaryStat) => s === cts);
        }
      }
    });
    user.setSchedule(auraSkillId, new Date(now.getTime() + 1_000));
  }

  private static handleMissileTank(user: User, now: Date): void {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Mechanic)) return;
    const skillId = user.getSecondaryStat().getOption(CharacterTemporaryStat.Mechanic).rOption;
    if (skillId !== SKILL.MECH_MISSILE_TANK) return;
    if (now > user.getSchedule(skillId)) {
      user.addMp(-user.getSkillStatValue(skillId, SkillStat.u));
      user.setSchedule(skillId, new Date(now.getTime() + 5_000));
    }
  }
}

function getBuffedDuration(_user: User, duration: number): number {
  // MapleStory v95 has no skill that extends buff duration by a percentage.
  // If a later-version buff-mastery skill is ever added, look up the user's
  // mastered skill level and apply an extension ratio here.
  return duration;
}

function addSummoned(
  user: User,
  field: any,
  summoned: Summoned,
  skill: { positionX: number; positionY: number; summonLeft: boolean },
): void {
  summoned.setPosition(field, skill.positionX, skill.positionY, skill.summonLeft);
  user.addSummoned(summoned);
}
