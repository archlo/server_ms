import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { InventoryType } from '../../item/InventoryType';
import { Reward } from '../../../provider/reward/Reward';
import { JobConstants } from '../../job/JobConstants';
import { MobAppearType } from '../../field/mob/MobAppearType';

const EVAN_PERION_SIGNS = 22597; // QuestRecordType.EvanPerionSigns
const EVAN_ENRAGED_GOLEM = 22598; // QuestRecordType.EvanEnragedGolem
const EVAN_SNOW_DRAGON = 22599; // QuestRecordType.EvanSnowDragon
const EVAN_EXIT_CAVE = 22600; // QuestRecordType.EvanExitCave
const EVAN_AFRIEN_MEMORY = 22601; // QuestRecordType.EvanAfrienMemory
const EVAN_AFRIEN = 22604; // QuestRecordType.EvanAfrien
const EVAN_ICE_WALL = 22605; // QuestRecordType.EvanIceWall
const MUSHROOM_CASTLE_OPENING = 2311; // QuestRecordType.MushroomCastleOpening

const EVAN_1 = 2200; // Job.EVAN_1
const EVAN_2 = 2210; // Job.EVAN_2
const EVAN_3 = 2211; // Job.EVAN_3
const EVAN_4 = 2212; // Job.EVAN_4
const EVAN_5 = 2213; // Job.EVAN_5
const EVAN_6 = 2214; // Job.EVAN_6
const EVAN_7 = 2215; // Job.EVAN_7
const EVAN_8 = 2216; // Job.EVAN_8
const EVAN_9 = 2217; // Job.EVAN_9
const EVAN_10 = 2218; // Job.EVAN_10

// ===== FIELDS =====

export function* dollCave01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Doll Cave (910050300)
}

export function* moveSDIRit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sleepy Dungeon III
}

export function* move_RitSDI(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Rien to Sleepy Dungeon III
}

export function* onSDI(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getQRValue(EVAN_SNOW_DRAGON) === '') {
    ctx.setQRValue(EVAN_SNOW_DRAGON, '1');
  }
}

export function* evanTogether(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Evan Together field script
}

// ===== NPCS =====

export function* periPatrol(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  switch (ctx.getFieldId()) {
    case 102020100: {
      if (ctx.getQRValue(EVAN_PERION_SIGNS) === '') {
        if (yield ctx.askYesNo("Hm? You there! You're not from around here, are you? You seem to be a stranger here in Perion... I am Peri Patrol, the guardian of these lands. I patrol around Perion in order to protect this place from monsters and any other dangers. Would you like to hear more about Perion?")) {
          yield ctx.sayNext("This is Perion, home to the toughest warriors and blacksmiths of Maple World. We may not look like much, but we hold a strong tradition of bravery and a never-give-up attitude. I patrol around the borders of this place, watching out for the safety of our citizens.");
          yield ctx.sayBoth("If you happen to walk around Perion, you may notice some odd looking signs posted in certain locations. These signs were placed there to test the resolve of the young warriors that strive to become strong. Find these signs and challenge yourself to overcome the obstacles described on them.");
          ctx.setQRValue(EVAN_PERION_SIGNS, '1');
        } else {
          yield ctx.sayNext("I see... well, if you change your mind, feel free to talk to me again.");
        }
      } else {
        yield ctx.sayOk("Be careful out there. Perion may look peaceful, but danger lurks around every corner.");
      }
      break;
    }
    case 102030000: {
      const qr = ctx.getQRValue(EVAN_PERION_SIGNS);
      if (qr === '1') {
        yield ctx.sayNext("Oh, you found one of the signs! This one challenges you to defeat a number of monsters in this area without taking too much damage. Give it a try if you're feeling confident!");
        ctx.setQRValue(EVAN_PERION_SIGNS, '1;2');
      } else {
        yield ctx.sayOk("Keep exploring, there's more to find around here.");
      }
      break;
    }
    case 102030100: {
      const qr = ctx.getQRValue(EVAN_PERION_SIGNS);
      if (qr === '1;2') {
        yield ctx.sayNext("Another sign! This area is known for its tricky terrain. Watch your footing as you battle.");
        ctx.setQRValue(EVAN_PERION_SIGNS, '1;2;3');
      } else {
        yield ctx.sayOk("Keep exploring, there's more to find around here.");
      }
      break;
    }
    case 102030200: {
      const qr = ctx.getQRValue(EVAN_PERION_SIGNS);
      if (qr === '1;2;3') {
        yield ctx.sayNext("You're getting close to completing the trial! This sign marks one of the toughest spots in Perion.");
        ctx.setQRValue(EVAN_PERION_SIGNS, '1;2;3;4');
      } else {
        yield ctx.sayOk("Keep exploring, there's more to find around here.");
      }
      break;
    }
    case 102030300: {
      const qr = ctx.getQRValue(EVAN_PERION_SIGNS);
      if (qr === '1;2;3;4') {
        yield ctx.sayNext("This is the final sign! You've made it through the entire trial. I'm impressed by your resolve.");
        yield ctx.sayBoth("You've proven yourself to be a true warrior of Perion. Take this as a token of my respect.");
        ctx.setQRValue(EVAN_PERION_SIGNS, '5');
      } else {
        yield ctx.sayOk("Keep exploring, there's more to find around here.");
      }
      break;
    }
    default:
      break;
  }
}

export function* downCamillar(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!ctx.hasQuestStarted(22557)) {
    yield ctx.sayOk("I don't think we have any business right now.");
    return;
  }
  if (ctx.field.getMobPool().getCount() > 0) {
    yield ctx.sayOk("There's still a monster nearby. Take care of it first!");
    return;
  }
  yield ctx.sayNext("Alright, the area is clear. Let's head back.");
  ctx.setQRValue(EVAN_ENRAGED_GOLEM, '2');
  ctx.warp(100000000, 'gm00');
}

export function* contimoveSDIRit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!ctx.hasQuestCompleted(22579)) {
    yield ctx.sayOk("I can't take you there yet.");
    return;
  }
  if (!(yield ctx.askAccept("Would you like to head over to Rien?"))) {
    yield ctx.sayNext("Let me know when you're ready.");
    return;
  }
  ctx.warpInstance([200090080], 'sp', 914100000, 60 * 15);
}

export function* contimoveRitSDI(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getFieldId() === 914100000) {
    if (!(yield ctx.askAccept("Would you like to head back to Sleepy Dungeon III?"))) {
      yield ctx.sayNext("Let me know when you're ready.");
      return;
    }
    ctx.warpInstance([200090090], 'sp', 914100000, 60 * 15);
  } else if (ctx.getFieldId() === 200090090) {
    if (!(yield ctx.askAccept("Would you like to head back to Sleepy Dungeon III?"))) {
      yield ctx.sayNext("Let me know when you're ready.");
      return;
    }
    ctx.warpInstance([200090080], 'sp', 914100000, 60 * 15);
  } else if (ctx.getFieldId() === 200090080) {
    if (!(yield ctx.askAccept("Would you like to head back to Sleepy Dungeon III?"))) {
      yield ctx.sayNext("Let me know when you're ready.");
      return;
    }
    ctx.warpInstance([200090090], 'sp', 914100000, 60 * 15);
  }
}

export function* ibech(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22582)) {
    ctx.warp(922030002, 'out00');
  } else if (ctx.hasQuestStarted(22583)) {
    ctx.warpInstance([922030010, 922030011], 'out00', 220011000, 60 * 10);
  } else if (ctx.hasQuestStarted(22584)) {
    ctx.warpInstance([922030020, 922030021, 922030022], 'out00', 220011000, 60 * 10);
  }
}

export function* Afirentalk(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!ctx.hasQuestStarted(22591)) {
    yield ctx.sayOk("...");
    return;
  }
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayNext("So... you're the one Mir told me about.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext("Yes, that's right.");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayNext("I... I remember now. There was someone like you who came here before, a long time ago.");
  yield ctx.sayBoth("That memory... it's coming back to me. Please, give me a moment.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext("Take your time.");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("Yes... I remember now. Thank you for helping me recover this memory.");
  ctx.setQRValue(EVAN_AFRIEN_MEMORY, '1');
  ctx.warp(914100021);
}

export function* froghiver(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!ctx.hasQuestStarted(22596)) {
    yield ctx.sayOk("...");
    return;
  }
  yield ctx.sayNext("Hm? What's that sound...");
  yield ctx.sayBoth("Something's coming!");
  ctx.spawnMob(9300393, 230, 31, MobAppearType.NORMAL, true);
  ctx.removeNpc(9300393);
}

export function* SDIhiver(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.field.getMobPool().getCount() > 0) {
    yield ctx.sayOk("There's still something here...");
    return;
  }
  yield ctx.sayNext("It's quiet now. Let's get out of here.");
  ctx.setQRValue(EVAN_AFRIEN, '1');
  ctx.warp(914100021, 'out00');
}

// ===== PORTALS =====

export function* evanEntrance(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getJob() === 2001) {
    ctx.message("You must complete your training as a Beginner before entering.");
    return;
  }
  ctx.warp(100030400, 'east00');
}

export function* enterDollcave(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22549) || ctx.hasQuestCompleted(22549)) {
    ctx.playPortalSE();
    ctx.warp(910050300, 'out00');
  } else {
    ctx.message("The cave is sealed shut.");
  }
}

export function* evanGolemDoor(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22557)) {
    ctx.playPortalSE();
    ctx.warpInstance([910600000], 'out00', 100020200, 60 * 10);
    ctx.spawnNpc(1013201, 390, 305, false, false);
  } else {
    ctx.playPortalSE();
    ctx.warp(100040000, 'west00');
  }
}

export function* evanDollGR(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22556)) {
    ctx.setQRValue(EVAN_ENRAGED_GOLEM, '1');
    yield ctx.sayOk("...");
  } else if (ctx.hasQuestStarted(22559)) {
    ctx.playPortalSE();
    ctx.warp(910600010, 'out00');
  }
}

export function* enterBlackRoom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.playPortalSE();
  ctx.warp(200080601, 'out00');
}

export function* goQuest_22575(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22575)) {
    ctx.playPortalSE();
    ctx.warp(921110100, 'out00');
  } else {
    ctx.message("The door is locked.");
  }
}

export function* goQuest_22404(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22404)) {
    ctx.playPortalSE();
    ctx.warp(923030000, 'out00');
  } else {
    ctx.setSpeakerId(2060005);
    yield ctx.sayOk("Uhm, excuse me? You can't go through here yet.");
  }
}

export function* enterSnowDragon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22580)) {
    ctx.playPortalSE();
    ctx.warp(914100020, 'out00');
  } else if (ctx.hasQuestStarted(22588)) {
    ctx.playPortalSE();
    ctx.warpInstance([914100020], 'out00', 922030000, 60 * 10);
    ctx.spawnReactor(1409000, -243, 6, false, -1, false);
  } else if (ctx.hasQuestStarted(22589)) {
    ctx.playPortalSE();
    ctx.warpInstance([914100023], 'out00', 914100010, 60 * 5);
    ctx.spawnNpc(1013204, -245, 53, false, false);
  } else if (ctx.hasQuestCompleted(22589)) {
    ctx.playPortalSE();
    ctx.warp(914100021, 'out00');
  } else {
    ctx.message("A mysterious force prevents you from entering.");
  }
}

export function* stopIceWall(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getQRValue(EVAN_SNOW_DRAGON) === '1') {
    ctx.setQRValue(EVAN_SNOW_DRAGON, '2');
    ctx.warp(914100020, 'out00');
    return;
  }
  ctx.warp(914100020, 'out00');
}

export function* enterBlackFrog(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22596)) {
    ctx.playPortalSE();
    ctx.warpInstance([922030001], 'out00', 211000300, 60 * 10);
    ctx.spawnNpc(1013206, 175, 31, false, false);
  } else if (ctx.hasQuestStarted(22581) || ctx.hasQuestCompleted(22581)) {
    ctx.playPortalSE();
    ctx.warp(922030000, 'out00');
  } else {
    ctx.playPortalSE();
    ctx.warp(922030001, 'out00');
  }
}

export function* enterBlackBC(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.playPortalSE();
  if (ctx.hasQuestStarted(22583)) {
    ctx.warpInstance([922030010, 922030011], 'out00', 220011000, 60 * 10);
    return;
  }
  if (ctx.hasQuestStarted(22584)) {
    ctx.warpInstance([922030020, 922030021, 922030022], 'out00', 220011000, 60 * 10);
    return;
  }
  ctx.warp(220011001, 'out00');
}

export function* enterSDI(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.hasQuestStarted(22588)) {
    ctx.playPortalSE();
    ctx.warpInstance([914100020], 'out00', 922030000, 60 * 10);
    ctx.spawnReactor(1409000, -243, 6, false, -1, false);
  }
}

export function* outSDI(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.playPortalSE();
  ctx.setQRValue(EVAN_EXIT_CAVE, '1');
  ctx.warp(914100010, 'in00');
}

export function* outAfrienMemory(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayOk("#bAfrien is in the other direction.");
}

// ===== REACTORS =====

export function* farmItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.dropRewards([Reward.item(4032452, 1, 1, 1.0, 22502)]);
}

export function* SDIScript0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayOk("#b(The cave begins to shake violently.)");
  ctx.setQRValue(EVAN_ICE_WALL, '1');
  ctx.warp(914100022, 'out00');
}

// ===== QUESTS - JOB ADVANCEMENT =====

export function* q22100s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22100);
  ctx.setJob(EVAN_1);
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
  yield ctx.sayImage(['UI/tutorial/evan/14/0']);
}

export function* q22101s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22101);
  ctx.setJob(EVAN_2);
}

export function* q22102s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22102);
  ctx.setJob(EVAN_3);
  ctx.addSkill(22111001, 0, 20);
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
}

export function* q22103s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22103);
  ctx.setJob(EVAN_4);
}

export function* q22104s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22104);
  ctx.setJob(EVAN_5);
}

export function* q22105s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22105);
  ctx.setJob(EVAN_6);
  ctx.addSkill(22140000, 0, 15);
  ctx.addSkill(22141002, 0, 20);
}

export function* q22106s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22106);
  ctx.setJob(EVAN_7);
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
}

export function* q22107s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22107);
  ctx.setJob(EVAN_8);
}

export function* q22108s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22108);
  ctx.setJob(EVAN_9);
  ctx.addSkill(22170001, 0, 30);
  ctx.addSkill(22171003, 0, 30);
  ctx.addSkill(22171000, 0, 30);
  ctx.addSkill(22171002, 0, 30);
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
}

export function* q22109s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.forceCompleteQuest(22109);
  ctx.setJob(EVAN_10);
  ctx.addSkill(22181000, 0, 30);
  ctx.addSkill(22181001, 0, 30);
  ctx.addSkill(22181002, 0, 30);
  ctx.addSkill(22181003, 0, 20);
}

export function* q2344s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Would you like to enter the Mushroom Castle theme dungeon?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  if (yield ctx.askYesNo("Would you like directions to the dungeon instead of entering directly?")) {
    yield ctx.sayNext("Head to Mushroom Castle and look for the entrance.");
    ctx.addItem(4032375, 1);
    ctx.forceStartQuest(2344);
    return;
  }
  ctx.addItem(4032375, 1);
  ctx.forceStartQuest(2344);
  if (ctx.getQRValue(MUSHROOM_CASTLE_OPENING) === '1') {
    ctx.warp(106020000, 'left00'); // Mushroom Castle : Mushroom Forest Field
  } else {
    ctx.warp(106020001); // TD_MC_Openning
  }
}

export function* q2344e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Well done on completing the dungeon!");
  ctx.removeItem(4032375);
  ctx.forceCompleteQuest(2344);
}

// ===== QUESTS - EVAN MOUNT =====

export function* q22401s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("You'll need a special item to ride your dragon properly.");
  if (!(yield ctx.askAccept("Would you like to receive the Dragon Saddle?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  if (!ctx.addItem(1902040, 1)) {
    yield ctx.sayNext("Please check if your inventory is full.");
    return;
  }
  ctx.forceCompleteQuest(22401);
}

export function* q22403s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Your dragon is growing stronger. There's more training ahead.");
  if (!(yield ctx.askYesNo("Are you ready to continue your dragon's training?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  ctx.forceStartQuest(22403);
}

export function* q22404s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("There's something important I need to tell you about your dragon's growth.");
  if (!(yield ctx.askYesNo("Would you like to hear more?"))) {
    yield ctx.sayNext("Let me know when you're ready.");
    return;
  }
  if (!(yield ctx.askYesNo("Are you prepared to head out now?"))) {
    yield ctx.sayNext("Let me know when you're ready.");
    return;
  }
  ctx.forceStartQuest(22404);
  ctx.warp(923030000, 'out00');
}

export function* q22406s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Your dragon has grown again! Let's continue.");
  if (!(yield ctx.askAccept("Would you like to receive the next saddle upgrade?"))) {
    yield ctx.sayOk("Come back when you're ready.");
  }
  if (!ctx.addItem(1902041, 1)) {
    yield ctx.sayNext("Please check if your inventory is full.");
    return;
  }
  ctx.forceCompleteQuest(22406);
}

export function* q22411s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Your dragon is finally fully grown!");
  if (!(yield ctx.askAccept("Would you like to receive the final saddle upgrade?"))) {
    yield ctx.sayOk("Come back when you're ready.");
  }
  if (!ctx.addItem(1902042, 1)) {
    yield ctx.sayNext("Please check if your inventory is full.");
    return;
  }
  ctx.forceCompleteQuest(22411);
}

// ===== QUESTS - STORY =====

export function* q23908s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Hello there, young Magician.");
}

export function* q22500s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayImage(['UI/tutorial/evan/11/0']);
}

export function* q22501s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Let's continue your training.");
}

export function* q22502s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayImage(['UI/tutorial/evan/12/0']);
}

export function* q22503s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Keep practicing your spells.");
}

export function* q22504s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Your dragon companion is growing.");
}

export function* q22507s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Are you ready to take on this challenge?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  ctx.addExp(810);
}

export function* q22510s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayImage(['UI/tutorial/evan/13/0']);
}

export function* q22512s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("There's still more to learn.");
}

export function* q22514s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Your dragon yearns to explore further.");
}

export function* q22518s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("It's time to head out on a new journey.");
  ctx.warpInstance([910060100], 'start', 100020000, 60 * 10);
}

export function* q22536s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("You've made great progress!");
  ctx.addExp(8000);
}

export function* q22541s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (yield ctx.askAccept("Would you like to head to Perion now?")) {
    yield ctx.sayNext("Off you go then.");
    ctx.forceStartQuest(22541);
    ctx.warp(103000000);
    return;
  }
  yield ctx.sayNext("Let me know when you're ready.");
  ctx.forceStartQuest(22541);
}

export function* q22546e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askYesNo("Have you finished what you set out to do?"))) {
    yield ctx.sayNext("Take your time.");
    return;
  }
  ctx.setSpeakerId(1013000);
  ctx.setSpeakerOnRight(false);
  yield ctx.sayNext("Well done!");
  ctx.setSpeakerId(2081000);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("Thank you for everything.");
  ctx.removeItem(4161050);
  ctx.addExp(12000);
}

export function* q22560s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("It's time for the next part of your journey.");
}

export function* q22564e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setSpeakerId(1013000);
  ctx.setSpeakerOnRight(false);
  yield ctx.sayNext("You've come a long way, Evan.");
  ctx.setSpeakerId(2081000);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("Indeed. Let's keep moving forward.");
  ctx.forceCompleteQuest(22564);
  ctx.addExp(17000);
  ctx.addSp(JobConstants.getJobLevel(EVAN_4), 2);
}

export function* q22565s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Your bond with your dragon grows stronger every day.");
  ctx.addExp(20000);
  ctx.addSp(JobConstants.getJobLevel(EVAN_4), 2);
}

export function* q22567e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setSpeakerId(1013000);
  ctx.setSpeakerOnRight(false);
  yield ctx.sayNext("Mir has something to say to you.");
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("Thank you for all your hard work.");
  ctx.removeItem(4032468);
  ctx.addExp(22500);
  ctx.addSp(JobConstants.getJobLevel(EVAN_4), 1);
}

export function* q22575s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (yield ctx.askYesNo("Would you like to head out immediately?")) {
    yield ctx.sayNext("Be careful out there.");
    ctx.forceStartQuest(22575);
    ctx.warp(211000001, 'out01');
    return;
  }
  yield ctx.sayNext("Let me know when you're ready.");
  ctx.forceStartQuest(22575);
}

export function* q22578s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Well done. Your dragon has learned a new ability.");
  ctx.forceCompleteQuest(22578);
  ctx.addSp(JobConstants.getJobLevel(EVAN_5), 2);
  ctx.addExp(30000);
}

export function* q22581s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (yield ctx.askAccept("Would you like to head out now?")) {
    yield ctx.sayNext("Be safe.");
    ctx.forceStartQuest(22581);
    ctx.warp(220000300, 'scr00');
    return;
  }
  yield ctx.sayNext("Let me know when you're ready.");
  ctx.forceStartQuest(22581);
}

export function* q22582s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Would you like to head into the cave?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  ctx.forceStartQuest(22582);
  ctx.warp(922030002, 'out00');
}

export function* q22582e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askYesNo("Have you completed your task?"))) {
    yield ctx.sayNext("Take your time.");
    return;
  }
  ctx.forceCompleteQuest(22582);
  ctx.removeItem(4000594);
  ctx.addExp(50000);
}

export function* q22583s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askYesNo("Are you ready to continue?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  if (!ctx.addItem(2430032, 1)) {
    yield ctx.sayNext("Please check if your inventory is full.");
    return;
  }
  ctx.forceStartQuest(22583);
  ctx.warpInstance([922030010, 922030011], 'out00', 220011000, 60 * 10);
}

export function* q22585s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Are you ready to proceed?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  ctx.forceCompleteQuest(22585);
  ctx.addExp(50000);
  ctx.addSp(JobConstants.getJobLevel(EVAN_6), 1);
}

export function* q22587s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Are you ready to head out?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  if (!(yield ctx.askYesNo("Would you like to depart now?"))) {
    yield ctx.sayNext("Let me know when you're ready.");
    return;
  }
  ctx.forceStartQuest(22587);
  ctx.warpInstance([925110001], 'out00', 251000000, 60 * 30);
}

export function* q22591s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Are you ready to find Afrien?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  ctx.forceStartQuest(22591);
  ctx.warp(900030000, 'sp');
}

export function* q22593s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Well done, Evan.");
  ctx.forceCompleteQuest(22593);
  ctx.addExp(65000);
}

export function* q22594s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setSpeakerId(1013000);
  ctx.setSpeakerOnRight(false);
  yield ctx.sayNext("This is a momentous occasion.");
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("Indeed it is.");
  ctx.forceCompleteQuest(22594);
  ctx.addExp(65000);
}

export function* q22595s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setSpeakerId(1013000);
  ctx.setSpeakerOnRight(false);
  yield ctx.sayNext("You've grown so much, Evan.");
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("Thank you, Mir.");
  ctx.forceCompleteQuest(22595);
  ctx.addExp(65000);
}

export function* q22602s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Would you like to receive this item?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  if (!ctx.addItem(1142156, 1)) {
    yield ctx.sayNext("Please check if your inventory is full.");
    return;
  }
  ctx.forceCompleteQuest(22602);
}

export function* q22603s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!(yield ctx.askAccept("Would you like to receive this item?"))) {
    yield ctx.sayNext("Come back when you're ready.");
    return;
  }
  if (!ctx.addItem(1142157, 1)) {
    yield ctx.sayNext("Please check if your inventory is full.");
    return;
  }
  ctx.forceCompleteQuest(22603);
}
