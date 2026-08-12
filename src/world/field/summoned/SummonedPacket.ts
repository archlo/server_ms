import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { MovePath } from '../life/MovePath';
import { User } from '../../user/User';
import { Summoned } from './Summoned';
import { HitInfo } from '../../skill/HitInfo';
import { Attack } from '../../skill/Attack';

const MECHANIC_ROCK_N_SHOCK = 35111002;

export class SummonedPacket {
  static summonedEnterField(user: User, summoned: Summoned): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUMMONED_ENTER_FIELD.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(summoned.getId());
    w.writeInt(summoned.skillId);
    w.writeByte(user.getLevel());
    w.writeByte(summoned.skillLevel);
    w.writeShort(summoned.getX());
    w.writeShort(summoned.getY());
    w.writeByte(summoned.getMoveAction());
    w.writeShort(summoned.getFoothold());
    w.writeByte(summoned.moveAbility);
    w.writeByte(summoned.assistType);
    w.writeByte(summoned.enterType);
    w.writeBoolean(summoned.avatarLook !== null);
    if (summoned.avatarLook) {
      summoned.avatarLook.encode(w);
    }
    if (summoned.skillId === MECHANIC_ROCK_N_SHOCK) {
      w.writeByte(summoned.teslaCoilState);
      if (summoned.teslaCoilState === 1) {
        for (const rockAndShock of user.getSummonedBySkill(MECHANIC_ROCK_N_SHOCK)) {
          w.writeShort(rockAndShock.getX());
          w.writeShort(rockAndShock.getY());
        }
      }
    }
    return w.getPacket();
  }

  static summonedLeaveField(user: User, summoned: Summoned): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUMMONED_LEAVE_FIELD.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(summoned.getId());
    w.writeByte(summoned.leaveType);
    return w.getPacket();
  }

  static summonedMove(user: User, summoned: Summoned, movePath: MovePath): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUMMONED_MOVE.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(summoned.getId());
    movePath.encode(w);
    return w.getPacket();
  }

  static summonedAttack(user: User, summoned: Summoned, attack: Attack): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUMMONED_ATTACK.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(summoned.getId());
    w.writeByte(user.getLevel());
    w.writeByte(attack.actionAndDir);
    w.writeByte(attack.attackInfo.length);
    for (const ai of attack.attackInfo) {
      w.writeInt(ai.mobId);
      w.writeByte(ai.hitAction);
      w.writeInt(ai.damage[0]);
    }
    w.writeByte(0);
    return w.getPacket();
  }

  static summonedHit(user: User, summoned: Summoned, hitInfo: HitInfo): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUMMONED_HIT.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(summoned.getId());
    w.writeByte(hitInfo.attackIndex);
    w.writeInt(hitInfo.damage);
    if (hitInfo.attackIndex > -2) {
      w.writeInt(hitInfo.templateId);
      w.writeByte(hitInfo.dir);
    }
    return w.getPacket();
  }

  static summonedSkill(user: User, summoned: Summoned, actionAndDir: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUMMONED_SKILL.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(summoned.getId());
    w.writeByte(actionAndDir);
    return w.getPacket();
  }
}
