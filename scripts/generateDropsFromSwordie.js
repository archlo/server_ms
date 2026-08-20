#!/usr/bin/env node
/**
 * Generate drop tables from swordie v232 SQL for missing v95 mobs.
 * Filters for v95-era mobs (Victoria Island: 100000-999999).
 */

const fs = require('fs');
const path = require('path');

// Load all v95 mob IDs
const allMobIdsRaw = fs.readFileSync('C:\\Users\\jorge\\OneDrive\\Desktop\\ts\\all_mob_ids.txt', 'utf16le');
// Remove BOM if present
const allMobIdsClean = allMobIdsRaw.replace(/^\uFEFF/, '');
// Remove carriage returns (Windows line endings)
const allMobIdsNoCR = allMobIdsClean.replace(/\r/g, '');
const allMobIds = allMobIdsNoCR
  .trim().split('\n')
  .map(x => parseInt(x.trim().replace(/^0+/, ''), 10))
  .filter(x => !isNaN(x));

// Load existing drops
const existingDrops = new Set();
const rewardDir = path.join(__dirname, '..', 'data', 'reward');

for (const file of fs.readdirSync(rewardDir)) {
  if (file.endsWith('.yaml')) {
    existingDrops.add(parseInt(file.replace('.yaml', ''), 10));
  }
}

// Parse swordie SQL drops
const swordieDrops = new Map();
const sqlContent = fs.readFileSync(
  'C:\\Users\\jorge\\OneDrive\\Desktop\\swordie-232-main\\swordie-232-main\\sql\\InitTables_drops.sql', 
  'utf8'
);

const lines = sqlContent.split('\n');
for (const line of lines) {
  const match = line.match(/^\s*\((-?\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/);
  if (match) {
    const mobId = parseInt(match[1], 10);
    const itemId = parseInt(match[2], 10);
    const chance = parseInt(match[3], 10);
    const minQuant = parseInt(match[4], 10);
    const maxQuant = parseInt(match[5], 10);
    
    // Only v95-era mobs (Victoria Island: 100000-999999, exclude global -1)
    if (mobId >= 100000 && mobId <= 999999) {
      if (!swordieDrops.has(mobId)) {
        swordieDrops.set(mobId, []);
      }
      swordieDrops.get(mobId).push({
        itemId: parseInt(match[2], 10),
        chance: parseInt(match[3], 10),
        minQuant: parseInt(match[4], 10),
        maxQuant: parseInt(match[5], 10)
      });
    }
  }
}

console.log(`Swordie has drops for ${swordieDrops.size} v95-era mobs`);

// Filter for v95-era mobs (Victoria Island)
const v95Mobs = allMobIds.filter(id => id >= 100000 && id <= 999999);
console.log(`v95-era mobs: ${v95Mobs.length}`);

// Find missing mobs that swordie has data for
let generated = 0;
let skipped = 0;

for (const mobId of v95Mobs) {
  if (existingDrops.has(mobId)) {
    skipped++;
    continue;
  }
  
  const drops = swordieDrops.get(mobId);
  if (!drops || drops.length === 0) {
    continue;
  }
  
  // Convert swordie chance (0-10000) to probability (0-1)
  const rewards = drops.map(d => [
    d.itemId,
    d.minQuant,
    d.maxQuant,
    d.chance / 10000,
    0, // questId
    0  // fieldId
  ]);
  
  // Always add meso drop
  rewards.unshift([0, 5, 15, 0.7, 0, 0]);
  
  const yamlContent = `# v95 drop table: Auto-generated from swordie v232 for mob ${mobId}\nrewards:\n` +
    rewards.map(d => `  - [ ${d.join(', ')} ]`).join('\n') + '\n';
  
  fs.writeFileSync(path.join(rewardDir, `${mobId}.yaml`), yamlContent);
  generated++;
}

console.log(`Generated ${generated} new drop tables`);
console.log(`Skipped ${skipped} already existing`);