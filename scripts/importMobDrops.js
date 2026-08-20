#!/usr/bin/env node
/**
 * Import mob drop tables from YAML files into the database.
 * Usage: node importMobDrops.js [dataDir]
 */

const fs = require('fs');
const path = require('path');
const knex = require('knex');
require('dotenv').config();

function parseRewardFile(mobId, content) {
  const rewards = [];
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
    rewards.push({ itemId, min, max, prob, questId, fieldId });
  }
  return rewards;
}

async function importDrops(dataDir) {
  const dbName = process.env.DB_SCHEMA || 'omega';

  const tempKnex = knex({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
    },
    pool: { min: 0, max: 5 },
  });

  try {
    if (!fs.existsSync(dataDir)) {
      console.error(`Reward data directory not found: ${dataDir}`);
      process.exit(1);
    }

    console.log(`Importing mob drops from ${dataDir}...`);

    let mobCount = 0;
    let rewardCount = 0;

    // Clear existing data
    await tempKnex('mob_drops').delete();
    console.log('Cleared existing mob_drops table');

    for (const fileName of fs.readdirSync(dataDir)) {
      if (!fileName.endsWith('.yaml')) continue;
      const mobId = parseInt(fileName.replace('.yaml', ''), 10);
      if (isNaN(mobId)) continue;

      const filePath = path.join(dataDir, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      const rewards = parseRewardFile(mobId, content);

      if (rewards.length === 0) continue;

      // Batch insert
      const rows = rewards.map(r => ({
        mob_id: mobId,
        item_id: r.itemId,
        min_quantity: r.min,
        max_quantity: r.max,
        probability: r.prob,
        quest_id: r.questId || 0,
        field_id: r.fieldId || 0,
      }));

      await tempKnex('mob_drops').insert(rows);
      mobCount++;
      rewardCount += rewards.length;
    }

    console.log(`Imported ${mobCount} mob drop tables with ${rewardCount} total reward rows`);

  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  } finally {
    await tempKnex.destroy();
  }
}

const dataDir = process.argv[2] || path.resolve(__dirname, '..', 'data', 'reward');
importDrops(dataDir);