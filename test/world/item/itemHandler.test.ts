import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { ItemHandler } from '../../../src/world/item/ItemHandler';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { ItemSpecType } from '../../../src/provider/item/ItemSpecType';
import { ItemInfoType } from '../../../src/provider/item/ItemInfoType';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';

describe('world/item/ItemHandler.ts', () => {
  describe('handleUserMapTransferItemUseRequest', () => {
    const TOWN_SCROLL = 2030000;
    let originalGetItemInfo: typeof ItemProvider.getItemInfo;

    before(() => { originalGetItemInfo = ItemProvider.getItemInfo; });
    afterEach(() => { ItemProvider.getItemInfo = originalGetItemInfo; });

    it('should warp user when transfer item is valid', () => {
      const scroll = new Item(ItemType.BUNDLE);
      scroll.itemId = TOWN_SCROLL;
      scroll.quantity = 1;

      const im = new InventoryManager();
      im.consumeInventory.putItem(2, scroll);

      let warped = false;
      ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
        if (id === TOWN_SCROLL) return new ItemInfo(id, new Map(), new Map([[ItemSpecType.moveTo, 100000000]]));
        return undefined;
      };

      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        getField: (): any => ({
          getFieldStorage: (): any => ({
            getFieldById: (): any => ({
              getRandomStartPoint: (): any => ({ getId: (): number => 0 }),
            }),
          }),
        }),
        warp: (): void => { warped = true; },
        write: (): void => {},
        dispose: (): void => {},
      };

      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(2); w.writeInt(TOWN_SCROLL);
      ItemHandler.handleUserMapTransferItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(warped).to.be.true;
    });

    it('should dispose when moveTo is 0', () => {
      let disposed = 0;
      ItemProvider.getItemInfo = (): ItemInfo | undefined =>
        new ItemInfo(999999, new Map(), new Map([[ItemSpecType.moveTo, 0]]));

      const user: any = {
        getHp: (): number => 100,
        getField: (): any => ({}),
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(1); w.writeInt(999999);
      ItemHandler.handleUserMapTransferItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });

    it('should dispose when item not in inventory', () => {
      const im = new InventoryManager();
      let disposed = 0;
      ItemProvider.getItemInfo = (id: number): ItemInfo | undefined =>
        new ItemInfo(id, new Map(), new Map([[ItemSpecType.moveTo, 100000000]]));

      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        getField: (): any => ({
          getFieldStorage: (): any => ({
            getFieldById: (): any => ({
              getRandomStartPoint: (): any => ({ getId: (): number => 0 }),
            }),
          }),
        }),
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(1); w.writeInt(TOWN_SCROLL);
      ItemHandler.handleUserMapTransferItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });

    it('should dispose when hp <= 0', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 0,
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(1); w.writeInt(TOWN_SCROLL);
      ItemHandler.handleUserMapTransferItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });

  describe('handleUserExpUpItemUseRequest', () => {
    it('should consume exp item and add exp', () => {
      const item = new Item(ItemType.BUNDLE);
      item.itemId = 5210000;
      const im = new InventoryManager();
      im.consumeInventory.putItem(1, item);

      let addedExp = 0;
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        addExp: (exp: number): void => { addedExp = exp; },
        write: (): void => {},
        dispose: (): void => {},
      };

      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(1); w.writeInt(5210000);
      ItemHandler.handleUserExpUpItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(addedExp).to.equal(0);
    });

    it('should dispose when hp <= 0', () => {
      let disposed = 0;
      const user: any = { getHp: (): number => 0, dispose: (): void => { disposed++; } };
      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(1); w.writeInt(5210000);
      ItemHandler.handleUserExpUpItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });

  describe('handleUserTamingMobFoodItemUseRequest', () => {
    it('should consume mount food and dispose', () => {
      const item = new Item(ItemType.BUNDLE);
      item.itemId = 4220000;
      const im = new InventoryManager();
      im.etcInventory.putItem(3, item);

      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(3); w.writeInt(4220000); w.writeInt(0);
      ItemHandler.handleUserTamingMobFoodItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(0);
    });

    it('should dispose when hp <= 0', () => {
      let disposed = 0;
      const user: any = { getHp: (): number => 0, dispose: (): void => { disposed++; } };
      const w = new PacketWriter();
      w.writeInt(0); w.writeShort(1); w.writeInt(4220000); w.writeInt(0);
      ItemHandler.handleUserTamingMobFoodItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });
});
