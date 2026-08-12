import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User } from '../user/User';
import { UserRemote } from '../user/UserRemote';
import { UserLocal } from '../user/UserLocal';
import { Skill } from '../skill/Skill';
import { SkillConstants } from '../skill/SkillConstants';
import { SkillRecord } from '../skill/SkillRecord';
import { SkillProvider } from '../../provider/SkillProvider';
import { SkillInfo } from '../../provider/skill/SkillInfo';
import { SkillStat } from '../../provider/skill/SkillStat';
import { JobConstants } from '../job/JobConstants';
import { CharacterTemporaryStat } from '../user/stat/CharacterTemporaryStat';
import { Effect } from '../user/effect/Effect';
import { Stat } from '../user/stat/Stat';
import { ExtendSp } from '../user/stat/ExtendSp';
import { SkillProcessor } from '../skill/SkillProcessor';
import { inventoryOperation, changeSkillRecordResultPacket } from '../item/ItemPacket';
import { MessagePacket } from '../user/MessagePacket';
import { Warrior } from '../skill/job/Warrior';
import { Evan } from '../skill/job/Evan';
import { BattleMage } from '../skill/job/BattleMage';
import { Mechanic } from '../skill/job/Mechanic';

// Skill IDs referenced directly by SkillHandler (kinoko per-job constants).
const MECHANIC_ROCK_N_SHOCK = 35111002;
const CITIZEN_CAPTURE = 30001061;
const CITIZEN_CALL_OF_THE_HUNTER = 30001062;
const THIEF_SHADOW_STARS = 4121006;
const MAGICIAN_DISPEL = 2311001;
const MAGICIAN_MYSTIC_DOOR = 2311002;
const THIEF_CHAINS_OF_HELL = 4341005;
const WILDHUNTER_JAGUAR_OSHI = 33101004;
const WILDHUNTER_JAGUAR_OSHI_DIGESTED = 33101006;
const THIEF_FLASHBANG = 4321002;
const THIEF_MONSTER_BOMB = 4341003;
const MECH_SIEGE_MODE_CANCEL = 35110004;
const MECH_MISSILE_TANK_CANCEL = 35120005;
const MECH_SIEGE_MODE_2_CANCEL = 35120013;
const WARRIOR_BEHOLDER = 1321007;

/**
 * Port of kinoko's SkillHandler.
 *
 * Cuts (documented in PORT_GAPS.md "SkillHandler (#12) scope notes"):
 * - SkillProcessor.processSkill: partially ported for plain temporary-stat
 *   buffs/debuffs; Summoned/Pet/AffectedArea/two-state branches remain cut.
 * - Beholder/Aura/SuperBody/BattleMage.cancelPartyAura special-case resets in
 *   handleUserSkillCancelRequest: skipped (Summoned subsystem unported).
 * - WildHunter.JAGUAR_OSHI swallow-mob handling: skipped (Mob.setSwallowCharacterId
 *   not ported).
 * - Mystic Door cooltime check (user.getTownPortal()): ported.
 * - Mechanic.handleMech / Warrior.handleBerserkEffect / Evan.handleDragonFuryEffect /
 *   BattleMage.cancelPartyAura: not ported.
 * - SkillInfo.getHpCon/getMpCon/getBulletCon: implemented here as free functions
 *   (avoids User<->SkillInfo import cycle), with FINAL_CUT/SACRIFICE/DRAGON_ROAR/
 *   MP_RECOVERY hpCon special cases and amplification/teleport-mastery mpCon
 *   adjustments cut (rare per-job edge cases).
 *
 * Batch 9 resolved: itemCon/spiritJavelinItemId consumption, party-skill
 * propagation via Skill.forEachAffectedMember.
 */
export class SkillHandler {
  /** Port of kinoko's SkillHandler::handleUserSkillUseRequest. */
  static handleUserSkillUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time

    const skill = new Skill();
    skill.skillId = r.readInt();
    skill.slv = r.readByte();

    if (skill.skillId === MECHANIC_ROCK_N_SHOCK) {
      skill.rockAndShockCount = r.readByte();
      if (skill.rockAndShockCount === 2) {
        skill.rockAndShock1 = r.readInt();
        skill.rockAndShock2 = r.readInt();
      }
    }
    if (skill.skillId === CITIZEN_CAPTURE) {
      skill.captureTargetMobId = r.readInt();
    }
    if (skill.skillId === CITIZEN_CALL_OF_THE_HUNTER) {
      skill.randomCapturedMobId = r.readInt();
    }
    if (SkillConstants.isEncodePositionSkill(skill.skillId)) {
      skill.positionX = r.readShort();
      skill.positionY = r.readShort();
      if (SkillConstants.isSummonSkill(skill.skillId)) {
        skill.summonLeft = r.readBoolean();
      }
    }
    if (skill.skillId === THIEF_SHADOW_STARS) {
      skill.spiritJavelinItemId = r.readInt();
    }
    if (SkillConstants.isPartySkill(skill.skillId) && remaining(r) > 2) {
      skill.affectedMemberBitMap = r.readByte();
      if (skill.skillId === MAGICIAN_DISPEL) {
        r.readShort(); // tDelay
      }
    }
    if (remaining(r) > 2) {
      const targetCount = r.readByte() & 0xFF;
      skill.targetIds = new Array(targetCount);
      for (let i = 0; i < targetCount; i++) {
        skill.targetIds[i] = r.readInt();
        if (skill.skillId === THIEF_CHAINS_OF_HELL) {
          r.readByte(); // anMobMove[k] == 3 || == 4
        }
      }
    }
    if (skill.skillId === THIEF_CHAINS_OF_HELL || skill.skillId === CITIZEN_CALL_OF_THE_HUNTER || SkillConstants.isSummonSkill(skill.skillId)) {
      skill.left = r.readBoolean();
    }
    if (remaining(r) === 2) {
      skill.delay = r.readShort();
    }

    // Check skill root
    const skillRoot = SkillConstants.getSkillRoot(skill.skillId);
    if (!JobConstants.isBeginnerJob(skillRoot) && !JobConstants.isCorrectJobForSkillRoot(user.getJob(), skillRoot)) {
      user.dispose();
      return;
    }
    // Check seal
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Seal) && skill.skillId !== MAGICIAN_DISPEL) {
      user.dispose();
      return;
    }
    // Check morph
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Morph)) {
      const morphId = user.getSecondaryStat().getOption(CharacterTemporaryStat.Morph).nOption;
      const morphInfo = SkillProvider.getMorphInfoById(morphId);
      if (!morphInfo) {
        user.dispose();
        return;
      }
      if (!morphInfo.superman && !morphInfo.attackable) {
        user.dispose();
        return;
      }
    }
    // Mystic Door cooltime to avoid crashes (port of kinoko SkillHandler)
    if (skill.skillId === MAGICIAN_MYSTIC_DOOR) {
      const tp = user.getTownPortal();
      if (tp && tp.waitTime > new Date()) {
        user.write(MessagePacket.system('Please wait 5 seconds before casting Mystic Door again.'));
        user.dispose();
        return;
      }
    }

    SkillHandler.handleSkill(user, skill);
  }

  /** Port of kinoko's SkillHandler::handleUserSkillCancelRequest. */
  static handleUserSkillCancelRequest(user: User, r: PacketReader): void {
    const skillId = r.readInt();
    if (SkillConstants.isKeydownSkill(skillId)) {
      user.getField()?.broadcastPacket(UserRemote.skillCancel(user, skillId));
      return;
    }
    user.resetTemporaryStatBySkill(skillId);
    // Beholder cancel: remove beholder summoned when Beholder CTS is reset
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Beholder)) {
      user.removeSummoned((summoned) => summoned.skillId === WARRIOR_BEHOLDER);
    }
    // Aura cancel: reset AURA_STAT set and propagate to party
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Aura)) {
      user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.DarkAura
        || cts === CharacterTemporaryStat.BlueAura
        || cts === CharacterTemporaryStat.YellowAura
        || cts === CharacterTemporaryStat.SuperBody);
      BattleMage.cancelPartyAura(user, skillId);
    }
    // SuperBody cancel: if Aura is not set but SuperBody is, reset all AURA_STAT
    if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.SuperBody)) {
      user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.DarkAura
        || cts === CharacterTemporaryStat.BlueAura
        || cts === CharacterTemporaryStat.YellowAura
        || cts === CharacterTemporaryStat.SuperBody);
    }
  }

  /** Port of kinoko's SkillHandler::handleUserSkillPrepareRequest. */
  static handleUserSkillPrepareRequest(user: User, r: PacketReader): void {
    const skillId = r.readInt();
    const slv = r.readByte();
    const actionAndDir = r.readShort();
    const attackSpeed = r.readByte();

    if (skillId === WILDHUNTER_JAGUAR_OSHI) {
      r.readInt(); // dwSwallowMobID - swallow handling skipped (Mob.setSwallowCharacterId unported)
    }
    user.getField()?.broadcastPacket(UserRemote.skillPrepare(user, skillId, slv, actionAndDir, attackSpeed), user);
  }

  /** Port of kinoko's SkillHandler::handleMovingShootAttackPrepare. */
  static handleMovingShootAttackPrepare(user: User, r: PacketReader): void {
    const skillId = r.readInt();
    const actionAndDir = r.readShort();
    const attackSpeed = r.readByte();
    const slv = user.getSkillManager().getSkillLevel(skillId);
    if (slv === 0) {
      return;
    }
    user.getField()?.broadcastPacket(UserRemote.movingShootAttackPrepare(user, skillId, slv, actionAndDir, attackSpeed), user);
  }

  /** Port of kinoko's SkillHandler::handleUserEffectLocal. */
  static handleUserEffectLocal(user: User, r: PacketReader): void {
    const skillId = r.readInt();
    const slv = r.readByte();
    const sendLocal = r.readBoolean();

    const effect = Effect.skillUse(skillId, slv, user.getLevel());
    if (sendLocal) {
      user.write(UserLocal.effect(effect));
      // Mech: Siege Mode (35111004), Mech: Missile Tank (35121005), Mech: Siege Mode 2 (35121013)
      if (skillId === MECH_SIEGE_MODE_CANCEL || skillId === MECH_MISSILE_TANK_CANCEL || skillId === MECH_SIEGE_MODE_2_CANCEL) {
        if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Mechanic)) {
          Mechanic.handleMech(user, skillId === MECH_SIEGE_MODE_2_CANCEL ? 35121005 /* MECH_MISSILE_TANK */ : 35001002 /* MECH_PROTOTYPE */);
        }
      }
    }
    user.getField()?.broadcastPacket(UserRemote.effect(user, effect), user);
  }

  /** Port of kinoko's SkillHandler::handleUserCalcDamageStatSetRequest. */
  static handleUserCalcDamageStatSetRequest(user: User, _r: PacketReader): void {
    user.validateStat();
    Warrior.handleBerserkEffect(user);
    Evan.handleDragonFuryEffect(user);
  }

  /** Port of kinoko's SkillHandler::handleUserThrowGrenade. */
  static handleUserThrowGrenade(user: User, r: PacketReader): void {
    const skill = new Skill();
    skill.positionX = r.readInt();
    skill.positionY = r.readInt();
    r.readInt();
    skill.keyDown = r.readInt();
    skill.skillId = r.readInt();
    skill.slv = r.readInt();

    if (skill.skillId !== THIEF_FLASHBANG && skill.skillId !== THIEF_MONSTER_BOMB) {
      SkillHandler.handleSkill(user, skill);
    }
    user.getField()?.broadcastPacket(UserRemote.throwGrenade(user, skill), user);
  }

  /** Port of kinoko's SkillHandler::handleUserClientTimerEndRequest. */
  static handleUserClientTimerEndRequest(user: User, r: PacketReader): void {
    const size = r.readInt();
    const skillIds: number[] = new Array(size);
    for (let i = 0; i < size; i++) {
      skillIds[i] = r.readInt();
      r.readInt();
    }
    for (const skillId of skillIds) {
      user.resetTemporaryStatBySkill(skillId);
    }
  }

  /** Port of kinoko's UserHandler::handleUserSkillUpRequest. */
  static handleUserSkillUpRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const skillId = r.readInt();

    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) {
      user.dispose();
      return;
    }

    const sm = user.getSkillManager();
    const skillRecord = sm.getSkill(skillId);
    if (!skillRecord) {
      user.dispose();
      return;
    }

    for (const [reqSkillId, reqSkillLevel] of si.reqSkills) {
      if (user.getSkillLevel(reqSkillId) < reqSkillLevel) {
        user.dispose();
        return;
      }
    }

    if (SkillConstants.isSkillNeedMasterLevel(skillId)) {
      if (skillRecord.getSkillLevel() >= skillRecord.getMasterLevel()) {
        user.dispose();
        return;
      }
    } else {
      if (skillRecord.getSkillLevel() >= si.maxLevel) {
        user.dispose();
        return;
      }
    }

    const skillRoot = SkillConstants.getSkillRoot(skillId);
    const sp = user.getCharacterStat().sp;
    if (JobConstants.isBeginnerJob(skillRoot)) {
      if (!SkillConstants.isBeginnerSpAddableSkill(skillId)) {
        user.dispose();
        return;
      }
      let spentSp = 0;
      for (const sr of sm.getSkillRecords()) {
        if (SkillConstants.isBeginnerSpAddableSkill(sr.getSkillId())) {
          spentSp += sr.getSkillLevel();
        }
      }
      const totalSp = JobConstants.isResistanceJob(skillRoot)
        ? Math.min(user.getLevel(), 10) - 1
        : Math.min(user.getLevel(), 7) - 1;
      if (spentSp >= totalSp) {
        user.dispose();
        return;
      }
    } else if (JobConstants.isExtendSpJob(skillRoot)) {
      const jobLevel = JobConstants.getJobLevel(skillRoot);
      if (!sp.removeSp(jobLevel, 1)) {
        user.dispose();
        return;
      }
    } else {
      if (!sp.removeNonExtendSp(1)) {
        user.dispose();
        return;
      }
    }

    skillRecord.setSkillLevel(skillRecord.getSkillLevel() + 1);
    user.write(statChangedSpPacket(JobConstants.isExtendSpJob(user.getJob()) ? sp : sp.getNonExtendSp()));
    user.write(changeSkillRecordResultPacket(skillRecord, true));
    user.validateStat();
  }

  /** Port of kinoko's SkillHandler::handleSkill. */
  private static handleSkill(user: User, skill: Skill): void {
    if (skill.skillId === WILDHUNTER_JAGUAR_OSHI_DIGESTED && user.getHp() <= 0) {
      user.dispose();
      return;
    }

    const si = SkillProvider.getSkillInfoById(skill.skillId);
    if (!si) {
      return;
    }

    if (user.getSkillManager().hasSkillCooltime(skill.skillId)) {
      return;
    }
    const hpCon = getHpCon(user, si, skill.slv);
    if (user.getHp() <= hpCon) {
      return;
    }
    const mpCon = getMpCon(user, si, skill.slv);
    if (user.getMp() < mpCon) {
      return;
    }
    const comboCon = SkillConstants.getRequiredComboCount(skill.skillId);
    if (comboCon > 0) {
      user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.ComboAbilityBuff);
    }

    // Consume skill items (itemCon / spiritJavelinItemId)
    const itemCon = si.getValue(SkillStat.itemCon, skill.slv);
    const itemConNo = si.getValue(SkillStat.itemConNo, skill.slv);
    if (itemCon > 0) {
      const count = itemConNo > 0 ? itemConNo : 1;
      const ops = user.getInventoryManager().removeItemById(itemCon, count);
      if (ops) {
        user.write(inventoryOperation(ops, false));
      }
    }
    if (skill.spiritJavelinItemId > 0) {
      const ops = user.getInventoryManager().removeItemById(skill.spiritJavelinItemId, 1);
      if (ops) {
        user.write(inventoryOperation(ops, false));
      }
    }

    // Consume hp/mp
    user.addHp(-hpCon);
    user.addMp(-mpCon);

    // Set cooltime
    const cooltime = si.getValue(SkillStat.cooltime, skill.slv);
    if (!SkillConstants.isNoCooltimeSkill(skill.skillId) && cooltime > 0) {
      user.setSkillCooltime(skill.skillId, cooltime);
    }

    SkillProcessor.processSkill(user, skill);

    user.write(skillUseResultPacket());

    const field = user.getField();
    if (field) {
      field.broadcastPacket(UserRemote.effect(user, Effect.skillUseForSkill(skill.skillId, skill.slv, user.getLevel(), {
        left: skill.left,
        targetMobId: skill.targetIds[0],
        positionX: skill.positionX,
        positionY: skill.positionY,
      })), user);
      skill.forEachAffectedMember(user, field, (member) => {
        member.write(UserLocal.effect(Effect.skillAffected(skill.skillId, skill.slv)));
        field.broadcastPacket(UserRemote.effect(member, Effect.skillAffected(skill.skillId, skill.slv)), member);
      });
    }
  }
}

function remaining(r: PacketReader): number {
  return r.data.length - r.offset;
}

/** Port of kinoko's WvsContext::skillUseResult. */
function skillUseResultPacket(): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.SKILL_USE_RESULT.code);
  w.writeByte(0);
  return w.getPacket();
}

/**
 * Port of kinoko's WvsContext::statChanged(Stat.SP, ...) for UserSkillUpRequest.
 * value is an ExtendSp (extend-sp jobs, encoded via ExtendSp::encode) or a plain
 * number (non-extend jobs, encoded as a short) - encodeSingleStat in User.ts only
 * handles the number case, so this is a small dedicated builder.
 */
function statChangedSpPacket(value: ExtendSp | number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.STAT_CHANGED.code);
  w.writeByte(1); // bOnExclRequest
  w.writeInt(Stat.SP);
  w.writeInt(0);
  if (value instanceof ExtendSp) {
    value.encode(w);
  } else {
    w.writeShort(value);
  }
  w.writeShort(0);
  return w.getPacket();
}

/**
 * Port of kinoko's SkillInfo::getHpCon, minus the FINAL_CUT/SACRIFICE/
 * DRAGON_ROAR/MP_RECOVERY special cases (rare per-job edge cases, cut).
 */
function getHpCon(_user: User, si: SkillInfo, slv: number): number {
  return si.getValue(SkillStat.hpCon, slv);
}

/**
 * Port of kinoko's SkillInfo::getMpCon, minus the element-amplification and
 * teleport-mastery adjustments (cut - SkillConstants.getAmplificationSkill /
 * isTeleportSkill not ported).
 */
function getMpCon(user: User, si: SkillInfo, slv: number): number {
  let mpCon = si.getValue(SkillStat.mpCon, slv);
  const ss = user.getSecondaryStat();
  if (ss.hasOption(CharacterTemporaryStat.Infinity)) {
    mpCon = 0;
  }
  if (ss.hasOption(CharacterTemporaryStat.Concentration)) {
    const percentage = 100 - ss.getOption(CharacterTemporaryStat.Concentration).nOption;
    mpCon = Math.floor((percentage * mpCon) / 100 + 0.99);
  }
  return mpCon;
}
