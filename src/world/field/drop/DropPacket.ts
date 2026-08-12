import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { Drop } from './Drop';
import { DropEnterType } from './DropEnterType';
import { DropLeaveType } from './DropLeaveType';

/** Port of kinoko's CDropPool::OnPacket. */
export class DropPacket {
  static dropEnterField(drop: Drop, enterType: DropEnterType, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.DROP_ENTER_FIELD.code);
    w.writeByte(enterType);
    w.writeInt(drop.getId());
    w.writeBoolean(drop.isMoney());
    w.writeInt(drop.isMoney() ? drop.money : drop.item!.itemId);
    w.writeInt(drop.ownerId);
    w.writeByte(drop.ownType);
    w.writeShort(drop.getX());
    w.writeShort(drop.getY());
    w.writeInt(drop.isUserDrop() ? 0 : (drop.source?.getId() ?? 0));
    if (enterType !== DropEnterType.ON_THE_FOOTHOLD) {
      w.writeShort(drop.source?.getX() ?? 0);
      w.writeShort(drop.source?.getY() ?? 0);
      w.writeShort(delay);
    }
    if (!drop.isMoney()) {
      w.writeFT(drop.item!.dateExpire);
    }
    w.writeBoolean(!drop.isUserDrop()); // bByPet
    w.writeBoolean(false);
    return w.getPacket();
  }

  static dropLeaveField(drop: Drop, leaveType: DropLeaveType, pickUpId: number, petIndex: number, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.DROP_LEAVE_FIELD.code);
    w.writeByte(leaveType);
    w.writeInt(drop.getId());
    switch (leaveType) {
      case DropLeaveType.PICKED_UP_BY_USER:
      case DropLeaveType.PICKED_UP_BY_MOB:
      case DropLeaveType.PICKED_UP_BY_PET:
        w.writeInt(pickUpId);
        if (leaveType === DropLeaveType.PICKED_UP_BY_PET) {
          w.writeInt(petIndex);
        }
        break;
      case DropLeaveType.EXPLODE:
        w.writeShort(delay);
        break;
    }
    return w.getPacket();
  }
}
