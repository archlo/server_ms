#!/usr/bin/env node
/**
 * Complete drop table generator using swordie database + mob stats for missing mobs.
 */

const fs = require('fs');
const path = require('path');
const knex = require('knex');
require('dotenv').config();

// Load mob stats from NX data
function loadMobStats() {
  const stats = {};
  const dump = fs.readFileSync('C:\\Users\\jorge\\OneDrive\\Desktop\\ts\\mob_full_dump.txt', 'utf8');
  
  let currentMob = null;
  for (const line of dump.split('\n')) {
    const mobMatch = line.match(/^\s*(\d{7})\.img/);
    if (mobMatch) {
      currentMob = parseInt(mobMatch[1], 10);
      stats[currentMob] = { level: 1, maxHp: 10, exp: 1, category: Math.floor(parseInt(mobMatch[1], 10) / 10000) };
    }
    if (currentMob) {
      const levelMatch = line.match(/level\s+\[1\]\s+int=(\d+)/);
      if (levelMatch) stats[currentMob].level = parseInt(levelMatch[1], 10);
      const hpMatch = line.match(/maxHp\s+\[1\]\s+int=(\d+)/);
      if (hpMatch) stats[currentMob].maxHp = parseInt(hpMatch[1], 10);
      const expMatch = line.match(/exp\s+\[1\]\s+int=(\d+)/);
      if (expMatch) stats[currentMob].exp = parseInt(expMatch[1], 10);
    }
  }
  return stats;
}

// Load swordie database drops
async function loadSwordieDrops() {
  const db = knex({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_SCHEMA || 'omega',
    },
    pool: { min: 0, max: 5 },
  });
  
  const rows = await db('mob_drops').select('mob_id', 'item_id', 'min_quantity', 'max_quantity', 'probability', 'quest_id', 'field_id');
  await db.destroy();
  
  const drops = new Map();
  for (const row of rows) {
    if (!drops.has(row.mob_id)) drops.set(row.mob_id, []);
    drops.get(row.mob_id).push({
      itemId: row.item_id,
      chance: Number(row.probability),
      minQuant: row.min_quantity,
      maxQuant: row.max_quantity,
      questId: row.quest_id,
      fieldId: row.field_id,
    });
  }
  return drops;
}

// Load mob stats
function loadMobStats() {
  const stats = {};
  const dump = fs.readFileSync('C:\\Users\\jorge\\OneDrive\\Desktop\\ts\\mob_full_dump.txt', 'utf16le');
  
  let currentMob = null;
  for (const line of dump.split('\n')) {
    const mobMatch = line.match(/^\s*(\d{7})\.img/);
    if (mobMatch) {
      currentMob = parseInt(mobMatch[1], 10);
      stats[currentMob] = { level: 1, maxHp: 10, exp: 1, category: Math.floor(parseInt(mobMatch[1], 10) / 10000) };
    }
    if (currentMob) {
      const levelMatch = line.match(/level\s+\[1\]\s+int=(\d+)/);
      if (levelMatch) stats[currentMob].level = parseInt(levelMatch[1], 10);
      const hpMatch = line.match(/maxHp\s+\[1\]\s+int=(\d+)/);
      if (hpMatch) stats[currentMob].maxHp = parseInt(hpMatch[1], 10);
      const expMatch = line.match(/exp\s+\[1\]\s+int=(\d+)/);
      if (expMatch) stats[currentMob].exp = parseInt(expMatch[1], 10);
    }
  }
  return stats;
}

// Generate drop table from stats
function generateDropTable(mobId, s) {
  const level = s?.level || 1;
  const category = Math.floor(mobId / 10000);
  const rewards = [];
  
  const mesoMin = Math.max(1, Math.floor((s?.level || 1) * 0.5));
  const mesoMax = Math.max(mesoMin + 2, Math.floor((s?.level || 1) * 1.5));
  rewards.push([0, mesoMin, mesoMax, 0.7, 0, 0]);
  
  const etcDrops = getEtcDrops(category, s?.level || 1);
  if (etcDrops) rewards.push(etcDrops);
  
  const equipDrop = getEquipDrop(category, s?.level || 1);
  if (equipDrop) rewards.push(equipDrop);
  
  if ((s?.level || 1) > 20) rewards.push([2000000, 1, 1, 0.05, 0, 0]);
  if ((s?.level || 1) > 40) rewards.push([2000001, 1, 1, 0.03, 0, 0]);
  if ((s?.level || 1) > 60) rewards.push([2000002, 1, 1, 0.02, 0, 0]);
  
  return rewards;
}

function getEtcDrops(category, level) {
  const drops = {
    10: { id: 4000000, prob: 0.25 }, 11: { id: 4000004, prob: 0.3 },
    12: { id: 4000002, prob: 0.2 }, 13: { id: 4000001, prob: 0.2 },
    21: { id: 4000001, prob: 0.2 }, 22: { id: 4000005, prob: 0.35 },
    23: { id: 4000001, prob: 0.2 }, 30: { id: 4000004, prob: 0.15 },
    31: { id: 4000004, prob: 0.15 }, 32: { id: 4000007, prob: 0.35 },
    42: { id: 4000007, prob: 0.35 }, 50: { id: 4000005, prob: 0.25 },
    51: { id: 4000003, prob: 0.25 }, 52: { id: 4000003, prob: 0.25 },
    60: { id: 4000007, prob: 0.25 }, 61: { id: 4000004, prob: 0.25 },
    62: { id: 4000004, prob: 0.25 }, 63: { id: 4000004, prob: 0.25 },
    64: { id: 4000004, prob: 0.25 }, 80: { id: 4000004, prob: 0.25 },
    81: { id: 4000007, prob: 0.35 }, 88: { id: 4000004, prob: 0.2 },
    90: { id: 4000000, prob: 0.1 }, 91: { id: 4000004, prob: 0.15 },
    92: { id: 4000004, prob: 0.2 }, 93: { id: 4000004, prob: 0.25 },
    94: { id: 4000007, prob: 0.3 }, 95: { id: 4000004, prob: 0.2 },
    99: { id: 4000000, prob: 0.1 },
  };
  
  const drop = drops[category];
  if (drop) {
    const prob = Math.min(drop.prob * (1 + (s?.level || 1) * 0.005), 0.5);
    return [drop.id, 1, 1, prob, 0, 0];
  }
  return null;
}

function getEquipDrop(category, level) {
  if ((level || 1) < 20) return null;
  const equipMap = {
    10: { id: 1040000, prob: 0.01 }, 11: { id: 1040000, prob: 0.01 },
    12: { id: 1040002, prob: 0.01 }, 13: { id: 1040002, prob: 0.01 },
    21: { id: 1040008, prob: 0.005 }, 22: { id: 1040008, prob: 0.005 },
    23: { id: 1040008, prob: 0.005 }, 30: { id: 1040008, prob: 0.005 },
    31: { id: 1040008, prob: 0.005 }, 32: { id: 1040008, prob: 0.005 },
    42: { id: 1040008, prob: 0.005 }, 50: { id: 1040008, prob: 0.005 },
    51: { id: 1040008, prob: 0.005 }, 52: { id: 1040008, prob: 0.005 },
    60: { id: 1040008, prob: 0.005 }, 61: { id: 1040008, prob: 0.005 },
    62: { id: 1040008, prob: 0.005 }, 63: { id: 1040008, prob: 0.005 },
    64: { id: 1040008, prob: 0.005 }, 80: { id: 1040008, prob: 0.01 },
    81: { id: 1040008, prob: 0.01 }, 93: { id: 1040008, prob: 0.005 },
    94: { id: 1040008, prob: 0.01 },
  };
  const equip = equipMap[category];
  if (equip) {
    const prob = Math.min(equip.prob * (1 + ((s?.level || 1) - 20) * 0.01), 0.02);
    return [equip.id, 1, 1, prob, 0, 0];
  }
  return null;
}

// Main
async function main() {
  console.log('Loading swordie database drops...');
  const swordieDrops = await loadSwordieDrops();
  console.log(`Loaded drops for ${swordieDrops.size} mobs from swordie DB`);
  
  console.log('Loading mob stats from NX...');
  const stats = loadMobStats();
  console.log(`Loaded stats for ${Object.keys(stats).length} mobs`);
  
  console.log('Loading all mob IDs...');
  const allMobIdsRaw = fs.readFileSync('C:\\Users\\jorge\\OneDrive\\Desktop\\ts\\all_mob_ids.txt', 'utf16le');
  const allMobIdsClean = allMobIdsRaw.replace(/^\uFEFF/, '');
  const allMobIdsNoCR = allMobIdsClean.replace(/\r/g, '');
  const allMobIds = allMobIdsNoCR
    .trim().split('\n')
    .map(x => parseInt(x.trim().replace(/^0+/, ''), 10))
    .filter(x => !isNaN(x));
  
  // v95-era mobs: exclude GM/event (99xxxx+), future (98xxxx+), event maps (90xxxx, 92xxxx)
  const v95Mobs = allMobIds.filter(id => {
    if (id < 100000) return false;
    if (id >= 9900000) return false;
    if (id >= 9800000) return false;
    if (id >= 9000000 && id < 9100000) return false;
    if (id >= 9200000 && id < 9300000) return false;
    return true;
  });
  console.log(`Total v95-era mobs: ${v95Mobs.length}`);
  
  // Load existing YAML drops
  const existingDrops = new Set();
  const rewardDir = path.join(__dirname, '..', 'data', 'reward');
  for (const file of fs.readdirSync(rewardDir)) {
    if (file.endsWith('.yaml')) existingDrops.add(parseInt(file.replace('.yaml', ''), 10));
  }
  
  let generated = 0, skipped = 0, fromSwordie = 0, fromStats = 0;
  
  for (const mobId of v95Mobs) {
    if (fs.existsSync(path.join(rewardDir, `${mobId}.yaml`))) {
      continue;
    }
    
    let rewards = [];
    
    // Priority 1: Use swordie database drops
    if (swordieDrops.has(mobId)) {
      const drops = swordieDrops.get(mobId);
      rewards = drops.map(d => [
        d.itemId, d.minQuant, d.maxQuant, d.chance, d.questId || 0, d.fieldId || 0
      ]);
      rewards.unshift([0, 5, 15, 0.7, 0, 0]); // meso
      fromSwordie++;
    } else {
      // Priority 2: Generate from stats
      const s = stats[mobId];
      if (s) {
        rewards = generateDropTable(mobId, s);
        fromStats++;
      } else {
        continue; // No data available
      }
    }
    
    const yamlContent = `# v95 drop table: ${swordieDrops.has(mobId) ? 'Swordie DB' : 'Generated from stats'} for mob ${mobId}\nrewards:\n` +
      rewards.map(r => `  - [ ${r.join(', ')} ]`).join('\n') + '\n';
    
    fs.writeFileSync(path.join(rewardDir, `${mobId}.yaml`), yamlContent);
    generated++;
  }
  
  console.log(`Generated ${generated} new drop tables`);
  console.log(`  From Swordie DB: ${fromSwordie}`);
  console.log(`  From generated stats: ${fromStats}`);
  console.log(`Total mobs with drops: ${existingDrops.size + generated}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});