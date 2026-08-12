import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';
import { Util } from '../../../util/Util';
import { EventType } from '../../../server/event/EventType';
import { EventState } from '../../../server/event/EventState';

export function* sell_ticket(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Joel : Station Clerk (1032007) / Agatha (2012000) / Mel (2040000) / Mue (2082000) / Syras (2102002)
  if (ctx.getFieldId() === 104020110) {
    // Port Road : Station to Orbis
    yield ctx.sayNext("Pleased to meet you. I'm Joel, the station attendant. Want to leave Victoria Island and go to another area? At our station, we have an #bairship#k bound for #bOrbis Station#k, on the continent of Ossyria, leaving #bevery 15 minutes on the hour#k.");
    yield ctx.sayBoth("If you are thinking of going to Orbis, please go talk to #bCherry#k on the right.");
    yield ctx.sayBoth("Well, the truth is, we charged for these flights until very recently, but the alchemists of Magatia made a crucial discovery on the fuel that dramatically cuts down the amount of Mana used for the flight, so these flight are now free. Don't worry, we still get paid. Now we just get paid through the government.");
  } else if (ctx.getFieldId() === 200000100) {
    // Orbis : Orbis Station Entrance
    const answer = yield ctx.askMenu("I can guide you to the right ship to reach your destination. Where are you headed?", new Map([
      [0, 'Victoria Island'],
      [1, 'Ludibrium Castle'],
      [2, 'Leafre'],
      [3, 'Mu Lung'],
      [4, 'Ariant'],
      [5, 'Ereve'],
      [6, 'Edelstein'],
    ]));
    if (answer === 0) {
      yield ctx.sayNext("You're headed to Victoria Island? Oh, it's a beautiful island with a variety of villages. The ship to Victoria Island #bleaves every 15 minutes on the hour#k.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the Airship to Victoria. If anyone can show you the way, it's Isa.");
    } else if (answer === 1) {
      yield ctx.sayNext("You're headed to Ludibrium Castle at Ludus Lake? It's such a fun village made of toys. The ship to Ludibrium #bleaves every 10 minutes on the hour#k.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the Airship to Ludibrium. If anyone can show you the way, it's Isa.");
    } else if (answer === 2) {
      yield ctx.sayNext("You're headed to Leafre in Minar Forest? I love that quaint little village of Halflingers. The ship to Leafre #bleaves every 10 minutes on the hour#k.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the Airship to Leafre. If anyone can show you the way, it's Isa.");
    } else if (answer === 3) {
      yield ctx.sayNext("Are you heading towards Mu Lung in the Mu Lung temple? I'm sorry, but there's no ship that flies from Orbis to Mu Lung. There is another way to get there, though. There's a #bCrane that runs a cab service for 1 that's always available#k, so you'll get there as soon as you wish.");
      yield ctx.sayBoth("Unlike the other ships that fly for free, however, this cab requires a set fee. This personalized flight to Mu Lung will cost you #b1,500 mesos#k, so please have to fee ready before riding the Crane.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the Crane to Mu Lung. If anyone can show you the way, it's Isa.");
    } else if (answer === 4) {
      yield ctx.sayNext("You're headed to Ariant in the Nihal Desert? The people living there have a passion as hot as the desert. The ship to Ariant #bleaves every 10 minutes on the hour#k.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the Genie to Ariant. If anyone can show you the way, it's Isa.");
    } else if (answer === 5) {
      yield ctx.sayNext("Are you heading towards Ereve? It's a beautiful island blessed with the presence of the Shinsoo the Holy Beast and Empress Cygnus. #bThe boat is for 1 person and it's always readily available#k so you can travel to Ereve fast.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the ship to Ereve. If anyone can show you the way, it's Isa.");
    } else if (answer === 6) {
      yield ctx.sayNext("Are you going to Edelstein? The brave people who live there constantly fight the influence of dangerous monsters. #b1-person Airship to Edelstein is always on standby#k, so you can use it at any time.");
      yield ctx.sayBoth("Talk to #bIsa the Platform Guide#k on the right if you would like to take the ship to Edelstein. If anyone can show you the way, it's Isa.");
    }
  } else if (ctx.getFieldId() === 220000100) {
    // Ludibrium : Ludibrium Ticketing Place
    yield ctx.sayNext("Pleased to meet you. I'm Mel, the station attendant. Are you ready to leave Ludibrium and go to another area? At our station, we have an #bairship#k bound for #bOrbis Station#k, on the continent of Ossyria, leaving #bevery 10 minutes on the hour#k.");
    yield ctx.sayBoth("If you are planning on heading to Orbis, please use the portal on the right and head to the station, then talk to #bTian#k.");
    yield ctx.sayBoth("Sigh... Free flights to everywhere... I don't understand what got the alchemists of Magatia to come up with something like this. This is making our job that much harder, because there are so many more passengers now. Sigh...");
  } else if (ctx.getFieldId() === 240000100) {
    // Leafre : Leafre Station Entrance
    yield ctx.sayNext("Pleased to meet you. I'm Mu, the station attendant. Would you like to leave Leafre and go to another area? At our station, we have an #bairship#k bound for #bOrbis Station#k, on the continent of Ossyria, leaving #bevery 10 minutes on the hour#k.");
    yield ctx.sayBoth("If you're going to Orbis, use the portal on the right and head to the station, then talk to #bTommie#k. Ah, don't be surprised when you see him. We keep being mistaken for being twins, but Tommie's actually my third oldest brother.");
    yield ctx.sayBoth("Oh, and this is just between you and me... at the highest point of the station, you'll find a strange old man named Corba. Apparently, he possesses the mystic power to transform people into flying dragons. It has been said that once transformed into a flying dragon, you can fly to the mysterious floating island. Surely adventurers of level 100 and up will be intrigued...");
  } else if (ctx.getFieldId() === 260000100) {
    // Ariant : Ariant Station Platform
    yield ctx.sayNext("Hey. I'm the station attendant, Syras. You wanna leave Ariant and go to another area? Here at our station we have a #bgenie#k that's headed to #bOrbis Station#k, on the continent of Ossyria, #bleaving every 10 minutes on the hour#k.");
    yield ctx.sayBoth("If you're going to Orbis, talk to that old man on the right, #bAsesson#k. He has a hard time hearing, so you may want to yell at him to get his attention.");
    yield ctx.sayBoth("Oh, and in case you're not aware of this, somewhere in the desert, a mysterious-looking man called Karcasa sends people to Victoria Island for a fee. I hope you understand that it's against the law to fly these innocent people to other towns without permit!!");
    yield ctx.sayPrev("The Camel Cab, however, is permitted by the king so you can use that. Well, that cab will only take you up to Magatia, but it's still legal.");
  }
}

export function* get_ticket(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Cherry (1032008) / Rini (2012001) / Sunny (2012013) / Ramini (2012021) / Geras (2012025) / Tian (2041000) / Tommie (2082001) / Asesson (2102000)
  let eventType: EventType;
  let moveType: string;
  let waitingField: number;
  switch (ctx.getFieldId()) {
    case 200000111: // Orbis : Station <Victoria Bound>
      eventType = EventType.CM_VICTORIA;
      moveType = 'ship';
      waitingField = 200000112; // Orbis : Pre-Departure <Victoria Bound>
      break;
    case 104020110: // Port Road : Station to Orbis
      eventType = EventType.CM_VICTORIA;
      moveType = 'ship';
      waitingField = 104020111; // Port Road : To Orbis <Before Starting>
      break;
    case 200000121: // Orbis : Station <Ludibrium>
      eventType = EventType.CM_LUDIBRIUM;
      moveType = 'ship';
      waitingField = 200000122; // Orbis : Before the Departure <Ludibrium>
      break;
    case 220000110: // Ludibrium : Station <Orbis>
      eventType = EventType.CM_LUDIBRIUM;
      moveType = 'ship';
      waitingField = 220000111; // Ludibrium : Before the Departure <Orbis>
      break;
    case 200000131: // Orbis : Cabin <To Leafre>
      eventType = EventType.CM_LEAFRE;
      moveType = 'ship';
      waitingField = 200000132; // Orbis : Cabin <To Leafre> (waiting)
      break;
    case 240000110: // Leafre : Station
      eventType = EventType.CM_LEAFRE;
      moveType = 'ship';
      waitingField = 240000111; // Leafre : Before Takeoff <To Orbis>
      break;
    case 200000151: // Orbis : Station <To Ariant>
      eventType = EventType.CM_ARIANT;
      moveType = 'genie';
      waitingField = 200000152; // Orbis : Before Takeoff <To Ariant>
      break;
    case 260000100: // Ariant : Ariant Station Platform
      eventType = EventType.CM_ARIANT;
      moveType = 'genie';
      waitingField = 260000110; // Ariant : Before Takeoff <To Orbis>
      break;
    default:
      console.warn(`[ContiMove] get_ticket: tried to board ship from field ID : ${ctx.getFieldId()}`);
      return;
  }
  const eventState = ctx.getEventState(eventType);
  if (eventState === EventState.CONTIMOVE_BOARDING) {
    if (yield ctx.askYesNo(`This will not be a short flight, so you need to take care of some things, I suggest you do that first before getting on board. Do you still wish to board the ${moveType}?`)) {
      ctx.warp(waitingField);
    } else {
      yield ctx.sayNext('You must have some business to take care of here, right?');
    }
  } else if (eventState === EventState.CONTIMOVE_WAITING) {
    yield ctx.sayNext(`This ${moveType} is getting ready for takeoff. I'm sorry, but you'll have to get on the next ride. The ride schedule is available through the usher at the ticketing booth.`);
  } else {
    yield ctx.sayNext(`We will begin boarding 5 minutes before the takeoff. Please be patient and wait for a few minutes. Be aware that the ${moveType} will take off on time, and we stop receiving tickets 1 minute before that, so please make sure to be here on time.`);
  }
}

export function* goOutWaitingRoom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Purin (1032009) / Erin (2012002) / Pelace (2012022) / Egnet (2012024) / Rosey (2041001) / Harry (2082002) / Slyn (2102001)
  let boardingField: number;
  switch (ctx.getFieldId()) {
    case 200000112: // Orbis : Pre-Departure <Victoria Bound>
      boardingField = 200000111; // Orbis : Station <Victoria Bound>
      break;
    case 104020111: // Port Road : To Orbis <Before Starting>
      boardingField = 104020110; // Port Road : Station to Orbis
      break;
    case 200000122: // Orbis : Before the Departure <Ludibrium>
      boardingField = 200000121; // Orbis : Station <Ludibrium>
      break;
    case 220000111: // Ludibrium : Before the Departure <Orbis>
      boardingField = 220000110; // Ludibrium : Station <Orbis>
      break;
    case 200000132: // Orbis : Cabin <To Leafre>
      boardingField = 200000131; // Orbis : Station <To Leafre>
      break;
    case 240000111: // Leafre : Before Takeoff <To Orbis>
      boardingField = 240000110; // Leafre : Station
      break;
    case 200000152: // Orbis : Station <To Ariant> (waiting)
      boardingField = 200000151; // Orbis : Station <To Ariant>
      break;
    case 260000110: // Ariant : Before Takeoff <To Orbis>
      boardingField = 260000100; // Ariant : Ariant Station Platform
      break;
    default:
      console.warn(`[ContiMove] goOutWaitingRoom: tried to leave ship from field ID : ${ctx.getFieldId()}`);
      return;
  }
  if (yield ctx.askYesNo("We're just about to take off. Are you sure you want to get off the ship? You may do so, but then you'll have to wait until the next available flight. Do you still wish to get off board?")) {
    ctx.warp(boardingField, 'sp');
  } else {
    yield ctx.sayOk("You'll get to your destination in a short while. Talk to other passengers and share your stories to them, and you'll be there before you know it.");
  }
}

export function* sBoxItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // sBoxItem0 (9102000) - During the Ride : Cabin <To Orbis> (200090011)
  ctx.dropRewards([
    Reward.money(15, 15, 0.7),
    Reward.item(2000000, 1, 1, 0.1), // Red Potion
    Reward.item(2000001, 1, 1, 0.1), // Orange Potion
    Reward.item(2000002, 1, 1, 0.1), // White Potion
    Reward.item(2000002, 1, 1, 0.1), // Blue Potion
    Reward.item(2010000, 1, 1, 0.1), // Apple
    Reward.item(2010003, 1, 1, 0.1), // Orange
    Reward.item(2010004, 1, 1, 0.1), // Lemon
    Reward.item(4031158, 1, 1, 0.8, 2074), // Maple History Book II
  ]);
}

// ---- CRANE SCRIPTS --------------------------------------------------------

export function* crane(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Crane : Public Transportation (2090005)
  if (ctx.getFieldId() === 200000141) {
    // Orbis : Cabin <To Mu Lung>
    const answer = yield ctx.askMenu("Hello there. How's the traveling so far? I've been transporting other travelers like you to other regions in no time, and... are you interested? If so, then select the town you'd like to head to.", new Map([
      [0, 'Mu Lung (1500 mesos)'],
    ]));
    if (answer === 0) {
      if (ctx.addMoney(-1500)) {
        // During the Ride : To Mu Lung -> Mu Lung : Mu Lung Temple
        ctx.warpInstance([200090300], 'sp', 250000100, 60);
      } else {
        yield ctx.sayNext('Are you sure you have enough mesos?');
      }
    }
  } else if (ctx.getFieldId() === 250000100) {
    // Mu Lung : Mu Lung Temple
    const answer = yield ctx.askMenu("Hello there. How's the traveling so far? I understand that walking on two legs is much harder to cover ground compared to someone like me that can navigate the skies. I've been transporting other travelers like you to other regions in no time, and... are you interested? If so, then select the town you'd like to head to.", new Map([
      [0, 'Orbis (1500 mesos)'],
      [1, 'Herb Town (500 mesos)'],
    ]));
    if (answer === 0) {
      if (yield ctx.askYesNo("Do you want to fly to #bOrbis#k right now? As long as you don't act silly while in the air, you should reach your destination in no time. It'll only cost you #b1500 mesos#k.")) {
        if (ctx.addMoney(-1500)) {
          // During the Ride : To Orbis -> Orbis : Cabin <To Mu Lung>
          ctx.warpInstance([200090310], 'sp', 200000141, 60);
        } else {
          yield ctx.sayNext('Are you sure you have enough mesos?');
        }
      } else {
        yield ctx.sayOk('OK. if you ever change your mind, please let me know.');
      }
    } else if (answer === 1) {
      if (yield ctx.askYesNo("Do you want to fly to #bHerb Town#k right now? As long as you don't act silly while in the air, you should reach your destination in no time. It'll only cost you #b500 mesos#k.")) {
        if (ctx.addMoney(-500)) {
          ctx.warp(251000000); // Herb Town : Herb Town
        } else {
          yield ctx.sayNext('Are you sure you have enough mesos?');
        }
      } else {
        yield ctx.sayOk('OK. if you ever change your mind, please let me know.');
      }
    }
  } else if (ctx.getFieldId() === 251000000) {
    // Herb Town : Herb Town
    if (yield ctx.askYesNo("Hello there. How's the traveling so far? I've been transporting other travelers like you to #bMu Lung#k in no time, and... are you interested? It's not as stable as the ship, so you'll have to hold on tight, but i can get there much faster than the ship. I'll take you there as long as you pay #b500 mesos#k.")) {
      if (ctx.addMoney(-500)) {
        ctx.warp(250000100); // Mu Lung : Mu Lung Temple
      } else {
        yield ctx.sayNext('Are you sure you have enough mesos?');
      }
    } else {
      yield ctx.sayOk('OK. if you ever change your mind, please let me know.');
    }
  }
}

export function* crane_MR(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* crane_SS(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

// ---- EREVE SCRIPTS ---------------------------------------------------------

export function* contimoveOrbEre(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kiru : Station Guide (1100008) - Orbis : Station (200000161)
  if (yield ctx.askYesNo("This ship will head towards #eEreve#n, an island where you'll find crimson leaves soaking up the sun, the gentle breeze that glides past the stream, and the Empress of Maple Cygnus. If you're interested in joining the Cygnus Knights, then you should definitely pay a visit here. Are you interested in visiting Ereve?\r\n\r\n The Trip will cost you #e1000#n Mesos")) {
    if (ctx.addMoney(-1000)) {
      // Empress' Road : To Ereve -> Empress' Road : Sky Ferry
      ctx.warpInstance([200090020], 'sp', 130000210, 120);
    } else {
      yield ctx.sayNext("Hmm... Are you sure you have #b1000#k Mesos? Check your Inventory and make sure you have enough. You must pay the fee or I can't let you get on...");
    }
  } else {
    yield ctx.sayNext("If you're not interested, then oh well...");
  }
}

export function* contimoveEreOrb(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kiru : Station Guide (1100004) - Empress' Road : Sky Ferry (130000210)
  yield ctx.sayNext("Hmm... The winds are favorable. Are you thinking of leaving #eEreve#n and going somewhere else? This ferry sails to Orbis on the Ossyria Continent.");
  if (yield ctx.askYesNo("Have you taken care of everything you needed to in #eEreve#n? If you happen to be headed towards #b#eOrbis#n#k I can take you there. What do you say? Are you going to go to #eOrbis#n?\r\n\r\nYou'll have to pay a fee of #b1000#k Mesos.")) {
    if (ctx.addMoney(-1000)) {
      // Empress' Road : To Orbis -> Orbis : Station
      ctx.warpInstance([200090021], 'sp', 200000161, 120);
    } else {
      yield ctx.sayNext("Hmm... Are you sure you have #b1000#k Mesos? Check your Inventory and make sure you have enough. You must pay the fee or I can't let you get on...");
    }
  } else {
    yield ctx.sayNext("If you're not interested, then oh well...");
  }
}

export function* contimoveEliEre(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kiriru : Station Guide (1100007) - Port Road : Station to Ereve (104020120)
  if (yield ctx.askYesNo("Eh... So... Um... Are you trying to leave Victoria to go to a different region? You can take this boat to #eEreve#n. There, you will see bright sunlight shining on the leaves and feel a gentle breeze on your skin. It's where Shinsoo and Empress Cygnus are. Would you like to go to Ereve?\r\n\r\nIt will take about #e2 minutes#n and it will cost you #e1000#n Mesos.")) {
    if (ctx.addMoney(-1000)) {
      // Empress' Road : To Ereve -> Empress' Road : Sky Ferry
      ctx.warpInstance([200090030], 'sp', 130000210, 120);
    } else {
      yield ctx.sayNext("Hmm... Are you sure you have #b1000#k Mesos? Check your Inventory and make sure you have enough. You must pay the fee or I can't let you get on...");
    }
  } else {
    yield ctx.sayNext("If you're not interested, then oh well...");
  }
}

export function* contimoveEreEli(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kiriru : Station Guide (1100003) - Empress' Road : Sky Ferry (130000210)
  if (yield ctx.askYesNo("Eh, Hello...again. Do you want to leave Ereve and go somewhere else? If so, you've come to the right place. I operate a ferry that goes from Ereve to Victoria Island, I can take you to #eVictoria Island#n if you want... You'll have to pay a fee of #e1000#n Mesos.")) {
    if (ctx.addMoney(-1000)) {
      // Empress' Road : Victoria Bound -> Port Road : Station to Ereve
      ctx.warpInstance([200090031], 'sp', 104020120, 120);
    } else {
      yield ctx.sayNext("Hmm... Are you sure you have #b1000#k Mesos? Check your Inventory and make sure you have enough. You must pay the fee or I can't let you get on...");
    }
  } else {
    yield ctx.sayNext("If you're not interested, then oh well...");
  }
}

export function* talkOrv(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* talkVic(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_OrbEre(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_EreOrb(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_EliEre(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_EreEli(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

// ---- RIEN SCRIPTS -----------------------------------------------------------

export function* contimoveRieRit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Puro : To Victoria Island (1200003) - Snow Island : Penguin Port (140020300)
  if (!(yield ctx.askYesNo("Are you thinking about leaving Rien and heading back? If you board this ship, I can take you from #bLith Harbor#k to #bRien#k and back. Would you like to go to #bVinctoria Island#k?\r\n\r\nThe trip costs #b1000 Mesos#k"))) {
    yield ctx.sayNext("If you're not interested, then oh well...");
    return;
  }
  if (!ctx.addMoney(-1000)) {
    yield ctx.sayNext("Hmm... Are you sure you have #b1000#k Mesos? Check your Inventory and make sure you have enough. You must pay the fee or I can't let you get on...");
    return;
  }
  ctx.warpInstance([200090070], 'sp', 104000000, 120);
}

export function* contimoveRitRie(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Puro : To Rien (1200004) - Lith Harbor : Lith Harbor (104000000)
  if (!(yield ctx.askYesNo("Are you thinking about leaving Victoria Island and heading to our town? If you board this ship, I can take you from #bLith Harbor#k to #bRien#k and back. Would you like to go to #bRien#k?\r\n\r\nThe trip costs #b1000 Mesos#k"))) {
    yield ctx.sayNext("If you're not interested, then oh well...");
    return;
  }
  if (!ctx.addMoney(-1000)) {
    yield ctx.sayNext("Hmm... Are you sure you have #b1000#k Mesos? Check your Inventory and make sure you have enough. You must pay the fee or I can't let you get on...");
    return;
  }
  ctx.warpInstance([200090060], 'sp', 140020300, 120);
}

export function* move_RieRit(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_RitRie(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

// ---- EDELSTEIN SCRIPTS --------------------------------------------------------

export function* contimoveEdeGo(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ace : Pilot (2150008) - Edelstein : Edelstein Temporary Airport (310000010)
  const answer = yield ctx.askMenu('Would you like to leave Edelstein and travel to a different continent? I can take you to Victoria Island and the Orbis area of Ossyria. The cost is 800 Mesos. Where would you like to go?', new Map([
    [0, 'Victoria Island'],
    [1, 'Orbis'],
  ]));
  if (answer === 0) {
    if (ctx.addMoney(-800)) {
      // On Voyage : Victoria Island Bound -> Port Road : Station to Edelstein
      ctx.warpInstance([200090710], 'sp', 104020130, 300);
    } else {
      yield ctx.sayNext('Are you sure you have enough mesos?');
    }
  } else if (answer === 1) {
    if (ctx.addMoney(-800)) {
      // On Voyage : Orbis Bound -> Orbis : Station <Edelstein Bound>
      ctx.warpInstance([200090610], 'sp', 200000170, 180);
    } else {
      yield ctx.sayNext('Are you sure you have enough mesos?');
    }
  }
}

export function* contimoveEliEde(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ace : Pilot (2150010) - Port Road : Station to Edelstein (104020130)
  if (yield ctx.askYesNo('Do you want to go to Edelstein? The fee is 800 Mesos. Hop on if you want to go.')) {
    if (ctx.addMoney(-800)) {
      // On Voyage : Edelstein Bound -> Edelstein : Edelstein Temporary Airport
      ctx.warpInstance([200090700], 'sp', 310000010, 300);
    } else {
      yield ctx.sayNext('Are you sure you have enough mesos?');
    }
  }
}

export function* contimoveOrbEde(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ace : Pilot (2150009) - Orbis : Station <Edelstein Bound> (200000170)
  if (yield ctx.askYesNo('Do you want to go to Edelstein? The fee is 800 Mesos. Hop on if you want to go.')) {
    if (ctx.addMoney(-800)) {
      // On Voyage : Edelstein Bound -> Edelstein : Edelstein Temporary Airport
      ctx.warpInstance([200090600], 'sp', 310000010, 180);
    } else {
      yield ctx.sayNext('Are you sure you have enough mesos?');
    }
  }
}

export function* move_EdeEli(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_EdeOrb(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_EliEde(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* move_OrbEde(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

// ---- OTHER SCRIPTS ----------------------------------------------------------

export function* elevator(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ludibrium : Helios Tower <2nd Floor> (222020100) / <99th Floor> (222020200)
  if (ctx.getFieldId() === 222020100) {
    // Ludibrium : Helios Tower <2nd Floor>
    if (ctx.getEventState(EventType.CM_ELEVATOR) === EventState.ELEVATOR_2ND_FLOOR) {
      ctx.playPortalSE();
      ctx.warp(222020110, 'out00'); // Ludibrium : Elevator <To Ludibrium>
    } else {
      ctx.message('At the moment, the elevator is not available for this route. Please try again later.');
    }
  } else if (ctx.getFieldId() === 222020200) {
    // Ludibrium : Helios Tower <99th Floor>
    if (ctx.getEventState(EventType.CM_ELEVATOR) === EventState.ELEVATOR_99TH_FLOOR) {
      ctx.playPortalSE();
      ctx.warp(222020210, 'out00'); // Ludibrium : Elevator <To Korean Folk Town>
    }
  }
}

export function* nihal_taxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Camel Cab (2110005)
  if (ctx.getFieldId() === 260020000) {
    // The Burning Sands : Outside North Entrance of Ariant
    if (yield ctx.askYesNo('Would you like to take the #b#p2110005##k to #b#m261000000##k, the town of Alchemy? The fare is #b1500 mesos#k.')) {
      if (ctx.addMoney(-1500)) {
        ctx.warp(261000000); // Sunset Road : Magatia
      } else {
        yield ctx.sayNext('I am sorry, but I think you are short on mesos. I am afraid I can\'t let you ride this if you do not have enough money to do so. Please come back when you have enough money to use this.');
      }
    } else {
      yield ctx.sayNext('Hmmm... too busy to do it right now? If you feel like doing it, though, come back and find me.');
    }
  } else if (ctx.getFieldId() === 260020700) {
    // Sunset Road : Sahel 1
    if (yield ctx.askYesNo('Would you like to take the #b#p2110005##k to #b#m260000000##k, the town of Burning Roads? The fare is #b1500 mesos#k.')) {
      if (ctx.addMoney(-1500)) {
        ctx.warp(260000000); // The Burning Road : Ariant
      } else {
        yield ctx.sayNext('I am sorry, but I think you are short on mesos. I am afraid I can\'t let you ride this if you do not have enough money to do so. Please come back when you have enough money to use this.');
      }
    } else {
      yield ctx.sayNext('Hmmm... too busy to do it right now? If you feel like doing it, though, come back and find me.');
    }
  }
}

export function* karakasa(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Karcasa (2101013) - The Burning Sands : Tent of the Entertainers (260010600)
  const towns = [
    100000000, // Henesys : Henesys
    101000000, // Ellinia : Ellinia
    102000000, // Perion : Perion
    103000000, // Kerning City : Kerning City
  ];
  if (!(yield ctx.askAccept("I don't know how you found out about this, but you came to the right place! For those who wandered around Nihal Desert and are getting homesick, I am offering a flight straight to Victoria Island, non-stop. Don't worry about the flying ship - it's only fallen once or twice! Don't you feel claustrophobic being in a long flight on that small ship? What do you think? Are you willing to take the offer on this direct flight?"))) {
    yield ctx.sayNext("Aye...are you scared of speed or heights? You can't trust my flying skills? Trust me, I've worked out all the kinks!");
    return;
  }
  if (!(yield ctx.askAccept("Please remember two things. One, this line is actually for overseas shipping, so #rI cannot guarantee which town you'll land#k. Two, since I am putting you in this special flight, it'll be a bit expensive. The service charge is #b#e10,000 mesos#n#k. There's a flight that's about to take off. Are you interested?"))) {
    yield ctx.sayNext("Aye...are you scared of speed or heights? You can't trust my flying skills? Trust me, I've worked out all the kinks!");
    return;
  }
  yield ctx.sayNext('Okay, ready for takeoff!');
  if (ctx.addMoney(-10000)) {
    const town = Util.getRandomFromCollection(towns);
    if (town !== undefined) ctx.warp(town);
  } else {
    yield ctx.sayNext("Hey, are you short on cash? I told you you'll need #b10,000 mesos#k to get on this.");
  }
}

export function* enter_earth00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nautilus : Navigation Room (120000101) - earth01 (570, -120)
  if (ctx.removeItem(4031890, 1)) {
    ctx.playPortalSE();
    ctx.warp(221000300, 'earth00'); // Omega Sector : Command Center
  } else {
    ctx.message('You need a warp card to activate this portal.');
  }
}

export function* enter_earth01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Omega Sector : Command Center (221000300) - earth00 (218, 0)
  if (ctx.removeItem(4031890, 1)) {
    ctx.playPortalSE();
    ctx.warp(120000101, 'earth01'); // Nautilus : Navigation Room
  } else {
    ctx.message('You need a warp card to activate this portal.');
  }
}

export function* rankRoom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Rank-up portals across multiple job halls
  switch (ctx.getFieldId()) {
    case 100000201: // Henesys : Bowman Instructional School
      ctx.playPortalSE();
      ctx.warp(100000204, 'out00'); // Henesys : Hall of Bowmen
      break;
    case 101000003: // Ellinia : Magic Library
      ctx.playPortalSE();
      ctx.warp(101000004, 'out00'); // Ellinia : Hall of Magicians
      break;
    case 102000003: // Perion : Warriors' Sanctuary
      ctx.playPortalSE();
      ctx.warp(102000004, 'out00'); // Perion : Hall of Warriors
      break;
    case 103000003: // Kerning City : Thieves' Hideout
      ctx.playPortalSE();
      ctx.warp(103000008, 'out00'); // Kerning City : Hall of Thieves
      break;
    case 120000101: // Nautilus : Navigation Room
      ctx.playPortalSE();
      ctx.warp(120000105, 'out00'); // Nautilus : Training Room
      break;
    case 130000000: // Empress' Road : Ereve
      ctx.playPortalSE();
      ctx.warp(130000100, 'east00'); // Empress' Road : Knights Chamber
      break;
    case 130000200: // Empress' Road : Crossroads of Ereve
      ctx.playPortalSE();
      ctx.warp(130000100, 'west00'); // Empress' Road : Knights Chamber
      break;
    case 140010100: // Snow Island : Dangerous Forest
      ctx.playPortalSE();
      ctx.warp(140010110, 'out00'); // Snow Island : Palace of the Master
      break;
  }
}
