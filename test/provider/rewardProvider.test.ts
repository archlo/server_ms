import { expect } from 'chai';
import { RewardProvider } from '../../src/provider/RewardProvider';

describe('provider/RewardProvider.ts', () => {
  afterEach(() => RewardProvider.clear());

  it('should initialize from database and return rewards for mob', async () => {
    await RewardProvider.initialize();
    const rewards = RewardProvider.getMobRewards(100100);
    
    // Just verify it initializes without error and returns an array
    expect(rewards).to.be.an('array');
  });
});
