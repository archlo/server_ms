import { expect } from 'chai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { RewardProvider } from '../../src/provider/RewardProvider';

describe('provider/RewardProvider.ts', () => {
  afterEach(() => RewardProvider.clear());

  it('should load mob rewards from yaml rows', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reward-provider-'));
    fs.writeFileSync(path.join(dir, '100100.yaml'), [
      '# Snail',
      'rewards:',
      '  - [ 0, 1, 2, 0.600000 ]',
      '  - [ 4000019, 1, 1, 0.400000, 2001, 100000000 ] # Snail Shell',
    ].join('\n'));

    RewardProvider.initialize(dir);
    const rewards = RewardProvider.getMobRewards(100100);

    expect(rewards.length).to.equal(2);
    expect(rewards[0].isMoney()).to.equal(true);
    expect(rewards[0].min).to.equal(1);
    expect(rewards[0].max).to.equal(2);
    expect(rewards[1].itemId).to.equal(4000019);
    expect(rewards[1].questId).to.equal(2001);
    expect(rewards[1].fieldId).to.equal(100000000);
  });
});
