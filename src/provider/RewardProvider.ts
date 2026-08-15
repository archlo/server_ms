import * as fs from 'fs';
import * as path from 'path';
import { Reward } from './reward/Reward';

const mobRewards = new Map<number, Reward[]>();
let initialized = false;

// Rewards live in server/data/reward. Resolve relative to this module so the
// lookup works regardless of the process cwd (the channel server used to rely
// on `process.cwd()`, which silently produced zero drops when launched from
// anywhere but the server root).
function defaultRewardDir(): string {
  return (
    process.env.REWARD_DATA_DIR
    ?? path.resolve(__dirname, '..', '..', '..', 'data', 'reward')
  );
}

export const RewardProvider = {
  initialize(dataDir = defaultRewardDir()): void {
    mobRewards.clear();
    if (!fs.existsSync(dataDir)) {
      console.warn(`[RewardProvider] reward data directory not found: ${dataDir}. Mobs will not drop items/mesos. Set REWARD_DATA_DIR or create server/data/reward.`);
      initialized = true;
      return;
    }
    let mobCount = 0;
    let rewardCount = 0;
    for (const fileName of fs.readdirSync(dataDir)) {
      if (!fileName.endsWith('.yaml')) continue;
      const mobId = parseInt(fileName.replace('.yaml', ''), 10);
      if (isNaN(mobId)) continue;
      const filePath = path.join(dataDir, fileName);
      const rewards = parseRewardFile(mobId, fs.readFileSync(filePath, 'utf8'));
      mobRewards.set(mobId, rewards);
      mobCount++;
      rewardCount += rewards.length;
    }
    initialized = true;
    console.log(`[RewardProvider] loaded ${mobCount} mob reward table(s) / ${rewardCount} reward row(s) from ${dataDir}`);
  },

  getMobRewards(mobId: number): Reward[] {
    if (!initialized) this.initialize();
    return mobRewards.get(mobId) ?? [];
  },

  clear(): void {
    mobRewards.clear();
    initialized = false;
  },
};

function parseRewardFile(mobId: number, content: string): Reward[] {
  const rewards: Reward[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line.startsWith('-')) continue;
    const match = line.match(/\[(.*)\]/);
    if (!match) {
      throw new Error(`Could not parse reward row for mob ID ${mobId}: ${rawLine}`);
    }
    const values = match[1].split(',').map(v => Number(v.trim())).filter(v => !isNaN(v));
    if (values.length < 4) {
      throw new Error(`Reward row for mob ID ${mobId} must have at least 4 numeric values: ${rawLine}`);
    }
    const [itemId, min, max, prob, questId = 0, fieldId = 0] = values;
    rewards.push(Reward.item(itemId, min, max, prob, questId, fieldId));
  }
  return rewards;
}
