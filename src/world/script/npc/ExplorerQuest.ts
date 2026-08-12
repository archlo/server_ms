import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { JobConstants } from '../../job/JobConstants';

/** Generic helper for entering an Explorer Training Center. */
function* enterTrainingCenter(ctx: ScriptContext, reqJobId: number, reqJobName: string, fieldId: number): Generator<ScriptMessage, void, any> {
  // If the user is level 20 or above, or not the correct job, they should not be able to access the Training Center
  if (ctx.getLevel() >= 20 || ctx.getJob() !== reqJobId) {
    yield ctx.sayOk(`Sorry, but this is a training center only available to ${reqJobName} under Lv. 20.`);
    return;
  }
  const fieldNames = [
    'Room of Courage',
    'Room of Wisdom',
    'Room of Skill',
    'Room of Training',
    'Room of Power',
  ];
  const options = new Map<number, string>();
  for (let i = 0; i < fieldNames.length; i++) {
    const roomFieldId = fieldId + i;
    const roomField = ctx.field.getFieldStorage()?.getFieldById(roomFieldId);
    if (!roomField) {
      console.warn(`[ExplorerQuest] enterTrainingCenter: could not resolve field ID ${roomFieldId}`);
      continue;
    }
    // Only add the option if there are less than 5 people in the map
    const userCount = roomField.getUserPool().getAll().length;
    if (userCount < 5) {
      options.set(roomFieldId, `${fieldNames[i]} (${userCount}/5)`);
    }
  }
  // If all maps are already full, notify the user
  if (options.size === 0) {
    yield ctx.sayOk("I'm sorry, but it appears that all the training centers are currently full. Please come back later!");
    return;
  }
  const targetFieldId: number = yield ctx.askMenu(`#e#b[Notice]#n#k\r\nAdventurers!\r\nThis is a training center for ${reqJobName} under Lv. 20. While you can always train on your own, training with others will allow you to become stronger in a faster time. Select the room you would like to train in.#b`, options);
  ctx.warp(targetFieldId);
}

export function* enter_warrior(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Power B. Fore : Entrance to Warrior Training Center (1022105)
  //   North Rocky Mountain : Perion Northern Ridge (102020000)
  yield* enterTrainingCenter(ctx, 100, 'Warriors', 910220000); // Victoria Road : Warrior Training Center
}

export function* enter_magicion(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Power B. Fore : Entrance to Magician Training Center (1032114)
  //   Chimney Tree : Close to the Wind (101020000)
  yield* enterTrainingCenter(ctx, 200, 'Magicians', 910120000); // Victoria Road : Magician Training Center
}

export function* enter_archer(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Power B. Fore : Entrance to Bowman Training Center (1012119)
  //   Singing Mushroom Forest : Spore Hill (100020000)
  if (ctx.hasQuestStarted(22518)) {
    ctx.warpInstance([910060100], 'start', 100020000, 60 * 30);
    return;
  }
  yield* enterTrainingCenter(ctx, 300, 'Bowmen', 910060000); // Victoria Road : Bowman Training Center
}

export function* enter_thief(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Power B. Fore : Entrance to Thief Training Center (1052114)
  //   Construction Site : Caution Falling Down (103010000)
  yield* enterTrainingCenter(ctx, 400, 'Thieves', 910310000); // Victoria Road : Thief Training Center
}

export function* enter_pirate(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Power B. Fore : Entrance to Pirate Training Center (1095002)
  //   Beach : Coastal Forest (120020000)
  yield* enterTrainingCenter(ctx, 500, 'Pirates', 912030000); // Victoria Road : Pirate Training Center
}

export function* magician(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Grendel the Really Old : Magician Instructor (1032001)
  //   Ellinia : Magic Library (101000003)
  if (ctx.getJob() === 0) {
    const jobChangeLevel = JobConstants.getJobChangeLevel(200, 0, 1);
    yield ctx.sayNext(`Do you want to be a Magician? You need to meet some requirements in order to do so. You need to be at least #bLevel ${jobChangeLevel}#k. Let's see if you have what it takes to become a Magician.`);
    if (ctx.getLevel() < jobChangeLevel) {
      yield ctx.sayOk('You need more training to be a Magician. In order to be one, you need to train yourself to be more powerful than you are right now. Please come back when you are much stronger.');
      return;
    }
    if (!(yield ctx.askYesNo('You definitely have the look of a Magician. You may not be there yet, but I can see the Magician in you. What do you think? Do you want to become a Magician?'))) {
      yield ctx.sayOk('Really? Have to give more thought to it, huh? Take your time. This is not something you should take lightly... come talk to me once you have made your decision');
      return;
    }
    yield ctx.sayNext("You're now a Magician from here on out! It isn't much, but as the head Magician, I, #p1032001#, will give you a little bit of what I have...");
    if (!ctx.addItem(1372043, 1)) { // Beginner Magician's Wand
      yield ctx.sayOk('Please make sure that you have an empty slot in your #rEQP. inventory#k and then talk to me again.');
      return;
    }
    ctx.setJob(200);
    if (ctx.getLevel() > jobChangeLevel) {
      yield ctx.sayBoth('I think you are a bit late with making a job advancement. But don\'t worry, I have compensated you with additional Skill Points that you didn\'t receive by making the advancement so late.');
    }
    yield ctx.sayBoth('You have just equipped yourself with more magical power. Please continue training and improving. I\'ll be watching you here and there.');
    yield ctx.sayBoth("I just gave you a little bit of #bSP#k. When you open up the #bSkill menu#k on the lower right corner of the screen, there are skills you can learn by using your SP. One warning, though; you can't raise them all at once. There are also skills you can acquire only after having learned a couple of skills first.");
    yield ctx.sayBoth("One more warning, though it's kind of obvious. Once you have chosen your job, try your best to stay alive. Every death will cost you a certain amount of experience points, and you don't want to lose those, do you?");
    yield ctx.sayBoth("Okay! This is all I can teach you. Go explore, train and better yourself. Find me when you feel like you've done all you can. I'll be waiting for you.");
    yield ctx.sayPrev("Oh, and if you have any questions about being a Magician, feel free to ask. I don't know EVERYTHING, per se, but I'll help you out with all that I know of. Until then, farewell...");
  } else if (ctx.getJob() === 200 && ctx.getLevel() >= JobConstants.getJobChangeLevel(200, 0, 2)) {
    // Magician → 2nd job
    const advOptions = new Map<number, string>([
      [210, 'Fire/Poison Wizard'],
      [220, 'Ice/Lightning Wizard'],
      [230, 'Cleric'],
    ]);
    const chosenJob: number = yield ctx.askMenu("You have grown quite a bit since we last met. I can feel the magical energy swirling around you. It is time for you to choose a specialization. Each path grants unique spells — think carefully before you decide.#b", advOptions);
    if (!(yield ctx.askYesNo(`Are you certain you wish to become a #b${advOptions.get(chosenJob)}#k? Once chosen, this path cannot be undone.`))) {
      yield ctx.sayOk('Take all the time you need. When you are ready to make your choice, come speak with me again.');
      return;
    }
    ctx.setJob(chosenJob);
    yield ctx.sayBoth(`You are now a #b${advOptions.get(chosenJob)}#k! I have enhanced your vitality and granted you new powers. The road ahead will demand great focus.`);
    yield ctx.sayPrev("Study your new skills carefully. Each branch of magic requires deep understanding. Return to me when you feel you have mastered your craft, and I may have more to teach you.");
  } else if (ctx.getJob() === 200) {
    const options = new Map<number, string>([
      [0, 'What are the basic characteristics of being a Magician?'],
      [1, 'What sort of weapons does a Magician use?'],
      [2, 'What kind of armor can a Magician wear?'],
      [3, 'What types of skills does a Magician have?'],
    ]);
    const answer: number = yield ctx.askMenu('Any questions about being a Magician?#b', options);
    if (answer === 0) {
      yield ctx.sayOk("Magicians put their high levels of magic and intelligence to good use. They can use the power of nature all around them to kill enemies, but they are very weak in close combat. Their stamina isn't high, either, so be careful and avoid getting too close.\r\n\r\nSince Magicians can attack monsters from afar, that helps quite a bit. Try boosting up the level of INT if you want to attack enemies accurately with your magic. The higher your intelligence, the better you'll be able to handle your magic.");
    } else if (answer === 1) {
      yield ctx.sayOk("Actually, it doesn't mean much for Magicians to attack their opponents with weapons. Magicians lack power and dexterity, so they have a hard time even defeating a snail.\r\n\r\nIf we're talking about magical powers, then THAT's a whole different story. The weapons that Magicians use are staves, and wands. These weapons have special magical powers in them, so they enhance a Magician's effectiveness. It'll be wise to carry a weapon with a lot of magical powers in it...");
    } else if (answer === 2) {
      yield ctx.sayOk("Honestly, Magicians don't have much armor to wear since they are weak in physical strength and low in stamina. Its defensive abilities aren't great either, so I don't know if it helps a lot or not...\r\n\r\nSome armors, however, have the ability to weaken an opponent's magical power, so it can guard you from magic attacks. It won't help much, but it is still better than not wearing them at all... so buy them if you have enough mesos...");
    } else if (answer === 3) {
      yield ctx.sayOk("The skills available for Magicians use the high levels of intelligence and magic that they have. Also available are Magic Guard and Magic Armor, which help prevent Magicians with weak stamina from dying.\r\n\r\nTheir offensive skills are #bEnergy Bolt#k and #bMagic Claw#k. Firstly, Energy Bolt is a skill that applies a lot of damage to an opponent with minimal use of MP.\r\n\r\nMagic Claw, on the other hand, uses up a lot of MP to attack multiple opponents TWICE. But, you can only use it once Energy Bolt is at least Level 1, so keep that in mind. Whatever you choose to do, it's all up to you...");
    }
  } else if ([210, 220, 230].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(200, 0, 3)) {
    // Wizard/Cleric → 3rd job (FP/IL/Bishop)
    const advOptions = new Map<number, string>([
      [211, 'Fire/Poison Mage'],
      [221, 'Ice/Lightning Mage'],
      [231, 'Bishop'],
    ]);
    const chosenJob: number = yield ctx.askMenu("You have grown powerful indeed. I can sense your mastery over the elements. Now it is time for you to ascend to a higher understanding of magic. Choose your path wisely.#b", advOptions);
    if (!(yield ctx.askYesNo(`Are you certain you wish to become a #b${advOptions.get(chosenJob)}#k? This is a significant step in your journey.`))) {
      yield ctx.sayOk('When you are ready to make this commitment, return to me.');
      return;
    }
    ctx.setJob(chosenJob);
    yield ctx.sayBoth(`You are now a #b${advOptions.get(chosenJob)}#k! Your power over magic has deepened considerably.`);
    yield ctx.sayPrev("You have proven yourself worthy of this advancement. Continue to hone your abilities — there is still much to learn.");
  } else if ([211, 221, 231].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(200, 0, 4)) {
    // FP/IL/Bishop → 4th job (Arch Mage FP/IL, Bishop)
    const advOptions = new Map<number, string>([
      [212, 'Fire/Poison Arch Mage'],
      [222, 'Ice/Lightning Arch Mage'],
      [232, 'Bishop'],
    ]);
    const targetJob = ctx.getJob() === 211 ? 212 : ctx.getJob() === 221 ? 222 : 232;
    if (!(yield ctx.askYesNo(`You have walked the path of a ${advOptions.get(ctx.getJob())} with great dedication. Are you ready to ascend to the rank of #b${advOptions.get(targetJob)}#k and master the ultimate arcane arts?`))) {
      yield ctx.sayOk('When you feel ready to take this final step, I will be here.');
      return;
    }
    ctx.setJob(targetJob);
    yield ctx.sayBoth(`You are now a #b${advOptions.get(targetJob)}#k! You have reached the pinnacle of magical mastery.`);
    yield ctx.sayPrev("Your journey has brought you far, but true mastery is a lifelong pursuit. Go forth and write your legend.");
  } else {
    yield ctx.sayOk("The path of a Magician is one of endless study and self-discovery. Come find me when you feel a change is upon you.");
  }
}

/** Helper for 1st-job advancement with a starter item check. */
function* firstJobAdvance(
  ctx: ScriptContext,
  baseJob: number,
  jobName: string,
  npcRef: string,
  reqItemId: number,
  reqItemName: string,
): Generator<ScriptMessage, void, any> {
  const jobChangeLevel = JobConstants.getJobChangeLevel(baseJob, 0, 1);
  yield ctx.sayNext(`Do you want to become a #b${jobName}#k? You need to be at least #bLevel ${jobChangeLevel}#k. Let me see if you have what it takes.`);
  if (ctx.getLevel() < jobChangeLevel) {
    yield ctx.sayOk(`You still need more training before you can become a ${jobName}. Please come back when you are stronger.`);
    return;
  }
  if (!(yield ctx.askYesNo(`I can see great potential in you. Are you ready to embrace the path of a ${jobName}?`))) {
    yield ctx.sayOk('This is a decision not to be taken lightly. Come back when you are ready.');
    return;
  }
  yield ctx.sayNext(`You are now a ${jobName}! As a token of your new path, I will give you this...`);
  if (!ctx.addItem(reqItemId, 1)) {
    yield ctx.sayOk(`Please make sure you have an empty slot in your #rEQP. inventory#k and talk to me again.`);
    return;
  }
  ctx.setJob(baseJob);
  if (ctx.getLevel() > jobChangeLevel) {
    yield ctx.sayBoth('You have earned additional Skill Points for the experience you gained before this advancement.');
  }
  yield ctx.sayPrev(`You are now a #b${jobName}#k! Train diligently and return when you feel ready for greater challenges.`);
}

/** Helper for 2nd-job advancement (one branch choice among options). */
function* secondJobAdvance(
  ctx: ScriptContext,
  baseJob: number,
  options: Map<number, string>,
  prompt: string,
  successMsg: string,
): Generator<ScriptMessage, void, any> {
  if (ctx.getLevel() < JobConstants.getJobChangeLevel(baseJob, 0, 2)) {
    yield ctx.sayOk('You need more experience before you can specialize. Come back when you are stronger.');
    return;
  }
  const chosenJob: number = yield ctx.askMenu(prompt, options);
  if (!(yield ctx.askYesNo(`Are you certain you wish to become a #b${options.get(chosenJob)}#k? This choice will define your path forward.`))) {
    yield ctx.sayOk('Take your time. When you are sure, return to me.');
    return;
  }
  ctx.setJob(chosenJob);
  yield ctx.sayBoth(`You are now a #b${options.get(chosenJob)}#k! ${successMsg}`);
  yield ctx.sayPrev('Continue to hone your skills. Greater challenges await you.');
}

/** Helper for 3rd-job advancement (one branch choice among options). */
function* thirdJobAdvance(
  ctx: ScriptContext,
  baseJob: number,
  options: Map<number, string>,
  prompt: string,
  successMsg: string,
): Generator<ScriptMessage, void, any> {
  if (ctx.getLevel() < JobConstants.getJobChangeLevel(baseJob, 0, 3)) {
    yield ctx.sayOk('You are not yet ready for this advancement. Continue training and return when you are stronger.');
    return;
  }
  const chosenJob: number = yield ctx.askMenu(prompt, options);
  if (!(yield ctx.askYesNo(`Are you certain you wish to become a #b${options.get(chosenJob)}#k? This is a significant step in your journey.`))) {
    yield ctx.sayOk('When you are ready to make this commitment, return to me.');
    return;
  }
  ctx.setJob(chosenJob);
  yield ctx.sayBoth(`You are now a #b${options.get(chosenJob)}#k! ${successMsg}`);
  yield ctx.sayPrev('You have proven yourself worthy. There is still more to learn — seek me out when you are ready.');
}

/** Helper for 4th-job advancement (auto-determined by current job, no branch choice). */
function* fourthJobAdvance(
  ctx: ScriptContext,
  baseJob: number,
  targetJob: number,
  jobName: string,
): Generator<ScriptMessage, void, any> {
  if (ctx.getLevel() < JobConstants.getJobChangeLevel(baseJob, 0, 4)) {
    yield ctx.sayOk('You are not yet ready for this final advancement. Continue your training.');
    return;
  }
  if (!(yield ctx.askYesNo(`You have reached the pinnacle of your current path. Are you ready to become a #b${jobName}#k, the ultimate form of your class?`))) {
    yield ctx.sayOk('When you are ready to take this final step, return to me.');
    return;
  }
  ctx.setJob(targetJob);
  yield ctx.sayBoth(`You are now a #b${jobName}#k! You have reached the apex of your class.`);
  yield ctx.sayPrev('Your legend begins now. Go forth and make your mark upon the world.');
}

export function* fighter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dances with Balrog : Warrior Instructor (1022000)
  //   Perion : Warriors' Sanctuary (102000003)
  if (ctx.getJob() === 0) {
    yield* firstJobAdvance(ctx, 100, 'Warrior', '#p1022000#', 1302000, 'Sword');
  } else if (ctx.getJob() === 100 && ctx.getLevel() >= JobConstants.getJobChangeLevel(100, 0, 2)) {
    yield* secondJobAdvance(ctx, 100, new Map([
      [110, 'Fighter'],
      [120, 'Page'],
      [130, 'Spearman'],
    ]), 'You have grown strong. It is time to choose your martial path. Which discipline calls to you?#b', 'Your combat abilities have been greatly enhanced.');
  } else if ([110, 120, 130].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(100, 0, 3)) {
    const advMap = new Map([[110, 'Crusader'], [120, 'White Knight'], [130, 'Dragon Knight']]);
    const advOpts = new Map<number, string>();
    for (const [jobId, name] of advMap) {
      if (ctx.getJob() === jobId) {
        advOpts.set(jobId, name);
        break;
      }
    }
    yield* thirdJobAdvance(ctx, 100, advOpts, 'You have mastered your basic training. Now you must advance to a higher form.#b', 'Your true strength is beginning to emerge.');
  } else if ([111, 121, 131].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(100, 0, 4)) {
    const advMap: Record<number, string> = { 111: 'Hero', 121: 'Paladin', 131: 'Dark Knight' };
    const current = ctx.getJob();
    const nextMap: Record<number, number> = { 111: 112, 121: 122, 131: 132 };
    yield* fourthJobAdvance(ctx, 100, nextMap[current], advMap[current]);
  } else if (ctx.getJob() === 100) {
    yield ctx.sayOk('You have chosen the path of the Warrior. Train hard and I will teach you more when you are ready.');
  } else {
    yield ctx.sayOk('A warrior\'s path is one of strength and honor. Return when you seek to advance.');
  }
}

export function* bowman(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Athena Pierce : Bowman Instructor (1012100)
  //   Henesys : Bowman Instructional School (100000201)
  if (ctx.getJob() === 0) {
    yield* firstJobAdvance(ctx, 300, 'Bowman', '#p1012100#', 1452000, 'Bow');
  } else if (ctx.getJob() === 300 && ctx.getLevel() >= JobConstants.getJobChangeLevel(300, 0, 2)) {
    yield* secondJobAdvance(ctx, 300, new Map([
      [310, 'Hunter'],
      [320, 'Crossbowman'],
    ]), 'The path of an archer branches in two directions. Which will you pursue?#b', 'Your aim and precision have been sharpened.');
  } else if ([310, 320].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(300, 0, 3)) {
    const advMap = new Map([[310, 'Ranger'], [320, 'Sniper']]);
    const advOpts = new Map<number, string>();
    for (const [jobId, name] of advMap) {
      if (ctx.getJob() === jobId) {
        advOpts.set(jobId, name);
        break;
      }
    }
    yield* thirdJobAdvance(ctx, 300, advOpts, 'Your skills have matured. It is time to ascend to a higher level of mastery.#b', 'Your precision and awareness have expanded greatly.');
  } else if ([311, 321].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(300, 0, 4)) {
    const advMap: Record<number, string> = { 311: 'Bow Master', 321: 'Marksman' };
    const current = ctx.getJob();
    const nextMap: Record<number, number> = { 311: 312, 321: 322 };
    yield* fourthJobAdvance(ctx, 300, nextMap[current], advMap[current]);
  } else if (ctx.getJob() === 300) {
    yield ctx.sayOk('A Bowman must have patience and a keen eye. Train well and return when you are ready for more.');
  } else {
    yield ctx.sayOk('The path of a Bowman requires focus and precision. Seek me when you wish to advance.');
  }
}

export function* rogue(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dark Lord : Thief Instructor (1052001)
  //   Kerning City : Thieves' Hideout (103000003)
  if (ctx.getJob() === 0) {
    yield* firstJobAdvance(ctx, 400, 'Thief', '#p1052001#', 1332000, 'Dagger');
  } else if (ctx.getJob() === 400 && ctx.getLevel() >= JobConstants.getJobChangeLevel(400, 0, 2)) {
    yield* secondJobAdvance(ctx, 400, new Map([
      [410, 'Assassin'],
      [420, 'Bandit'],
    ]), 'The shadows offer two paths. Choose the one that suits your style.#b', 'Your agility and cunning have increased.');
  } else if ([410, 420].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(400, 0, 3)) {
    const advMap = new Map([[410, 'Hermit'], [420, 'Chief Bandit']]);
    const advOpts = new Map<number, string>();
    for (const [jobId, name] of advMap) {
      if (ctx.getJob() === jobId) {
        advOpts.set(jobId, name);
        break;
      }
    }
    yield* thirdJobAdvance(ctx, 400, advOpts, 'You have honed your skills in the shadows. Now take the next step.#b', 'Your mastery of the dark arts deepens.');
  } else if ([411, 421].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(400, 0, 4)) {
    const advMap: Record<number, string> = { 411: 'Night Lord', 421: 'Shadower' };
    const current = ctx.getJob();
    const nextMap: Record<number, number> = { 411: 412, 421: 422 };
    yield* fourthJobAdvance(ctx, 400, nextMap[current], advMap[current]);
  } else if (ctx.getJob() === 400) {
    yield ctx.sayOk('A Thief moves in silence and strikes without warning. Hone your skills and return when you are ready.');
  } else {
    yield ctx.sayOk('The path of a Thief is one of shadow and precision. Seek me when you wish to advance.');
  }
}

export function* kairinT(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kyrin : Pirate Instructor (1090000)
  //   Nautilus : Nautilus' Mid-Hold (120000101)
  if (ctx.getJob() === 0) {
    yield* firstJobAdvance(ctx, 500, 'Pirate', '#p1090000#', 1482000, 'Knuckle');
  } else if (ctx.getJob() === 500 && ctx.getLevel() >= JobConstants.getJobChangeLevel(500, 0, 2)) {
    yield* secondJobAdvance(ctx, 500, new Map([
      [510, 'Brawler'],
      [520, 'Gunslinger'],
    ]), 'The sea offers two ways to fight. Which one calls to you?#b', 'Your power and versatility have grown.');
  } else if ([510, 520].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(500, 0, 3)) {
    const advMap = new Map([[510, 'Marauder'], [520, 'Outlaw']]);
    const advOpts = new Map<number, string>();
    for (const [jobId, name] of advMap) {
      if (ctx.getJob() === jobId) {
        advOpts.set(jobId, name);
        break;
      }
    }
    yield* thirdJobAdvance(ctx, 500, advOpts, 'You have sailed far and fought hard. Now ascend to a greater rank.#b', 'Your strength and skill have reached new heights.');
  } else if ([511, 521].includes(ctx.getJob()) && ctx.getLevel() >= JobConstants.getJobChangeLevel(500, 0, 4)) {
    const advMap: Record<number, string> = { 511: 'Buccaneer', 521: 'Corsair' };
    const current = ctx.getJob();
    const nextMap: Record<number, number> = { 511: 512, 521: 522 };
    yield* fourthJobAdvance(ctx, 500, nextMap[current], advMap[current]);
  } else if (ctx.getJob() === 500) {
    yield ctx.sayOk('A Pirate must be fearless and adaptable. Train hard and return when you are ready for more.');
  } else {
    yield ctx.sayOk('The path of a Pirate is one of adventure and might. Seek me when you wish to advance.');
  }
}
