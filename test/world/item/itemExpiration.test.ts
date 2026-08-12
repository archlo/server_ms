import { expect } from 'chai';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { InventoryType } from '../../../src/world/item/InventoryType';

describe('world/item/itemExpiration', () => {

  describe('Item.isExpired', () => {
    it('should return false when dateExpire is null', () => {
      const item = new Item(ItemType.BUNDLE);
      expect(item.isExpired()).to.equal(false);
    });

    it('should return true when dateExpire is in the past', () => {
      const item = new Item(ItemType.BUNDLE);
      item.dateExpire = new Date('2000-01-01');
      expect(item.isExpired()).to.equal(true);
    });

    it('should return false when dateExpire is in the future', () => {
      const item = new Item(ItemType.BUNDLE);
      item.dateExpire = new Date('2099-01-01');
      expect(item.isExpired()).to.equal(false);
    });

    it('should use provided now reference', () => {
      const item = new Item(ItemType.BUNDLE);
      item.dateExpire = new Date('2020-06-01');
      expect(item.isExpired(new Date('2020-01-01'))).to.equal(false);
      expect(item.isExpired(new Date('2020-07-01'))).to.equal(true);
    });
  });

  describe('InventoryManager.removeExpiredItems', () => {
    it('should remove expired items from all inventories', () => {
      const im = new InventoryManager();

      const expired = new Item(ItemType.BUNDLE);
      expired.itemId = 2000000;
      expired.dateExpire = new Date('2000-01-01');
      im.consumeInventory.putItem(1, expired);

      const fresh = new Item(ItemType.BUNDLE);
      fresh.itemId = 2000001;
      fresh.dateExpire = new Date('2099-01-01');
      im.consumeInventory.putItem(2, fresh);

      const { ops, removedItemIds } = im.removeExpiredItems();

      expect(ops.length).to.equal(1);
      expect(removedItemIds).to.deep.equal([2000000]);
      expect(im.consumeInventory.getItem(1)).to.equal(undefined);
      expect(im.consumeInventory.getItem(2)).to.not.equal(undefined);
    });

    it('should remove expired items from equipped inventory', () => {
      const im = new InventoryManager();

      const expired = new Item(ItemType.EQUIP);
      expired.itemId = 1302000;
      expired.dateExpire = new Date('2000-01-01');
      im.equipped.putItem(-5, expired);

      const { ops, removedItemIds } = im.removeExpiredItems();

      expect(ops.length).to.equal(1);
      expect(removedItemIds).to.deep.equal([1302000]);
      expect(im.equipped.getItem(-5)).to.equal(undefined);
    });

    it('should remove expired items from cash inventory', () => {
      const im = new InventoryManager();

      const expired = new Item(ItemType.BUNDLE);
      expired.itemId = 5160000;
      expired.cash = true;
      expired.dateExpire = new Date('2000-01-01');
      im.cashInventory.putItem(1, expired);

      const { ops, removedItemIds } = im.removeExpiredItems();

      expect(ops.length).to.equal(1);
      expect(removedItemIds).to.deep.equal([5160000]);
    });

    it('should return empty arrays when no items are expired', () => {
      const im = new InventoryManager();

      const fresh = new Item(ItemType.BUNDLE);
      fresh.itemId = 2000000;
      fresh.dateExpire = new Date('2099-01-01');
      im.consumeInventory.putItem(1, fresh);

      const { ops, removedItemIds } = im.removeExpiredItems();

      expect(ops.length).to.equal(0);
      expect(removedItemIds.length).to.equal(0);
    });

    it('should not remove items with null dateExpire', () => {
      const im = new InventoryManager();

      const item = new Item(ItemType.BUNDLE);
      item.itemId = 2000000;
      im.consumeInventory.putItem(1, item);

      const { ops } = im.removeExpiredItems();
      expect(ops.length).to.equal(0);
    });

    it('should produce correct InventoryOperation for each removal', () => {
      const im = new InventoryManager();

      const item1 = new Item(ItemType.EQUIP);
      item1.itemId = 1302000;
      item1.dateExpire = new Date('2000-01-01');
      im.equipInventory.putItem(1, item1);

      const item2 = new Item(ItemType.BUNDLE);
      item2.itemId = 2000000;
      item2.dateExpire = new Date('2000-01-01');
      im.consumeInventory.putItem(2, item2);

      const { ops } = im.removeExpiredItems();
      expect(ops.length).to.equal(2);

      // Verify op fields
      expect(ops[0].inventoryType).to.equal(InventoryType.EQUIP);
      expect(ops[1].inventoryType).to.equal(InventoryType.CONSUME);
    });
  });
});
