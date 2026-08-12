import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { Reactor } from './Reactor';

/** Port of kinoko's CReactorPool::OnPacket. */
export class ReactorPacket {
  static reactorEnterField(reactor: Reactor): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.REACTOR_ENTER_FIELD.code);
    w.writeInt(reactor.getId());
    w.writeInt(reactor.getTemplateId());
    w.writeByte(reactor.getState());
    w.writeShort(reactor.getX());
    w.writeShort(reactor.getY());
    w.writeBoolean(reactor.isFlip());
    w.writeMapleAsciiString(reactor.getName());
    return w.getPacket();
  }

  static reactorLeaveField(reactor: Reactor): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.REACTOR_LEAVE_FIELD.code);
    w.writeInt(reactor.getId());
    w.writeByte(reactor.getState());
    w.writeShort(reactor.getX());
    w.writeShort(reactor.getY());
    return w.getPacket();
  }

  static reactorChangeState(reactor: Reactor, delay: number, eventIndex: number, endDelay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.REACTOR_CHANGE_STATE.code);
    w.writeInt(reactor.getId());
    w.writeByte(reactor.getState());
    w.writeShort(reactor.getX());
    w.writeShort(reactor.getY());
    w.writeShort(delay);
    w.writeByte(eventIndex);
    w.writeByte(endDelay);
    return w.getPacket();
  }
}
