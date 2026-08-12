import { User } from '../user/User';
import { Field } from '../field/Field';
import { Mob } from '../field/mob/Mob';
import { Summoned } from '../field/summoned/Summoned';

/**
 * Port of kinoko's Skill struct.
 * isSummonedSkill is deferred until summoned attack processing is ported.
 */
export class Skill {
  skillId = 0;
  slv = 0;

  positionX = 0;
  positionY = 0;
  delay = 0;

  /** default when nPartyID = 0 (CUserLocal::FindParty) -> Byte.MIN_VALUE = -128 */
  affectedMemberBitMap = -128;

  targetIds: number[] = [];

  captureTargetMobId = 0;
  randomCapturedMobId = 0;
  spiritJavelinItemId = 0;
  rockAndShockCount = 0;
  rockAndShock1 = 0;
  rockAndShock2 = 0;

  left = false;
  summonLeft = false;
  summonBuffType = 0;
  summoned: Summoned | null = null;

  // UserThrowGrenade
  keyDown = 0;

  getAffectedMemberCount(): number {
    if (this.affectedMemberBitMap === -128) return 1;
    return popcount(this.affectedMemberBitMap & 0xFF);
  }

  /**
   * Port of kinoko's Skill::forEachAffectedMember.
   * Iterates party members in the field whose bit is set in affectedMemberBitMap.
   */
  forEachAffectedMember(caster: User, field: Field, consumer: (member: User) => void): void {
    if (this.affectedMemberBitMap === -128) return;
    const partyId = caster.getPartyId();
    if (partyId === 0) return;
    for (const member of field.getUserPool().getAll()) {
      if (member.getPartyId() !== partyId) continue;
      const memberIndex = member.getPartyMemberIndex();
      if (memberIndex >= 0 && ((this.affectedMemberBitMap >> (memberIndex - 1)) & 1) !== 0) {
        consumer(member);
      }
    }
  }

  /** Port of Skill::forEachAffectedUser (Echo of Hero, GM Buffs). */
  forEachAffectedUser(field: Field, consumer: (user: User) => void): void {
    for (const characterId of this.targetIds) {
      const user = field.getUserPool().getById(characterId);
      if (user) consumer(user);
    }
  }

  /** Port of Skill::forEachAffectedMob. */
  forEachAffectedMob(field: Field, consumer: (mob: Mob) => void): void {
    for (const mobId of this.targetIds) {
      const mob = field.getMobPool().getById(mobId);
      if (mob) consumer(mob);
    }
  }
}

function popcount(n: number): number {
  let count = 0;
  while (n !== 0) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}
