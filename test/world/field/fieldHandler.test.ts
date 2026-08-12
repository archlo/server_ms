import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { FieldHandler } from '../../../src/world/field/FieldHandler';

describe('world/field/FieldHandler.ts', () => {
  describe('handleInvitePartyMatch', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeByte(0); w.writeByte(0); w.writeInt(0);
      FieldHandler.handleInvitePartyMatch({} as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleRequestFootholdInfo', () => {
    it('should not crash (no-op)', () => {
      const w = new PacketWriter(); w.writeInt(0); w.writeByte(0);
      FieldHandler.handleRequestFootholdInfo({} as any, new PacketReader(w.getPacket()));
    });
  });
});
