import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { JobConstants } from '../../job/JobConstants';
import { MobAppearType } from '../../field/mob/MobAppearType';
import { startTimeKeepQuestTimer } from '../../quest/QuestPacket';

const RESISTANCE_TRAINING = 23128; // QuestRecordType.ResistanceTraining
const RESISTANCE_FIRST_MISSION = 23129; // QuestRecordType.ResistanceFirstMission
const RESISTANCE_WATER_TANK = 23130; // QuestRecordType.ResistanceWaterTank
const RESISTANCE_WATER_TRADE = 23131; // QuestRecordType.ResistanceWaterTrade

const MUSHROOM_CASTLE_OPENING = 2311; // QuestRecordType.MushroomCastleOpening

const BATTLE_MAGE_1 = 3200; // Job.BATTLE_MAGE_1
const BATTLE_MAGE_2 = 3210; // Job.BATTLE_MAGE_2
const BATTLE_MAGE_3 = 3211; // Job.BATTLE_MAGE_3
const BATTLE_MAGE_4 = 3212; // Job.BATTLE_MAGE_4
const WILD_HUNTER_1 = 3300; // Job.WILD_HUNTER_1
const WILD_HUNTER_2 = 3310; // Job.WILD_HUNTER_2
const WILD_HUNTER_3 = 3311; // Job.WILD_HUNTER_3
const WILD_HUNTER_4 = 3312; // Job.WILD_HUNTER_4
const MECHANIC_1 = 3500; // Job.MECHANIC_1
const MECHANIC_2 = 3510; // Job.MECHANIC_2
const MECHANIC_3 = 3511; // Job.MECHANIC_3
const MECHANIC_4 = 3512; // Job.MECHANIC_4

export function* q23100e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Student of the Resistance (23100 - end)
  yield ctx.sayNext("You joined the Resistance? I knew we were short on members... Guess we're accepting anyone these days. That #p2151001# is a lot softer than he looks.");
  yield ctx.sayNext("Well, since you're part of our group now, you should train and level up. I'll teach you what you need to know to be a contributing member of the Resistance.");
  ctx.setQRValue(RESISTANCE_TRAINING, '1'); // Without this, you can't accept the training quests.
  ctx.forceCompleteQuest(23100);
}

export function* q23101e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Student of the Resistance (23101 - end)
  yield ctx.sayNext("You joined the Resistance? I knew we were short on members... Guess we're accepting anyone these days. That #p2151001# is a lot softer than he looks.");
  yield ctx.sayNext("Well, since you're part of our group now, you should train and level up. I'll teach you what you need to know to be a contributing member of the Resistance.");
  ctx.setQRValue(RESISTANCE_TRAINING, '1');
  ctx.forceCompleteQuest(23101);
}

export function* q23102e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Student of the Resistance (23102 - end)
  yield ctx.sayNext("You joined the Resistance? I knew we were short on members... Guess we're accepting anyone these days. That #p2151001# is a lot softer than he looks.");
  yield ctx.sayNext("Well, since you're part of our group now, you should train and level up. I'll teach you what you need to know to be a contributing member of the Resistance.");
  ctx.setQRValue(RESISTANCE_TRAINING, '1');
  ctx.forceCompleteQuest(23102);
}

export function* q23107e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The First Mission (23107 - end)
  yield ctx.sayNext("Welcome #h0#. As you already know, I'm in charge of Resistance mission assignments.");
  yield ctx.sayNext("I should actually be a Thief job instructor, but I've taken this position since the Resistance doesn't train thieves. It's the same as why #p2151000#, who should be a Warrior Job Instructor, is in charge of education.");
  yield ctx.sayNext("In any case, since I'm in charge of missions, you'll be seeing me more often than even #p2151001#, your job instructor. Now, let's drive those Black Wings out of our territory.");
  ctx.setQRValue(RESISTANCE_FIRST_MISSION, '1');
  ctx.addExp(20);
  ctx.forceCompleteQuest(23107);
}

export function* q23108e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The First Mission (23108 - end)
  yield ctx.sayNext("Welcome #h0#. As you already know, I'm in charge of Resistance mission assignments.");
  yield ctx.sayNext("I should actually be a Thief job instructor, but I've taken this position since the Resistance doesn't train thieves. It's the same as why #p2151000#, who should be a Warrior Job Instructor, is in charge of education.");
  yield ctx.sayNext("In any case, since I'm in charge of missions, you'll be seeing me more often than even #p2151002#, your job instructor. Now, let's drive those Black Wings out of our territory.");
  ctx.setQRValue(RESISTANCE_FIRST_MISSION, '1');
  ctx.addExp(20);
  ctx.forceCompleteQuest(23108);
}

export function* q23109e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The First Mission (23109 - end)
  yield ctx.sayNext("Welcome #h0#. As you already know, I'm in charge of Resistance mission assignments.");
  yield ctx.sayNext("I should actually be a Thief job instructor, but I've taken this position since the Resistance doesn't train thieves. It's the same as why #p2151000#, who should be a Warrior Job Instructor, is in charge of education.");
  yield ctx.sayNext("In any case, since I'm in charge of missions, you'll be seeing me more often than even #p2151004#, your job instructor. Now, let's drive those Black Wings out of our territory.");
  ctx.setQRValue(RESISTANCE_FIRST_MISSION, '1');
  ctx.addExp(20);
  ctx.forceCompleteQuest(23109);
}

export function* q2345s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Endangered Mushking Empire (2345 - start)
  if (!(yield ctx.askYesNo("#h0#, I know you're busy carrying out your Resistance missions, but could you spare me a moment? I received a request for help from outside, and I can't think of anyone better than you."))) {
    yield ctx.sayOk('Oh really? Well, this is very urgent, so please talk to me again if you change your mind.');
    return;
  }
  yield ctx.sayNext("#bMushking Empire#k is in great danger right now. Their former Emperor is seriously ill... something terrible must have happened! Mushking Empire is located near #m100000000#. Please hurry!");
  yield ctx.sayBoth("Unlike the Cygnus Knights, who declined #m310000000#'s help during a time of need, members of the Resistance cannot just stand back and watch others suffer. Please, go save the Mushking Empire from danger. Here is a recommendation letter.");
  const decision: boolean = yield ctx.askYesNo("Mushking Empire is near #m100000000#. If you say yes, I'll send you to the Mushking Empire right away.");
  if (!ctx.addItem(4032375, 1)) {
    yield ctx.sayOk('Please check and see if you have an empty slot available at your etc. inventory.');
    return;
  }
  ctx.forceStartQuest(2345);
  if (!decision) {
    yield ctx.sayOk("Are you planning to walk all the way there? If so, please hurry. You can get to the Mushking Empire #bby heading west from Ghost Mushroom Forest#k, where the Henesys Mushroom Forest ends. #b<Theme Dungeon: Mushroom Castle>#k is its entrance.");
    return;
  }
  // MushroomCastle.enterThemeDungeon(sm)
  if (ctx.getQRValue(MUSHROOM_CASTLE_OPENING) === '1') {
    ctx.warp(106020000, 'left00'); // Mushroom Castle : Mushroom Forest Field
  } else {
    ctx.warp(106020001); // TD_MC_Openning
  }
}

export function* q2345e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Endangered Mushking Empire (2345 - end)
  yield ctx.sayNext("Huh? #bRecommendation Letter from a job instructor#k! What's this? You're the one sent here to save our Mushking Kingdom?");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Y...Yesss?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("Hmm, I see. Well, if a job instructor recommended you, I will put my trust in you as well. I apologize for my late introduction. I am the #bHead Security Officer#k in charge of the royal family's security. As you can see, I am currently in charge of security over this temporary housing and the key figures inside. We're not in the best of situations, but nevertheless, let me welcome you to the Mushking Empire.");
  ctx.removeItem(4032375);
  ctx.forceCompleteQuest(2345);
  ctx.addExp(1200);
}

export function* q23127s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Protecting Surl (23127 - start)
  yield ctx.sayNext("It's quiet. Too quiet. Is someone really after me? To think someone would want to hurt an old man like me... Those Black Wings are truly cowards. Still, I'm not worried. I've been through too much in life. They can't scare me!");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#b(#p2159201# doesn\'t seem scared at all. How brave.)#k');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('I think the Black Wings are too chicken to come out with you around. Let\'s find a way to lure them out.');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#bBut if I leave your side, you'll be in danger. You're the one they're after...#k");
  ctx.setPlayerAsSpeaker(false);
  if (yield ctx.askAccept("Heh, you think they can frighten this old man. Nah, I trust you. You're a strong member of the Resistance. You'll keep me safe. Now, let's go someplace more secluded, where the Black Wings will feel safe enough to show their faces.")) {
    ctx.forceStartQuest(23127);
    ctx.warpInstance([931000441], 'out00', 931000440, 60);
    ctx.getUser().write(startTimeKeepQuestTimer(23127, 55000));
    ctx.message('Protect Surl from the Black Wings for a set amount of time!');
    return;
  }
  yield ctx.sayOk('I think the Black Wings are too chicken to come out with you around.'); // Not GMS-like, unsure what he'd say
}

export function* enterResi_23120(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wing Territory : Edelstein (310000000) - in05 (915, 581)
  if (ctx.hasQuestStarted(23120)) {
    ctx.playPortalSE();
    ctx.warpInstance([931000410], 'out00', 310000000, 10 * 60);
  }
}

export function* enterDelivery(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Concrete Road : Serpent Path (310030110) - in00 (565, -556)
  if (!ctx.hasQuestStarted(23125)) {
    return;
  }
  ctx.playPortalSE();
  ctx.warp(931000430, 'out00');
}

export function* enterSuar(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Concrete Road : Edelstein Park 2 (310020100) - in00 (862, -674)
  if (ctx.hasQuestCompleted(23126) && ctx.hasQuestCompleted(23127)) {
    return;
  }
  ctx.playPortalSE();
  ctx.warp(931000440, 'out00');
}

export function* edelScript0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // edelScript0 (3109000)
  //   Edelstein : Surl's Water Cellar (931000410)
  ctx.setQRValue(RESISTANCE_WATER_TANK, '1');
}

export function* jaguar_in(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Jack (2151008)
  //   Resistance Headquarters : Secret Plaza (310010000)
  if (!JobConstants.isWildHunterJob(ctx.getJob())) {
    yield ctx.sayOk('Grrrr....\r\n(You can\'t enter. Only Wild Hunters may enter.)');
    return;
  }
  if (yield ctx.askAccept('Enter Jaguar Habitat?')) {
    ctx.warp(931000500);
  }
}

export function* giveWater(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ace (2159202)
  //   Edelstein : Danger! Makeshift Airport (931000420)
  if (ctx.field.getMobPool().getCount() === 0) {
    ctx.setQRValue(RESISTANCE_WATER_TRADE, '1');
    yield ctx.sayOk("Whew, we're safe now. Let's trade the water now.");
    ctx.warp(310000010, 'out00');
  }
}

export function* q23011e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of the Battle Mage (23011 - end)
  if (yield ctx.askYesNo("So you've finally decided to become a Battle Mage, eh? Well, you can still change your mind. Just stop our conversation, forfeit this quest, and talk to another class trainer. So, you sure you want to become a Battle Mage? I'm not interested in teaching unless you're a hundred percent sure...")) {
    if (!ctx.addItems([
      [1382100, 1],
      [1142242, 1],
    ])) {
      yield ctx.sayNext('Whoa! Why are you carrying so many things? I was going to give you a gift but there isn\'t enough room in the Equip tab of your inventory.');
      return;
    }
    ctx.setJob(BATTLE_MAGE_1);
    ctx.forceCompleteQuest(23011);
    yield ctx.sayNext('Okay, okay. Welcome to the Resistance, kid. From now on, you will play the role of a Battle Mage, a fierce Magician always ready to lead your party into battle.');
    yield ctx.sayBoth("But don't go spreading it around that you're a Battle Mage, hm No need to tempt the Black Wings to come after you. From now on, I'll be your teacher. If anyone asks, you're visiting me just as a regular student, not as a member of the Resistance. I'll give you special lessons now and then. You better not fall asleep in class, hear?");
  }
}

export function* q23012e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of the Wild Hunter (23012 - end)
  if (yield ctx.askYesNo("I applaud your spirit! But are you certain about this? Wild Hunters are very strong, but they're also difficult to control. You have to control your mount and attack at the same time. It requires excellent reflexes. Are you sure you're up for a job like this?")) {
    if (!ctx.addItems([
      [1462092, 1],
      [1142242, 1],
      [2061000, 2000],
      [2061000, 2000],
      [2061000, 2000],
    ])) {
      yield ctx.sayNext("I was going to give you a gift for making the job advancement but I can't. Your Inventory Equip or Use tab is full. Empty out at least three slots if you're interested in my gift.");
      return;
    }
    ctx.setJob(WILD_HUNTER_1);
    ctx.addSkill(30001061, 1, 0);
    ctx.addSkill(30001062, 1, 0);
    ctx.forceCompleteQuest(23012);
    yield ctx.sayNext("Well, well! Congratulations! You're now an official member of the Resistance and a Wild Hunter. Hop on your mount, move like the wind, and slay all enemies who get in your way!");
    yield ctx.sayPrev('Now, a warning. Don\'t lure the Black Wings\' attention to you by telling people you\'re a Wild Hunter. I\'ll be your "teacher" from now on. This IS a school after all, right? I\'ll give you special lessons to turn you into the best Wild Hunter ever!');
  }
}

export function* q23013e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of a Mechanic (23013 - end)
  if (yield ctx.askYesNo("Have you made your decision to become a Mechanic? You can still change your mind, you know. Just stop the conversation, forfeit this quest, and talk to another job trainer. So, are you certain becoming a Mechanic is the best way for you to serve the Resistance?")) {
    if (!ctx.addItems([
      [1492014, 1],
      [1142242, 1],
    ])) {
      yield ctx.sayNext("I wanted to give you a gift to commemorate your new powers but I can't. Why do you carry so many things in your Inventory's Equip tab?");
      return;
    }
    ctx.setJob(MECHANIC_1);
    ctx.addSkill(30001068, 1, 0);
    ctx.forceCompleteQuest(23013);
    yield ctx.sayNext('Welcome to the Resistance. From now on, you are a Mechanic. As one who works with machines, use every method available to defeat the enemies before you!');
    yield ctx.sayBoth("We have to be careful that our identity is not revealed to the Black Wings. So from now on, refer to me as teacher. You will pretend to be a student who is coming here for extracurricular lessons. It's during these lessons that I will teach you to become a strong Mechanic.");
  }
}

export function* q23015s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taming a Jaguar (23015 - start)
  yield ctx.sayNext('Wild Hunters must have a Mount. When you became a Wild Hunter, you should have gotten the Capture skill. You can use that skill to tame and ride a Jaguar.');
  yield ctx.sayBoth('You can find the #s30001061# skill in your skill window. After you attack a Jaguar and get it down to half life, you can use the Capture skill to capture it. Then, use the #s33001001# skill to ride it. Simple, right?');
  yield ctx.sayBoth('You would like to know where you can find some Jaguars? #p2151008#, sitting here in front of me, will lead you to them.');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Umm, #p2151008#? Can you tell me where I should go?');
  ctx.setPlayerAsSpeaker(false);
  ctx.setSpeakerId(2151008); // Black Jack
  yield ctx.sayBoth('Hmm, a new Wild Hunter? You are still a rookie.');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Although I am still weak, I will work hard to become a valuable member of the Resistance. Now, where can I find the Jaguars?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('You have a good attitude. I will let you meet my brothers. Talk to me whenever you want to meet with them.');
  ctx.forceCompleteQuest(23015);
  ctx.warp(931000500);
}

export function* summonSchiller(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : 2nd Job Advancement (931000100 / 931000101 / 931000102 / 931000103 / 931000104)
  ctx.spawnNpc(2159100, 180, -14, false, true);
  ctx.message('Schiller has appeared! Defeat him and take the Report!');
}

export function* SecJob_Schiller(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Schiller (2159100)
  yield ctx.sayNext("Oh my. What's this? I gave specific instructions to make sure no one else used the airport at this time... But, I say, are you a member of the Resistance?");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext('#b(You are surprised Schiller doesn\'t immediately recognize you. You certainly remember him.)#k');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayNext('Come to think of it, you do look familiar... Where have I seen you before?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext('I couldn\'t fight you the last time we met, but I plan to fix that today.');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayNext("You! I remember now! You stole that one test subject! Do you have any idea how much I suffered because of that? I was demoted... five times! Now I'm stuck doing menial jobs like this.\r\nTime for you to pay, oh yes.");
  ctx.spawnMob(9001031, 230, -14, MobAppearType.NORMAL, true);
  ctx.removeNpc(2159100);
}

export function* q23023e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Revenge and Growth (23023 - end)
  yield ctx.sayNext('You brought the Black Wings Report? Good!');
  yield ctx.sayBoth("You know, I gave you that mission on purpose. That member of the Black Wings was the one who hurt you in the past. How's it feel to defeat someone who once seemed impossible to fight?");
  yield ctx.sayBoth("Still, I had no idea you'd handle the mission so excellently. To be honest, I had my doubts about you. But I'm starting to think there's something... special about you.");
  if (!(yield ctx.askYesNo("Okay, I think you're ready for the next stage, a stage in which you'll be transformed into an unimaginably strong Battle Mage..."))) {
    yield ctx.sayOk('Come back when you\'re ready.'); // Unsure if GMS-like
    return;
  }
  if (!ctx.addItem(1142243, 1)) {
    yield ctx.sayNext('Whoa! Why are you carrying so many things? I was going to give you a gift but there isn\'t enough room in the Equip tab of your inventory.');
    return;
  }
  ctx.removeItem(4032737);
  ctx.setJob(BATTLE_MAGE_2);
  ctx.forceCompleteQuest(23023);
  yield ctx.sayNext("I've advanced your job. I've also passed onto you skills that are much more powerful than the ones you've had before. You are now an even more powerful Battle Mage. Guess I'm a pretty good teacher, heh.");
  yield ctx.sayPrev('I will see you at the next lesson. Until then, keep up the good fight.');
}

export function* q23024e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Revenge and Growth (23024 - end)
  yield ctx.sayNext("So you have the Black Wings Report. Ha! I knew I was right about you!");
  yield ctx.sayBoth("This mission was supposed to go to someone else but I had it re-assigned to you. That guy from the Black Wings was the one who attacked you in the past. I gave you the mission so you could take your revenge. Two birds with one stone, eh?");
  yield ctx.sayBoth("To be honest though, you completed the mission more easily than I expected. You've really developed your skills...");
  if (!(yield ctx.askYesNo("I originally thought it might be too soon, but you've proved me wrong. You're more than ready to advance. You're ready to enhance your powers as a Wild Hunter."))) {
    yield ctx.sayOk('Come back when you\'re ready.'); // Unsure if GMS-like
    return;
  }
  if (!ctx.addItem(1142243, 1)) {
    yield ctx.sayNext("I was going to give you a gift for making the job advancement but I can't. Your Inventory Equip tab is full. Empty out at least one slot if you're interested in my gift.");
    return;
  }
  ctx.removeItem(4032738);
  ctx.setJob(WILD_HUNTER_2);
  ctx.forceCompleteQuest(23024);
  yield ctx.sayNext("I've advanced your job. I've also upgraded your skills. Enjoy your new abilities!");
  yield ctx.sayPrev('I will see you at the next lesson. Until then, keep up the good fight.');
}

export function* q23025e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Revenge and Growth (23025 - end)
  yield ctx.sayNext("So this is the Black Wings Report we needed. With this document, we can figure out the plans of the Black Wings. Thank you so much.");
  yield ctx.sayBoth("This mission was not originally assigned to you, but I swapped a few things around. I wanted you to defeat that individual personally, give you a chance to right past wrongs, you know?");
  yield ctx.sayBoth("Even so, I didn't think you would accomplish the mission so easily. You're progressing much faster than I expected.");
  if (!(yield ctx.askYesNo("I wasn't planning to do this for a while yet, but I think you're ready. Yes, I will advance you to become a Mechanic who can handle even more machines."))) {
    yield ctx.sayOk('Come back when you\'re ready.'); // Unsure if GMS-like
    return;
  }
  if (!ctx.addItem(1142243, 1)) {
    yield ctx.sayNext("I wanted to give you a gift to commemorate your new powers but I can't. Why do you carry so many things in your Inventory's Equip tab?");
    return;
  }
  ctx.removeItem(4032739);
  ctx.setJob(MECHANIC_2);
  ctx.forceCompleteQuest(23025);
  yield ctx.sayNext("I've advanced your job. I've also passed you a few more skills. Enjoy the new powers that you have gained.");
  yield ctx.sayPrev('I will see you at the next lesson. Until then, keep up the good fight!');
}

export function* q23033e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Destroying the Energy Conducting Device (23033 - end)
  yield ctx.sayNext("You destroyed the Energy Conducting Device! Good. This should alleviate the problem of insufficient energy in town. We'll all be able to sleep a little easier now. You've done a tremendous good for Edelstein.");
  if (!(yield ctx.askYesNo("You've proven yourself so thoroughly that there's no reason to put this off. I think you are ready for your advancement. Now you will become an even stronger Battle Mage. I trust you'll be able to handle it..."))) {
    yield ctx.sayOk('Come back when you\'re ready.'); // Unsure if GMS-like
    return;
  }
  if (!ctx.addItem(1142244, 1)) {
    yield ctx.sayNext('Whoa! Why are you carrying so many things? I was going to give you a gift but there isn\'t enough room in the Equip tab of your inventory.');
    return;
  }
  ctx.setJob(BATTLE_MAGE_3);
  ctx.forceCompleteQuest(23033);
  yield ctx.sayNext("You've been advanced. Now you have access to a maddening variety of powerful skills. They might not be easy to control, but from the way you completed that last mission, I think you can handle them.");
  yield ctx.sayPrev('I will see you at the next lesson. Until then, continue your good fight.');
}

export function* q23034e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Destroying the Energy Conducting Device (23034 - end)
  yield ctx.sayNext("You destroyed the Energy Conducting Device! I was right about you. Now our town won't have to worry about energy issues for a while. You've really done a great thing for #m310000000#.");
  if (!(yield ctx.askYesNo("Now that I know how much you've grown, I will give you the next lesson. I believe you are now strong enough to be reborn as a more powerful Wild Hunter!"))) {
    yield ctx.sayOk('Come back when you\'re ready.'); // Unsure if GMS-like
    return;
  }
  if (!ctx.addItem(1142244, 1)) {
    yield ctx.sayNext("I was going to give you a gift for making the job advancement but I can't. Your Inventory Equip tab is full. Empty out at least one slot if you're interested in my gift.");
    return;
  }
  ctx.setJob(WILD_HUNTER_3);
  ctx.forceCompleteQuest(23034);
  yield ctx.sayNext("You've been advanced. You now have a larger arsenal of skills to manage. It might not be easy, since you still have to control your mount, but I'm not worried.");
  yield ctx.sayPrev('I\'ll see you at the next lesson. Until then, continue your good fight.');
}

export function* q23035e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Destroying the Energy Conducting Device (23035 - end)
  yield ctx.sayNext("You've successfully destroyed the Energy Conducting Device! Now we don't have to worry about energy for a while. You've accomplished a truly great feat for Edelstein.");
  yield ctx.sayBoth('This mission was not originally assigned to you');
  yield ctx.sayBoth("Even so, I didn't think you would accomplish the mission so easily. You're progressing much faster than I expected.");
  if (!(yield ctx.askYesNo("Now that I've seen your abilities, it is time to show you mine. I will now pass on a new skill to you."))) {
    yield ctx.sayOk('Come back when you\'re ready.'); // Unsure if GMS-like
    return;
  }
  if (!ctx.addItem(1142244, 1)) {
    yield ctx.sayNext("I wanted to give you a gift to commemorate your new powers but I can't. Why do you carry so many things in your Inventory's Equip tab?");
    return;
  }
  ctx.setJob(MECHANIC_3);
  ctx.forceCompleteQuest(23035);
  yield ctx.sayNext("I have advanced you. You will now wield a skill that is more varied, more complex, and much, much more powerful. Don't worry, I trust that you will be able to handle it with ease.");
  yield ctx.sayPrev('I\'ll see you for your next mission. Keep fighting the good fight.');
}

export function* q23049e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wings' New Weapon (23049 - end)
  yield ctx.sayNext("You successfully destroyed the Black Wings' new weapon! Ha! I can't believe it! You did something I couldn't even do. I'm proud that you're a part of the Resistance.");
  if (!(yield ctx.askYesNo("Wait, we don't have time for this. Once #p2154009# realizes that his new weapon has been destroyed, he'll rush down with his minions. We need to get out of here now. Use the Underground Base #t4032740#. On my count. One... two... three!"))) {
    return;
  }
  ctx.forceCompleteQuest(23049);
  ctx.warp(310010000);
}

export function* q23050e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wings' New Weapon (23050 - end)
  yield ctx.sayNext("You really destroyed the Black Wings' new weapon! I knew I was right about you! There is nothing sharper than the eyes of a bowman. I'm proud to call you a fellow member of the Resistance!");
  if (!(yield ctx.askYesNo("I'd love nothing more than to rub what we've done in #p2154009#'s face, but things could get hairy if he gathers all his minions. Let's get out of here. Use the Underground Base #t4032740# on my count. One... two... three!"))) {
    return;
  }
  ctx.forceCompleteQuest(23050);
  ctx.warp(310010000);
}

export function* q23051e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wings' New Weapon (23051 - end)
  yield ctx.sayNext("You really destroyed the Black Wings' new weapon! I can't believe my eyes. You've upturned the status quo! The Resistance is lucky to have you! Truly lucky!");
  if (!(yield ctx.askYesNo("Oh... I was so happy, I forgot about our next move. Once Gelimer finds out that his new weapon has been destroyed, he is sure to come down with his minions. We better scram before that happens. I'll use the Underground Base #t4032742#. Ready to go? One... two... three!"))) {
    return;
  }
  ctx.forceCompleteQuest(23051);
  ctx.warp(310010000);
}

export function* q23052s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // You Surpass Me (23052 - start)
  yield ctx.sayNext("Hey, it's #h0#, the hero of #m310000000#. Ah, isn't #m310000000# great? Even if it IS under the control of the Black Wings...");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Are you feeling better?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("Yes. #p2151003#'s skills are second to none. I'm completely back to my old self.\r\nThe only problem is...");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('What?! Are the Black Wings planning something?');
  ctx.setPlayerAsSpeaker(false);
  if (!(yield ctx.askYesNo("No, the problem is... you! You've become too strong. I'm supposed to be your teacher but you've accomplished something I couldn't do. So I want to give you a more difficult mission!"))) {
    return;
  }
  if (!ctx.addItem(1142245, 1)) {
    yield ctx.sayNext('Whoa! Why are you carrying so many things? I was going to give you a gift but there isn\'t enough room in the Equip tab of your inventory.');
    return;
  }
  ctx.setJob(BATTLE_MAGE_4);
  ctx.addSkill(32120000, 0, 10);
  ctx.addSkill(32120001, 0, 10);
  ctx.addSkill(32120009, 0, 10);
  ctx.addSkill(32121002, 0, 10);
  ctx.addSkill(32121003, 0, 10);
  ctx.addSkill(32121004, 0, 10);
  ctx.addSkill(32121005, 0, 10);
  ctx.addSkill(32121006, 0, 10);
  ctx.addSkill(32121007, 0, 10);
  ctx.forceCompleteQuest(23052);
  yield ctx.sayNext("I've advanced you. I've also given you some sills that I know of but haven't mastered yet. I have a hunch that you'll be able to master them. After all, you are the most skilled member of the Resistance now!");
  yield ctx.sayBoth("Could this be my last lesson with you? Nah, can't be. You may be stronger, but I'm still smarter. I'm sure there's plenty more you can learn from me. So I'll see you at your next lesson... whenever that is...");
  yield ctx.sayPrev('Until then, I look forward to seeing what you accomplish.');
}

export function* q23053s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // You Surpass Me (23053 - start)
  yield ctx.sayNext("Well, if it isn't the town hero, #h0#! It's so wonderful to see you. Ah, even though it's under the control of the Black Wings, I do so love #m310000000#.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Are you feeling better?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("I still have a few aches and pains, but I'm fine. #p2151003# is the best healer around, after all. The only problem is...");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('What?! Are the Black Wings planning something?');
  ctx.setPlayerAsSpeaker(false);
  if (!(yield ctx.askYesNo("Haha, no, no. Rest easy. The problem is... you! You've become so strong that I don't have much to do. I used to be the best Wild Hunter in the Resistance, but now I'm not even good enough to teach you. That's why I want to give you an even more difficult mission!"))) {
    return;
  }
  if (!ctx.addItem(1142245, 1)) {
    yield ctx.sayNext("I was going to give you a gift for making the job advancement but I can't. Your Inventory Equip tab is full. Empty out at least one slot if you're interested in my gift.");
    return;
  }
  ctx.setJob(WILD_HUNTER_4);
  ctx.addSkill(33120000, 0, 10);
  ctx.addSkill(33120010, 0, 10);
  ctx.addSkill(33121001, 0, 10);
  ctx.addSkill(33121002, 0, 10);
  ctx.addSkill(33121004, 0, 10);
  ctx.addSkill(33121005, 0, 10);
  ctx.addSkill(33121006, 0, 10);
  ctx.addSkill(33121007, 0, 10);
  ctx.addSkill(33121009, 0, 10);
  ctx.forceCompleteQuest(23053);
  yield ctx.sayNext("I've advanced you. I've also given you some sills that I know of but haven't mastered yet. I have a hunch that you'll be able to master them. After all, you are the most skilled member of the Resistance now!");
  yield ctx.sayBoth("And with that, my lessons have... NOT come to an end. I can still be pretty useful, you know. There's more I can teach you. Plus, we're friends, right? So I'll see you at your next lesson... Whenever that might be...");
  yield ctx.sayPrev('Until then, I look forward to seeing what you accomplish.');
}

export function* q23054s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // You Surpass Me (23054 - start)
  yield ctx.sayNext("Well, if it isn't the town hero, #h0#! It's so wonderful to see you. Ah, even though it's under the control of the Black Wings, I do so love #m310000000#.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Are you feeling better?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("I still have a few aches and pains, but I'm fine. #p2151003# is the best healer around, after all. The only problem is...");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('What?! Are the Black Wings planning something?');
  ctx.setPlayerAsSpeaker(false);
  if (!(yield ctx.askYesNo("Haha, no, no. Rest easy. The problem is... you! You've become so strong that I don't have much to do. I used to be the best Wild Hunter in the Resistance, but now I'm not even good enough to teach you. That's why I want to give you an even more difficult mission!"))) {
    return;
  }
  if (!ctx.addItem(1142245, 1)) {
    yield ctx.sayNext("I wanted to give you a gift to commemorate your new powers but I can't. Why do you carry so many things in your Inventory's Equip tab?");
    return;
  }
  ctx.setJob(MECHANIC_4);
  ctx.addSkill(35120000, 0, 30);
  ctx.addSkill(35120001, 0, 15);
  ctx.addSkill(35121003, 0, 10);
  ctx.addSkill(35121005, 0, 10);
  ctx.addSkill(35121006, 0, 10);
  ctx.addSkill(35121007, 0, 10);
  ctx.addSkill(35121009, 0, 10);
  ctx.addSkill(35121010, 0, 10);
  ctx.addSkill(35121012, 0, 10);
  ctx.forceCompleteQuest(23054);
  yield ctx.sayNext("I've advanced you. I've also given you some sills that I know of but haven't mastered yet. I have a hunch that you'll be able to master them. After all, you are the most skilled member of the Resistance now.");
  yield ctx.sayBoth("With this, the end of my lessons has... neared. Though you are stronger than I am, there are a lot of things you can still learn from me. I will see you at our next lesson... Whenever that may be...");
  yield ctx.sayPrev('Until then, I look forward to seeing your accomplishments!');
}
