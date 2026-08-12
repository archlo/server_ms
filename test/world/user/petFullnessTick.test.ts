import { expect } from 'chai';
import { User } from '../../../src/world/user/User';
import { Pet } from '../../../src/world/user/Pet';
import { ItemType } from '../../../src/world/item/ItemType';
import { GameConstants } from '../../../src/world/GameConstants';

describe('world/user/User.processPets', () => {
  let user: User;
  let petItem: any;
  let broadcastCalled: boolean;

  beforeEach(() => {
    broadcastCalled = false;
    const mockSession = { write: (): Promise<void> => Promise.resolve() };
    user = new User(mockSession as any, null as any);
    const cd: any = {
      characterStat: { petSn1: 123n, petSn2: 0n, petSn3: 0n, level: 1, job: 0, hp: 100, maxHp: 100, mp: 50, maxMp: 50, str: 4, dex: 4, luk: 4, _int: 4, ap: 0, sp: null as any, skin: 0, face: 20000, hair: 30000, fame: 0 },
      inventoryManager: { cashInventory: { items: [] }, money: 0, getItemBySn: (): null => null, equipped: { items: [] } },
      skillManager: null as any,
      questManager: null as any,
      friendManager: null as any,
      friendMax: 30,
      accountId: 1,
      getCharacterId: (): number => 1,
      getCharacterName: (): string => 'Test',
      getNextItemSn: (): bigint => 1000n,
    };
    (user as any).characterData = cd;
    (user as any)._lastPetTick = new Date(0);

    const field: any = {
      broadcastPacket: (): void => { broadcastCalled = true; },
      getMapInfo: (): any => ({ getFootholdBelow: (): null => null }),
    };
    (user as any)._field = field;

    petItem = {
      itemSn: 123n,
      itemId: 5000000,
      petData: { fullness: 50, tameness: 0, level: 1, petName: 'TestPet' },
      itemType: ItemType.PET,
    };
    const pet = Pet.from(user, petItem);
    pet.setPosition(field, 0, 0);
    (user as any).pets.set(0, pet);
  });

  it('should decrease fullness after tick interval', () => {
    const now = new Date((0 + GameConstants.PET_FULLNESS_TICK_INTERVAL * 1000 + 1));
    user.processPets(now);
    expect(petItem.petData.fullness).to.equal(49);
  });

  it('should not decrease fullness before tick interval', () => {
    const now = new Date((0 + GameConstants.PET_FULLNESS_TICK_INTERVAL * 1000 - 1));
    user.processPets(now);
    expect(petItem.petData.fullness).to.equal(50);
  });

  it('should unsummon pet when fullness drops to 0', () => {
    petItem.petData.fullness = 1;
    const now = new Date((0 + GameConstants.PET_FULLNESS_TICK_INTERVAL * 1000 + 1));
    user.processPets(now);
    expect(user.getPet(0)).to.be.null;
    expect(broadcastCalled).to.be.true;
  });

  it('should unsummon pet that starts at 0 fullness', () => {
    petItem.petData.fullness = 0;
    const now = new Date((0 + GameConstants.PET_FULLNESS_TICK_INTERVAL * 1000 + 1));
    user.processPets(now);
    expect(user.getPet(0)).to.be.null;
    expect(broadcastCalled).to.be.true;
  });
});
