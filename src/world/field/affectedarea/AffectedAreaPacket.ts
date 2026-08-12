import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { AffectedArea } from './AffectedArea';

export class AffectedAreaPacket {
  static affectedAreaCreated(affectedArea: AffectedArea): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.AFFECTED_AREA_CREATED.code);
    affectedArea.encode(w);
    return w.getPacket();
  }

  static affectedAreaRemoved(affectedArea: AffectedArea): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.AFFECTED_AREA_REMOVED.code);
    w.writeInt(affectedArea.getId());
    return w.getPacket();
  }
}
