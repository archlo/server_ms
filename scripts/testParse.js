const fs = require('fs');
const path = require('path');

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

const content = fs.readFileSync('C:\\Users\\jorge\\OneDrive\\Desktop\\server\\data\\reward\\150000.yaml', 'utf8');
const rewards = parseRewardFile(150000, content);
console.log('Rewards:', rewards.length);
console.log(rewards);