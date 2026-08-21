import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { User } from '../user/User';
import { UserRemote } from '../user/UserRemote';
import { Attack, AttackHeaderType } from '../skill/Attack';
import { AttackInfo } from '../skill/AttackInfo';
import { SkillProcessor } from '../skill/SkillProcessor';
import { Mob } from './mob/Mob';
import { MobPacket } from './mob/MobPacket';
import { MobLeaveType } from './mob/MobLeaveType';
import { MobTemporaryStat } from './mob/MobTemporaryStat';
import { MobStatOption } from './mob/MobStatOption';
import { CharacterTemporaryStat } from '../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../user/stat/TemporaryStatOption';
import { SkillProvider } from '../../provider/SkillProvider';
import { SkillStat } from '../../provider/skill/SkillStat';
import { SkillConstants } from '../skill/SkillConstants';
import { Util } from '../../util/Util';
import { CalcDamage } from '../user/stat/CalcDamage';
import { CalcDamagePAD } from '../user/stat/CalcDamagePAD';
import { GameConstants } from '../GameConstants';
import { weaponTypeByItemId } from '../item/WeaponType';
import { BodyPart } from '../item/BodyPart';
import { Drop } from './drop/Drop';
import { DropOwnType } from './drop/DropOwnType';
import { DropEnterType } from './drop/DropEnterType';
import { DropLeaveType } from './drop/DropLeaveType';
import { BurnedInfo } from './mob/BurnedInfo';
import { Summoned } from './summoned/Summoned';
import { SummonedMoveAbility } from './summoned/SummonedMoveAbility';
import { SummonedAssistType } from './summoned/SummonedAssistType';
import { AffectedArea } from './affectedarea/AffectedArea';
import { UserLocal } from '../user/UserLocal';
import { Warrior } from '../skill/job/Warrior';

// Skill IDs referenced by AttackHandler (kinoko job constant ports - only the
// ones needed for branches handled below; see PORT_GAPS.md for the rest).
const TORNADO_SPIN = 4321000; // Thief.TORNADO_SPIN
const TORNADO_SPIN_ATTACK = 4321001; // Thief.TORNADO_SPIN_ATTACK
const MESO_EXPLOSION = 4211006; // Thief.MESO_EXPLOSION
const POISON_BOMB = 14111006; // NightWalker.POISON_BOMB
const FINAL_CUT = 4341002; // Thief.FINAL_CUT
const HEAVENS_HAMMER = 1221011; // Warrior.HEAVENS_HAMMER
const COMBO_TEMPEST = 21120006; // Aran.COMBO_TEMPEST
const ICE_CHARGE = 1121006; // Warrior.ICE_CHARGE
const SNOW_CHARGE = 21121002; // Aran.SNOW_CHARGE

// Keydown skills (SkillConstants.isKeydownSkill / isMagicKeydownSkill, partial port).
const MAGIC_KEYDOWN_SKILLS = new Set([2121001, 2221001, 2321001, 22121000, 22151001]);
const KEYDOWN_SKILLS = new Set([
  4001003, 4101003, 4201003, // Thief
  5101004, 15101003, // Pirate / ThunderBreaker
  ...MAGIC_KEYDOWN_SKILLS,
]);

/**
 * Port of kinoko's AttackHandler (handler/user/AttackHandler.java).
 *
 * Scope notes (see PORT_GAPS.md "AttackHandler (#9) scope notes"):
 * - Damage calculation uses a simplified pad-based formula (same approach as
 *   MobHandler's calcMobDamage) since CalcDamage.calcPDamage/calcMDamage and
 *   the supporting weapon-mastery/elemental-attribute math are not ported
 *   (#10).
 * - SkillProcessor.processAttack is not ported (#12) - skill-specific attack
 *   side effects (e.g. AffectedArea, Summoned, drop creation) are no-ops.
 * - Bullet/item consumption, hpCon/mpCon costs use raw SkillInfo.getValue
 *   since the job-aware getHpCon/getMpCon/getBulletCon helpers are not
 *   ported.
 */
export class AttackHandler {
  static handleUserMeleeAttack(user: User, r: PacketReader): void {
    // CUserLocal::TryDoingMeleeAttack / TryDoingNormalAttack
    const attack = new Attack(AttackHeaderType.UserMeleeAttack);
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    if (r.data.length - r.offset === 60) {
      r.readByte(); // extra byte sent when reactor is hit
    }
    r.readInt(); r.readInt(); // ~pDrInfo.dr0/dr1
    attack.mask = r.readByte();
    r.readInt(); r.readInt(); // ~pDrInfo.dr2/dr3
    attack.skillId = r.readInt();
    attack.combatOrders = r.readByte();
    r.readInt(); r.readInt(); // dwKey, Crc32

    attack.crc = r.readInt();
    r.readInt();

    if (KEYDOWN_SKILLS.has(attack.skillId)) {
      attack.keyDown = r.readInt();
    }
    attack.flag = r.readByte();
    attack.actionAndDir = r.readShort();

    r.readInt(); // GETCRC32Svr
    r.readByte(); // nAttackActionType
    attack.attackSpeed = r.readByte();
    r.readInt(); r.readInt(); // tAttackTime, dwID

    decodeMobAttackInfo(r, attack);

    attack.userX = r.readShort();
    attack.userY = r.readShort();
    if (attack.skillId === POISON_BOMB) {
      attack.grenadeX = r.readShort();
      attack.grenadeY = r.readShort();
    }
    if (attack.skillId === MESO_EXPLOSION) {
      const size = r.readByte();
      attack.drops = new Array(size);
      for (let i = 0; i < size; i++) {
        attack.drops[i] = r.readInt();
        r.readByte();
      }
      attack.dropExplodeDelay = r.readShort();
    }

    handleAttack(user, attack);
  }

  static handleUserShootAttack(user: User, r: PacketReader): void {
    // CUserLocal::TryDoingShootAttack
    const attack = new Attack(AttackHeaderType.UserShootAttack);
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    r.readInt(); r.readInt();
    attack.mask = r.readByte();
    r.readInt(); r.readInt();
    attack.skillId = r.readInt();
    attack.combatOrders = r.readByte();
    r.readInt(); r.readInt();

    attack.crc = r.readInt();
    r.readInt();

    if (KEYDOWN_SKILLS.has(attack.skillId)) {
      attack.keyDown = r.readInt();
    }
    attack.flag = r.readByte();
    attack.exJablin = r.readByte();
    attack.actionAndDir = r.readShort();

    r.readInt();
    r.readByte();
    attack.attackSpeed = r.readByte();
    r.readInt(); r.readInt();

    attack.bulletPosition = r.readShort();
    r.readShort(); // pnCashItemPos
    r.readByte(); // nShootRange0a
    if (attack.isSpiritJavelin()) {
      attack.bulletItemId = r.readInt();
    }

    decodeMobAttackInfo(r, attack);

    attack.userX = r.readShort();
    attack.userY = r.readShort();
    attack.ballStartX = r.readShort();
    attack.ballStartY = r.readShort();
    if (attack.skillId === 15111006) { // ThunderBreaker.SPARK
      r.readInt(); // tReserveSpark
    }

    handleAttack(user, attack);
  }

  static handleUserMagicAttack(user: User, r: PacketReader): void {
    // CUserLocal::TryDoingMagicAttack
    const attack = new Attack(AttackHeaderType.UserMagicAttack);
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    r.readInt(); r.readInt();
    attack.mask = r.readByte();
    r.readInt(); r.readInt();
    attack.skillId = r.readInt();
    attack.combatOrders = r.readByte();
    r.readInt(); r.readInt();

    r.read(16); // another DR check
    r.readInt(); // dwInit
    r.readInt(); // Crc32

    attack.crc = r.readInt();
    r.readInt();

    if (MAGIC_KEYDOWN_SKILLS.has(attack.skillId)) {
      attack.keyDown = r.readInt();
    }
    attack.flag = r.readByte();
    attack.actionAndDir = r.readShort();

    r.readInt();
    r.readByte();
    attack.attackSpeed = r.readByte();
    r.readInt(); r.readInt();

    decodeMobAttackInfo(r, attack);

    attack.userX = r.readShort();
    attack.userY = r.readShort();
    if (r.readBoolean()) {
      attack.dragonX = r.readShort();
      attack.dragonY = r.readShort();
    }

    handleAttack(user, attack);
  }

  static handleUserBodyAttack(user: User, r: PacketReader): void {
    // CUserLocal::TryDoingBodyAttack
    const attack = new Attack(AttackHeaderType.UserBodyAttack);
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    r.readInt(); r.readInt();
    attack.mask = r.readByte();
    r.readInt(); r.readInt();
    attack.skillId = r.readInt();
    attack.combatOrders = r.readByte();
    r.readInt(); r.readInt();

    attack.crc = r.readInt();
    r.readInt();

    attack.flag = r.readByte();
    attack.actionAndDir = r.readShort();

    r.readInt();
    r.readByte();
    attack.attackSpeed = r.readByte();
    r.readInt(); r.readInt();

    decodeMobAttackInfo(r, attack);

    attack.userX = r.readShort();
    attack.userY = r.readShort();

    handleAttack(user, attack);
  }
}

function decodeMobAttackInfo(r: PacketReader, attack: Attack): void {
  for (let i = 0; i < attack.getMobCount(); i++) {
    const ai = new AttackInfo();
    ai.mobId = r.readInt();
    ai.hitAction = r.readByte();
    ai.actionAndDir = r.readByte();
    r.readByte(); // nFrameIdx
    r.readByte(); // CalcDamageStatIndex & 0x7F | (bCurTemplate << 7)
    ai.hitX = r.readShort();
    ai.hitY = r.readShort();
    r.readShort();
    r.readShort();
    if (attack.skillId === MESO_EXPLOSION) {
      ai.attackCount = r.readByte();
      for (let j = 0; j < ai.attackCount; j++) {
        ai.damage[j] = r.readInt();
      }
    } else {
      ai.delay = Math.min(r.readShort(), 1000);
      for (let j = 0; j < attack.getDamagePerMob(); j++) {
        ai.damage[j] = r.readInt();
      }
    }
    r.readInt(); // CMob::GetCrc
    attack.attackInfo.push(ai);
  }
}

function handleAttack(user: User, attack: Attack): void {
  for (const ai of attack.attackInfo) {
    ai.random = user.getCalcDamage().getNextAttackRandom();
  }

  if (user.getHp() <= 0) {
    return;
  }

  // Set skill level
  if (attack.skillId !== 0) {
    attack.slv = user.getSkillManager().getSkillLevel(attack.skillId);
    switch (attack.skillId) {
      case TORNADO_SPIN_ATTACK:
        attack.slv = user.getSkillManager().getSkillLevel(TORNADO_SPIN);
        break;
    }
    if (attack.slv === 0) {
      return;
    }
    // Check seal
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Seal)) {
      return;
    }
    // Resolve skill info (CRC check skipped - logging only in kinoko)
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) {
      return;
    }
  }

  // Check morph
  if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Morph)) {
    const morphId = user.getSecondaryStat().getOption(CharacterTemporaryStat.Morph).nOption;
    const morphInfo = SkillProvider.getMorphInfoById(morphId);
    if (!morphInfo || (!morphInfo.superman && !morphInfo.attackable)) {
      return;
    }
  }

  // Resolve swallow template ID
  if (attack.skillId === 33101007 /* WildHunter.JAGUAR_OSHI_ATTACK */) {
    if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Swallow_Template)) {
      return;
    }
    attack.swallowMobTemplateId = user.getSecondaryStat().getOption(CharacterTemporaryStat.Swallow_Template).nOption;
    user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.Swallow_Mob || cts === CharacterTemporaryStat.Swallow_Template);
  }

  // Process skill cost/cooltime
  if (attack.skillId !== 0) {
    const si = SkillProvider.getSkillInfoById(attack.skillId)!;
    if (user.getSkillManager().hasSkillCooltime(attack.skillId)) {
      return;
    }
    const hpCon = si.getValue(SkillStat.hpCon, attack.slv);
    if (user.getHp() <= hpCon) {
      return;
    }
    const mpCon = si.getValue(SkillStat.mpCon, attack.slv);
    if (user.getMp() < mpCon) {
      return;
    }
    // Consume hp/mp
    if (hpCon > 0) user.addHp(-hpCon);
    if (mpCon > 0) user.addMp(-mpCon);
    // Set cooltime
    const cooltime = si.getValue(SkillStat.cooltime, attack.slv);
    if (cooltime > 0) {
      user.setSkillCooltime(attack.skillId, cooltime);
    }
  }

  // Process attack
  let hpGain = 0;
  let mpGain = 0;
  const field = user.getField();
  for (const ai of attack.attackInfo) {
    const mob: Mob | undefined = field?.getMobPool().getById?.(ai.mobId);
    if (!mob) {
      continue;
    }
    // Verify damage / determine criticals via ported CalcDamage (#10)
    calcAttackDamage(user, mob, attack, ai);

    // Skill specific handling
    if (attack.skillId !== 0) {
      SkillProcessor.processAttack(user, mob, attack, ai.delay);
    }

    let totalDamage = ai.damage.slice(0, attack.getDamagePerMob() || 1).reduce((a, b) => a + b, 0);

    if (attack.skillId === HEAVENS_HAMMER) {
      totalDamage = calculateHeavensHammer(user, mob, ai);
    } else if (attack.skillId === COMBO_TEMPEST && !mob.isBoss()) {
      totalDamage = mob.getHp() - 1;
    }

    if (attack.skillId === FINAL_CUT) {
      // handled below in handleFinalCut after the loop
    }

    // Skill-specific effects
    handlePickpocket(user, attack, mob);
    handleOwlSpirit(user, attack, mob.getMaxHp() === totalDamage);

    // HP drain / MP Eater
    let mpDamage = 0;
    if (attack.skillId === 4101005 /* Thief.DRAIN */ || attack.skillId === 14111002 /* NightWalker.VAMPIRE */) {
      const absorb = totalDamage * user.getSkillStatValue(attack.skillId, SkillStat.x) / 100;
      hpGain += Math.min(Math.min(absorb, user.getMaxHp() / 2), mob.getMaxHp());
    } else if (attack.skillId === 33101004 /* WildHunter.SWIPE */) {
      const absorb = totalDamage * user.getSkillStatValue(attack.skillId, SkillStat.x) / 100;
      hpGain += Math.min(Math.min(absorb, user.getMaxHp() * 15 / 100), mob.getMaxHp());
    } else if (attack.skillId === 5111005 /* Pirate.ENERGY_DRAIN */ || attack.skillId === 15101005 /* ThunderBreaker.ENERGY_DRAIN */) {
      hpGain += totalDamage * user.getSkillStatValue(attack.skillId, SkillStat.x) / 100;
    } else if (attack.skillId !== 0) {
      mpDamage = calculateMpEater(user, mob);
    }

    // ComboDrain HP absorb
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.ComboDrain)) {
      const absorb = totalDamage * user.getSecondaryStat().getOption(CharacterTemporaryStat.ComboDrain).nOption / 100;
      hpGain += Math.min(absorb, user.getMaxHp() / 10);
    }

    // Process on-hit effects
    if (mob.getHp() > 0) {
      handleHamString(user, mob, ai.delay);
      handleBlind(user, mob, ai.delay);
      handleVenom(user, mob, ai.delay);
      handleWeaponCharge(user, mob, ai.delay);
      handleEvanSlow(user, mob, ai.delay);
      handleMortalBlow(user, mob, ai.delay);
    }

    // Process damage
    const actualDamage = Math.min(mob.getHp(), totalDamage);
    if (actualDamage > 0) {
      mob.addDamage(user.getCharacterId(), actualDamage);
      mob.setHp(mob.getHp() - actualDamage);
    }
    // Always broadcast mobDamaged so the client can render misses (damage=0).
    // OG CMob::ShowDamage: nDamage==0 → Effect_Miss.
    field?.broadcastPacket(MobPacket.mobDamaged(mob, totalDamage));

    // Apply MP damage
    if (mpDamage > 0) {
      mob.setMp(mob.getMp() - mpDamage);
      mpGain += mpDamage;
    }

    // Process on-kill
    if (mob.getHp() <= 0) {
      console.log(`[DropDbg] KILL mob=${mob.getTemplateId()} hp=${mob.getHp()} controller=${mob.getController()?.getCharacterId()}`);
      handleRevive(user, mob);
      mob.getController()?.write(MobPacket.mobChangeController(mob, false));
      if (field?.getMobPool().removeMob(mob, MobLeaveType.ETC)) {
        mob.distributeExp();
        mob.spawnRevives(ai.delay);
        mob.dropRewards(user, ai.delay);
      } else {
        console.log(`[DropDbg] removeMob returned false — mob already removed`);
      }
    }
  }

  // Broadcast packet
  field?.broadcastPacket(UserRemote.attack(user, attack), user);

  if (hpGain > 0) {
    user.addHp(hpGain);
  }
  if (mpGain > 0) {
    user.addMp(mpGain);
  }

  // Skill effects after attack
  handleMesoExplosion(user, attack);
  handleAffectedArea(user, attack);
  handleFinalCut(user, attack);
  handleInfiltrate(user);
  if (attack.getMobCount() > 0) {
    handleComboAbility(user, attack);
    handleComboAttack(user, attack);
    handleDarkSight(user);
    handleEnergyCharge(user);
    handleWindWalk(user);
  }
  // handleAffectedArea currently covers poison-mist style user-skill areas.
}

/**
 * Port of the AttackHandler-side use of CalcDamage::calcPDamage/calcMDamage
 * (#10). kinoko is client-authoritative for ai.damage[] (assertDamage only
 * logs mismatches), so this:
 *  - runs calcPDamage/calcMDamage to consume the seeded RNG stream and set
 *    ai.critical[] the same way kinoko does (used by UserRemote.attack's
 *    broadcast to other clients);
 *  - for any hit slot the client claimed (ai.damage[i] !== 0) but where our
 *    pad/mad-based estimate is needed (e.g. server-side totals for mob HP),
 *    recomputes a damage estimate via calcDamageByWT + adjustRandomDamage
 *    using the real pad/mad/mastery from CalcDamagePAD, replacing the
 *    previous baseStr*4 placeholder.
 */
function calcAttackDamage(user: User, mob: Mob, attack: Attack, ai: AttackInfo): void {
  if (attack.isMagicAttack()) {
    CalcDamagePAD.calcMDamage(user, mob, attack, ai);
  } else {
    CalcDamagePAD.calcPDamage(user, mob, attack, ai);
  }

  const weapon = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
  const weaponType = weaponTypeByItemId(weapon ? weapon.itemId : 0);
  const pad = CalcDamagePAD.getPad(user);
  const mad = CalcDamagePAD.getMad(user);
  const baseDamage = CalcDamage.calcDamageByWT(weaponType, user.getBasicStat(), pad, mad);
  const k = CalcDamage.getMasteryConstByWT(weaponType);
  const mastery = CalcDamagePAD.getWeaponMastery(user, weaponType);

  const hits = Math.max(1, attack.getDamagePerMob());
  for (let i = 0; i < hits; i++) {
    if (ai.damage[i] === 0) continue; // client didn't claim a hit in this slot
    const rand = ai.random[i % 7] ?? 0n;
    const estimate = CalcDamage.adjustRandomDamage(baseDamage, rand, k, mastery);
    const critical = ai.critical[i] !== 0 ? 2.0 : 1.0;
    // kinoko is client-authoritative: ai.damage[i] is trusted as-sent,
    // assertDamage only logs a mismatch against the server's estimate.
    CalcDamage.assertDamage(Math.max(1, Math.floor(estimate * critical)), ai.damage[i]);
  }
}

// -----------------------------------------------------------------------------------------------------------------

/**
 * Port of kinoko's AttackHandler::calculateHeavensHammer.
 * The client sends a dummy damage value of 1 for this skill, so the server
 * must calculate the real damage. Omits passive PdamR/DipR (not ported) and
 * elemental attribute adjustments (getDamageAdjustedByElemAttr User-aware
 * overload not ported - same gap as HitHandler/BurnedInfo).
 */
function calculateHeavensHammer(user: User, mob: Mob, ai: AttackInfo): number {
  const skillId = HEAVENS_HAMMER;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return 0;
  const slv = user.getSkillManager().getSkillLevel(skillId);
  const weapon = user.getInventoryManager().equipped.getItem(BodyPart.WEAPON);
  const weaponType = weaponTypeByItemId(weapon ? weapon.itemId : 0);
  const mastery = CalcDamagePAD.getWeaponMastery(user, weaponType);
  const k = CalcDamage.getMasteryConstByWT(weaponType);
  const damageMax = CalcDamage.calcDamageByWT(weaponType, user.getBasicStat(), CalcDamagePAD.getPad(user), CalcDamagePAD.getMad(user));
  let damage = CalcDamage.adjustRandomDamage(damageMax, ai.random[0] ?? 0n, k, mastery);
  const skillDamage = si.getValue(SkillStat.damage, slv);
  if (skillDamage > 0) {
    damage = skillDamage / 100.0 * damage;
  }
  return Math.min(Math.max(Math.floor(damage), 1), GameConstants.DAMAGE_MAX, mob.getHp() - 1);
}

/**
 * Port of kinoko's AttackHandler::calculateMpEater.
 * Drains MP from the mob based on Magician passive skill.
 */
function calculateMpEater(user: User, mob: Mob): number {
  const skillId = SkillConstants.getMpEaterSkill(user.getJob());
  const slv = user.getSkillManager().getSkillLevel(skillId);
  if (slv === 0) return 0;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return 0;
  if (!Util.succeedProp(si.getValue(SkillStat.prop, slv))) return 0;
  const delta = mob.getMaxMp() * si.getValue(SkillStat.x, slv) / 100;
  return Math.min(Math.max(delta, 0), mob.getMp());
}

function handlePickpocket(user: User, attack: Attack, mob: Mob): void {
  if (attack.skillId === 4211006 /* Thief.MESO_EXPLOSION */ || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.PickPocket)) {
    return;
  }
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.PickPocket);
  const si = SkillProvider.getSkillInfoById(option.rOption);
  if (!si) return;
  const money = option.nOption;
  const prop = si.getValue(SkillStat.prop, option.nOption) + user.getSkillStatValue(4220009 /* Thief.MESO_MASTERY */, SkillStat.u);
  const drops: Drop[] = [];
  for (let i = 0; i < (attack.getDamagePerMob() || 1); i++) {
    if (money > 0 && Util.succeedProp(prop)) {
      drops.push(Drop.money(DropOwnType.USEROWN, mob, money, user.getCharacterId()));
    }
  }
  if (drops.length > 0) {
    user.getField().getDropPool().addDrops(drops, DropEnterType.CREATE, mob.getX(), mob.getY() - GameConstants.DROP_HEIGHT, 0, 120);
  }
}

function handleOwlSpirit(user: User, attack: Attack, instantKill: boolean): void {
  if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.SuddenDeath)) {
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.SuddenDeath_Count);
    const newCount = option.nOption - 1;
    if (newCount > 0) {
      user.setTemporaryStat(CharacterTemporaryStat.SuddenDeath_Count, option.update(newCount));
    } else {
      user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.SuddenDeath || cts === CharacterTemporaryStat.SuddenDeath_Count);
    }
  }
  if (!instantKill || attack.skillId !== 4331003 /* Thief.OWL_SPIRIT */) {
    return;
  }
  const si = SkillProvider.getSkillInfoById(attack.skillId);
  if (!si) return;
  user.setTemporaryStat(CharacterTemporaryStat.SuddenDeath, TemporaryStatOption.of(si.getValue(SkillStat.y, attack.slv), attack.skillId, 0));
  user.setTemporaryStat(CharacterTemporaryStat.SuddenDeath_Count, TemporaryStatOption.of(si.getValue(SkillStat.x, attack.slv), attack.skillId, 0));
}

function handleVenom(user: User, mob: Mob, delay: number): void {
  const skillId = SkillConstants.getVenomSkill(user.getJob());
  const slv = user.getSkillManager().getSkillLevel(skillId);
  if (slv === 0) return;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
    mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
  }
}

function handleRevive(user: User, mob: Mob): void {
  if (mob.isBoss() || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.Revive)) {
    return;
  }
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.Revive);
  const skillId = option.rOption;
  const slv = option.nOption;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
    const summoned = Summoned.from(skillId, slv, SummonedMoveAbility.WALK_RANDOM, SummonedAssistType.ATTACK, new Date(Date.now() + si.getValue(SkillStat.x, slv) * 1000));
    summoned.setPosition(user.getField(), mob.getX(), mob.getY(), mob.isLeft());
    user.addSummoned(summoned);
  }
}

function handleHamString(user: User, mob: Mob, delay: number): void {
  if (mob.isBoss() || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.HamString)) {
    return;
  }
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.HamString);
  const skillId = option.rOption;
  const slv = option.nOption;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
    mob.setTemporaryStat(new Map([[MobTemporaryStat.Speed, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getValue(SkillStat.y, slv) * 1000)]]), delay);
  }
}

function handleBlind(user: User, mob: Mob, delay: number): void {
  if (mob.isBoss() || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.Blind)) {
    return;
  }
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.Blind);
  const skillId = option.rOption;
  const slv = option.nOption;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
    mob.setTemporaryStat(new Map([[MobTemporaryStat.Blind, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getValue(SkillStat.y, slv) * 1000)]]), delay);
  }
}

function handleWeaponCharge(user: User, mob: Mob, delay: number): void {
  if (mob.isBoss() || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.WeaponCharge)) {
    return;
  }
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.WeaponCharge);
  const skillId = option.rOption;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (skillId === ICE_CHARGE) {
    const duration = si.getValue(SkillStat.y, user.getSkillManager().getSkillLevel(skillId));
    if (duration > 0) {
      mob.setTemporaryStat(new Map([[MobTemporaryStat.Freeze, MobStatOption.of(1, skillId, duration * 1000)]]), delay);
    }
  } else if (skillId === SNOW_CHARGE) {
    const slv = user.getSkillManager().getSkillLevel(skillId);
    const duration = si.getValue(SkillStat.y, slv);
    if (duration > 0) {
      mob.setTemporaryStat(new Map([[MobTemporaryStat.Speed, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, duration * 1000)]]), delay);
    }
  }
}

function handleEvanSlow(user: User, mob: Mob, delay: number): void {
  if (mob.isBoss() || !user.getSecondaryStat().hasOption(CharacterTemporaryStat.EvanSlow)) {
    return;
  }
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.EvanSlow);
  const skillId = option.rOption;
  const slv = option.nOption;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
    mob.setTemporaryStat(new Map([[MobTemporaryStat.Speed, MobStatOption.of(si.getValue(SkillStat.x, slv), skillId, si.getValue(SkillStat.y, slv) * 1000)]]), delay);
  }
}

function handleMortalBlow(user: User, mob: Mob, delay: number): void {
  if (mob.isBoss()) {
    return;
  }
  const skillId = SkillConstants.getMortalBlowSkill(user.getJob());
  const slv = user.getSkillManager().getSkillLevel(skillId);
  if (slv === 0) return;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  if (mob.getHp() <= mob.getMaxHp() * si.getValue(SkillStat.x, slv) / 100) {
    if (Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
      mob.damage(user.getCharacterId(), mob.getHp());
    }
  }
}

function handleAffectedArea(user: User, attack: Attack): void {
  switch (attack.skillId) {
    case 2111003: /* Magician.POISON_MIST */
    case 12111005: /* BlazeWizard.FLAME_GEAR */
    case 14111006: /* NightWalker.POISON_BOMB */ {
      const si = SkillProvider.getSkillInfoById(attack.skillId);
      if (!si) return;
      const affectedArea = AffectedArea.userSkill(user, si, attack.slv, 0, attack.userX, attack.userY);
      user.getField()?.getAffectedAreaPool().addAffectedArea(affectedArea);
      break;
    }
  }
}

function handleMesoExplosion(user: User, attack: Attack): void {
  if (attack.skillId !== 4211006 /* Thief.MESO_EXPLOSION */) {
    return;
  }
  let index = 0;
  const field = user.getField();
  for (const dropId of attack.drops) {
    const drop = field?.getDropPool().getById(dropId);
    if (!drop || !drop.isMoney()) {
      continue;
    }
    const delay = Math.min(attack.dropExplodeDelay + 100 * (index++ % 5), 1000);
    field?.getDropPool().removeDrop(drop, DropLeaveType.EXPLODE, 0, 0, delay);
  }
}

function handleFinalCut(user: User, attack: Attack): void {
  if (attack.skillId !== FINAL_CUT) {
    return;
  }
  const si = SkillProvider.getSkillInfoById(attack.skillId);
  if (!si) return;
  // SkillConstants.getMaxGaugeTime(skillId) not ported - skip if no keydown gauge time available
  const maxGaugeTime = si.getValue(SkillStat.time, attack.slv) * 1000;
  if (maxGaugeTime <= 0) return;
  const finalCut = Math.floor(si.getValue(SkillStat.y, attack.slv) * attack.keyDown / maxGaugeTime);
  user.setTemporaryStat(CharacterTemporaryStat.FinalCut, TemporaryStatOption.of(finalCut, attack.skillId, si.getDuration(attack.slv)));
}

function handleComboAbility(user: User, attack: Attack): void {
  const skillId = SkillConstants.getComboAbilitySkill(user.getJob());
  const slv = user.getSkillManager().getSkillLevel(skillId);
  if (slv === 0) return;
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.ComboAbilityBuff);
  const newCombo = option.nOption + attack.getMobCount();
  user.setTemporaryStat(CharacterTemporaryStat.ComboAbilityBuff, TemporaryStatOption.of(newCombo, skillId, 0));
  user.write(UserLocal.incCombo(newCombo));
}

function handleComboAttack(user: User, attack: Attack): void {
  const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.ComboCounter);
  if (option.nOption === 0) return;
  switch (attack.skillId) {
    case 1111003: /* Warrior.PANIC */
    case 1111005: /* Warrior.COMA */
    case 11111002: /* DawnWarrior.PANIC */
    case 11111003: /* DawnWarrior.COMA */
      Warrior.resetComboCounter(user);
      return;
  }
  const comboAttackId = SkillConstants.getComboAttackSkill(user.getJob());
  const advancedComboId = SkillConstants.getAdvancedComboSkill(user.getJob());
  const maxCombo = 1 + Math.max(
    user.getSkillStatValue(comboAttackId, SkillStat.x),
    user.getSkillStatValue(advancedComboId, SkillStat.x),
  );
  if (option.nOption < maxCombo) {
    const doubleProp = user.getSkillStatValue(advancedComboId, SkillStat.prop);
    const newCombo = Math.min(option.nOption + (Util.succeedProp(doubleProp) ? 2 : 1), maxCombo);
    user.setTemporaryStat(CharacterTemporaryStat.ComboCounter, option.update(newCombo));
  }
}

function handleDarkSight(user: User): void {
  if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.DarkSight)) {
    return;
  }
  if (!Util.succeedProp(user.getSkillStatValue(4111003 /* Thief.ADVANCED_DARK_SIGHT */, SkillStat.prop))) {
    user.resetTemporaryStatBySkill(user.getSecondaryStat().getOption(CharacterTemporaryStat.DarkSight).rOption);
  }
}

function handleEnergyCharge(user: User): void {
  const skillId = SkillConstants.getEnergyChargeSkill(user.getJob());
  const slv = user.getSkillManager().getSkillLevel(skillId);
  if (slv === 0) return;
  const si = SkillProvider.getSkillInfoById(skillId);
  if (!si) return;
  const energyCharge = user.getSecondaryStat().getOption(CharacterTemporaryStat.EnergyCharged).nOption;
  if (energyCharge < SkillConstants.ENERGY_CHARGE_MAX) {
    const option = TemporaryStatOption.ofTwoState(
      Math.min(energyCharge + si.getValue(SkillStat.x, slv), SkillConstants.ENERGY_CHARGE_MAX),
      skillId,
      si.getDuration(slv),
      0,
    );
    user.setTemporaryStat(CharacterTemporaryStat.EnergyCharged, option);
  }
}

function handleWindWalk(user: User): void {
  if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.WindWalk)) {
    return;
  }
  user.resetTemporaryStatBySkill(user.getSecondaryStat().getOption(CharacterTemporaryStat.WindWalk).rOption);
}

function handleInfiltrate(user: User): void {
  if (!user.getSecondaryStat().hasOption(CharacterTemporaryStat.Sneak)) {
    return;
  }
  user.resetTemporaryStatBySkill(user.getSecondaryStat().getOption(CharacterTemporaryStat.Sneak).rOption);
}
