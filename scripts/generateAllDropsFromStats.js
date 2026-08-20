#!/usr/bin/env node
/**
 * Generate drop tables for ALL missing v95 mobs using their actual stats from NX data.
 * Uses mob level, maxHP, category to create appropriate drop tables.
 */

const fs = require('fs');
const path = require('path');

// Load mob stats from NX data dump
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

// Generate drop table based on mob stats
function generateDropTable(mobId, s) {
  const level = s?.level || 1;
  const maxHp = s?.maxHp || 10;
  const exp = s?.exp || 1;
  const category = Math.floor(mobId / 10000);
  
  // Base meso range scales with level
  const mesoMin = Math.max(1, Math.floor(level * 0.5));
  const mesoMax = Math.max(mesoMin + 2, Math.floor(level * 1.5));
  
  // Determine drops based on category and level
  const rewards = [];
  
  // Always add meso (70% chance)
  rewards.push([0, mesoMin, mesoMax, 0.7, 0, 0]);
  
  // Category-based etc drops
  const etcDrops = getEtcDrops(category, level);
  if (etcDrops) rewards.push(etcDrops);
  
  // Equip drops (rare)
  const equipDrop = getEquipDrop(category, level);
  if (equipDrop) rewards.push(equipDrop);
  
  // Use drops for higher levels
  if (level > 20) rewards.push([2000000, 1, 1, 0.05, 0, 0]); // White Potion
  if (level > 40) rewards.push([2000001, 1, 1, 0.03, 0, 0]); // Mana Elixir
  if (level > 60) rewards.push([2000002, 1, 1, 0.02, 0, 0]); // Blue Potion
  
  return rewards;
}

function getEtcDrops(category, level) {
  const drops = {
    10: { id: 4000000, prob: 0.25 }, // Squishy Liquid
    11: { id: 4000004, prob: 0.3 },  // Blue Potion
    12: { id: 4000002, prob: 0.2 },  // Red Potion
    13: { id: 4000001, prob: 0.2 },  // Orange Potion
    21: { id: 4000001, prob: 0.2 },
    22: { id: 4000005, prob: 0.35 }, // White Potion
    23: { id: 4000001, prob: 0.2 },
    30: { id: 4000004, prob: 0.15 },
    31: { id: 4000004, prob: 0.15 },
    32: { id: 4000007, prob: 0.35 }, // Mana Elixir
    42: { id: 4000007, prob: 0.35 },
    50: { id: 4000005, prob: 0.25 },
    51: { id: 4000003, prob: 0.25 },
    52: { id: 4000003, prob: 0.25 },
    60: { id: 4000007, prob: 0.25 },
    61: { id: 4000004, prob: 0.25 },
    62: { id: 4000004, prob: 0.25 },
    63: { id: 4000004, prob: 0.25 },
    64: { id: 4000004, prob: 0.25 },
    80: { id: 4000004, prob: 0.25 },
    81: { id: 4000007, prob: 0.35 },
    88: { id: 4000004, prob: 0.2 },
    90: { id: 4000000, prob: 0.1 },
    91: { id: 4000004, prob: 0.15 },
    92: { id: 4000004, prob: 0.2 },
    93: { id: 4000004, prob: 0.25 },
    94: { id: 4000007, prob: 0.3 },
    95: { id: 4000004, prob: 0.2 },
    99: { id: 4000000, prob: 0.1 },
  };
  
  const drop = drops[category];
  if (drop) {
    // Scale probability with level
    const prob = Math.min(drop.prob * (1 + level * 0.005), 0.5);
    return [drop.id, 1, 1, prob, 0, 0];
  }
  return null;
}

function getEquipDrop(category, level) {
  // Rare equip drops for higher level mobs
  if (level < 20) return null;
  
  const equipMap = {
    10: { id: 1040000, prob: 0.01 }, // Work Gloves
    11: { id: 1040000, prob: 0.01 },
    12: { id: 1040002, prob: 0.01 }, // Leather Shoes
    13: { id: 1040002, prob: 0.01 },
    21: { id: 1040008, prob: 0.005 }, // Steel Cap
    22: { id: 1040008, prob: 0.005 },
    23: { id: 1040008, prob: 0.005 },
    30: { id: 1040008, prob: 0.005 },
    31: { id: 1040008, prob: 0.005 },
    32: { id: 1040008, prob: 0.005 },
    42: { id: 1040008, prob: 0.005 },
    50: { id: 1040008, prob: 0.005 },
    51: { id: 1040008, prob: 0.005 },
    52: { id: 1040008, prob: 0.005 },
    60: { id: 1040008, prob: 0.005 },
    61: { id: 1040008, prob: 0.005 },
    62: { id: 1040008, prob: 0.005 },
    63: { id: 1040008, prob: 0.005 },
    64: { id: 1040008, prob: 0.005 },
    80: { id: 1040008, prob: 0.01 },
    81: { id: 1040008, prob: 0.01 },
    93: { id: 1040008, prob: 0.005 },
    94: { id: 1040008, prob: 0.01 },
  };
  
  const equip = equipMap[category];
  if (equip) {
    // Scale probability with level
    const prob = Math.min(equip.prob * (1 + (level - 20) * 0.01), 0.02);
    return [equip.id, 1, 1, prob, 0, 0];
  }
  return null;
}

// Load mob stats
const stats = loadMobStats();

// Load existing drops
const existingDrops = new Set();
const rewardDir = path.join(__dirname, '..', 'data', 'reward');
for (const file of fs.readdirSync(rewardDir)) {
  if (file.endsWith('.yaml')) {
    existingDrops.add(parseInt(file.replace('.yaml', ''), 10));
  }
}

// Load all v95 mob IDs
const allMobIdsRaw = fs.readFileSync('C:\\Users\\jorge\\OneDrive\\Desktop\\ts\\all_mob_ids.txt', 'utf16le');
const allMobIdsClean = allMobIdsRaw.replace(/^\uFEFF/, '');
const allMobIdsNoCR = allMobIdsClean.replace(/\r/g, '');
const allMobIds = allMobIdsNoCR
  .trim().split('\n')
  .map(x => parseInt(x.trim().replace(/^0+/, ''), 10))
  .filter(x => !isNaN(x));

// Filter for v95-era mobs (all v95 mob ranges, not just Victoria Island)
// v95 mobs span many ranges: 1xx, 2xx, 3xx, 4xx, 5xx, 6xx, 7xx, 8xx, 9xx
// Exclude: 9900000+ (GM/Event), 98xxxxx (future), etc.
const v95Mobs = allMobIds.filter(id => {
  // Include all legitimate v95 mob ranges
  if (id < 100000) return false; // Below 100000 are not v95 mobs
  if (id >= 9900000) return false; // GM/Event mobs
  if (id >= 9800000) return false; // Future content
  // Exclude known non-v95 ranges
  if (id >= 9000000 && id < 9100000) return false; // Event maps
  if (id >= 9200000 && id < 9300000) return false; // Phantom Forest
  // Keep everything else
  return true;
});
console.log(`Total v95-era mobs: ${v95Mobs.length}`);

let generated = 0;
let skipped = 0;

for (const mobId of v95Mobs) {
  if (existingDrops.has(mobId)) {
    continue;
  }
  
  const s = stats[mobId];
  if (!s) {
    // No stats available, skip
    continue;
  }
  
  const rewards = generateDropTable(mobId, s);
  
  const yamlContent = `# v95 drop table: Auto-generated from mob stats for mob ${mobId}\nrewards:\n` +
    rewards.map(r => `  - [ ${r.join(', ')} ]`).join('\n') + '\n';
  
  fs.writeFileSync(path.join(rewardDir, `${mobId}.yaml`), yamlContent);
  generated++;
}

console.log(`Generated ${generated} new drop tables`);
console.log(`Total mobs with drops now: ${existingDrops.size + generated}`);