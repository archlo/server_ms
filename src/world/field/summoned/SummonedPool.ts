import { FieldObjectPool } from '../FieldObjectPool';
import { User } from '../../user/User';
import { Summoned } from './Summoned';
import { SummonedAssistType } from './SummonedAssistType';
import { SummonedEnterType } from './SummonedEnterType';
import { SummonedLeaveType } from './SummonedLeaveType';
import { SummonedPacket } from './SummonedPacket';
import { Attack, AttackHeaderType } from '../../skill/Attack';
import { AttackInfo } from '../../skill/AttackInfo';
import { SkillProcessor } from '../../skill/SkillProcessor';
import { MobLeaveType } from '../mob/MobLeaveType';
import { MobPacket } from '../mob/MobPacket';
import { Util } from '../../../util/Util';

export class SummonedPool extends FieldObjectPool<Summoned> {
  constructor(private readonly field: any) { super(); }

  addSummoned(user: User, summoned: Summoned): void {
    summoned.setField(this.field);
    summoned.ownerId = user.getCharacterId();
    summoned.lastUpdateTime = Date.now();
    if (summoned.getId() === 0) {
      summoned.setId(typeof this.field.nextId === 'function' ? this.field.nextId() : this.getCount() + 1);
    }
    this.addObject(summoned);
    this.field.broadcastPacket(SummonedPacket.summonedEnterField(user, summoned));
    summoned.enterType = SummonedEnterType.DEFAULT;
  }

  removeSummoned(user: User, summoned: Summoned): boolean {
    if (!this.removeObject(summoned)) return false;
    this.field.broadcastPacket(SummonedPacket.summonedLeaveField(user, summoned));
    return true;
  }

  expireSummoned(now: Date): Summoned[] {
    const expired: Summoned[] = [];
    for (const summoned of this.getAll()) {
      if (!summoned.isExpired(now)) continue;
      summoned.leaveType = SummonedLeaveType.DEFAULT;
      const owner = this.field.getUserPool?.().getUserByCharacterId?.(summoned.ownerId);
      if (owner?.removeSummonedObject(summoned)) {
        expired.push(summoned);
      }
    }
    return expired;
  }

  /** Port of kinoko's Summoned AI tick. Triggers auto-attack for attacking summons. */
  updateSummoned(now: Date): void {
    const nowMs = now.getTime();
    for (const summoned of this.getAll()) {
      if (summoned.ownerId === 0) continue;
      if (!isAttackingSummon(summoned.assistType)) continue;
      if (nowMs - summoned.lastUpdateTime < 3000) continue;

      const field = this.field;
      const owner = field.getUserPool?.().getUserByCharacterId?.(summoned.ownerId);
      if (!owner) continue;

      // Find nearest mob within range (800px)
      const mobs = field.getMobPool?.().getAll() ?? [];
      let nearestMob: any = null;
      let nearestDist = 801;
      for (const mob of mobs) {
        if (mob.getHp() <= 0) continue;
        const dx = mob.getX() - summoned.getX();
        const dy = mob.getY() - summoned.getY();
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestMob = mob;
        }
      }

      if (!nearestMob) continue;

      summoned.lastUpdateTime = nowMs;

      // Build summoned attack packet (client-authoritative damage, we just send animation)
      const attack = new Attack(AttackHeaderType.SummonedAttack);
      attack.skillId = summoned.skillId;
      attack.slv = summoned.skillLevel;
      attack.actionAndDir = 0;

      const ai = new AttackInfo();
      ai.mobId = nearestMob.getId();
      ai.hitAction = 0;
      ai.damage[0] = 0; // client-authoritative, server doesn't calc damage
      attack.attackInfo.push(ai);
      attack.mask = 1 | (1 << 4);

      field.broadcastPacket(SummonedPacket.summonedAttack(owner, summoned, attack));
    }
  }
}

function isAttackingSummon(assistType: SummonedAssistType): boolean {
  return assistType === SummonedAssistType.ATTACK
    || assistType === SummonedAssistType.ATTACK_EX
    || assistType === SummonedAssistType.ATTACK_MANUAL
    || assistType === SummonedAssistType.ATTACK_COUNTER;
}
