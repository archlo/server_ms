import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';

// Port of kinoko's ContiMoveType (CField_ContiMove::OnPacket).
const CONTIMOVE_TYPE_WAIT = 1;
const CONTIMOVE_TYPE_START = 2;
const CONTIMOVE_TYPE_MOBGEN = 4;
const CONTIMOVE_TYPE_MOBDESTROY = 5;
const CONTIMOVE_TYPE_TARGET_MOVEFIELD = 10;

/** Port of kinoko's ContiMovePacket (CField_ContiMove::OnPacket / CShip). */
export class ContiMovePacket {
  static mobGen(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CONTIMOVE.code);
    w.writeByte(CONTIMOVE_TYPE_TARGET_MOVEFIELD);
    w.writeByte(CONTIMOVE_TYPE_MOBGEN);
    return w.getPacket();
  }

  static mobDestroy(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CONTIMOVE.code);
    w.writeByte(CONTIMOVE_TYPE_TARGET_MOVEFIELD);
    w.writeByte(CONTIMOVE_TYPE_MOBDESTROY);
    return w.getPacket();
  }

  static enterShipMove(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CONTISTATE.code);
    w.writeByte(CONTIMOVE_TYPE_WAIT);
    w.writeByte(0);
    return w.getPacket();
  }

  static leaveShipMove(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CONTISTATE.code);
    w.writeByte(CONTIMOVE_TYPE_START);
    w.writeByte(0);
    return w.getPacket();
  }
}
