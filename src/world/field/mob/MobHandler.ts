import { PacketReader } from '../../../protocol/packets/packetReader';
import { User } from '../../user/User';
import { Mob } from './Mob';
import { MobPacket } from './MobPacket';
import { MobLeaveType } from './MobLeaveType';
import { MobAppearType } from './MobAppearType';
import { MobAttackInfo } from './MobAttackInfo';
import { MobActionType } from './MobActionType';
import { MobTemporaryStat } from './MobTemporaryStat';
import { MobStatOption } from './MobStatOption';
import { MobSkill } from '../../../provider/mob/MobSkill';
import { MobSkillType } from '../../../provider/mob/MobSkillType';
import { MovePath } from '../life/MovePath';
import { Util } from '../../../util/Util';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../../user/stat/TemporaryStatOption';
import { GameConstants } from '../../GameConstants';
import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillInfo } from '../../../provider/skill/SkillInfo';
import { MobProvider } from '../../../provider/MobProvider';
import { AffectedArea } from '../affectedarea/AffectedArea';

/**
 * Port of kinoko's MobHandler (subset).
 *
 * applyMobSkill ports: MobTemporaryStat / CharacterTemporaryStat effects,
 * HEAL_M / DISPEL / HARDSKIN / counter branches, AREA_FIRE/AREA_POISON
 * affected areas, and SUMMON (foothold-based mob spawn).
 *
 * calcMobDamage uses CalcDamage.getRand via a local helper since kinoko's
 * CalcDamage.getRand/calcDamageMax (full damage calc) are deferred to #10.
 */
export class MobHandler {
  static handleMobMove(user: User, r: PacketReader): void {
    const objectId = r.readInt(); // dwMobID

    const field = user.getField();
    const mob: Mob | undefined = field?.getMobPool().getById(objectId);
    if (!mob) return;
    if (mob.getController() !== user) {
      field.getUserPool().setController?.(mob, user);
      mob.setController(user);
    }

    const mobCtrlSn = r.readShort();
    const actionMask = r.readByte();
    const actionAndDir = r.readByte();
    const targetInfo = r.readInt();

    const multiTargetForBall: Array<[number, number]> = [];
    const multiTargetForBallCount = r.readInt();
    for (let i = 0; i < multiTargetForBallCount; i++) {
      multiTargetForBall.push([r.readInt(), r.readInt()]);
    }
    const randTimeForAreaAttack: number[] = [];
    const randTimeForAreaAttackCount = r.readInt();
    for (let i = 0; i < randTimeForAreaAttackCount; i++) {
      randTimeForAreaAttack.push(r.readInt());
    }

    r.readByte(); // (bActive == 0) | ...
    r.readInt(); // HackedCode
    r.readInt(); // moveCtx.fc.ptTarget->x
    r.readInt(); // moveCtx.fc.ptTarget->y
    r.readInt(); // dwHackedCodeCRC

    const movePath = MovePath.decode(r);
    movePath.applyTo(mob);

    r.readByte(); // bChasing
    r.readByte(); // pTarget != 0
    r.readByte(); // pvcActive->bChasing
    r.readByte(); // pvcActive->bChasingHack
    r.readInt(); // pvcActive->tChaseDuration

    const mai = new MobAttackInfo();
    mai.actionMask = actionMask;
    mai.actionAndDir = actionAndDir;
    mai.targetInfo = targetInfo;
    mai.multiTargetForBall = multiTargetForBall;
    mai.randTimeForAreaAttack = randTimeForAreaAttack;
    handleMobAttack(mob, mai);

    const nextAttackPossible = (mai.actionMask & 0x1) !== 0;
    const nextSkill = nextAttackPossible ? mob.getNextSkill() : undefined;
    user.write(MobPacket.mobCtrlAck(mob, mobCtrlSn, nextAttackPossible, nextSkill ?? null));
    field?.broadcastPacket(MobPacket.mobMove(mob, mai, movePath), user);
  }

  static handleMobApplyCtrl(user: User, r: PacketReader): void {
    const objectId = r.readInt(); // dwMobID
    r.readInt(); // crc?

    const field = user.getField();
    const mob: Mob | undefined = field?.getMobPool().getById(objectId);
    if (!mob) return;

    if (!mob.getController()) {
      field.getUserPool().setController?.(mob, user);
      mob.setController(user);
    } else if (mob.getController() !== user) {
      const userDistance = Util.distance(mob.getX(), mob.getY(), user.getX(), user.getY());
      const controllerDistance = Util.distance(mob.getX(), mob.getY(), mob.getController().getX(), mob.getController().getY());
      if (userDistance < controllerDistance - 20) {
        field.getUserPool().setController?.(mob, user);
        mob.setController(user);
      }
    }
  }

  static handleMobHitByMob(user: User, r: PacketReader): void {
    const attackerMobId = r.readInt(); // dwMobID
    r.readInt(); // dwCharacterID
    const targetMobId = r.readInt(); // MobID

    const field = user.getField();
    const attackerMob: Mob | undefined = field?.getMobPool().getById(attackerMobId);
    const targetMob: Mob | undefined = field?.getMobPool().getById(targetMobId);
    if (!attackerMob || !targetMob) return;
    if (!targetMob.isDamagedByMob()) return;

    const damage = calcMobDamage(attackerMob, targetMob);
    targetMob.setHp(targetMob.getHp() - damage);
    field.broadcastPacket(MobPacket.mobDamaged(targetMob, damage));
    if (targetMob.getHp() > 0) {
      targetMob.resetDropItemPeriod();
      return;
    }
    if (field.getMobPool().removeMob(targetMob, MobLeaveType.ETC)) {
      targetMob.distributeExp();
      targetMob.spawnRevives(0);
      targetMob.dropRewards(user, 0);
    }
    // Note: HenesysPQ.MOON_BUNNY / EvanQuest.SAFE_GUARD special-cases not
    // ported (party-quest scripts not in scope).
  }

  static handleMobAttackMob(user: User, r: PacketReader): void {
    r.readInt(); // attacker mob id
    r.readInt(); // CWvsContext->dwCharacterId
    const attackedMobId = r.readInt();
    r.readByte(); // vx
    const damage = r.readInt();
    r.readByte(); // vy < 0
    r.readShort(); // (rcBody.right + rcBody.left) / 2
    r.readShort(); // (rcBody.top + rcBody.bottom) / 2

    const field = user.getField();
    const mob: Mob | undefined = field?.getMobPool().getById(attackedMobId);
    if (!mob) return;

    // Mob::damage(user, damage, 0)
    const actualDamage = Math.min(mob.getHp(), damage);
    mob.addDamage(user.getCharacterId(), actualDamage);
    mob.setHp(mob.getHp() - actualDamage);
    field.broadcastPacket(MobPacket.mobDamaged(mob, damage), user);
    if (mob.getHp() <= 0) {
      if (mob.getController()) {
        mob.getController().write(MobPacket.mobChangeController(mob, false));
      }
      if (field.getMobPool().removeMob(mob, MobLeaveType.ETC)) {
        mob.distributeExp();
        mob.spawnRevives(0);
        mob.dropRewards(user, 0);
      }
    }
  }

  static handleMobTimeBombEnd(user: User, r: PacketReader): void {
    const objectId = r.readInt(); // dwMobID

    const field = user.getField();
    const mob: Mob | undefined = field?.getMobPool().getById(objectId);
    if (!mob) return;
    if (mob.isBoss()) {
      r.readInt(); // (rcBody.right + rcBody.left) / 2
      r.readInt(); // (rcBody.bottom + rcBody.top) / 2
    }
    r.readInt(); // user x
    r.readInt(); // user y

    if (!mob.getMobStat().hasOption(MobTemporaryStat.TimeBomb)) return;
    mob.resetTemporaryStatBySet(new Set([MobTemporaryStat.TimeBomb]));
    // Note: kinoko damages the user if within MONSTER_BOMB_RANGE of the mob
    // and sends UserLocal.timeBombAttack - not ported (CalcDamage.calcDamageMax
    // and UserLocal.timeBombAttack deferred to #10/#11).
  }

  // ---- UNHANDLED MOB OPCODES -------------------------------------------

  static handleMobCrcKeyChangedReply(user: User, r: PacketReader): void {
    r.readInt(); r.readInt(); r.readInt();
  }

  static handleMobDropPickUpRequest(user: User, r: PacketReader): void {
    r.readByte(); r.readInt(); r.readShort(); r.readShort();
    r.readInt(); r.readInt();
  }

  static handleMobHitByObstacle(user: User, r: PacketReader): void {
    const mobId = r.readInt();
    r.readByte();
    r.readShort();
    const field = user.getField();
    const mob = field?.getMobPool().getById(mobId);
    if (!mob) return;
    field?.broadcastPacket(MobPacket.mobDamaged(mob, 0));
  }

  static handleMobSelfDestruct(user: User, r: PacketReader): void {
    r.readInt(); r.readShort();
  }

  static handleMobSkillDelayEnd(user: User, r: PacketReader): void {
    r.readInt(); r.readByte(); r.readByte(); r.readShort();
  }

  static handleMobEscortCollision(user: User, r: PacketReader): void {
    r.readInt(); r.readInt(); r.readInt(); r.readInt(); r.readShort();
  }

  static handleMobRequestEscortInfo(user: User, r: PacketReader): void {
    r.readInt();
  }

  static handleMobEscortStopEndRequest(user: User, r: PacketReader): void {
    r.readInt(); r.readShort();
  }
}

function handleMobAttack(mob: Mob, mai: MobAttackInfo): void {
  const action = mai.actionAndDir >> 1;
  mai.isAttack = action >= MobActionType.ATTACK1 && action <= MobActionType.ATTACKF;
  mai.isSkill = action >= MobActionType.SKILL1 && action <= MobActionType.SKILLF;

  if (mai.isAttack) {
    const attackIndex = action - MobActionType.ATTACK1;
    const mobAttack = mob.getAttack(attackIndex);
    if (!mobAttack) return;
    mob.setMp(Math.max(mob.getMp() - mobAttack.conMp, 0));
  } else if (mai.isSkill) {
    const skillId = mai.targetInfo & 0xFF;
    const slv = (mai.targetInfo >> 8) & 0xFF;
    const option = (mai.targetInfo >> 16) & 0xFFFF; // tDelay

    const mobSkill = mob.getSkill(skillId);
    if (!mobSkill) return;
    if (skillId !== mobSkill.skillId || slv !== mobSkill.skillLevel) return;
    if (!mob.canUseSkill(mobSkill)) return;

    const now = new Date();
    mob.nextSkillUse = new Date(now.getTime() + GameConstants.MOB_SKILL_COOLTIME * 1000);
    mob.setSkillCooltime(mobSkill.skillId, now); // interval-based cooltime not ported (needs SkillProvider mob skill data)

    const si = SkillProvider.getMobSkillInfoById(skillId);
    applyMobSkill(mob, mobSkill, option, si);
  }
}

/**
 * Port of MobHandler.applyMobSkill — subset.
 * Falls back to MobTemporaryStat / CharacterTemporaryStat application using
 * defaults (x=1, no rect restriction) when mob skill info is unavailable.
 * AREA_FIRE/AREA_POISON use AffectedAreaPool when SkillProvider has a rect.
 * HARDSKIN applies both PImmune + MImmune simultaneously.
 */
export function applyMobSkill(mob: Mob, mobSkill: MobSkill, delay: number, si?: SkillInfo): void {
  const field = mob.getField();
  const skillType = mobSkill.skillType;
  const skillId = mobSkill.skillId;
  const slv = mobSkill.skillLevel;
  const duration = si?.getDuration(slv) ?? 0;

  const mts = mobTemporaryStatFor(skillType);
  if (mts !== undefined) {
    mob.setTemporaryStat(new Map([[mts, MobStatOption.ofMobSkill(1, skillId, slv, duration)]]), delay);
    return;
  }

  const cts = characterTemporaryStatFor(skillType);
  if (cts !== undefined) {
    const targetUsers: User[] = field?.getUserPool().getAll() ?? [];
    const option = TemporaryStatOption.ofMobSkill(1, skillId, slv, duration);
    for (const targetUser of targetUsers) {
      targetUser.setTemporaryStat(cts, option, delay);
    }
    return;
  }

  switch (skillType) {
    case MobSkillType.HEAL_M: {
      mob.heal(mob.getMaxHp() - mob.getHp());
      break;
    }
    case MobSkillType.DISPEL: {
      const targetUsers: User[] = field?.getUserPool().getAll() ?? [];
      for (const targetUser of targetUsers) {
        targetUser.resetTemporaryStat((_, opt) => Math.floor(opt.rOption / 1000000) > 0);
      }
      break;
    }
    case MobSkillType.PCOUNTER: {
      mob.setTemporaryStat(new Map([
        [MobTemporaryStat.PImmune, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
        [MobTemporaryStat.PCounter, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
      ]), delay);
      break;
    }
    case MobSkillType.MCOUNTER: {
      mob.setTemporaryStat(new Map([
        [MobTemporaryStat.MImmune, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
        [MobTemporaryStat.MCounter, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
      ]), delay);
      break;
    }
    case MobSkillType.PMCOUNTER: {
      mob.setTemporaryStat(new Map([
        [MobTemporaryStat.PImmune, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
        [MobTemporaryStat.MImmune, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
        [MobTemporaryStat.PCounter, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
        [MobTemporaryStat.MCounter, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
      ]), delay);
      break;
    }
    case MobSkillType.HARDSKIN: {
      mob.setTemporaryStat(new Map([
        [MobTemporaryStat.PImmune, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
        [MobTemporaryStat.MImmune, MobStatOption.ofMobSkill(1, skillId, slv, duration)],
      ]), delay);
      break;
    }
    case MobSkillType.AREA_FIRE:
    case MobSkillType.AREA_POISON:
      if (field && si) {
        try {
          field.getAffectedAreaPool().addAffectedArea(AffectedArea.mobSkill(mob, si, slv, delay));
        } catch {
          // Missing/invalid mob-skill rect in provider data - skip rather than killing the field tick.
        }
      }
      break;
    case MobSkillType.SUMMON: {
      if (!field) break;
      const summonInfo = SkillProvider.getMobSummonInfoByLevel(slv);
      if (!summonInfo || summonInfo.summons.length === 0) break;
      const mapInfo = field.getMapInfo();
      const mobX = mob.getX();
      const mobY = mob.getY();
      for (const templateId of summonInfo.summons) {
        const template = MobProvider.getMobTemplate(templateId);
        if (!template) continue;
        const fhBelow = mapInfo?.getFootholdBelow(mobX, mobY + 5);
        const fh = fhBelow?.sn ?? mob.getFoothold();
        const y = fhBelow ? fhBelow.getYFromX(mobX) : mobY;
        const summonMob = new Mob(template, null, mobX, y, fh);
        summonMob.summonType = MobAppearType.NORMAL;
        field.getMobPool().addMob(summonMob);
        field.broadcastPacket(MobPacket.mobEnterField(summonMob));
      }
      break;
    }
    default:
      break;
  }
}

/** MobSkillType.getMobTemporaryStat */
function mobTemporaryStatFor(skillType: MobSkillType): MobTemporaryStat | undefined {
  switch (skillType) {
    case MobSkillType.POWERUP: case MobSkillType.POWERUP_M: return MobTemporaryStat.PowerUp;
    case MobSkillType.MAGICUP: case MobSkillType.MAGICUP_M: return MobTemporaryStat.MagicUp;
    case MobSkillType.PGUARDUP: case MobSkillType.PGUARDUP_M: return MobTemporaryStat.PGuardUp;
    case MobSkillType.MGUARDUP: case MobSkillType.MGUARDUP_M: return MobTemporaryStat.MGuardUp;
    case MobSkillType.HASTE: case MobSkillType.HASTE_M: case MobSkillType.SPEED: return MobTemporaryStat.Speed;
    case MobSkillType.PHYSICALIMMUNE: return MobTemporaryStat.PImmune;
    case MobSkillType.MAGICIMMUNE: return MobTemporaryStat.MImmune;
    case MobSkillType.PAD: return MobTemporaryStat.PAD;
    case MobSkillType.MAD: return MobTemporaryStat.MAD;
    case MobSkillType.PDR: return MobTemporaryStat.PDR;
    case MobSkillType.MDR: return MobTemporaryStat.MDR;
    case MobSkillType.ACC: return MobTemporaryStat.ACC;
    case MobSkillType.EVA: return MobTemporaryStat.EVA;
    default: return undefined;
  }
}

/** MobSkillType.getCharacterTemporaryStat (UNDEAD has no CharacterTemporaryStat.Undead in this port - skipped) */
function characterTemporaryStatFor(skillType: MobSkillType): CharacterTemporaryStat | undefined {
  switch (skillType) {
    case MobSkillType.SEAL: return CharacterTemporaryStat.Seal;
    case MobSkillType.DARKNESS: return CharacterTemporaryStat.Darkness;
    case MobSkillType.WEAKNESS: return CharacterTemporaryStat.Weakness;
    case MobSkillType.STUN: return CharacterTemporaryStat.Stun;
    case MobSkillType.CURSE: return CharacterTemporaryStat.Curse;
    case MobSkillType.POISON: return CharacterTemporaryStat.Poison;
    case MobSkillType.SLOW: return CharacterTemporaryStat.Slow;
    case MobSkillType.ATTRACT: return CharacterTemporaryStat.Attract;
    case MobSkillType.BANMAP: return CharacterTemporaryStat.BanMap;
    case MobSkillType.REVERSE_INPUT: return CharacterTemporaryStat.ReverseInput;
    case MobSkillType.STOPPORTION: return CharacterTemporaryStat.StopPortion;
    case MobSkillType.STOPMOTION: return CharacterTemporaryStat.StopMotion;
    case MobSkillType.FEAR: return CharacterTemporaryStat.Fear;
    case MobSkillType.FROZEN: return CharacterTemporaryStat.Frozen;
    default: return undefined;
  }
}

function calcMobDamage(attackerMob: Mob, targetMob: Mob): number {
  const pad = attackerMob.template.pad;
  const lo = pad * 0.85;
  const baseDamage = lo + Math.random() * (pad - lo);
  return Math.max(1, Math.floor(baseDamage * ((100 - targetMob.template.pdr) / 100)));
}
