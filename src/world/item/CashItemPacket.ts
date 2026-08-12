import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';

export class CashItemPacket {
  static blowWeather(itemId: number, message?: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.BLOW_WEATHER.code);
    w.writeInt(itemId);
    w.writeMapleAsciiString(message ?? '');
    return w.getPacket();
  }

  static setActiveEffectItem(charId: number, itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SET_ACTIVE_EFFECT_ITEM.code);
    w.writeInt(charId);
    w.writeInt(itemId);
    return w.getPacket();
  }
}
