import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { FieldEffectPacket } from '../../../src/world/field/FieldEffectPacket';

describe('world/field/FieldEffectPacket', () => {
  it('should encode screen effect', () => {
    const buf = FieldEffectPacket.screen('Effect/Direction1.img/effect/hello');
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(3); // Screen
    expect(r.readMapleAsciiString()).to.equal('Effect/Direction1.img/effect/hello');
  });

  it('should encode sound effect', () => {
    const buf = FieldEffectPacket.sound('Sound/Farm.img/levelUp');
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(4); // Sound
    expect(r.readMapleAsciiString()).to.equal('Sound/Farm.img/levelUp');
  });

  it('should encode changeBGM', () => {
    const buf = FieldEffectPacket.changeBGM('Bgm00/GoPicnic', false);
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(6); // ChangeBGM
    expect(r.readMapleAsciiString()).to.equal('Bgm00/GoPicnic');
    expect(r.readByte()).to.equal(0);
  });

  it('should encode tremble', () => {
    const buf = FieldEffectPacket.tremble(100, 500);
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(1); // Tremble
    expect(r.readInt()).to.equal(100);
    expect(r.readInt()).to.equal(500);
  });

  it('should encode objectState', () => {
    const buf = FieldEffectPacket.objectState('gate');
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(2); // Object
    expect(r.readMapleAsciiString()).to.equal('gate');
  });

  it('should encode mobHPTag', () => {
    const buf = FieldEffectPacket.mobHPTag(9300182, 0, 1, 100);
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(5); // MobHPTag
    expect(r.readInt()).to.equal(9300182);
    expect(r.readByte()).to.equal(0);
    expect(r.readInt()).to.equal(1);
    expect(r.readInt()).to.equal(100);
  });

  it('should encode summon', () => {
    const buf = FieldEffectPacket.summon(12345);
    const r = new PacketReader(buf);
    r.readShort(); // opcode
    expect(r.readByte()).to.equal(0); // Summon
    expect(r.readInt()).to.equal(12345);
  });
});
