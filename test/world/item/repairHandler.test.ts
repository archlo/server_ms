import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { RepairHandler } from '../../../src/world/item/RepairHandler';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { EquipData } from '../../../src/world/item/EquipData';

describe('world/item/RepairHandler.ts', () => {
  describe('handleUserRepairDurabilityAll', () => {
    it('should repair all equipped items and deduct mesos', () => {
      const equip1 = new Item(ItemType.EQUIP);
      equip1.itemId = 1302000;
      equip1.equipData = new EquipData();
      equip1.equipData.durability = 50;

      const equip2 = new Item(ItemType.EQUIP);
      equip2.itemId = 1402000;
      equip2.equipData = new EquipData();
      equip2.equipData.durability = 75;
      equip2.equipData.incPad = 10;

      const im = new InventoryManager();
      im.equipInventory.putItem(1, equip1);
      im.equipInventory.putItem(2, equip2);
      im.addMoney(1000000);

      const writes: Buffer[] = [];
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (p: Buffer): void => { writes.push(p); },
        dispose: (): void => {},
      };

      const w = new PacketWriter();
      w.writeInt(2010000); // npcId
      RepairHandler.handleUserRepairDurabilityAll(user, new PacketReader(w.getPacket()));

      expect(equip1.equipData.durability).to.equal(100);
      expect(equip2.equipData.durability).to.equal(100);
      expect(writes.length).to.be.greaterThan(0);
    });

    it('should dispose when hp <= 0', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 0,
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(0);
      RepairHandler.handleUserRepairDurabilityAll(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });

  describe('handleUserRepairDurability', () => {
    it('should repair single equipped item', () => {
      const equip = new Item(ItemType.EQUIP);
      equip.itemId = 1302000;
      equip.equipData = new EquipData();
      equip.equipData.durability = 30;

      const im = new InventoryManager();
      im.equipInventory.putItem(5, equip);
      im.addMoney(500000);

      const writes: Buffer[] = [];
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (p: Buffer): void => { writes.push(p); },
        dispose: (): void => {},
      };

      const w = new PacketWriter();
      w.writeShort(5); // position
      w.writeInt(2010000); // npcId
      RepairHandler.handleUserRepairDurability(user, new PacketReader(w.getPacket()));

      expect(equip.equipData.durability).to.equal(100);
    });

    it('should dispose when hp <= 0', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 0,
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeShort(1); w.writeInt(0);
      RepairHandler.handleUserRepairDurability(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });
});
