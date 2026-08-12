import { expect } from 'chai';
import { Summoned } from '../../../src/world/field/summoned/Summoned';
import { SummonedAssistType } from '../../../src/world/field/summoned/SummonedAssistType';
import { SummonedLeaveType } from '../../../src/world/field/summoned/SummonedLeaveType';
import { SummonedMoveAbility } from '../../../src/world/field/summoned/SummonedMoveAbility';
import { SummonedPool } from '../../../src/world/field/summoned/SummonedPool';

describe('world/field/summoned/SummonedPool.ts', () => {
  it('should add and remove summoned objects with broadcasts', () => {
    const broadcasts: Buffer[] = [];
    let nextId = 100;
    const field = {
      nextId: (): number => nextId++,
      broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
    };
    const pool = new SummonedPool(field);
    const user = fakeUser(1, 30);
    const summoned = new Summoned(5211001, 3, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK);

    pool.addSummoned(user as any, summoned);

    expect(summoned.getId()).to.equal(100);
    expect(summoned.ownerId).to.equal(1);
    expect(pool.getCount()).to.equal(1);
    expect(broadcasts.length).to.equal(1);

    summoned.leaveType = SummonedLeaveType.ON_REMOVE;
    expect(pool.removeSummoned(user as any, summoned)).to.equal(true);
    expect(pool.getCount()).to.equal(0);
    expect(broadcasts.length).to.equal(2);
  });

  it('should expire summoned objects through the owning user', () => {
    const removed: Summoned[] = [];
    const owner = fakeUser(7, 80, (summoned) => {
      removed.push(summoned);
      return true;
    });
    const field = {
      nextId: (): number => 1,
      broadcastPacket: (_packet: Buffer): void => undefined,
      getUserPool: (): any => ({
        getUserByCharacterId: (id: number): any => id === 7 ? owner : undefined,
      }),
    };
    const pool = new SummonedPool(field);
    const summoned = new Summoned(5211001, 3, SummonedMoveAbility.STOP, SummonedAssistType.ATTACK, null, new Date(0));
    pool.addSummoned(owner as any, summoned);

    const expired = pool.expireSummoned(new Date(1));

    expect(expired).to.deep.equal([summoned]);
    expect(removed).to.deep.equal([summoned]);
    expect(summoned.leaveType).to.equal(SummonedLeaveType.DEFAULT);
  });
});

function fakeUser(characterId: number, level: number, removeSummonedObject?: (summoned: Summoned) => boolean): any {
  return {
    getCharacterId: (): number => characterId,
    getLevel: (): number => level,
    getSummonedBySkill: (_skillId: number): Summoned[] => [],
    removeSummonedObject: removeSummonedObject ?? ((_summoned: Summoned): boolean => true),
  };
}
