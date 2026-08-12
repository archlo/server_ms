import { expect } from 'chai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { RewardProvider } from '../../../src/provider/RewardProvider';
import { MobTemplate } from '../../../src/provider/mob/MobTemplate';
import { Mob } from '../../../src/world/field/mob/Mob';

describe('world/field/mob/Mob reward drops', () => {
  afterEach(() => RewardProvider.clear());

  it('should create deterministic money drops from reward data', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mob-rewards-'));
    fs.writeFileSync(path.join(dir, '999999.yaml'), [
      'rewards:',
      '  - [ 0, 5, 5, 1.000000 ]',
    ].join('\n'));
    RewardProvider.initialize(dir);

    const template = new MobTemplate(
      999999, 1, 0, 10, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      false, false, false, false, false, false,
      new Map(), new Map(), new Map(), new Set(), [], 0,
    );
    const mob = new Mob(template, null, 10, 20, 0);
    const user = {
      getCharacterId: () => 123,
      getSecondaryStat: () => ({ hasOption: () => false, getOption: () => ({ nOption: 0 }) }),
      getSkillLevel: () => 0,
      getSkillStatValue: () => 0,
    } as any;
    const added: any[] = [];
    const field = {
      getFieldId: () => 100000000,
      getUserPool: () => ({ getById: () => user }),
      getDropPool: () => ({ addDrops: (drops: any[]) => added.push(...drops) }),
    };
    mob.setField(field);
    mob.addDamage(123, 10);

    mob.dropRewards(user, 0);

    expect(added.length).to.equal(1);
    expect(added[0].isMoney()).to.equal(true);
    expect(added[0].money).to.equal(5);
    expect(added[0].ownerId).to.equal(123);
  });
});
