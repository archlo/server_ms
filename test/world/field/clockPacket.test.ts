import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { ClockPacket } from '../../../src/world/field/ClockPacket';

describe('world/field/ClockPacket', () => {
  it('should encode timeClock', () => {
    const buf = ClockPacket.timeClock(300);
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(1); // TimeClock
    expect(r.readInt()).to.equal(300);
  });

  it('should encode timer', () => {
    const buf = ClockPacket.timer(60);
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(2); // Timer
    expect(r.readInt()).to.equal(60);
  });

  it('should encode destroyClock', () => {
    const buf = ClockPacket.destroyClock();
    const r = new PacketReader(buf);
    expect(r.readShort()).to.equal(170); // DESTROY_CLOCK opcode
  });
});
