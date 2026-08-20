import { Database } from '../server/center/db/database';
import { Reward } from './reward/Reward';

const mobRewards = new Map<number, Reward[]>();
let initialized = false;

export const RewardProvider = {
  async initialize(): Promise<void> {
    mobRewards.clear();

    const knex = Database.knex;
    if (!knex) {
      console.warn('[RewardProvider] Database not initialized. Mobs will not drop items/mesos.');
      initialized = true;
      return;
    }

    try {
      const rows = await knex('mob_drops').select('*');
      
      let mobCount = 0;
      let rewardCount = 0;
      const tempMap = new Map<number, Reward[]>();

      for (const row of rows) {
        const mobId = row.mob_id;
        if (!tempMap.has(mobId)) {
          tempMap.set(mobId, []);
          mobCount++;
        }
        const rewards = tempMap.get(mobId)!;
        
        // Create reward using the same logic as parseRewardFile
        // itemId, min, max, prob, questId, fieldId
        rewards.push(Reward.item(
          row.item_id,
          row.min_quantity,
          row.max_quantity,
          Number(row.probability),
          row.quest_id || 0,
          row.field_id || 0
        ));
        rewardCount++;
      }

      mobRewards.clear();
      for (const [mobId, rewards] of tempMap) {
        mobRewards.set(mobId, rewards);
      }

      initialized = true;
      console.log(`[RewardProvider] loaded ${mobCount} mob reward table(s) / ${rewardCount} reward row(s) from database`);
    } catch (err) {
      console.error('[RewardProvider] Failed to load mob drops from database:', err);
      initialized = true; // Don't retry on every call
    }
  },

  getMobRewards(mobId: number): Reward[] {
    if (!initialized) {
      // Lazy init - but async, so we return empty and log warning
      console.warn('[RewardProvider] getMobRewards called before initialize()');
      return [];
    }
    return mobRewards.get(mobId) ?? [];
  },

  clear(): void {
    mobRewards.clear();
    initialized = false;
  },
};