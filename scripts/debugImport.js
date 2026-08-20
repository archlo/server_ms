const fs = require('fs');
const path = require('path');
const knex = require('knex');
require('dotenv').config();

async function debugImport() {
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
    const dataDir = 'C:\\Users\\jorge\\OneDrive\\Desktop\\server\\data\\reward';
    let mobCount = 0;
    let rewardCount = 0;

    for (const fileName of fs.readdirSync(dataDir)) {
      if (!fileName.endsWith('.yaml')) continue;
      const mobId = parseInt(fileName.replace('.yaml', ''), 10);
      if (isNaN(mobId)) continue;

      const filePath = path.join(dataDir, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse rewards
      const rewards = [];
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*$/, '').trim();
        if (!line.startsWith('-')) continue;
        const match = line.match(/\[(.*)\]/);
        if (!match) continue;
        const values = match[1].split(',').map(v => Number(v.trim())).filter(v => !isNaN(v));
        if (values.length < 4) continue;
        const [itemId, min, max, prob, questId = 0, fieldId = 0] = values;
        rewards.push({ itemId, min, max, prob, questId, fieldId });
      }

      if (rewards.length === 0) continue;

      console.log(`Mob ${mobId}: ${rewards.length} rewards`);
      mobCount++;
      rewardCount += rewards.length;
      
      if (mobCount > 70) break; // Just test first 70
    }

    console.log(`Total: ${mobCount} mobs, ${rewardCount} rewards`);

  } catch (err) {
    console.error('Debug failed:', err);
  } finally {
    await tempKnex.destroy();
  }
}

const tempKnex = knex({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA || 'omega',
  },
  pool: { min: 0, max: 5 },
});

debugImport().catch(console.error);