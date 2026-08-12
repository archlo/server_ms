import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User } from './User';
import { GuildInfo } from './GuildInfo';
import { MovePath } from '../field/life/MovePath';
import { Effect } from './effect/Effect';
import { CharacterTemporaryStat } from './stat/CharacterTemporaryStat';
import { Attack, AttackHeaderType } from '../skill/Attack';
import { HitInfo } from '../skill/HitInfo';
import { Skill } from '../skill/Skill';
import { CoupleRecord } from './data/CoupleRecord';

const ACTION_TYPE_NO = 0x111;
const STRAFE_MM = 3211006; // Bowman.STRAFE_MM
const MESO_EXPLOSION = 4211006; // Thief.MESO_EXPLOSION
const JAGUAR_OSHI_ATTACK = 33101007; // WildHunter.JAGUAR_OSHI_ATTACK
const MAGIC_KEYDOWN_SKILLS = new Set([2121001, 2221001, 2321001, 22121000, 22151001]); // SkillConstants.isMagicKeydownSkill

const ATTACK_OPCODE_BY_HEADER: Record<AttackHeaderType, MapleSendOpcode> = {
  [AttackHeaderType.UserMeleeAttack]: MapleSendOpcode.USER_MELEE_ATTACK,
  [AttackHeaderType.UserShootAttack]: MapleSendOpcode.USER_SHOOT_ATTACK,
  [AttackHeaderType.UserMagicAttack]: MapleSendOpcode.USER_MAGIC_ATTACK,
  [AttackHeaderType.UserBodyAttack]: MapleSendOpcode.USER_BODY_ATTACK,
  [AttackHeaderType.SummonedAttack]: MapleSendOpcode.SUMMONED_ATTACK,
};

/**
 * Port of kinoko's UserRemote (CUserPool::OnUserRemotePacket).
 * attack/hit/skillPrepare/skillCancel/throwGrenade/movingShootAttackPrepare
 * are deferred to the AttackHandler/HitHandler/SkillHandler ports.
 * temporaryStatSet/temporaryStatReset are already implemented inline in User.ts.
 * CoupleRecord is encoded as empty/default (no wedding ring active).
 */
export class UserRemote {
  /** Port of kinoko's UserRemote::attack (CUserPool::OnUserRemotePacket / Attack). */
  static attack(user: User, attack: Attack): Buffer {
    const w = new PacketWriter();
    w.writeShort(ATTACK_OPCODE_BY_HEADER[attack.headerType].code);
    w.writeInt(user.getCharacterId());
    w.writeByte(attack.mask); // nDamagePerMob | (16 * nMobCount)
    w.writeByte(user.getLevel()); // nLevel
    w.writeByte(attack.slv);
    if (attack.slv !== 0) {
      w.writeInt(attack.skillId);
    }
    if (attack.skillId === STRAFE_MM) {
      w.writeByte(attack.passiveSlv);
      if (attack.passiveSlv !== 0) {
        w.writeInt(attack.passiveSkillId);
      }
    }
    w.writeByte(attack.flag);
    w.writeShort(attack.actionAndDir);
    if (attack.getAction() < ACTION_TYPE_NO) {
      w.writeByte(attack.attackSpeed);
      w.writeByte(attack.mastery);
      w.writeInt(attack.bulletItemId);
      for (const ai of attack.attackInfo) {
        w.writeInt(ai.mobId);
        if (ai.mobId === 0) {
          continue;
        }
        w.writeByte(ai.actionAndDir);
        if (attack.skillId === MESO_EXPLOSION) {
          w.writeByte(ai.attackCount);
          for (let i = 0; i < ai.attackCount; i++) {
            w.writeInt(ai.damage[i]);
          }
        } else if (attack.getDamagePerMob() > 0) {
          for (let i = 0; i < attack.getDamagePerMob(); i++) {
            w.writeByte(ai.critical[i]);
            w.writeInt(ai.damage[i]);
          }
        }
      }
      if (attack.isShootAttack()) {
        w.writeShort(attack.ballStartX);
        w.writeShort(attack.ballStartY);
      }
      if (MAGIC_KEYDOWN_SKILLS.has(attack.skillId)) {
        w.writeInt(attack.keyDown);
      } else if (attack.skillId === JAGUAR_OSHI_ATTACK) {
        w.writeInt(attack.swallowMobTemplateId);
      }
    }
    return w.getPacket();
  }

  /** Port of kinoko's UserRemote::hit. */
  static hit(user: User, hitInfo: HitInfo): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_HIT.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(hitInfo.attackIndex);
    w.writeInt(hitInfo.damage);
    if (hitInfo.attackIndex > -2) {
      w.writeInt(hitInfo.templateId);
      w.writeByte(hitInfo.dir);
      w.writeByte(hitInfo.reflect);
      if (hitInfo.reflect !== 0) {
        w.writeByte(hitInfo.powerGuard);
        w.writeInt(hitInfo.reflectMobId);
        w.writeByte(hitInfo.reflectMobAction);
        w.writeShort(hitInfo.reflectMobX);
        w.writeShort(hitInfo.reflectMobY);
      }
      w.writeByte(hitInfo.guard);
      w.writeByte(hitInfo.stance);
    }
    w.writeInt(hitInfo.finalDamage);
    if (hitInfo.damage === -1) {
      w.writeInt(hitInfo.missSkillId);
    }
    return w.getPacket();
  }

  /** Port of kinoko's UserRemote::skillPrepare. */
  static skillPrepare(user: User, skillId: number, slv: number, actionAndDir: number, attackSpeed: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SKILL_PREPARE.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(skillId);
    w.writeByte(slv);
    w.writeShort(actionAndDir);
    w.writeByte(attackSpeed);
    return w.getPacket();
  }

  /** Port of kinoko's UserRemote::movingShootAttackPrepare. */
  static movingShootAttackPrepare(user: User, skillId: number, slv: number, actionAndDir: number, attackSpeed: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_MOVING_SHOOT_ATTACK_PREPARE.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(user.getLevel());
    w.writeByte(slv);
    if (slv !== 0) {
      w.writeInt(skillId);
    }
    w.writeShort(actionAndDir);
    w.writeByte(attackSpeed);
    return w.getPacket();
  }

  /** Port of kinoko's UserRemote::skillCancel. */
  static skillCancel(user: User, skillId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SKILL_CANCEL.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(skillId);
    return w.getPacket();
  }

  /** Port of kinoko's UserRemote::throwGrenade. */
  static throwGrenade(user: User, skill: Skill): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_THROW_GRENADE.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(skill.positionX);
    w.writeInt(skill.positionY);
    w.writeInt(skill.keyDown);
    w.writeInt(skill.skillId);
    w.writeInt(skill.slv);
    return w.getPacket();
  }

  static move(user: User, movePath: MovePath): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_MOVE.code);
    w.writeInt(user.getCharacterId());
    movePath.encode(w);
    return w.getPacket();
  }

  static emotion(user: User, emotion: number, duration: number, isByItemOption: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_EMOTION.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(emotion);
    w.writeInt(duration);
    w.writeBoolean(isByItemOption);
    return w.getPacket();
  }

  static setActiveEffectItem(user: User, itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SET_ACTIVE_EFFECT_ITEM.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(itemId);
    return w.getPacket();
  }

  static showUpgradeTombEffect(user: User, itemId: number, x: number, y: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SHOW_UPGRADE_TOMB_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(itemId);
    w.writeInt(x);
    w.writeInt(y);
    return w.getPacket();
  }

  static setActivePortableChair(user: User, itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SET_ACTIVE_PORTABLE_CHAIR.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(itemId);
    return w.getPacket();
  }

  static avatarModified(user: User): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_AVATAR_MODIFIED.code);
    w.writeInt(user.getCharacterId());
    w.writeUByte(0xFF); // flag: AVATAR_LOOK = 0x1, AVATAR_SPEED = 0x2, AVATAR_CHOCO = 0x4
    user.getAvatarLook().encode(w);
    w.writeByte(user.getSecondaryStat().getOption(CharacterTemporaryStat.Speed).nOption);
    w.writeByte(0); // nCount
    // CoupleRecord
    const coupleRecord = user.getCoupleRecord();
    w.writeBoolean(coupleRecord.coupleId !== 0);
    if (coupleRecord.coupleId !== 0) {
      coupleRecord.encodeForLocal(w, true);
    }
    w.writeInt(0); // nCompletedSetItemID
    return w.getPacket();
  }

  static effect(user: User, effect: Effect): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_EFFECT_REMOTE.code);
    w.writeInt(user.getCharacterId());
    effect.encode(w);
    return w.getPacket();
  }

  static receiveHp(user: User): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_HP.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(user.getHp());
    w.writeInt(user.getMaxHp());
    return w.getPacket();
  }

  static guildNameChanged(user: User, guildInfo: GuildInfo | null): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_GUILD_NAME_CHANGED.code);
    w.writeInt(user.getCharacterId());
    w.writeMapleAsciiString(guildInfo ? guildInfo.guildName : '');
    return w.getPacket();
  }

  static guildMarkChanged(user: User, guildInfo: GuildInfo | null): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_GUILD_MARK_CHANGED.code);
    w.writeInt(user.getCharacterId());
    w.writeShort(guildInfo ? guildInfo.markBg : 0);
    w.writeByte(guildInfo ? guildInfo.markBgColor : 0);
    w.writeShort(guildInfo ? guildInfo.mark : 0);
    w.writeByte(guildInfo ? guildInfo.markColor : 0);
    return w.getPacket();
  }
}
