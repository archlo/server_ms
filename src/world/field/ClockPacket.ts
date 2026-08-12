import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';

/** Port of kinoko's ClockPacket — timer display on the client HUD. */
export class ClockPacket {
  /** Timer counting down from `seconds`. */
  static timeClock(seconds: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CLOCK.code);
    w.writeByte(1); // TimeClock
    w.writeInt(seconds);
    return w.getPacket();
  }

  /** Timer that counts up from the server's current time for `seconds` duration. */
  static timer(seconds: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CLOCK.code);
    w.writeByte(2); // Timer
    w.writeInt(seconds);
    return w.getPacket();
  }

  /** Removes any active clock from the HUD. */
  static destroyClock(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.DESTROY_CLOCK.code);
    return w.getPacket();
  }
}
