import { expect } from 'chai';
import { DropPool } from '../../../src/world/field/drop/DropPool';
import { Drop } from '../../../src/world/field/drop/Drop';
import { DropOwnType } from '../../../src/world/field/drop/DropOwnType';
import { DropLeaveType } from '../../../src/world/field/drop/DropLeaveType';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { InventoryManager } from '../../../src/world/item/InventoryManager';

describe('world/field/drop/DropPool.ts', () => {
  it('should add picked up item drops to inventory', () => {
    const packets: Buffer[] = [];
    const field = {
      broadcastPacket: (packet: Buffer) => packets.push(packet),
      nextId: (() => {
        let id = 1;
        return () => id++;
      })(),
    };
    const pool = new DropPool(field);
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = 2000000;
    item.quantity = 2;
    const source = { getId: () => 99, getX: () => 0, getY: () => 0 } as any;
    const drop = Drop.item(DropOwnType.USEROWN, source, item, 123);
    pool.addDrop(drop);

    const user = {
      getCharacterId: () => 123,
      getPartyId: () => 0,
      getInventoryManager: () => im,
      write: (packet: Buffer) => packets.push(packet),
    } as any;
    pool.pickUpDrop(user, drop, DropLeaveType.PICKED_UP_BY_USER, 0);

    expect(pool.getCount()).to.equal(0);
    expect(im.getItemCount(2000000)).to.equal(2);
    expect(packets.length).to.be.greaterThan(0);
  });
});
