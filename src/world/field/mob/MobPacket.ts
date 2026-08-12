import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { Mob, MobStat } from './Mob';
import { MobLeaveType } from './MobLeaveType';
import { MobAttackInfo } from './MobAttackInfo';
import { MovePath } from '../life/MovePath';
import { MobSkill } from '../../../provider/mob/MobSkill';
import { BitFlag } from '../../../util/BitFlag';
import { MobTemporaryStat } from './MobTemporaryStat';

/** Port of kinoko's CMobPool::OnPacket / OnMobPacket. */
export class MobPacket {
  /** v95 format: inline position/HP/fields — matches client FieldHandlers.handleMobEnter */
  static mobEnterField(mob: Mob): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_ENTER_FIELD.code);
    w.writeInt(mob.getId());
    w.writeByte(0); // bSummoned
    w.writeInt(mob.getTemplateId());
    w.writeByte(mob.getMoveAction());
    w.writeByte(mob.hasController() ? 1 : 0);
    w.writeShort(0); // usCtrlSN
    w.writeInt(0);   // dwMobStatFlag (32-bit, no stats)
    w.writeShort(mob.getX());
    w.writeShort(mob.getY());
    w.writeShort(mob.getFoothold());
    w.writeShort(0); // rx0
    w.writeShort(0); // rx1
    w.writeByte(mob.summonType);
    if (mob.summonType === -3 || mob.summonType >= 0) w.writeInt(0);
    w.writeInt(mob.getMaxHp());
    w.writeInt(mob.getHp());
    w.writeByte(0); // team
    w.writeByte(0); // bEffect
    w.writeByte(mob.isBoss() ? 1 : 0);
    return w.getPacket();
  }

  static mobLeaveField(mob: Mob, leaveType: MobLeaveType): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_LEAVE_FIELD.code);
    w.writeInt(mob.getId());
    w.writeByte(leaveType);
    if (leaveType === MobLeaveType.SWALLOW) {
      w.writeInt(mob.getSwallowCharacterId());
    }
    return w.getPacket();
  }

  static mobChangeController(mob: Mob, forController: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_CHANGE_CONTROLLER.code);
    w.writeBoolean(forController);
    w.writeInt(mob.getId());
    if (forController) {
      w.writeByte(1); // nCalcDamageIndex
      w.writeInt(mob.getTemplateId());
      mob.getMobStat().encodeTemporary(w);
      mob.encode(w);
    }
    return w.getPacket();
  }

  static mobMove(mob: Mob, mai: MobAttackInfo, movePath: MovePath): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_MOVE.code);
    w.writeInt(mob.getId());
    w.writeBoolean(false); // bNotForceLandingWhenDiscard
    w.writeBoolean(false); // bNotChangeAction
    w.writeByte(mai.actionMask);
    w.writeByte(mai.actionAndDir);
    w.writeInt(mai.targetInfo);
    w.writeInt(mai.multiTargetForBall.length);
    for (const [x, y] of mai.multiTargetForBall) {
      w.writeInt(x);
      w.writeInt(y);
    }
    w.writeInt(mai.randTimeForAreaAttack.length);
    for (const value of mai.randTimeForAreaAttack) {
      w.writeInt(value);
    }
    movePath.encode(w);
    return w.getPacket();
  }

  static mobCtrlAck(mob: Mob, mobCtrlSn: number, nextAttackPossible: boolean, mobSkill: MobSkill | null): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_CTRL_ACK.code);
    w.writeInt(mob.getId());
    w.writeShort(mobCtrlSn);
    w.writeBoolean(nextAttackPossible);
    w.writeShort(mob.getMp());
    w.writeByte(mobSkill !== null ? mobSkill.skillId : 0);
    w.writeByte(mobSkill !== null ? mobSkill.skillLevel : 0);
    return w.getPacket();
  }

  static mobStatSet(mob: Mob, mobStat: MobStat, flag: BitFlag, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_STAT_SET.code);
    w.writeInt(mob.getId());
    mobStat.encodeTemporaryWithFlag(flag, w);
    w.writeShort(delay);
    w.writeBoolean(true);  // nCalcDamageStatIndex
    w.writeByte(0);        // bStat || bDoomReservedSN
    return w.getPacket();
  }

  static mobStatReset(mob: Mob, flag: BitFlag): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_STAT_RESET.code);
    w.writeInt(mob.getId());
    flag.encode(w);
    if (flag.has(MobTemporaryStat.Burned)) {
      w.writeInt(0); // resetBurnedInfos count (not ported)
    }
    w.writeBoolean(true); // nCalcDamageStatIndex
    w.writeByte(0);       // bStat
    return w.getPacket();
  }

  static mobAffected(mob: Mob, skillId: number, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_AFFECTED.code);
    w.writeInt(mob.getId());
    w.writeInt(skillId);
    w.writeShort(delay);
    return w.getPacket();
  }

  static mobDamaged(mob: Mob, damage: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_DAMAGED.code);
    w.writeInt(mob.getId());
    w.writeByte(0);
    w.writeInt(damage);
    if (mob.isDamagedByMob()) {
      w.writeInt(mob.getHp());
      w.writeInt(mob.getMaxHp());
    }
    return w.getPacket();
  }

  static mobSpecialEffectBySkill(mob: Mob, skillId: number, characterId: number, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_SPECIAL_EFFECT_BY_SKILL.code);
    w.writeInt(mob.getId());
    w.writeInt(skillId);
    w.writeInt(characterId);
    w.writeShort(delay);
    return w.getPacket();
  }

  static mobHpIndicator(mob: Mob, percentage: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_HP_INDICATOR.code);
    w.writeInt(mob.getId());
    w.writeByte(percentage);
    return w.getPacket();
  }

  static mobCatchEffect(mob: Mob, success: boolean, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_CATCH_EFFECT.code);
    w.writeInt(mob.getId());
    w.writeBoolean(success);
    w.writeByte(delay);
    return w.getPacket();
  }

  static mobEffectByItem(mob: Mob, itemId: number, success: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_EFFECT_BY_ITEM.code);
    w.writeInt(mob.getId());
    w.writeInt(itemId);
    w.writeBoolean(success);
    return w.getPacket();
  }

  static mobNextAttack(mob: Mob): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MOB_NEXT_ATTACK.code);
    w.writeInt(mob.getId());
    w.writeInt(0);
    return w.getPacket();
  }
}
