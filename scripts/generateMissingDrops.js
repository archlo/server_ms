#!/usr/bin/env node
/**
 * Generate basic drop tables for missing mobs based on their level/type.
 * Uses mob stats from NX data to create appropriate drop tables.
 */

const fs = require('fs');
const path = require('path');

// Load mob stats from NX data
function loadMobStats() {
  const stats = {};
  // Parse the NX mob dump for level/hp/exp info
  const dump = fs.readFileSync('mob_full_dump.txt', 'utf8');
  
  let currentMob = null;
  for (const line of dump.split('\n')) {
    const mobMatch = line.match(/^\s*(\d{7})\.img/);
    if (mobMatch) {
      currentMob = parseInt(mobMatch[1], 10);
      stats[currentMob] = { level: 1, maxHp: 10, exp: 1 };
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

// Generate drop table based on mob level and type
function generateDropTable(mobId, mobStats) {
  const level = mobStats?.level || 1;
  const maxHp = mobStats?.maxHp || 10;
  const exp = mobStats?.exp || 1;
  
  // Determine mob category from ID
  const category = Math.floor(mobId / 10000);
  
  // Base meso range scales with level
  const mesoMin = Math.max(1, Math.floor(level * 0.5));
  const mesoMax = Math.max(mesoMin + 2, Math.floor(level * 1.5));
  
  // Common drops by category
  let etcDrop = null;
  let equipDrop = null;
  let useDrop = null;
  
  switch (category) {
    case 10: // Victoria Island early
      etcDrop = { id: 4000000, min: 1, max: 1, prob: 0.25 }; // Squishy Liquid
      equipDrop = { id: 1040000, min: 1, max: 1, prob: 0.01 }; // Work Gloves
      break;
    case 11: // Victoria Island mid
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.3 }; // Blue Potion
      equipDrop = { id: 1040000, min: 1, max: 1, prob: 0.01 };
      break;
    case 12: // Victoria Island late
      etcDrop = { id: 4000002, min: 1, max: 1, prob: 0.2 }; // Red Potion
      equipDrop = { id: 1040002, min: 1, max: 1, prob: 0.01 }; // Leather Shoes
      break;
    case 13: // Henesys/Orbis
      etcDrop = { id: 4000001, min: 1, max: 1, prob: 0.2 };
      equipDrop = { id: 1040002, min: 1, max: 1, prob: 0.01 };
      break;
    case 21: // Ludibrium
      etcDrop = { id: 4000001, min: 1, max: 1, prob: 0.2 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 }; // Steel Cap
      break;
    case 22: // El Nath
      etcDrop = { id: 4000005, min: 1, max: 1, prob: 0.35 }; // White Potion
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 23: // Dead Mine
      etcDrop = { id: 4000001, min: 1, max: 1, prob: 0.2 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 30: // Aqua Road
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.15 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 31: // Deep Sea
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.15 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 32: // Singapore/Amherst
      etcDrop = { id: 4000007, min: 1, max: 1, prob: 0.35 }; // Mana Elixir
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 42: // Zipangu
      etcDrop = { id: 4000007, min: 1, max: 1, prob: 0.35 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 50: // Mu Lung/Herb Town
      etcDrop = { id: 4000005, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 51: // Nihal Desert
      etcDrop = { id: 4000003, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 52: // Ariant
      etcDrop = { id: 4000003, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 60: // Masteria
      etcDrop = { id: 4000007, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 61: // Wedding
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 62: // Herb Town
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 63: // Rien
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 64: // Magatia
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 70: // Event/Quest
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.15 };
      break;
    case 80: // Boss/Event
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.01 };
      break;
    case 81: // Boss
      etcDrop = { id: 4000007, min: 1, max: 1, prob: 0.35 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.01 };
      break;
    case 88: // Monster Carnival
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.2 };
      break;
    case 90: // Event/Maple Island
      etcDrop = { id: 4000000, min: 1, max: 1, prob: 0.1 };
      break;
    case 91: // Kerning Square
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.15 };
      break;
    case 92: // Phantom Forest
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.2 };
      break;
    case 93: // Crimsonwood
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.25 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.005 };
      break;
    case 94: // Temple of Time
      etcDrop = { id: 4000007, min: 1, max: 1, prob: 0.3 };
      equipDrop = { id: 1040008, min: 1, max: 1, prob: 0.01 };
      break;
    case 95: // Aran/Evan
      etcDrop = { id: 4000004, min: 1, max: 1, prob: 0.2 };
      break;
    case 99: // GM/Event
      etcDrop = { id: 4000000, min: 1, max: 1, prob: 0.1 };
      break;
    default:
      etcDrop = { id: 4000000, min: 1, max: 1, prob: 0.1 };
  }

  // Build rewards array
  const rewards = [];
  
  // Meso (always present)
  rewards.push([0, mesoMin, mesoMax, 0.7, 0, 0]);
  
  // Etc drop
  if (etcDrop) {
    rewards.push([etcDrop.id, etcDrop.min, etcDrop.max, etcDrop.prob, 0, 0]);
  }
  
  // Equip drop (rare)
  if (equipDrop) {
    rewards.push([equipDrop.id, equipDrop.min, equipDrop.max, equipDrop.prob, 0, 0]);
  }
  
  // Use items for higher level mobs
  if (level > 30) {
    rewards.push([2000000, 1, 1, 0.05, 0, 0]); // White Potion
  }
  if (level > 50) {
    rewards.push([2000001, 1, 1, 0.03, 0, 0]); // Mana Elixir
  }
  
  return rewards;
}

// Main
const stats = loadMobStats();
const existingDrops = new Set();
const rewardDir = path.join(__dirname, '..', 'data', 'reward');

for (const file of fs.readdirSync(rewardDir)) {
  if (file.endsWith('.yaml')) {
    existingDrops.add(parseInt(file.replace('.yaml', ''), 10));
  }
}

const allMobs = fs.readFileSync('all_mob_ids.txt', 'utf8').trim().split('\n').map(x => parseInt(x.trim(), 10));

let generated = 0;
for (const mobId of allMobs) {
  if (existingDrops.has(mobId)) continue;
  
  const mobStats = stats[mobId];
  const rewards = generateDropTable(mobId, mobStats);
  
  const yamlContent = `# v95 drop table: Auto-generated for mob ${mobId}\nrewards:\n` +
    rewards.map(r => `  - [ ${r.join(', ')} ]`).join('\n') + '\n';
  
  fs.writeFileSync(path.join(rewardDir, `${mobId}.yaml`), yamlContent);
  generated++;
}

console.log(`Generated ${generated} new drop tables`);