import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { JobConstants } from '../../job/JobConstants';
import { EventType } from '../../../server/event/EventType';
import { EventState } from '../../../server/event/EventState';
import { Util } from '../../../util/Util';

const TICKET_TO_CONSTRUCTION_SITE_B1 = 4031036;
const TICKET_TO_CONSTRUCTION_SITE_B2 = 4031037;
const TICKET_TO_CONSTRUCTION_SITE_B3 = 4031038;

const KERNING_SQUARE_SUBWAY_1 = 103020010; // Kerning City -> Kerning Square
const KERNING_SQUARE_SUBWAY_2 = 103020011; // Kerning Square -> Kerning City

const SUBWAY_TICKET_TO_NLC = 4031711; // Masteria.SUBWAY_TICKET_TO_NLC
const WAITING_ROOM_FROM_KC_TO_NLC = 600010004; // Subway.WAITING_ROOM_FROM_KC_TO_NLC

function itemName(itemId: number): string {
  return `#t${itemId}#`;
}

function bold(text: string): string {
  return `#e${text}#n`;
}

function red(text: string): string {
  return `#r${text}#k`;
}

export function* victoria_taxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Regular Cab in Victoria (1012000)
  //   Henesys / Ellinia / Perion / Kerning City / Lith Harbor / Nautilus Harbor
  const isBeginner = JobConstants.isBeginnerJob(ctx.getJob());
  const price = isBeginner ? 100 : 1000;
  const towns = [
    100000000, // Henesys : Henesys
    101000000, // Ellinia : Ellinia
    102000000, // Perion : Perion
    103000000, // Kerning City : Kerning City
    104000000, // Lith Harbor : Lith Harbor
    120000000, // Nautilus : Nautilus Harbor
  ].filter((mapId) => ctx.getFieldId() !== mapId);
  const options = new Map<number, string>();
  towns.forEach((mapId, i) => options.set(i, `#m${mapId}# (${price} Mesos)`));
  yield ctx.sayNext("Hello! I'm #p1012000#, and I am here to take you to your destination, quickly and safely. #b#p1012000##k values your satisfaction, so you can always reach your destination at an affordable price. I am here to serve you.");
  const answer: number = yield ctx.askMenu('Please select your destination.' + (isBeginner ? '\r\nWe have a special 90% discount for beginners.' : ''), options);
  if (yield ctx.askYesNo(`You don't have anything else to do here, huh? Do you really want to go to #b#m${towns[answer]}##k? It'll cost you #b${price}#k mesos.`)) {
    if (ctx.addMoney(-price)) {
      ctx.warp(towns[answer]);
    } else {
      yield ctx.sayOk("You don't have enough mesos. Sorry to say this, but without them, you won't be able to ride the cab.");
    }
  } else {
    yield ctx.sayOk("There's a lot to see in this town, too. Come back and find us when you need to go to a different town.");
  }
}

export function* subway_ticket(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Jake : Subway Worker (1052006)
  //   Victoria Road : Subway Ticketing Booth (103000100)
  //   Kerning City Subway : Subway Ticketing Booth (103020000)
  const options = new Map<number, string>();
  if (ctx.getLevel() >= 20) {
    options.set(0, itemName(TICKET_TO_CONSTRUCTION_SITE_B1)); // Shumi's Lost Coin
  }
  if (ctx.getLevel() >= 30) {
    options.set(1, itemName(TICKET_TO_CONSTRUCTION_SITE_B2)); // Shumi's Lost Bundle of Money
  }
  if (ctx.getLevel() >= 40) {
    options.set(2, itemName(TICKET_TO_CONSTRUCTION_SITE_B3)); // Shumi's Lost Sack of Money
  }
  if (options.size === 0) {
    yield ctx.sayNext("You can enter the premise once you have bought the ticket; however it doesn't seem like you can enter here. There are foreign devices underground that may be too much for you to handle, so please train yourself, be prepared, and then come back.");
    return;
  }
  const answer: number = yield ctx.askMenu('You must purchase the ticket to enter. Once you have made the purchase, you can enter through #p1052007# on the right. What would you like to buy?', options);
  if (answer === 0) {
    if (yield ctx.askYesNo("Will you purchase the Ticket to #bConstruction site B1#k? It'll cost you 500 Mesos. Before making the purchase, please make sure you have an empty slot on your ETC inventory.")) {
      if (ctx.canAddItem(TICKET_TO_CONSTRUCTION_SITE_B1, 1) && ctx.addMoney(-500)) {
        ctx.addItem(TICKET_TO_CONSTRUCTION_SITE_B1, 1);
        yield ctx.sayNext('You can insert the ticket in the #p1052007#. I heard Area 1 has some precious items available but with so many traps all over the place most come back out early. Wishing you the best of luck.');
      } else {
        yield ctx.sayNext('Are you lacking Mesos? Check and see if you have an empty slot on your ETC inventory or not.');
      }
    } else {
      yield ctx.sayNext('You can enter the premise once you have bought the ticket. I heard there are strange devices in there everywhere but in the end, rare precious items await you. So let me know if you ever decide to change your mind.');
    }
  } else if (answer === 1) {
    if (yield ctx.askYesNo("Will you purchase the Ticket to #bConstruction site B2#k? It'll cost you 1200 Mesos. Before making the purchase, please make sure you have an empty slot on your ETC inventory.")) {
      if (ctx.canAddItem(TICKET_TO_CONSTRUCTION_SITE_B2, 1) && ctx.addMoney(-1200)) {
        ctx.addItem(TICKET_TO_CONSTRUCTION_SITE_B2, 1);
        yield ctx.sayNext('You can insert the ticket in the #p1052007#. I heard Area 2 has rare, precious items available but with so many traps all over the place most come back out early. Please be safe.');
      } else {
        yield ctx.sayNext('Are you lacking Mesos? Check and see if you have an empty slot on your ETC inventory or not.');
      }
    } else {
      yield ctx.sayNext('You can enter the premise once you have bought the ticket. I heard there are strange devices in there everywhere but in the end, rare precious items await you. So let me know if you ever decide to change your mind.');
    }
  } else if (answer === 2) {
    if (yield ctx.askYesNo("Will you purchase the Ticket to #bConstruction site B3#k? It'll cost you 2000 Mesos. Before making the purchase, please make sure you have an empty slot on your ETC inventory.")) {
      if (ctx.canAddItem(TICKET_TO_CONSTRUCTION_SITE_B3, 1) && ctx.addMoney(-2000)) {
        ctx.addItem(TICKET_TO_CONSTRUCTION_SITE_B3, 1);
        yield ctx.sayNext('You can insert the ticket in the #p1052007#. I heard Area 3 has very rare, very precious items available but with so many traps all over the place most come back out early. Wishing you the best of luck.');
      } else {
        yield ctx.sayNext('Are you lacking Mesos? Check and see if you have an empty slot on your ETC inventory or not.');
      }
    } else {
      yield ctx.sayNext('You can enter the premise once you have bought the ticket. I heard there are strange devices in there everywhere but in the end, rare precious items await you. So let me know if you ever decide to change your mind.');
    }
  }
}

export function* subway_in(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Ticket Gate (1052007)
  //   Victoria Road : Subway Ticketing Booth (103000100)
  //   Kerning City Subway : Subway Ticketing Booth (103020000)
  const answer: number = yield ctx.askMenu('Pick your destination.', new Map([
    [0, bold('Kerning City Subway' + red('Beware of Stirges and Wraiths!'))],
    [1, 'Kerning Square Shopping Center (Get on the Subway)'],
    [2, 'Enter Construction Site'],
    [3, 'New Leaf City'],
  ]));
  if (answer === 0) {
    // Kerning City Subway : Along the Subway
    ctx.warp(103020100, 'out00');
  } else if (answer === 1) {
    // Kerning Square : Kerning Square Station
    ctx.warpInstance([KERNING_SQUARE_SUBWAY_1], 'sp', 103020020, 10);
  } else if (answer === 2) {
    // Enter Construction Site
    if (!ctx.hasItem(TICKET_TO_CONSTRUCTION_SITE_B1) && !ctx.hasItem(TICKET_TO_CONSTRUCTION_SITE_B2) && !ctx.hasItem(TICKET_TO_CONSTRUCTION_SITE_B3)) {
      yield ctx.sayOk('Here\'s the ticket reader. You are not allowed in without the ticket.');
      return;
    }
    const options = new Map<number, string>();
    if (ctx.hasItem(TICKET_TO_CONSTRUCTION_SITE_B1)) {
      options.set(0, 'Construction site B1');
    }
    if (ctx.hasItem(TICKET_TO_CONSTRUCTION_SITE_B2)) {
      options.set(1, 'Construction site B2');
    }
    if (ctx.hasItem(TICKET_TO_CONSTRUCTION_SITE_B3)) {
      options.set(2, 'Construction site B3');
    }
    const ticketAnswer: number = yield ctx.askMenu('Here\'s the ticket reader. You will be brought in immediately. Which ticket would you like to use?', options);
    if (ticketAnswer === 0) {
      if (ctx.removeItem(TICKET_TO_CONSTRUCTION_SITE_B1, 1)) {
        ctx.warp(910360000, 'sp'); // B1 : Area 1
      }
    } else if (ticketAnswer === 1) {
      if (ctx.removeItem(TICKET_TO_CONSTRUCTION_SITE_B2, 1)) {
        ctx.warp(910360100, 'sp'); // B2 : Area 1
      }
    } else if (ticketAnswer === 2) {
      if (ctx.removeItem(TICKET_TO_CONSTRUCTION_SITE_B3, 1)) {
        ctx.warp(910360200, 'sp'); // B3 : Area 1
      }
    }
  } else if (answer === 3) {
    // New Leaf City
    if (!ctx.hasItem(SUBWAY_TICKET_TO_NLC)) {
      yield ctx.sayOk('Here\'s the ticket reader. You are not allowed in without the ticket.');
      return;
    }
    const eventState = ctx.getEventState(EventType.CM_SUBWAY);
    if (eventState === EventState.SUBWAY_BOARDING) {
      if (!(yield ctx.askYesNo("It looks like there's plenty of room for this ride. Please have your ticket ready so I can let you in. The ride will be long, but you'll get to your destination just fine. What do you think? Do you want to get on this ride?"))) {
        return;
      }
      if (ctx.removeItem(SUBWAY_TICKET_TO_NLC, 1)) {
        ctx.warp(WAITING_ROOM_FROM_KC_TO_NLC, 'st00'); // Kerning City Town Street : Waiting Room (From KC to NLC)
      }
    } else if (eventState === EventState.SUBWAY_WAITING) {
      yield ctx.sayNext("This subway is getting ready for takeoff. I'm sorry, but you'll have to get on the next ride. The ride schedule is available through the usher at the ticketing booth.");
    } else {
      yield ctx.sayNext('We will begin boarding 5 minutes before the takeoff. Please be patient and wait for a few minutes. Be aware that the subway will take off right on time, and we stop receiving tickets 1 minute before that, so please make sure to be here on time.');
    }
  }
}

export function* subway_in2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Victoria Road : Subway Ticketing Booth (103000100) - in00 (200, 187)
  // Kerning City Subway : Subway Ticketing Booth (103020000) - in00 (200, 187)
  yield* subway_in(ctx);
}

export function* Depart_inSubway(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kerning City Subway : Kerning Square Subway (103020010 / 103020011 / 103020012)
  if (ctx.getFieldId() === KERNING_SQUARE_SUBWAY_1) {
    ctx.scriptProgressMessage('The next stop is at Kerning Square Station. The exit is to your left.');
  } else if (ctx.getFieldId() === KERNING_SQUARE_SUBWAY_2) {
    ctx.scriptProgressMessage('The next stop is at Kerning Subway Station. The exit is to your left.');
  }
}

export function* Depart_ToKerning(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kerning Square : Kerning Square Station (103020020) - out00 (465, 26)
  ctx.playPortalSE();
  ctx.warpInstance([KERNING_SQUARE_SUBWAY_2], 'sp', 103020000, 10); // Kerning City Subway : Subway Ticketing Booth
}

export function* enter_VDS(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sleepywood : Sleepywood (105000000) - east00 (1759, 312)
  const playerLevel = ctx.getLevel();
  if (playerLevel < 50) {
    ctx.scriptProgressMessage('You cannot enter, because you do not meet the level requirement.');
    ctx.message('You must be Lv. 50 or above to enter this area.');
    return;
  }
  ctx.playPortalSE();
  ctx.warp(105010000, 'west00'); // Swamp : Silent Swamp
}

export function* enterAchter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Henesys : Henesys Park (100000200) - in02 (3941, 693)
  ctx.playPortalSE();
  ctx.warp(100000201, 'out02'); // Henesys : Bowman Instructional School
}

export function* enterMagiclibrar(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ellinia : Ellinia (101000000) - jobin00 (-250, -473)
  ctx.playPortalSE();
  ctx.warp(101000003, 'jobout00'); // Ellinia : Magic Library
}

export function* inERShip(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Port Road : Victoria Tree Platform (104020100) - in01 (-422, -745)
  ctx.playPortalSE();
  ctx.warp(104020120, 'out00'); // Port Road : Station to Ereve
}

export function* nautil_black(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Muirhat (1092007) - Nautilus : Top Floor - Hallway (120000100)
  // TODO
}

export function* nautil_stone(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Shiny Stone (1092016) - Nautilus : Generator Room (120000301)
  if (ctx.hasQuestStarted(2166)) {
    yield ctx.sayNext("It's a beautiful, shiny rock. I can feel the mysterious power surrounding it.");
    ctx.forceCompleteQuest(2166);
  } else {
    yield ctx.sayNext('I touched the shiny rock with my hand, and I felt a mysterious power flowing into my body.');
  }
}

export function* nautil_letter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Trash Can (1092018) - Nautilus : Top Floor - Hallway (120000100)
  if (ctx.hasQuestCompleted(2162) || ctx.hasItem(4031839)) {
    return;
  }
  if (ctx.addItem(4031839, 1)) {
    yield ctx.sayNext("(You retrieved a Crumpled Paper standing out of the trash can. It's content seems important.)");
  } else {
    yield ctx.sayNext("(You see a Crumpled Paper standing out of the trash can. It's content seems important, but you can't retrieve it since your inventory is full.)");
  }
}

export function* nautil_cow(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Tangyoon (1092000) - Nautilus : Cafeteria (120000103)
  if (ctx.hasQuestStarted(2180)) {
    yield ctx.sayNext("Okay, I'll now send you to the stable where my cows are. Watch out for the calves that drink all the milk. You don't want your effort to go to waste.");
    yield ctx.sayBoth("It won't be easy to tell at a glance between a calf and a cow. Those calves may only be a month or two old, but they have already grown to the size of their mother. They even look alike...even I get confused at times! Good luck!");
    if (ctx.addItem(4031847, 1)) {
      ctx.warp(912000100, 'sp'); // Hidden Chamber : The Nautilus - Stable
    } else {
      yield ctx.sayOk("I can't give you the empty bottle because your inventory is full. Please make some room in your Etc window.");
    }
  }
}

export function* mom_cow(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mother Milk Cow (1092090 / 1092091 / 1092092) - Hidden Chamber : The Nautilus - Stable (912000100)
  if (ctx.getQRValue(2180) === String(ctx.getSpeakerId())) { // QuestRecordType.NautilusMomCow
    yield ctx.sayNext('You have taken milk from this cow recently, check another cow.');
    return;
  }
  if (ctx.canAddItem(4031848, 1) && ctx.hasItem(4031847)) {
    ctx.removeItem(4031847, 1);
    ctx.addItem(4031848, 1);
    yield ctx.sayNext('Now filling up the bottle with milk. The bottle is now 1/3 full of milk.');
    ctx.setQRValue(2180, String(ctx.getSpeakerId())); // QuestRecordType.NautilusMomCow
  } else if (ctx.canAddItem(4031849, 1) && ctx.hasItem(4031848)) {
    ctx.removeItem(4031848, 1);
    ctx.addItem(4031849, 1);
    yield ctx.sayNext('Now filling up the bottle with milk. The bottle is now 2/3 full of milk.');
    ctx.setQRValue(2180, String(ctx.getSpeakerId())); // QuestRecordType.NautilusMomCow
  } else if (ctx.canAddItem(4031850, 1) && ctx.hasItem(4031849)) {
    ctx.removeItem(4031849, 1);
    ctx.addItem(4031850, 1);
    yield ctx.sayNext('Now filling up the bottle with milk. The bottle is now completely full of milk.');
    ctx.setQRValue(2180, String(ctx.getSpeakerId())); // QuestRecordType.NautilusMomCow
  }
}

export function* baby_cow(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Baby Milk Cow (1092093 / 1092094 / 1092095) - Hidden Chamber : The Nautilus - Stable (912000100)
  if (ctx.hasItem(4031847)) {
    yield ctx.sayNext('The hungry calf is drinking all the milk! The bottle remains empty...');
  } else if (ctx.hasItem(4031848) || ctx.hasItem(4031849) || ctx.hasItem(4031850)) {
    ctx.removeItem(4031848);
    ctx.removeItem(4031849);
    ctx.removeItem(4031850);
    ctx.addItem(4031847, 1);
    yield ctx.sayNext('The hungry calf is drinking all the milk! The bottle is now empty.');
  }
}

export function* end_cow(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Chamber : The Nautilus - Stable (912000100) - ntq2 (793, 148)
  if (ctx.hasQuestStarted(2180) && !ctx.hasItem(4031850)) {
    ctx.message('Your milk jug is not full...');
  } else {
    ctx.playPortalSE();
    ctx.warp(120000103); // Nautilus : Cafeteria
  }
}

export function* nautil_Abel1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Bush (1094002 / 1094003 / 1094004 / 1094005 / 1094006) - Nautilus : Nautilus Harbor (120000000)
  const items = [4031853, 4031854, 4031855];
  if (ctx.hasQuestStarted(2186) && !ctx.hasItem(4031853)) {
    const itemId = Util.getRandomFromCollection(items)!;
    if (ctx.addItem(itemId, 1)) {
      if (itemId === 4031853) {
        yield ctx.sayNext("I found Abel's glasses.");
      } else {
        yield ctx.sayOk("I found a pair of glasses, but it doesn't seem to be Abel's. Abel's pair is horn-rimmed...");
      }
    } else {
      yield ctx.sayNext("I can't find any space to store Abel's glasses. I better check the Etc. tab of my inventory.");
    }
  }
}

export function* q2186e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Help Me Find My Glasses (2186 - end)
  yield ctx.sayNext("What? You found my glasses? I better put it on first, to make sure that it''s really mine. Oh, it really is mine. Thank you so much!\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#v2030019# 5 #t2030019#s\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0#  1000 EXP");
  if (ctx.canAddItem(2030019, 5) && ctx.removeItem(4031853)) {
    ctx.addItem(2030019, 5); // Nautilus Return Scroll
    ctx.addExp(1000);
    ctx.forceCompleteQuest(2186);
    ctx.setNpcAction(1094001, 'quest'); // Abel
    yield ctx.sayNext('Yes...time for some fishing!');
  } else {
    yield ctx.sayOk('I need you to have an USE slot available to reward you properly!');
  }
}

export function* q2230e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Mysterious Small Egg (2230 - end)
  yield ctx.askMenu('Hello, traveler. You have finally come to see me. Have you fulfilled your duties?', new Map([[0, 'What duties? Who are you?']]));
  yield ctx.sayNext("You found a small egg in your pocket? That egg is your duty, your responsibility. Life is hard when you're all by yourself. In times like this, there's nothing quite like having a friend that will be there for you at all times. Have you heard of a #bpet#k?\r\nPeople raise pets to ease the burden, sorrow, and loneliness, because knowing that you have someone, or something in this matter, on your side will really bring a peace of mind. But everything has consequences, and with it comes responsibility...");
  yield ctx.sayBoth("Raising a pet requires a huge amount of responsibility. Remember, a pet is a form of life, as well, so you'll need to feed it, name it, share your thoughts with it, and ultimately form a bond. That's how the owners get attached to these pets.");
  yield ctx.sayBoth("I wanted to instill this in you, and that's why I sent you a baby that I cherish. The egg you have brought is #bRune Snail#k, a creature that is born through the power of Mana. Since you took great care of it as you brought the egg here, the egg will hatch soon.");
  yield ctx.sayBoth("The Rune Snail is a pet of many skills. It'll pick up items, feed you with potions, and do other things that will astound you. The downside is that since it was born out of power of Mana, its lifespan is very short. Once it turns into a doll, it'll never be able to be revived.");
  if (!(yield ctx.askYesNo('Now do you understand? Every action comes with consequences, and pets are no exception. The egg of the snail shall hatch soon.'))) {
    // TODO: This line is not GMS-like
    yield ctx.sayOk("You aren't ready to take on the responsibility of a pet? I understand.. not everyone has the ability to do so.");
    return;
  }
  if (ctx.canAddItem(5000054, 1) && ctx.removeItem(4032086)) {
    ctx.addItemWithExpiration(5000054, 5 * 60 * 60); // 5 hour duration
    ctx.forceCompleteQuest(2230);
    yield ctx.sayNext('This snail will only be alive for #b5 hours#k. Shower it with love. Your love will be reciprocated in the end.');
  } else {
    yield ctx.sayOk('I need you to have a CASH slot available to reward you properly!');
  }
}
