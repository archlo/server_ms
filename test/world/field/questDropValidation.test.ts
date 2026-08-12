import { expect } from 'chai';
import { UserPool } from '../../../src/world/field/UserPool';
import { DropPool } from '../../../src/world/field/drop/DropPool';
import { Drop } from '../../../src/world/field/drop/Drop';
import { DropOwnType } from '../../../src/world/field/drop/DropOwnType';
import { DropLeaveType } from '../../../src/world/field/drop/DropLeaveType';

describe('world/field/questDropValidation', () => {
  let dropPool: DropPool;
  let field: any;
  let userWithQuest: any;
  let userWithoutQuest: any;
  let questDrop: Drop;
  let normalDrop: Drop;

  beforeEach(() => {
    const userPool = { getAll: (): any[] => [] };
    const emptyPacket = Buffer.from([]);

    field = {
      getUserPool: (): any => userPool,
      broadcastPacket: (): void => {},
      getMapInfo: (): any => ({ getFootholdBelow: (): null => null }),
      nextId: (): number => 1,
      getFieldStorage: (): any => null,
    };
    dropPool = new DropPool(field);

    userWithQuest = {
      getCharacterId: (): number => 100,
      getPartyId: (): number => 0,
      getQuestManager: (): any => ({ hasQuestStarted: (id: number): boolean => id === 9999 }),
      getInventoryManager: (): any => ({
        money: 0,
        addMoney: (): boolean => true,
        canAddItem: (): boolean => true,
        addItem: (): any => [],
      }),
      write: (): void => {},
    };

    userWithoutQuest = {
      getCharacterId: (): number => 200,
      getPartyId: (): number => 0,
      getQuestManager: (): any => ({ hasQuestStarted: (): boolean => false }),
      getInventoryManager: (): any => ({
        money: 0,
        addMoney: (): boolean => true,
        canAddItem: (): boolean => true,
        addItem: (): any => [],
      }),
      write: (): void => {},
    };

    questDrop = Drop.item(DropOwnType.NOOWN, null as any, { itemId: 4032923, quantity: 1, itemSn: 1n } as any, 0, 9999);
    normalDrop = Drop.item(DropOwnType.NOOWN, null as any, { itemId: 2000000, quantity: 1, itemSn: 2n } as any, 0, 0);
  });

  it('should allow user with quest to pick up quest drop', () => {
    dropPool.addDrop(questDrop);
    const writeCalls: Buffer[] = [];
    const user = { ...userWithQuest, write: (buf: Buffer): void => { writeCalls.push(buf); } };
    dropPool.pickUpDrop(user, questDrop, DropLeaveType.PICKED_UP_BY_USER, 0);
    // drop was consumed
    expect(dropPool.getById(questDrop.getId())).to.be.undefined;
  });

  it('should reject user without quest picking up quest drop', () => {
    dropPool.addDrop(questDrop);
    const writeCalls: Buffer[] = [];
    const user = { ...userWithoutQuest, write: (buf: Buffer): void => { writeCalls.push(buf); } };
    dropPool.pickUpDrop(user, questDrop, DropLeaveType.PICKED_UP_BY_USER, 0);
    // drop was NOT consumed
    expect(dropPool.getById(questDrop.getId())).not.to.be.undefined;
  });

  it('should allow user without quest to pick up normal drop', () => {
    dropPool.addDrop(normalDrop);
    const writeCalls: Buffer[] = [];
    const user = { ...userWithoutQuest, write: (buf: Buffer): void => { writeCalls.push(buf); } };
    dropPool.pickUpDrop(user, normalDrop, DropLeaveType.PICKED_UP_BY_USER, 0);
    // drop was consumed
    expect(dropPool.getById(normalDrop.getId())).to.be.undefined;
  });
});
