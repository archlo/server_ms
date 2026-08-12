import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { UserRemote } from '../user/UserRemote';
import { Mob } from './mob/Mob';
import { MobPacket } from './mob/MobPacket';
import { MobLeaveType } from './mob/MobLeaveType';
import { MobTemporaryStat } from './mob/MobTemporaryStat';
import { MobStatOption } from './mob/MobStatOption';
import { MobProvider } from '../../provider/MobProvider';
import { SkillProvider } from '../../provider/SkillProvider';
import { SkillStat } from '../../provider/skill/SkillStat';
import { mobSkillTypeFromValue, MobSkillType } from '../../provider/mob/MobSkillType';
import { CharacterTemporaryStat } from '../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../user/stat/TemporaryStatOption';
import { Stat } from '../user/stat/Stat';
import { AttackIndex } from '../skill/AttackIndex';
import { HitInfo } from '../skill/HitInfo';
import { Util } from '../../util/Util';
import { GameConstants } from '../GameConstants';
import { statChangedPacket } from '../user/User';
import { Summoned } from './summoned/Summoned';
import { SummonedPacket } from './summoned/SummonedPacket';
import { Attack, AttackHeaderType } from '../skill/Attack';
import { AttackInfo } from '../skill/AttackInfo';
import { CalcDamagePAD } from '../user/stat/CalcDamagePAD';
import { CalcDamage } from '../user/stat/CalcDamage';
import { SkillConstants } from '../skill/SkillConstants';
import { weaponTypeByItemId } from '../item/WeaponType';
import { BodyPart } from '../item/BodyPart';
import { Pirate } from '../skill/job/Pirate';

// Skill IDs referenced by HitHandler (kinoko job constant ports - only the
// ones needed for branches handled below; see PORT_GAPS.md "HitHandler (#11)
// scope notes" for the rest).
const THIEF_MESO_MASTERY = 4100001;
const THIEF_MESO_GUARD = 4111001;
const WARRIOR_ACHILLES_HERO = 1120013;
const WARRIOR_ACHILLES_PALADIN = 1220011;
const WARRIOR_ACHILLES_DRK = 1320012;
const ARAN_HIGH_DEFENSE = 21121003;
const WARRIOR_GUARDIAN = 1121010;
const WARRIOR_DIVINE_SHIELD = 1220012;
const BOWMAN_EVASION_BOOST_BM = 3121007;
const BOWMAN_EVASION_BOOST_MM = 3221007;
const BOWMAN_VENGEANCE = 3121008;
const WARRIOR_BEHOLDER = 1321007;
const WARRIOR_HEX_OF_THE_BEHOLDER = 1320009;
const THIEF_DARK_FLARE_NL = 4111007;
const THIEF_DARK_FLARE_SHAD = 4211007;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/** Mirrors AttackHandler's inline mob-damage pattern (Mob has no `damage()` method ported yet). */
function applyMobDamage(user: User, mob: Mob, damage: number): void {
  const field = user.getField();
  const actualDamage = Math.min(mob.getHp(), damage);
  if (actualDamage > 0) {
    mob.addDamage(user.getCharacterId(), actualDamage);
    mob.setHp(mob.getHp() - actualDamage);
    field?.broadcastPacket(MobPacket.mobDamaged(mob, damage));
  }
  if (mob.getHp() <= 0) {
    mob.getController()?.write(MobPacket.mobChangeController(mob, false));
    if (field?.getMobPool().removeMob(mob, MobLeaveType.ETC)) {
      mob.distributeExp();
      mob.spawnRevives(0);
      mob.dropRewards(user, 0);
    }
  }
}

/**
 * Port of kinoko's HitHandler (handler/user/HitHandler.java).
 *
 * Scope notes (see PORT_GAPS.md "HitHandler (#11) scope notes"):
 * - handleBeholderCounter / handleDarkFlare: ported (Summoned rect + on-hit
 *   damage via applyMobDamage). DarkFlare checks current user's summons only
 *   (no party system yet).
 * - handlePiratesRevenge: ported (uses SkillConstants.getPiratesRevengeSkill).
 * - handleBattleship: ported (uses Pirate.getBattleshipDurability /
 *   setBattleshipDurability).
 * - handleReflect's ManaReflection branch and handleMesoGuard/
 *   getAchillesReduce/getBlueAuraReduce use raw skill IDs (hardcoded consts
 *   above) instead of per-job constant files.
 */
export class HitHandler {
  static handleUserHit(user: User, r: PacketReader): void {
    const hitInfo = new HitInfo();
    r.readInt(); // get_update_time()
    hitInfo.attackIndex = r.readByte() << 24 >> 24; // signed byte
    if (hitInfo.attackIndex > -2) {
      hitInfo.magicElemAttr = r.readByte();
      hitInfo.damage = r.readInt();
      hitInfo.templateId = r.readInt();
      hitInfo.mobId = r.readInt();
      hitInfo.dir = r.readByte();
      hitInfo.reflect = r.readByte();
      hitInfo.guard = r.readByte();
      hitInfo.knockback = r.readByte();
      if (hitInfo.knockback > 1 || hitInfo.reflect !== 0) {
        hitInfo.powerGuard = r.readByte();
        hitInfo.reflectMobId = r.readInt();
        hitInfo.reflectMobAction = r.readByte();
        hitInfo.reflectMobX = r.readShort();
        hitInfo.reflectMobY = r.readShort();
        r.readShort(); // this->GetPos()->x
        r.readShort(); // this->GetPos()->y
      }
      hitInfo.stance = r.readByte();
    } else if (hitInfo.attackIndex === AttackIndex.Counter || hitInfo.attackIndex === AttackIndex.Obstacle) {
      r.readByte(); // 0
      hitInfo.damage = r.readInt();
      hitInfo.obstacleData = r.readShort();
      r.readByte(); // 0
    } else if (hitInfo.attackIndex === AttackIndex.Stat) {
      hitInfo.magicElemAttr = r.readByte();
      hitInfo.damage = r.readInt();
      hitInfo.diseaseData = r.readShort();
      hitInfo.diseaseType = r.readByte();
    } else {
      return; // Unknown attack index
    }

    if (hitInfo.attackIndex >= 0) {
      HitHandler.handleMobAttack(user, hitInfo);
    }
    HitHandler.handleHit(user, hitInfo);
  }

  private static handleMobAttack(user: User, hitInfo: HitInfo): void {
    const mobTemplate = MobProvider.getMobTemplate(hitInfo.templateId);
    if (!mobTemplate) {
      return;
    }
    const mobAttack = mobTemplate.getAttack(hitInfo.attackIndex);
    if (!mobAttack) {
      return;
    }

    // Handle mpBurn and deadlyAttack
    hitInfo.mpDamage = mobAttack.mpBurn;
    if (mobAttack.deadlyAttack) {
      hitInfo.damage = user.getHp() - 1;
      hitInfo.mpDamage = user.getMp() - 1;
    }

    // Resolve mob skill
    const skillId = mobAttack.skillId;
    if (skillId === 0) {
      return;
    }
    const skillType = mobSkillTypeFromValue(skillId);
    if (skillType === null) {
      return;
    }
    const si = SkillProvider.getMobSkillInfoById(skillId);
    if (!si) {
      return;
    }
    const slv = mobAttack.skillLevel;
    const prop = si.getValue(SkillStat.prop, slv);
    if (prop > 0 && !Util.succeedProp(prop)) {
      return;
    }

    // Handle dispel
    if (skillType === MobSkillType.DISPEL) {
      user.resetTemporaryStat((_cts, option) => Math.floor(option.rOption / 1000000) > 0); // SecondaryStat::ResetByUserSkill
      return;
    }

    // Check if mob skill should apply a CTS
    const cts = mobSkillTypeToCts(skillType);
    if (cts === null) {
      return;
    }

    // Apply mob skill
    if (cts !== CharacterTemporaryStat.Stun && cts !== CharacterTemporaryStat.Attract
        && user.getSecondaryStat().hasOption(CharacterTemporaryStat.Holyshield)) {
      return;
    }
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.DefenseState)) {
      const defenseStateCts = defenseStateStatToCts(user.getSecondaryStat().getOption(CharacterTemporaryStat.DefenseState_Stat).nOption);
      if (defenseStateCts === cts
          && Util.succeedProp(user.getSecondaryStat().getOption(CharacterTemporaryStat.DefenseState).nOption)) {
        return;
      }
    }
    const option = TemporaryStatOption.ofMobSkill(Math.max(si.getValue(SkillStat.x, slv), 1), skillId, slv, si.getDuration(slv));
    user.setTemporaryStats(new Map([[cts, option]]), 0);
  }

  private static handleHit(user: User, hitInfo: HitInfo): void {
    const damage = hitInfo.damage;

    // Compute damage reductions
    const powerGuardReduce = HitHandler.handleReflect(user, hitInfo);
    const mesoGuardReduce = HitHandler.handleMesoGuard(user, hitInfo);

    const achillesReduce = HitHandler.getAchillesReduce(user, damage);
    const comboBarrierReduce = HitHandler.getComboBarrierReduce(user, damage, achillesReduce);

    const magicGuardReduce = HitHandler.getMagicGuardReduce(user, damage);
    const magicShieldReduce = HitHandler.getMagicShieldReduce(user, damage);
    const blueAuraReduce = HitHandler.getBlueAuraReduce(user, damage);

    // Final damage
    hitInfo.finalDamage = damage - powerGuardReduce - mesoGuardReduce - achillesReduce - comboBarrierReduce - magicGuardReduce - magicShieldReduce - blueAuraReduce;

    // Process hit damage
    if (hitInfo.finalDamage > 0) {
      user.addHp(-hitInfo.finalDamage);
    }
    if (hitInfo.mpDamage > 0) {
      user.addMp(-hitInfo.mpDamage);
    }
    user.getField()?.broadcastPacket(UserRemote.hit(user, hitInfo), user);

    // Process on hit effects
    HitHandler.handleGuardian(user, hitInfo);
    HitHandler.handleDivineShield(user, hitInfo);
    HitHandler.handleBeholderCounter(user, hitInfo);
    HitHandler.handleEvasionBoost(user, hitInfo);
    HitHandler.handleVengeance(user, hitInfo);
    HitHandler.handleDarkFlare(user, hitInfo);
    HitHandler.handlePiratesRevenge(user, hitInfo);
    HitHandler.handleBattleship(user, hitInfo);
  }

  /** Port of HitHandler::handleReflect. PowerGuard branch ported; ManaReflection ported via raw skill info lookup. */
  private static handleReflect(user: User, hitInfo: HitInfo): number {
    const mob = user.getField()?.getMobPool().getById(hitInfo.reflectMobId);
    if (!mob) {
      return 0;
    }
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.PowerGuard)) {
      const percentage = user.getSecondaryStat().getOption(CharacterTemporaryStat.PowerGuard).nOption;
      let powerGuardDamage = Math.min(Math.floor(hitInfo.damage * percentage / 100), Math.floor(mob.getMaxHp() / 2));
      if (mob.isBoss()) {
        powerGuardDamage = Math.floor(powerGuardDamage / 2);
      }
      const finalDamage = powerGuardDamage; // Mob.getFixedDamage() not ported - assumed 0
      applyMobDamage(user, mob, finalDamage);
      return finalDamage;
    } else if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.ManaReflection)) {
      const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.ManaReflection);
      const si = SkillProvider.getSkillInfoById(option.rOption);
      if (si) {
        const percentage = si.getValue(SkillStat.x, option.nOption);
        const damage = Math.min(Math.floor(hitInfo.damage * percentage / 100), Math.floor(mob.getMaxHp() / 20));
        applyMobDamage(user, mob, damage);
        // no amount is subtracted from hit damage
      }
    }
    return 0;
  }

  /** Port of HitHandler::handleMesoGuard / CalcDamage::GetMesoGuardReduce. */
  private static handleMesoGuard(user: User, hitInfo: HitInfo): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.MesoGuard)) {
      return 0;
    }
    const mesoGuardRate = clamp(50 + user.getSkillStatValue(THIEF_MESO_MASTERY, SkillStat.v), 50, 100);
    const mesoRequiredRate = Math.max(0, user.getSkillStatValue(THIEF_MESO_GUARD, SkillStat.x) - user.getSkillStatValue(THIEF_MESO_MASTERY, SkillStat.w));
    const realDamage = clamp(hitInfo.damage, 1, GameConstants.DAMAGE_MAX);
    const mesoGuardReduce = Math.floor(realDamage * mesoGuardRate / 100);
    const mesoRequired = Math.floor(mesoGuardReduce * mesoRequiredRate / 100);
    const im = user.getInventoryManager();
    const mesoRemaining = im.money;
    if (mesoRemaining > mesoRequired) {
      im.addMoney(-mesoRequired);
      user.write(statChangedPacket(Stat.MONEY, im.money));
      return mesoGuardReduce;
    } else {
      im.addMoney(-mesoRemaining);
      user.write(statChangedPacket(Stat.MONEY, im.money));
      return mesoRequiredRate > 0 ? Math.floor(100 * mesoRemaining / mesoRequiredRate) : 0;
    }
  }

  /** Port of CUserLocal::GetAchillesReduce. */
  private static getAchillesReduce(user: User, damage: number): number {
    let skillId = 0;
    switch (user.getJob()) {
      case 112: skillId = WARRIOR_ACHILLES_HERO; break;
      case 122: skillId = WARRIOR_ACHILLES_PALADIN; break;
      case 132: skillId = WARRIOR_ACHILLES_DRK; break;
      case 2112: skillId = ARAN_HIGH_DEFENSE; break;
      default: skillId = 0;
    }
    const x = user.getSkillStatValue(skillId, SkillStat.x);
    if (x === 0) {
      return 0;
    }
    return Math.floor(damage * (1000 - x) / 1000);
  }

  private static getComboBarrierReduce(user: User, damage: number, achillesReduce: number): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.ComboBarrier)) {
      return 0;
    }
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.ComboBarrier);
    return Math.floor((damage - achillesReduce) * (1000 - option.nOption) / 1000);
  }

  private static getMagicGuardReduce(user: User, damage: number): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.MagicGuard)) {
      return 0;
    }
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.MagicGuard);
    let mpDamage = Math.floor(damage * option.nOption / 100);
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Infinity)) {
      return mpDamage;
    } else {
      mpDamage = Math.min(mpDamage, user.getMp());
      user.addMp(-mpDamage);
      return mpDamage;
    }
  }

  private static getMagicShieldReduce(user: User, damage: number): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.MagicShield)) {
      return 0;
    }
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.MagicShield);
    return Math.floor(damage * option.nOption / 100);
  }

  private static getBlueAuraReduce(user: User, damage: number): number {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.BlueAura)) {
      return 0;
    }
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.BlueAura);
    const skillId = option.rOption;
    const slv = option.nOption;
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) {
      return 0;
    }
    // x = damage reduction % (Blue Aura redistributes damage among party members — not yet implemented)
    const x = si.getValue(SkillStat.x, slv);
    return Math.floor(damage * x / 100);
  }

  private static handleGuardian(user: User, hitInfo: HitInfo): void {
    if (hitInfo.knockback <= 1) {
      return;
    }
    const stunDuration = user.getSkillStatValue(WARRIOR_GUARDIAN, SkillStat.time);
    if (stunDuration === 0) {
      return;
    }
    const mob = user.getField()?.getMobPool().getById(hitInfo.reflectMobId);
    mob?.setTemporaryStat(new Map([[MobTemporaryStat.Stun, MobStatOption.of(1, WARRIOR_GUARDIAN, stunDuration * 1000)]]), 0);
  }

  /** Port of HitHandler::handleDivineShield. */
  private static handleDivineShield(user: User, hitInfo: HitInfo): void {
    if (hitInfo.attackIndex <= AttackIndex.Counter) {
      return;
    }
    const skillId = WARRIOR_DIVINE_SHIELD;
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) {
      return;
    }
    const slv = user.getSkillLevel(skillId);
    const ss = user.getSecondaryStat();
    if (ss.hasOption(CharacterTemporaryStat.BlessingArmor)) {
      const option = ss.getOption(CharacterTemporaryStat.BlessingArmor);
      const newCount = option.nOption - 1;
      if (newCount > 0) {
        user.setTemporaryStats(new Map([
          [CharacterTemporaryStat.BlessingArmor, option.update(newCount)],
          [CharacterTemporaryStat.BlessingArmorIncPAD, ss.getOption(CharacterTemporaryStat.BlessingArmorIncPAD)],
        ]));
      } else {
        user.resetTemporaryStatBySkill(skillId);
        user.setSkillCooltime(skillId, si.getValue(SkillStat.cooltime, slv));
      }
    } else {
      if (slv === 0 || user.getSkillManager().hasSkillCooltime(skillId) || !Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
        return;
      }
      user.setTemporaryStats(new Map([
        [CharacterTemporaryStat.BlessingArmor, TemporaryStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getDuration(slv))],
        [CharacterTemporaryStat.BlessingArmorIncPAD, TemporaryStatOption.of(si.getValue(SkillStat.epad, slv), skillId, si.getDuration(slv))],
      ]));
    }
  }

  /** Port of kinoko's HitHandler::handleBeholderCounter. */
  private static handleBeholderCounter(user: User, hitInfo: HitInfo): void {
    if (hitInfo.attackIndex <= AttackIndex.Counter) {
      return;
    }
    const beholders = user.getSummonedBySkill(WARRIOR_BEHOLDER);
    if (beholders.length === 0) return;
    const summon = beholders[0];
    if (!summon.getRect()) return;
    const mob = user.getField()?.getMobPool().getById(hitInfo.mobId);
    if (!mob || mob.getHp() <= 0) return;
    const skillId = WARRIOR_HEX_OF_THE_BEHOLDER;
    const slv = user.getSkillLevel(skillId);
    if (slv === 0) return;
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) return;
    const relativeRect = summon.getRelativeRect(summon.getRect()!);
    if (!relativeRect.isInsideRect(mob.getX(), mob.getY())) return;
    const weapon = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
    const weaponType = weaponTypeByItemId(weapon?.itemId ?? 0);
    const mastery = CalcDamagePAD.getWeaponMastery(user, weaponType);
    const k = CalcDamage.getMasteryConstByWT(weaponType);
    const damageMax = CalcDamage.calcDamageByWT(weaponType, user.getBasicStat(), CalcDamagePAD.getPad(user), CalcDamagePAD.getMad(user));
    const rand = user.getCalcDamage().getNextAttackRandom();
    let damage = CalcDamage.adjustRandomDamage(damageMax, rand[0], k, mastery);
    const skillDamage = si.getValue(SkillStat.damage, slv);
    if (skillDamage > 0) {
      damage = skillDamage / 100.0 * damage;
    }
    damage += user.getSecondaryStat().getOption(CharacterTemporaryStat.DamR).nOption * damage / 100.0;
    const attack = new Attack(AttackHeaderType.SummonedAttack);
    attack.actionAndDir = ((summon.getMoveAction() & 1) << 7 | 0x01) & 0xFF;
    const ai = new AttackInfo();
    ai.mobId = mob.getId();
    ai.hitAction = 0x01;
    ai.damage[0] = Math.min(Math.max(Math.floor(damage), 1), GameConstants.DAMAGE_MAX);
    attack.attackInfo.push(ai);
    user.getField()?.broadcastPacket(SummonedPacket.summonedAttack(user, summon, attack));
    applyMobDamage(user, mob, ai.damage[0]);
  }

  private static handleEvasionBoost(user: User, hitInfo: HitInfo): void {
    if (hitInfo.damage > 0) {
      return;
    }
    if (user.getSkillLevel(BOWMAN_EVASION_BOOST_BM) > 0 || user.getSkillLevel(BOWMAN_EVASION_BOOST_MM) > 0) {
      user.getCalcDamage().setNextAttackCritical(true);
    }
  }

  private static handleVengeance(user: User, hitInfo: HitInfo): void {
    if (hitInfo.attackIndex <= AttackIndex.Counter) {
      return;
    }
    const prop = user.getSkillStatValue(BOWMAN_VENGEANCE, SkillStat.prop);
    if (prop !== 0 && Util.succeedProp(prop)) {
      // UserLocal.requestVengeance() not ported (no UI request packet yet)
    }
  }

  /** Port of kinoko's HitHandler::handleDarkFlare (current user's summons only - no party system). */
  private static handleDarkFlare(user: User, hitInfo: HitInfo): void {
    if (hitInfo.attackIndex <= AttackIndex.Counter || hitInfo.damage <= 0) {
      return;
    }
    for (const summoned of user.getSummonedAll()) {
      if (summoned.skillId !== THIEF_DARK_FLARE_NL && summoned.skillId !== THIEF_DARK_FLARE_SHAD) {
        continue;
      }
      if (!summoned.getRect()) continue;
      const relativeRect = summoned.getRelativeRect(summoned.getRect()!);
      if (!relativeRect.isInsideRect(user.getX(), user.getY())) continue;
      const si = SkillProvider.getSkillInfoById(summoned.skillId);
      if (!si) continue;
      const damage = si.getValue(SkillStat.x, summoned.skillLevel) / 100.0 * hitInfo.damage;
      const mob = user.getField()?.getMobPool().getById(hitInfo.mobId);
      if (!mob || mob.getHp() <= 0) continue;
      const attack = new Attack(AttackHeaderType.SummonedAttack);
      attack.actionAndDir = ((summoned.getMoveAction() & 1) << 7 | 0x01) & 0xFF;
      const ai = new AttackInfo();
      ai.mobId = mob.getId();
      ai.hitAction = 0x01;
      ai.damage[0] = Math.min(Math.max(Math.floor(damage), 1), Math.floor(mob.getMaxHp() / 2));
      attack.attackInfo.push(ai);
      user.getField()?.broadcastPacket(SummonedPacket.summonedAttack(user, summoned, attack));
      applyMobDamage(user, mob, ai.damage[0]);
    }
  }

  /** Port of kinoko's HitHandler::handlePiratesRevenge. */
  private static handlePiratesRevenge(user: User, hitInfo: HitInfo): void {
    if (hitInfo.attackIndex <= AttackIndex.Counter) {
      return;
    }
    const skillId = SkillConstants.getPiratesRevengeSkill(user.getJob());
    if (user.getSkillManager().hasSkillCooltime(skillId)) return;
    const slv = user.getSkillLevel(skillId);
    if (slv === 0) return;
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) return;
    if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
      user.setTemporaryStat(CharacterTemporaryStat.DamR, TemporaryStatOption.of(si.getValue(SkillStat.damR, slv), skillId, si.getDuration(slv)));
      user.setSkillCooltime(skillId, si.getValue(SkillStat.x, slv));
    }
  }

  /** Port of kinoko's HitHandler::handleBattleship. */
  private static handleBattleship(user: User, hitInfo: HitInfo): void {
    if (hitInfo.finalDamage <= 0 || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.RideVehicle)) {
      return;
    }
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.RideVehicle);
    if (option.nOption !== SkillConstants.BATTLESHIP_VEHICLE) {
      return;
    }
    const newDurability = Pirate.getBattleshipDurability(user) - hitInfo.finalDamage;
    if (newDurability > 0) {
      Pirate.setBattleshipDurability(user, newDurability);
    } else {
      user.getSkillManager().getSkillCooltimes().delete(SkillConstants.BATTLESHIP_DURABILITY);
      user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.RideVehicle);
      user.setSkillCooltime(option.rOption, user.getSkillStatValue(option.rOption, SkillStat.cooltime));
    }
  }
}

/** Port of MobSkillType::getCharacterTemporaryStat. */
function mobSkillTypeToCts(skillType: MobSkillType): CharacterTemporaryStat | null {
  switch (skillType) {
    case MobSkillType.SEAL: return CharacterTemporaryStat.Seal;
    case MobSkillType.DARKNESS: return CharacterTemporaryStat.Darkness;
    case MobSkillType.WEAKNESS: return CharacterTemporaryStat.Weakness;
    case MobSkillType.STUN: return CharacterTemporaryStat.Stun;
    case MobSkillType.CURSE: return CharacterTemporaryStat.Curse;
    case MobSkillType.POISON: return CharacterTemporaryStat.Poison;
    case MobSkillType.SLOW: return CharacterTemporaryStat.Slow;
    case MobSkillType.ATTRACT: return CharacterTemporaryStat.Attract;
    case MobSkillType.STOPPORTION: return CharacterTemporaryStat.StopPortion;
    case MobSkillType.STOPMOTION: return CharacterTemporaryStat.StopMotion;
    case MobSkillType.FEAR: return CharacterTemporaryStat.Fear;
    case MobSkillType.FROZEN: return CharacterTemporaryStat.Frozen;
    default: return null;
  }
}

/** Port of DefenseStateStat::getByValue + getStat. nOption is a char code ('C'/'D'/'S'/'F'/'W'). */
function defenseStateStatToCts(nOption: number): CharacterTemporaryStat | null {
  switch (nOption) {
    case 0x43 /* 'C' */: return CharacterTemporaryStat.Curse;
    case 0x44 /* 'D' */: return CharacterTemporaryStat.Darkness;
    case 0x53 /* 'S' */: return CharacterTemporaryStat.Seal;
    case 0x46 /* 'F' */: return CharacterTemporaryStat.Stun;
    case 0x57 /* 'W' */: return CharacterTemporaryStat.Weakness;
    default: return null;
  }
}
