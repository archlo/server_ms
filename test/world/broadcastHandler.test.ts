import { expect } from 'chai';
import { PacketReader } from '../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../src/protocol/packets/packetWriter';
import { BroadcastHandler } from '../../src/world/BroadcastHandler';

describe('world/BroadcastHandler.ts', () => {
  describe('handleBroadcastMsg', () => {
    it('should dispose when message is empty', () => {
      let disposed = 0;
      const user: any = {
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeByte(0);
      w.writeMapleAsciiString('');
      BroadcastHandler.handleBroadcastMsg(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });
});
