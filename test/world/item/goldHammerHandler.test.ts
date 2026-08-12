import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { GoldHammerHandler } from '../../../src/world/item/GoldHammerHandler';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { EquipData } from '../../../src/world/item/EquipData';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';

describe('world/item/GoldHammerHandler.ts', () => {
  const GOLD_HAMMER_ID = 2470000;

  function makeEquip(cuc = 0, iuc = 0): Item {
    const e = new Item(ItemType.EQUIP);
    e.itemId = 1000000;
    e.itemSn = 100n;
    e.equipData = new EquipData();
    e.equipData.cuc = cuc;
    e.equipData.iuc = iuc;
    e.equipData.ruc = 7;
    return e;
  }

  function goldHammerPacket(pos: number, itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(pos);
    w.writeInt(itemId);
    return w.getPacket();
  }

  describe('handleGoldHammerRequest', () => {
    it('should return success when equip can be hammered', () => {
      const equip = makeEquip(0, 0);
      const im = new InventoryManager();
      im.equipInventory.putItem(1, equip);

      const writes: Buffer[] = [];
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (p: Buffer): void => { writes.push(p); },
        dispose: (): void => {},
      };

      GoldHammerHandler.handleGoldHammerRequest(user, new PacketReader(goldHammerPacket(1, 1000000)));
      expect(writes.length).to.equal(1);
      expect(writes[0].readInt16LE(0)).to.equal(MapleSendOpcode.GOLD_HAMMER_RESULT.code);
      expect(writes[0].readUInt8(2)).to.equal(1); // success = true
    });

    it('should return failure when cuc + iuc >= 10', () => {
      const equip = makeEquip(10, 0);
      const im = new InventoryManager();
      im.equipInventory.putItem(1, equip);

      const writes: Buffer[] = [];
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (p: Buffer): void => { writes.push(p); },
        dispose: (): void => {},
      };

      GoldHammerHandler.handleGoldHammerRequest(user, new PacketReader(goldHammerPacket(1, 1000000)));
      expect(writes.length).to.equal(1);
      expect(writes[0].readUInt8(2)).to.equal(0); // success = false
    });

    it('should return failure when equip not found', () => {
      const im = new InventoryManager();
      const writes: Buffer[] = [];
      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (p: Buffer): void => { writes.push(p); },
        dispose: (): void => { disposed++; },
      };

      GoldHammerHandler.handleGoldHammerRequest(user, new PacketReader(goldHammerPacket(99, 1000000)));
      expect(disposed).to.equal(1);
      expect(writes.length).to.equal(1);
      expect(writes[0].readUInt8(2)).to.equal(0);
    });
  });

  describe('handleGoldHammerComplete', () => {
    it('should increment iuc and ruc when valid', () => {
      const equip = makeEquip(3, 0);
      equip.equipData!.ruc = 5;

      const hammer = new Item(ItemType.BUNDLE);
      hammer.itemId = GOLD_HAMMER_ID;
      hammer.quantity = 1;

      const im = new InventoryManager();
      im.equipInventory.putItem(1, equip);
      im.cashInventory.putItem(5, hammer);

      const writes: Buffer[] = [];
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (p: Buffer): void => { writes.push(p); },
        dispose: (): void => {},
      };

      GoldHammerHandler.handleGoldHammerComplete(user, new PacketReader(goldHammerPacket(1, 1000000)));
      expect(equip.equipData!.iuc).to.equal(1);
      expect(equip.equipData!.ruc).to.equal(6);
      expect(writes.length).to.equal(2);
    });

    it('should consume hammer from consume inventory when not in cash', () => {
      const equip = makeEquip(0, 0);
      const hammer = new Item(ItemType.BUNDLE);
      hammer.itemId = GOLD_HAMMER_ID;
      hammer.quantity = 1;

      const im = new InventoryManager();
      im.equipInventory.putItem(1, equip);
      im.consumeInventory.putItem(5, hammer);

      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (): void => {},
        dispose: (): void => {},
      };

      GoldHammerHandler.handleGoldHammerComplete(user, new PacketReader(goldHammerPacket(1, 1000000)));
      expect(equip.equipData!.iuc).to.equal(1);
      expect(im.consumeInventory.getItem(5)).to.equal(undefined);
    });

    it('should dispose when equip not found', () => {
      const im = new InventoryManager();
      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      GoldHammerHandler.handleGoldHammerComplete(user, new PacketReader(goldHammerPacket(99, 1000000)));
      expect(disposed).to.equal(1);
    });

    it('should dispose when hammer not in inventory', () => {
      const equip = makeEquip(0, 0);
      const im = new InventoryManager();
      im.equipInventory.putItem(1, equip);

      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      GoldHammerHandler.handleGoldHammerComplete(user, new PacketReader(goldHammerPacket(1, 1000000)));
      expect(disposed).to.equal(1);
    });

    it('should dispose when hp <= 0', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 0,
        dispose: (): void => { disposed++; },
      };

      GoldHammerHandler.handleGoldHammerComplete(user, new PacketReader(goldHammerPacket(1, 1000000)));
      expect(disposed).to.equal(1);
    });
  });
});
