import { PacketReader } from '../../../protocol/packets/packetReader';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { MovePath } from '../life/MovePath';
import { User } from '../../user/User';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { HitInfo } from '../../skill/HitInfo';
import { Skill } from '../../skill/Skill';
import { SkillProcessor } from '../../skill/SkillProcessor';
import { Attack, AttackHeaderType } from '../../skill/Attack';
import { AttackInfo } from '../../skill/AttackInfo';
import { MobLeaveType } from '../mob/MobLeaveType';
import { MobPacket } from '../mob/MobPacket';
import { SummonedActionType, summonedActionTypeByValue } from './SummonedActionType';
import { Summoned } from './Summoned';
import { SummonedLeaveType } from './SummonedLeaveType';
import { SummonedPacket } from './SummonedPacket';

const HEX_OF_THE_BEHOLDER = 1320009;
const MECH_SATELLITE = 35111001;
const MECH_SATELLITE_2 = 35111009;
const MECH_SATELLITE_3 = 35111010;
const MECH_SATELLITE_SAFETY = 35121006;

export class SummonedHandler {
  static handleSummonedMove(user: User, r: PacketReader): void {
    const summonedId = r.readInt();
    if (summonedId === 0) return; // CTutor

    const summoned = resolveSummoned(user, summonedId);
    if (!summoned) return;

    const movePath = MovePath.decode(r);
    movePath.applyTo(summoned);
    summoned.getField()?.broadcastPacket(SummonedPacket.summonedMove(user, summoned, movePath), user);
  }

  static handleSummonedAttack(user: User, r: PacketReader): void {
    const summonedId = r.readInt();
    const summoned = resolveSummoned(user, summonedId);
    if (!summoned) return;

    const attack = new Attack(AttackHeaderType.SummonedAttack);
    attack.skillId = summoned.skillId;
    attack.slv = summoned.skillLevel;

    r.readInt(); // ~drInfo.dr0
    r.readInt(); // ~drInfo.dr1
    r.readInt(); // update_time
    r.readInt(); // ~drInfo.dr2
    r.readInt(); // ~drInfo.dr3

    attack.actionAndDir = r.readByte();
    const actionType = summonedActionTypeByValue(attack.actionAndDir & 0x7F);
    if (actionType === null) return;

    r.readInt(); // dwKey
    r.readInt(); // Crc32

    const mobCount = r.readByte();
    attack.mask = 1 | (mobCount << 4);

    if (actionType === SummonedActionType.ATTACK_TRIANGLE) {
      for (let i = 0; i < 3; i++) r.readInt();
    }

    attack.userX = r.readShort();
    attack.userY = r.readShort();
    r.readShort(); // summonedX
    r.readShort(); // summonedY

    r.readInt(); // CUserLocal::GetRepeatSkillPoint

    while (r.getRemainingPacket().length > 4) {
      const ai = new AttackInfo();
      ai.mobId = r.readInt();
      r.readInt(); // dwTemplateID
      ai.hitAction = r.readByte();
      ai.actionAndDir = r.readByte();
      r.readByte(); // nFrameIdx
      r.readByte(); // CalcDamageStatIndex
      ai.hitX = r.readShort();
      ai.hitY = r.readShort();
      r.readShort();
      r.readShort();
      ai.delay = Math.min(r.readShort(), 1000);
      ai.damage[0] = r.readInt();
      attack.attackInfo.push(ai);
    }

    attack.crc = r.readInt();

    const field = user.getField();
    for (const ai of attack.attackInfo) {
      const mob = field?.getMobPool().getById(ai.mobId);
      if (!mob) continue;

      SkillProcessor.processAttack(user, mob, attack, ai.delay);
      const totalDamage = ai.damage[0];
      const actualDamage = Math.min(mob.getHp(), totalDamage);
      if (actualDamage > 0) {
        mob.addDamage(user.getCharacterId(), actualDamage);
        mob.setHp(mob.getHp() - actualDamage);
        field?.broadcastPacket(MobPacket.mobDamaged(mob, totalDamage));
      }

      if (mob.getHp() <= 0) {
        mob.getController()?.write(MobPacket.mobChangeController(mob, false));
        if (field?.getMobPool().removeMob(mob, MobLeaveType.ETC)) {
          mob.distributeExp();
          mob.spawnRevives(ai.delay);
          mob.dropRewards(user, ai.delay);
        }
      }
    }

    if (actionType === SummonedActionType.DIE) {
      user.removeSummonedObject(summoned);
    }

    field?.broadcastPacket(SummonedPacket.summonedAttack(user, summoned, attack), user);
  }

  static handleSummonedRemove(user: User, r: PacketReader): void {
    const summonedId = r.readInt();
    const summoned = resolveSummoned(user, summonedId);
    if (!summoned) return;

    user.removeSummonedObject(summoned);

    // Kinoko also clears Satellite Safety when a satellite disappears manually.
    if (isMechanicSatellite(summoned.skillId) && user.getSecondaryStat().hasOption(CharacterTemporaryStat.SafetyDamage)) {
      user.resetTemporaryStat((cts) => cts === CharacterTemporaryStat.SafetyDamage || cts === CharacterTemporaryStat.SafetyAbsorb);
      user.setSkillCooltime(MECH_SATELLITE_SAFETY, user.getSkillStatValue(MECH_SATELLITE_SAFETY, SkillStat.cooltime));
    }
  }

  static handleSummonedHit(user: User, r: PacketReader): void {
    const summonedId = r.readInt();
    const summoned = resolveSummoned(user, summonedId);
    if (!summoned) return;

    const hitInfo = new HitInfo();
    hitInfo.attackIndex = r.readByte() << 24 >> 24;
    hitInfo.damage = r.readInt();
    if (hitInfo.attackIndex > -2) {
      hitInfo.templateId = r.readInt();
      hitInfo.dir = r.readByte();
    }

    user.getField()?.broadcastPacket(SummonedPacket.summonedHit(user, summoned, hitInfo));
    summoned.hp -= hitInfo.damage;
    if (summoned.hp <= 0) {
      summoned.leaveType = SummonedLeaveType.SUMMONED_DEAD;
      user.removeSummonedObject(summoned);
    }
  }

  static handleSummonedSkill(user: User, r: PacketReader): void {
    const summonedId = r.readInt();
    const summoned = resolveSummoned(user, summonedId);
    if (!summoned) return;

    const skill = new Skill();
    skill.skillId = r.readInt();
    const actionAndDir = r.readByte();
    if (skill.skillId === HEX_OF_THE_BEHOLDER) {
      skill.summonBuffType = r.readByte();
    }
    skill.slv = skill.skillId === summoned.skillId ? summoned.skillLevel : user.getSkillLevel(skill.skillId);
    skill.summoned = summoned;

    SkillProcessor.processSkill(user, skill);
    user.getField()?.broadcastPacket(SummonedPacket.summonedSkill(user, summoned, actionAndDir));
  }
}

function resolveSummoned(user: User, summonedId: number): Summoned | undefined {
  const summoned = user.getField()?.getSummonedPool().getById(summonedId);
  if (!summoned || summoned.ownerId !== user.getCharacterId()) return undefined;
  return summoned;
}

function isMechanicSatellite(skillId: number): boolean {
  return skillId === MECH_SATELLITE || skillId === MECH_SATELLITE_2 || skillId === MECH_SATELLITE_3;
}
