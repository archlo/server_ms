import { expect } from 'chai';
import { CenterSendOpcode } from '../../../src/protocol/opcodes/center/send';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { CenterPackets } from '../../../src/server/center/centerPackets';
import { Config } from '../../../src/util/config';
import { CenterServer } from '../../../src/server/center/centerServer';

describe('server/shop/cashShop', () => {

  describe('CenterPackets.getCashShopMigrateAck', () => {
    it('should build a success ack with host and port', () => {
      const buf = CenterPackets.getCashShopMigrateAck(42, true, '127.0.0.1', 8485);
      const r = new PacketReader(buf);
      expect(r.readShort()).to.equal(CenterSendOpcode.CASH_SHOP_MIGRATE_ACK.getValue());
      expect(r.readInt()).to.equal(42);
      expect(r.readBoolean()).to.equal(true);
      expect(r.readMapleAsciiString()).to.equal('127.0.0.1');
      expect(r.readInt()).to.equal(8485);
    });

    it('should build a failure ack (without host/port)', () => {
      const buf = CenterPackets.getCashShopMigrateAck(42, false, '', 0);
      const r = new PacketReader(buf);
      expect(r.readShort()).to.equal(CenterSendOpcode.CASH_SHOP_MIGRATE_ACK.getValue());
      expect(r.readInt()).to.equal(42);
      expect(r.readBoolean()).to.equal(false);
      // Failure ack has no host/port; only 7 meaningful bytes written
    });
  });

  describe('CashShopMigrateHandler', () => {
    let centerWrites: Buffer[];

    beforeEach(() => {
      centerWrites = [];
      (CenterServer as any).instance = {
        shopServerSessionId: 99,
        logger: { info: (...args: any[]) => {}, warn: (...args: any[]) => {}, error: (...args: any[]) => {}, debug: (...args: any[]) => {} },
      };
    });

    it('should respond with shop host and port on success', async () => {
      const { CashShopMigrateHandler } = await import('../../../src/server/center/handlers/cashShopMigrateHandler');
      const handler = new CashShopMigrateHandler();

      const mockSession = {
        id: 1,
        socket: { write: (buf: Buffer) => { centerWrites.push(buf); } },
      };

      const w = new PacketWriter();
      w.writeInt(42);  // channelSessionId
      w.writeInt(1001); // accountId
      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(centerWrites.length).to.equal(1);
      const r = new PacketReader(centerWrites[0]);
      expect(r.readShort()).to.equal(CenterSendOpcode.CASH_SHOP_MIGRATE_ACK.getValue());
      expect(r.readInt()).to.equal(42);
      expect(r.readBoolean()).to.equal(true);
      expect(r.readMapleAsciiString()).to.equal(Config.instance.shop.host);
    });

    it('should return failure when no shop server registered', async () => {
      (CenterServer as any).instance.shopServerSessionId = undefined;

      const { CashShopMigrateHandler } = await import('../../../src/server/center/handlers/cashShopMigrateHandler');
      const handler = new CashShopMigrateHandler();

      const mockSession = {
        id: 1,
        socket: { write: (buf: Buffer) => { centerWrites.push(buf); } },
      };

      const w = new PacketWriter();
      w.writeInt(42);
      w.writeInt(1001);
      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(centerWrites.length).to.equal(1);
      const r = new PacketReader(centerWrites[0]);
      expect(r.readShort()).to.equal(CenterSendOpcode.CASH_SHOP_MIGRATE_ACK.getValue());
      expect(r.readBoolean()).to.equal(false);
    });
  });
});
