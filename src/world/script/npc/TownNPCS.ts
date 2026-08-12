import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

// ============================================================
// TAXI NPCS
// ============================================================

export function* taxi1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Haight St. (1022001) - Perion : Haight St. (102000000)
  const price = 1000;
  const townList: [number, string][] = [
    [100000000, 'Henesys (#b1000#k mesos)'],
    [101000000, 'Ellinia (#b1000#k mesos)'],
    [102000000, 'Perion (#b1000#k mesos)'],
    [103000000, 'Kerning City (#b1000#k mesos)'],
    [104000000, 'Lith Harbor (#b1000#k mesos)'],
    [120000000, 'Nautilus Harbor (#b1000#k mesos)'],
  ];
  const towns = townList.filter(([id]) => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach(([, label], i) => options.set(i, label));
  yield ctx.sayNext('Hello! I can take you to other towns. Where would you like to go?');
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b#m${towns[answer][0]}##k? It'll cost you #b${price}#k mesos.`)) {
    if (ctx.addMoney(-price)) {
      ctx.warp(towns[answer][0] as number);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

export function* taxi3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Thief St. (1052016) - Kerning City : Thief St. (103000000)
  yield ctx.sayNext('I can take you to other towns. Where would you like to go?');
  const towns = [100000000, 101000000, 102000000, 104000000, 120000000]
    .filter(id => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach((id, i) => options.set(i, `#m${id}#`));
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b#m${towns[answer]}##k?`)) {
    if (ctx.addMoney(-1000)) {
      ctx.warp(towns[answer]);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

export function* taxi4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Radiant Hall (1032000) - Ellinia : Radiant Hall (101000000)
  yield ctx.sayNext('I can take you to other towns. Where would you like to go?');
  const towns = [100000000, 102000000, 103000000, 104000000, 120000000]
    .filter(id => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach((id, i) => options.set(i, `#m${id}#`));
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b#m${towns[answer]}##k?`)) {
    if (ctx.addMoney(-1000)) {
      ctx.warp(towns[answer]);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

export function* taxi5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Nautilus (1092014) - Nautilus Harbor (120000000)
  yield ctx.sayNext('I can take you to other towns. Where would you like to go?');
  const towns = [100000000, 101000000, 102000000, 103000000, 104000000]
    .filter(id => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach((id, i) => options.set(i, `#m${id}#`));
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b#m${towns[answer]}##k?`)) {
    if (ctx.addMoney(-1000)) {
      ctx.warp(towns[answer]);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

export function* taxi6(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Henesys (1002007) - Henesys : Henesys (100000000)
  yield ctx.sayNext('I can take you to other towns. Where would you like to go?');
  const towns = [101000000, 102000000, 103000000, 104000000, 120000000]
    .filter(id => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach((id, i) => options.set(i, `#m${id}#`));
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b#m${towns[answer]}##k?`)) {
    if (ctx.addMoney(-1000)) {
      ctx.warp(towns[answer]);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

export function* mTaxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mr. Taxi : Lith Harbor (1002004) - Lith Harbor (104000000) / Kerning City (1032005)
  yield ctx.sayNext('I can take you to other towns. Where would you like to go?');
  const towns = [100000000, 101000000, 102000000, 103000000, 120000000]
    .filter(id => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach((id, i) => options.set(i, `#m${id}#`));
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b#m${towns[answer]}##k?`)) {
    if (ctx.addMoney(-1000)) {
      ctx.warp(towns[answer]);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

export function* ossyria_taxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Orbis (2023000) - Orbis : Orbis (200000000)
  const price = 10000;
  const towns = [
    [200000000, 'Orbis'],
    [220000000, 'Ludibrium'],
    [240000000, 'Leafre'],
    [250000000, 'Mu Lung'],
    [251000000, 'Herb Town'],
    [260000000, 'Ariant'],
    [261000000, 'Magatia'],
    [211000000, 'Omega Sector'],
  ].filter(([id]) => id !== ctx.getFieldId());
  const options = new Map<number, string>();
  towns.forEach(([, label], i) => options.set(i, `#b${label}#k (#b${price}#k mesos)`));
  yield ctx.sayNext('I can take you to other towns in Ossyria. Where would you like to go?');
  const answer: number = yield ctx.askMenu('Select your destination.', options);
  if (yield ctx.askYesNo(`Do you want to go to #b${towns[answer][1]}##k? It'll cost you #b${price}#k mesos.`)) {
    if (ctx.addMoney(-price)) {
      ctx.warp(towns[answer][0] as number);
    } else {
      yield ctx.sayOk('You do not have enough mesos.');
    }
  }
}

// ============================================================
// TOWN QUEST NPCs
// ============================================================

export function* carlie(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Carlie (2010000) - Orbis : Orbis (200000000) - Travel guide
  yield ctx.sayNext('Welcome to Orbis! I can tell you all about the different areas of Ossyria. What would you like to know?');
  const options = new Map<number, string>([
    [0, 'Tell me about Ludibrium'],
    [1, 'Tell me about El Nath'],
    [2, 'Tell me about Omega Sector'],
    [3, 'Nothing'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0) {
    yield ctx.sayOk('Ludibrium is a town of toy blocks. You can get there by taking the Minar Forest: Forest Tower portal from Orbis.');
  } else if (answer === 1) {
    yield ctx.sayOk('El Nath is a cold, snowy region. You can reach it from Orbis by taking the Orbis: El Nath road.');
  } else if (answer === 2) {
    yield ctx.sayOk('Omega Sector is a mysterious place. You can find the entrance from El Nath.');
  }
}

export function* mike(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mike (1040001) - Lith Harbor : Lith Harbor (104000000)
  yield ctx.sayNext("Hello there! I'm Mike, here to welcome you to Lith Harbor! I can give you some information about the town if you'd like.");
  if (yield ctx.askYesNo('Would you like to hear about the town?')) {
    yield ctx.sayOk('Lith Harbor is a peaceful port town. You can travel to other continents from here. There are ships to Victoria Island towns and beyond!');
  }
}

export function* jane(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Jane (1002100) - Henesys : Henesys (100000000) - Maple Travel Guide
  yield ctx.sayNext("Hey there! I'm Jane. I can tell you about the different towns on Victoria Island. Interested?");
  const options = new Map<number, string>([
    [0, 'Tell me about Henesys'],
    [1, 'Tell me about Ellinia'],
    [2, 'Tell me about Perion'],
    [3, 'Tell me about Kerning City'],
    [4, 'Tell me about Lith Harbor'],
    [5, 'Tell me about Nautilus Harbor'],
    [6, 'Never mind'],
  ]);
  const answer: number = yield ctx.askMenu('What would you like to know?', options);
  const descriptions: Record<number, string> = {
    0: 'Henesys is a peaceful town full of greenery. The Bowman job instructors are here.',
    1: 'Ellinia is a town of mages, located high up in the trees.',
    2: 'Perion is a rugged warrior town built into the mountains.',
    3: 'Kerning City is a dark, urban city where thieves train.',
    4: 'Lith Harbor is a calm port where travelers first arrive on Victoria Island.',
    5: 'Nautilus Harbor is the home port of the Nautilus, where pirates train.',
  };
  if (answer >= 0 && answer <= 5) {
    yield ctx.sayOk(descriptions[answer]);
  }
}

export function* leaderAl(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leader Al (1002103) - Henesys : Henesys (100000000) - Archer instructor
  if (ctx.getJob() === 200) {
    yield ctx.sayNext("So you want to become a Bowman? I can help you with that.");
    if (yield ctx.askYesNo("Are you sure you want to become a Bowman?")) {
      ctx.setJob(300);
      yield ctx.sayOk("You are now a Bowman! Welcome to the guild of archers.");
    }
  } else if (ctx.getJob() === 300) {
    yield ctx.sayNext("You're already a Bowman. Come back when you're stronger for your 2nd job advancement.");
  } else {
    yield ctx.sayOk("Hello, traveler.");
  }
}

export function* rein(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Rein (12101) - Tween 12 o'clock 1st Floor - Sleepywood quest NPC
  if (ctx.hasQuestStarted(1043) && ctx.hasItem(4031147)) {
    yield ctx.sayNext("Oh! That's the letter I've been waiting for!");
    if (ctx.removeItem(4031147)) {
      ctx.forceCompleteQuest(1043);
      yield ctx.sayOk("Thank you so much for delivering this!");
    }
  } else if (!ctx.hasQuestCompleted(1043)) {
    yield ctx.sayNext("Hi there! I'm waiting for an important letter...");
  } else {
    yield ctx.sayOk("Hello again!");
  }
}

export function* owen(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Owen (1032100) - Ellinia : Magic Library (101000003)
  yield ctx.sayNext("Welcome to the Magic Library. Here you can find knowledge about magic.");
  if (yield ctx.askYesNo("Would you like to know about the different types of magic?")) {
    yield ctx.sayOk("There are three main types of magic: Fire/Poison, Ice/Lightning, and Holy. Each has its own strengths and weaknesses. Choose wisely!");
  }
}

export function* rowen(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Rowen (1032101) - Ellinia : Magic Library (101000003)
  yield ctx.sayNext("I'm Rowen, the keeper of magical tomes. What brings you here?");
  if (yield ctx.askYesNo("Would you like to browse my books?")) {
    yield ctx.sayOk("Feel free to look around. There's much to learn about the magical arts.");
  }
}

// ============================================================
// JOB ADVANCEMENT NPCs
// ============================================================

export function* change_swordman(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Change Class (1072000) - Warrior Job Instructor
  // 1st job -> Warrior (100)
  if (ctx.getLevel() >= 10 && ctx.getJob() === 0) {
    if (yield ctx.askYesNo('Do you want to become a Warrior? You need at least 35 STR.')) {
      const cs = ctx.user.getCharacterStat();
      if (cs.baseStr >= 35) {
        ctx.setJob(100);
        yield ctx.sayOk('You are now a Warrior! Train hard!');
      } else {
        yield ctx.sayOk("You don't have enough STR. Train more and come back.");
      }
    }
  } else if (ctx.getJob() === 100) {
    yield ctx.sayOk('You are already a Warrior.');
  } else {
    yield ctx.sayOk('You are not qualified to become a Warrior.');
  }
}

export function* change_magician(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Change Class (1072001) - Magician Job Instructor
  if (ctx.getLevel() >= 8 && ctx.getJob() === 0) {
    if (yield ctx.askYesNo('Do you want to become a Magician? You need at least 20 INT.')) {
      if (ctx.user.getCharacterStat().baseInt >= 20) {
        ctx.setJob(200);
        yield ctx.sayOk('You are now a Magician! Train hard!');
      } else {
        yield ctx.sayOk("You don't have enough INT. Train more and come back.");
      }
    }
  } else if (ctx.getJob() === 200) {
    yield ctx.sayOk('You are already a Magician.');
  } else {
    yield ctx.sayOk('You are not qualified to become a Magician.');
  }
}

export function* change_archer(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Change Class (1072002) - Bowman Job Instructor
  if (ctx.getLevel() >= 10 && ctx.getJob() === 0) {
    if (yield ctx.askYesNo('Do you want to become a Bowman? You need at least 25 DEX.')) {
      if (ctx.user.getCharacterStat().baseDex >= 25) {
        ctx.setJob(300);
        yield ctx.sayOk('You are now a Bowman! Train hard!');
      } else {
        yield ctx.sayOk("You don't have enough DEX. Train more and come back.");
      }
    }
  } else if (ctx.getJob() === 300) {
    yield ctx.sayOk('You are already a Bowman.');
  } else {
    yield ctx.sayOk('You are not qualified to become a Bowman.');
  }
}

export function* change_rogue(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Change Class (1072003) - Rogue Job Instructor
  if (ctx.getLevel() >= 10 && ctx.getJob() === 0) {
    if (yield ctx.askYesNo('Do you want to become a Rogue? You need at least 25 DEX.')) {
      if (ctx.user.getCharacterStat().baseDex >= 25) {
        ctx.setJob(400);
        yield ctx.sayOk('You are now a Rogue! Train hard!');
      } else {
        yield ctx.sayOk("You don't have enough DEX. Train more and come back.");
      }
    }
  } else if (ctx.getJob() === 400) {
    yield ctx.sayOk('You are already a Rogue.');
  } else {
    yield ctx.sayOk('You are not qualified to become a Rogue.');
  }
}

export function* inside_swordman(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* change_swordman(ctx);
}

export function* inside_magician(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* change_magician(ctx);
}

export function* inside_archer(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* change_archer(ctx);
}

export function* inside_rogue(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* change_rogue(ctx);
}

export function* inside_pirate(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Inside (1072008) - Pirate Job Instructor
  if (ctx.getLevel() >= 10 && ctx.getJob() === 0) {
    if (yield ctx.askYesNo('Do you want to become a Pirate? You need at least 20 DEX.')) {
      if (ctx.user.getCharacterStat().baseDex >= 20) {
        ctx.setJob(500);
        yield ctx.sayOk('You are now a Pirate! Train hard!');
      } else {
        yield ctx.sayOk("You don't have enough DEX. Train more and come back.");
      }
    }
  } else if (ctx.getJob() === 500) {
    yield ctx.sayOk('You are already a Pirate.');
  } else {
    yield ctx.sayOk('You are not qualified to become a Pirate.');
  }
}

// ============================================================
// 3RD JOB ADVANCEMENT NPCs
// ============================================================

export function* warrior3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 3rd Job Instructor : Warrior (2020008) - Sleepywood : Dangerous Forest
  if (ctx.getLevel() >= 60 && ctx.getJob() >= 110 && ctx.getJob() <= 112) {
    if (yield ctx.askYesNo('Are you ready to take on the 3rd job advancement challenge?')) {
      yield ctx.sayOk('Go to the Forest of the Priest and defeat the creatures there. Bring me proof of your strength.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 3rd job advancement.');
  }
}

export function* wizard3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 3rd Job Instructor : Magician (2020009)
  if (ctx.getLevel() >= 60 && ctx.getJob() >= 210 && ctx.getJob() <= 212) {
    if (yield ctx.askYesNo('Are you ready to take on the 3rd job advancement challenge?')) {
      yield ctx.sayOk('Prove your magical prowess by defeating powerful creatures.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 3rd job advancement.');
  }
}

export function* bowman3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 3rd Job Instructor : Bowman (2020010)
  if (ctx.getLevel() >= 60 && ctx.getJob() >= 310 && ctx.getJob() <= 312) {
    if (yield ctx.askYesNo('Are you ready to take on the 3rd job advancement challenge?')) {
      yield ctx.sayOk('Prove your archery skills by taking down powerful monsters.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 3rd job advancement.');
  }
}

export function* thief3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 3rd Job Instructor : Thief (2020011)
  if (ctx.getLevel() >= 60 && ctx.getJob() >= 410 && ctx.getJob() <= 412) {
    if (yield ctx.askYesNo('Are you ready to take on the 3rd job advancement challenge?')) {
      yield ctx.sayOk('Prove your skills through stealth and combat.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 3rd job advancement.');
  }
}

export function* pirate3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 3rd Job Instructor : Pirate (2020013)
  if (ctx.getLevel() >= 60 && ctx.getJob() >= 510 && ctx.getJob() <= 512) {
    if (yield ctx.askYesNo('Are you ready to take on the 3rd job advancement challenge?')) {
      yield ctx.sayOk('Show me your pirate spirit by defeating powerful foes.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 3rd job advancement.');
  }
}

export function* warrior4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 4th Job Instructor : Warrior (2081100) - Leafre
  if (ctx.getLevel() >= 100 && ctx.getJob() >= 111 && ctx.getJob() <= 112) {
    if (yield ctx.askYesNo('Are you ready for the 4th job advancement?')) {
      yield ctx.sayOk('Go and defeat the powerful beings in the Temple of Time to prove yourself worthy.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 4th job advancement.');
  }
}

export function* magician4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 4th Job Instructor : Magician (2081200) - Leafre
  if (ctx.getLevel() >= 100 && ctx.getJob() >= 211 && ctx.getJob() <= 212) {
    if (yield ctx.askYesNo('Are you ready for the 4th job advancement?')) {
      yield ctx.sayOk('Prove your ultimate magical power in the Temple of Time.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 4th job advancement.');
  }
}

export function* archer4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 4th Job Instructor : Bowman (2081300) - Leafre
  if (ctx.getLevel() >= 100 && ctx.getJob() >= 311 && ctx.getJob() <= 312) {
    if (yield ctx.askYesNo('Are you ready for the 4th job advancement?')) {
      yield ctx.sayOk('The ultimate test awaits you in the Temple of Time.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 4th job advancement.');
  }
}

export function* thief4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 4th Job Instructor : Thief (2081400) - Leafre
  if (ctx.getLevel() >= 100 && ctx.getJob() >= 411 && ctx.getJob() <= 412) {
    if (yield ctx.askYesNo('Are you ready for the 4th job advancement?')) {
      yield ctx.sayOk('Your final shadow trial awaits in the Temple of Time.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 4th job advancement.');
  }
}

export function* pirate4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 4th Job Instructor : Pirate (2081500) - Leafre
  if (ctx.getLevel() >= 100 && ctx.getJob() >= 511 && ctx.getJob() <= 512) {
    if (yield ctx.askYesNo('Are you ready for the 4th job advancement?')) {
      yield ctx.sayOk('Prove yourself as a true captain in the Temple of Time.');
    }
  } else {
    yield ctx.sayOk('You are not yet ready for the 4th job advancement.');
  }
}

// ============================================================
// REFINING NPCs
// ============================================================

export function* refine_henesys(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1012002) - Henesys
  yield ctx.sayNext('I can refine materials for you. What would you like to make?');
  const options = new Map<number, string>([
    [0, 'Make a Plate Ore'],
    [1, 'Make a Jewel Ore'],
    [2, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4010000)) {
    if (ctx.removeItem(4010000) && ctx.addItem(4011000)) {
      yield ctx.sayOk('Here is your refined Plate Ore!');
    }
  } else if (answer === 1 && ctx.hasItem(4020000)) {
    if (ctx.removeItem(4020000) && ctx.addItem(4021000)) {
      yield ctx.sayOk('Here is your refined Jewel Ore!');
    }
  } else {
    yield ctx.sayOk("You don't have the right materials.");
  }
}

export function* refine_ellinia(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1032002) - Ellinia
  yield ctx.sayNext('Welcome to the Magic Refinery. I can process magical ores for you.');
  const options = new Map<number, string>([
    [0, 'Refine a Jewel Ore'],
    [1, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4020000)) {
    if (ctx.removeItem(4020000) && ctx.addItem(4021000)) {
      yield ctx.sayOk('Your jewel has been refined!');
    }
  } else {
    yield ctx.sayOk('Come back when you have the materials.');
  }
}

export function* refine_kerning(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1052002) - Kerning City
  yield ctx.sayNext('I can refine materials for you.');
  const options = new Map<number, string>([
    [0, 'Make Screws (30)'],
    [1, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4010000, 3)) {
    ctx.removeItem(4010000, 3);
    ctx.addItem(4003000, 30);
    yield ctx.sayOk('Here are 30 Screws!');
  } else {
    yield ctx.sayOk("You don't have the materials. You need 3 Plate Ores.");
  }
}

export function* refine_kerning2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1052003) - Kerning City
  yield ctx.sayNext('I can refine various materials for you.');
  const options = new Map<number, string>([
    [0, 'Refine a Stone'],
    [1, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4010000)) {
    if (ctx.removeItem(4010000) && ctx.addItem(4011000)) {
      yield ctx.sayOk('Done!');
    }
  } else {
    yield ctx.sayOk("You don't have the right materials.");
  }
}

export function* refine_perion(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1022003) - Perion
  yield ctx.sayNext('I can smelt ores for you warriors.');
  const options = new Map<number, string>([
    [0, 'Smelt Iron Ore'],
    [1, 'Smelt Steel Ore'],
    [2, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4010001)) {
    ctx.removeItem(4010001);
    ctx.addItem(4011000);
    yield ctx.sayOk('Iron refined!');
  } else if (answer === 1 && ctx.hasItem(4010002)) {
    ctx.removeItem(4010002);
    ctx.addItem(4011001);
    yield ctx.sayOk('Steel refined!');
  } else {
    yield ctx.sayOk("You don't have the right ores.");
  }
}

export function* refine_perion2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1022004) - Perion
  yield ctx.sayNext('I can refine precious ores for you.');
  const options = new Map<number, string>([
    [0, 'Refine Gold Ore'],
    [1, 'Refine Silver Ore'],
    [2, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4010005)) {
    ctx.removeItem(4010005);
    ctx.addItem(4011005);
    yield ctx.sayOk('Gold refined!');
  } else if (answer === 1 && ctx.hasItem(4010004)) {
    ctx.removeItem(4010004);
    ctx.addItem(4011004);
    yield ctx.sayOk('Silver refined!');
  } else {
    yield ctx.sayOk("You don't have the right ores.");
  }
}

export function* refine_sleepy(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1061000) - Sleepywood
  yield ctx.sayNext('I can process the rare ores found in the deep dungeons.');
  const options = new Map<number, string>([
    [0, 'Reform Dark Crystal Ore'],
    [1, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4020008)) {
    ctx.removeItem(4020008);
    ctx.addItem(4021008);
    yield ctx.sayOk('The Dark Crystal has been purified!');
  } else {
    yield ctx.sayOk("You don't have the right materials.");
  }
}

export function* refine_nautillus(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (1091003) - Nautilus Harbor
  yield ctx.sayNext('I can refine ores for you pirates!');
  const options = new Map<number, string>([
    [0, 'Refine Crystals'],
    [1, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4020000)) {
    ctx.removeItem(4020000);
    ctx.addItem(4021000);
    yield ctx.sayOk('Crystal refined!');
  } else {
    yield ctx.sayOk("You don't have the materials.");
  }
}

export function* refine_elnath(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Refining NPC (2020000) - El Nath
  yield ctx.sayNext('I can work with the cold-resistant ores found in El Nath.');
  const options = new Map<number, string>([
    [0, 'Refine Mithril Ore'],
    [1, 'Cancel'],
  ]);
  const answer: number = yield ctx.askMenu(null, options);
  if (answer === 0 && ctx.hasItem(4010002)) {
    ctx.removeItem(4010002);
    ctx.addItem(4011001);
    yield ctx.sayOk('Mithril refined!');
  } else {
    yield ctx.sayOk("You don't have the right ores.");
  }
}

// ============================================================
// GACHAPON NPCs
// ============================================================

function gachaponItem(minLevel: number): number[] {
  const items: Record<number, number[]> = {
    10: [1302000, 1312000, 1322000, 1332000, 1042000, 1062000],
    20: [1302001, 1312001, 1322001, 1332001, 1042001, 1062001],
    30: [1302002, 1312002, 1322002, 1332002, 1042002, 1062002],
    40: [1302003, 1312003, 1322003, 1332003, 1042003, 1062003],
  };
  const keys = Object.keys(items).map(Number).sort((a, b) => a - b);
  const poolKeys = keys.filter(k => minLevel >= k);
  const targetKey = poolKeys.length > 0 ? poolKeys[poolKeys.length - 1] : keys[0];
  return items[targetKey];
}

function* doGachapon(ctx: ScriptContext, minLevel: number, cost: number, name: string): Generator<ScriptMessage, void, any> {
  if (yield ctx.askYesNo(`Would you like to use the ${name} Gachapon? It costs #b${cost}#k mesos.`)) {
    if (!ctx.addMoney(-cost)) {
      yield ctx.sayOk("You don't have enough mesos.");
      return;
    }
    const pool = gachaponItem(minLevel);
    const itemId = pool[Math.floor(Math.random() * pool.length)];
    if (ctx.addItem(itemId, 1)) {
      yield ctx.sayOk(`Congratulations! You got #b#t${itemId}##k from the Gachapon!`);
    } else {
      yield ctx.sayOk("Your inventory is full. Make room and come back.");
      ctx.addMoney(cost);
    }
  }
}

// Gachapon NPCs: gachapon1 through gachapon18

function gachaponSetup(ctx: ScriptContext, id: number): Generator<ScriptMessage, void, any> {
  const gachaInfo: Record<number, { name: string; cost: number; minLevel: number }> = {
    1: { name: 'Henesys', cost: 1000, minLevel: 10 },
    2: { name: 'Ellinia', cost: 1000, minLevel: 10 },
    3: { name: 'Perion', cost: 1000, minLevel: 10 },
    4: { name: 'Kerning City', cost: 1000, minLevel: 10 },
    5: { name: 'Lith Harbor', cost: 1000, minLevel: 10 },
    6: { name: 'Sleepywood', cost: 2000, minLevel: 30 },
    7: { name: 'Orbis', cost: 3000, minLevel: 40 },
    8: { name: 'Ludibrium', cost: 3000, minLevel: 40 },
    9: { name: 'El Nath', cost: 3000, minLevel: 50 },
    10: { name: 'Mu Lung', cost: 3000, minLevel: 50 },
    11: { name: 'Ariant', cost: 3000, minLevel: 50 },
    13: { name: 'NLC', cost: 3000, minLevel: 50 },
    18: { name: 'Leafre', cost: 3000, minLevel: 60 },
  };

  const info = gachaInfo[id] || { name: 'Regular', cost: 1000, minLevel: 10 };
  return doGachapon(ctx, info.minLevel, info.cost, info.name);
}

export function* gachapon1(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 1); }
export function* gachapon2(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 2); }
export function* gachapon3(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 3); }
export function* gachapon4(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 4); }
export function* gachapon5(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 5); }
export function* gachapon6(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 6); }
export function* gachapon7(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 7); }
export function* gachapon8(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 8); }
export function* gachapon9(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 9); }
export function* gachapon10(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 10); }
export function* gachapon11(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 11); }
export function* gachapon13(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 13); }
export function* gachapon18(ctx: ScriptContext): Generator<ScriptMessage, void, any> { yield* gachaponSetup(ctx, 18); }

// ============================================================
// DOJO NPCs
// ============================================================

export function* dojang_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mu Lung Dojo Entrance (2091005)
  if (yield ctx.askYesNo('Would you like to enter the Mu Lung Dojo?')) {
    ctx.warp(925020000, 'sp'); // Mu Lung Dojo : Waiting Room
  }
}

export function* dojang_move(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mu Lung Dojo Move (2091006)
  yield ctx.sayNext('Do you want to advance to the next stage?');
  // Implementation would track current floor and move to next
  yield ctx.sayOk('You advanced to the next floor!');
}

// ============================================================
// ZAKUM NPCs
// ============================================================

export function* Zakum00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zakum Altar (2030008) - Entrance to Zakum
  yield ctx.sayNext('Do you want to face Zakum?');
  if (yield ctx.askYesNo('Are you sure you want to challenge Zakum?')) {
    yield ctx.sayOk('Enter the altar when you are ready.');
    ctx.warp(280030000, 'sp'); // Zakum's Altar
  }
}

export function* Zakum01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zakum Door 1 (2032002) - Door to Zakum's Chamber
  if (ctx.hasItem(4001017)) {
    if (ctx.removeItem(4001017)) {
      ctx.warp(280030100);
    }
  } else {
    yield ctx.sayOk('You need a Piece of Fire to enter.');
  }
}

export function* Zakum02(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zakum Door 2 (2032003)
  if (yield ctx.askYesNo('Ready to face the Chaos Zakum?')) {
    ctx.warp(280030200);
  }
}

export function* Zakum04(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zakum Door 4 (2030011)
  yield ctx.sayOk('The door to Zakum is here.');
}

export function* Zakum06(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zakum Door 6 (2030010)
  yield ctx.sayOk('The gate to the unknown is before you.');
}

export function* zakum_accept(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zakum Acceptance (2030013)
  yield ctx.sayNext('Are you ready to accept the challenge of Zakum?');
  if (yield ctx.askYesNo('The challenge is not for the faint of heart. Are you sure?')) {
    ctx.warp(280030000);
  }
}

// ============================================================
// HORNTAIL NPCs
// ============================================================

export function* hontale_accept(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Horntail Acceptance (2083004) - Leafre
  if (ctx.getLevel() >= 80) {
    if (yield ctx.askYesNo('Are you ready to face Horntail?')) {
      yield ctx.sayOk("Go to the Cave of Life and prove yourself.");
      ctx.warp(240050000, 'sp'); // Cave of Life - Entrance
    }
  } else {
    yield ctx.sayOk('You need to be at least level 80 to face Horntail.');
  }
}

export function* hontale_enter1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Horntail Entrance 1 (2083001)
  if (yield ctx.askYesNo('Go deeper into the Cave of Life?')) {
    ctx.warp(240050300);
  }
}

export function* hontale_enterToE(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Horntail Enter To E (2083000) 
  if (yield ctx.askYesNo('Enter the path to Horntail?')) {
    ctx.warp(240050310);
  }
}

export function* hontale_Bdoor(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Horntail Bdoor (2083003)
  yield ctx.sayOk('The path to Horntail is open.');
}

export function* hontale_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Horntail Out (2083002)
  ctx.warp(240000000); // Leafre
}

export function* hontale_keroben(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Horntail Keroben (2081005) - Leafre
  if (ctx.hasQuestStarted(7091)) {
    yield ctx.sayNext('You must face Horntail to complete your quest.');
  } else {
    yield ctx.sayOk('The Cave of Life is dangerous. Be prepared.');
  }
}

// ============================================================
// ARIANT NPCS
// ============================================================

export function* ariant_oasis(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant Oasis (2103000) - Ariant : Ariant (260000000)
  yield ctx.sayNext("Welcome to the Ariant Oasis! It's a great place to rest.");
}

export function* ariant_ring(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant Ring (2103002) - Ariant : Residential District
  yield ctx.sayOk("This ring holds the key to the Ariant Coliseum.");
}

export function* ariant_house1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant House 1 (2103003)
  yield ctx.sayOk("A warm house. It's empty right now.");
}

export function* ariant_house2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant House 2 (2103004)
  yield ctx.sayOk("A small house with desert decorations.");
}

export function* ariant_house3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant House 3 (2103005)
  yield ctx.sayOk("The scent of spices fills this house.");
}

export function* ariant_house4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant House 4 (2103006)
  yield ctx.sayOk("A merchant's home, filled with goods from across the desert.");
}

export function* secret_wall(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Secret Wall (2103001) - Ariant
  yield ctx.sayOk("The wall seems solid, but there's a faint outline of a door...");
}

export function* dooat(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dooat (2103013) - Ariant
  yield ctx.sayNext("Welcome to the Ariant Coliseum! Ready to battle?");
  if (yield ctx.askYesNo('Would you like to enter the coliseum?')) {
    ctx.warp(260000000);
  }
}

// ============================================================
// MAGATIA NPCs
// ============================================================

export function* magatia_dark1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Magatia Dark Room Door (2111010) - Magatia
  yield ctx.sayOk("The door to the dark research area. You feel a sinister presence.");
}

export function* alceCircle1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Alchemy Circle 1 (2111020) - Magatia - Zenumist
  yield ctx.sayOk("An alchemy circle pulsing with dark energy.");
}

export function* alceCircle2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Alchemy Circle 2 (2111021)
  yield ctx.sayOk("This circle seems to be used for powerful transmutations.");
}

export function* alceCircle3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Alchemy Circle 3 (2111022)
  yield ctx.sayOk("The circle glows with a faint green light.");
}

export function* alceCircle4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Alchemy Circle 4 (2111023)
  yield ctx.sayOk("The largest alchemy circle in the room.");
}
