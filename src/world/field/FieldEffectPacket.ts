import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';

enum FieldEffectType {
  Summon = 0,
  Tremble = 1,
  Object = 2,
  Screen = 3,
  Sound = 4,
  MobHPTag = 5,
  ChangeBGM = 6,
}

/** Port of kinoko's FieldEffectPacket (CField::OnFieldEffect). */
export class FieldEffectPacket {
  static screen(name: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.Screen);
    w.writeMapleAsciiString(name);
    return w.getPacket();
  }

  static sound(name: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.Sound);
    w.writeMapleAsciiString(name);
    return w.getPacket();
  }

  static changeBGM(bgmPath: string, fade: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.ChangeBGM);
    w.writeMapleAsciiString(bgmPath);
    w.writeByte(fade ? 1 : 0);
    return w.getPacket();
  }

  static tremble(delay: number, time: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.Tremble);
    w.writeInt(delay);
    w.writeInt(time);
    return w.getPacket();
  }

  static objectState(state: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.Object);
    w.writeMapleAsciiString(state);
    return w.getPacket();
  }

  static mobHPTag(mobTemplateId: number, hpColor: number, hpBgColor: number, hpGauge: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.MobHPTag);
    w.writeInt(mobTemplateId);
    w.writeByte(hpColor);
    w.writeInt(hpBgColor);
    w.writeInt(hpGauge);
    return w.getPacket();
  }

  static summon(objectId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIELD_EFFECT.code);
    w.writeByte(FieldEffectType.Summon);
    w.writeInt(objectId);
    return w.getPacket();
  }
}
