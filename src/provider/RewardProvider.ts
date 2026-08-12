import * as fs from 'fs';
import * as path from 'path';
import { Reward } from './reward/Reward';

const mobRewards = new Map<number, Reward[]>();
let initialized = false;

export const RewardProvider = {
  initialize(dataDir = process.env.REWARD_DATA_DIR ?? path.join(process.cwd(), 'data', 'reward')): void {
    mobRewards.clear();
    if (!fs.existsSync(dataDir)) {
      console.warn(`Reward data directory not found: ${dataDir}. Mobs will not drop items/mesos. Set REWARD_DATA_DIR or create server/data/reward.`);
      initialized = true;
      return;
    }
    for (const fileName of fs.readdirSync(dataDir)) {
      if (!fileName.endsWith('.yaml')) continue;
      const mobId = parseInt(fileName.replace('.yaml', ''), 10);
      if (isNaN(mobId)) continue;
      const filePath = path.join(dataDir, fileName);
      mobRewards.set(mobId, parseRewardFile(mobId, fs.readFileSync(filePath, 'utf8')));
    }
    initialized = true;
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
