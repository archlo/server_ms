import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { EventType } from '../../../server/event/EventType';
import { EventState } from '../../../server/event/EventState';
import { MobAppearType } from '../../field/mob/MobAppearType';

const TICKET_TO_SINGAPORE = 4031731;
const TICKET_TO_KERNING_CITY = 4031732;

const KERNING_AIRPORT = 540010100; // Airport.KERNING_AIRPORT
const BEFORE_DEPARTURE_TO_KERNING_CITY = 540010001; // Airport.BEFORE_DEPARTURE_TO_KERNING_CITY

export function* world_trip(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Spinel : World Tour Guide (9000020)
  //   Henesys / Ellinia / Perion / Kerning City / Lith Harbor / Orbis / Ludibrium / Leafre / Mu Lung
  //   The Burning Road : Ariant / Singapore : Boat Quay Town / Amoria : Amoria
  //   Zipangu : Mushroom Shrine / Hidden Street : Travel's End / Hidden Street : Spinel's Forest
  const towns = [
    100000000, // Henesys : Henesys
    101000000, // Ellinia : Ellinia
    102000000, // Perion : Perion
    103000000, // Kerning City : Kerning City
    104000000, // Lith Harbor : Lith Harbor
    200000000, // Orbis : Orbis
    220000000, // Ludibrium : Ludibrium
    240000000, // Leafre : Leafre
    250000000, // Mu Lung : Mu Lung
    260000000, // The Burning Road : Ariant
    541000000, // Singapore : Boat Quay Town
    680000000, // Amoria : Amoria
  ];
  if (towns.includes(ctx.getFieldId())) {
    yield ctx.sayNext("If you're tired of the monotony of daily life, it might be time for change, and the #bMaple Travel Agency#k is here to give your life a new sense of adventure! For a low, low free, we can offer you a #bWorld Tour#k that will make your dreariest days sparkle!");
    const answer: number = yield ctx.askMenu('We\'re currently servicing multiple destinations for your traveling pleasure, though our list of service areas is always expanding. Just pick your destination below, and I\'ll be there to serve you as your travel guide.', new Map([
      [0, 'Mushroom Shrine of Japan (3,000 mesos)'],
      [1, 'Malaysian Metropolis (300,000 mesos)'],
    ]));
    if (answer === 0) {
      yield ctx.sayNext('Would you like to travel to #bMushrom Shrine of Japan#k? If you desire to feel the essence of Japan, there\'s nothing like visiting the Shrine, a Japanese cultural melting pot. Mushroom Shrine is a mythical place that serves the incomparable Mushroom God from ancient times.');
      yield ctx.sayNext('Check out the female shaman serving the Mushroom God, and I strongly recommend trying Takoyaki, Yakisoba, and other delocious food sold in the streets of Japan. Now, let\'s head over to #bMushroom Shrine#k, a mythical place if there ever was one.');
      if (ctx.addMoney(-3000)) {
        ctx.warp(800000000, 'st00'); // Zipangu : Mushroom Shrine
        ctx.setQRValue(8792, String(ctx.getFieldId())); // QuestRecordType.WorldTour
      } else {
        yield ctx.sayOk("I'm afraid you don't have enough meso.");
      }
    } else if (answer === 1) {
      if (yield ctx.askYesNo('You can return to Victoria Island through the Changi Airport in CBD. Would you like to go now? It will cost 300,000 mesos.')) {
        if (ctx.addMoney(-300000)) {
          ctx.warp(550000000); // Malaysia : Trend Zone Metropolis
        } else {
          yield ctx.sayOk("I'm afraid you don't have enough meso.");
        }
      } else {
        yield ctx.sayOk('OK. if you ever change your mind, please let me know.');
      }
    }
  } else if (ctx.getFieldId() === 800000000) {
    // Zipangu : Mushroom Shrine
    let returnMapId = 100000000; // Henesys : Henesys
    const returnMap = ctx.getQRValue(8792); // QuestRecordType.WorldTour
    if (returnMap && /^-?\d+$/.test(returnMap) && towns.includes(parseInt(returnMap, 10))) {
      returnMapId = parseInt(returnMap, 10);
    }
    const answer: number = yield ctx.askMenu("How's the traveling? Are you enjoying it?", new Map([
      [0, `Yes, I'm done with travelling. Can I go back to #e#m${returnMapId}##n?`],
      [1, "No, I'd like to continue exploring this place."],
    ]));
    if (answer === 0) {
      yield ctx.sayNext("Alright. I'll take you back to where you were before the visit to Japan. If you ever feel like traveling again down the road, please let me know!");
      ctx.warp(returnMapId);
      ctx.setQRValue(8792, ''); // QuestRecordType.WorldTour
    } else {
      yield ctx.sayOk('OK. if you ever change your mind, please let me know.');
    }
  }
}

// ZIPANGU SCRIPTS -------------------------------------------------------------------------------------------------

export function* in_bath(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hikari (9120003) - Zipangu : Showa Town (801000000)
  if (!(yield ctx.askYesNo('Would you like to enter the bathhouse? That\'ll be 300 mesos for you.'))) {
    return;
  }
  if (ctx.addMoney(-300)) {
    ctx.warp(801000100 + (100 * ctx.getGender()), 'out00');
  } else {
    yield ctx.sayOk('Please check and see if you have 300 mesos to enter this place');
  }
}

export function* goNinja(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Palanquin (9110107) - Zipangu : Mushroom Shrine (800000000) / Outside Ninja Castle (800040000)
  if (ctx.getFieldId() === 800000000) {
    // Zipangu : Mushroom Shrine
    yield ctx.sayNext('We are... the palanquin... bearers! Need to... get to... Ninja Castle? Talk to us! Talk to us!');
    if (yield ctx.askYesNo('Huh, what? You want to go to Ninja Castle?')) {
      yield ctx.sayNext("Got it! We are... the palanquin.... bearers! We'll get you there faster than you can blink. And since we're in such a jolly mood, you don't even have to pay us!");
      ctx.warp(800040000); // Zipangu : Outside Ninja Castle
    }
  } else if (ctx.getFieldId() === 800040000) {
    // Zipangu : Outside Ninja Castle
    yield ctx.sayNext('We are... the palanquin... bearers! Need to... get to... Ninja Castle? Talk to us! Talk to us!');
    if (yield ctx.askYesNo('Huh, what? You want to go to Mushroom Shrine?')) {
      yield ctx.sayNext("Got it! We are... the palanquin.... bearers! We'll get you there faster than you can blink. And since we're in such a jolly mood, you don't even have to pay us!");
      ctx.warp(800000000); // Zipangu : Mushroom Shrine
    }
  }
}

// SINGAPORE SCRIPTS -----------------------------------------------------------------------------------------------

export function* sellticket_sg(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Irene : Ticketing Usher (9270041) - Kerning City : Kerning City (103000000)
  const answer: number = yield ctx.askMenu('Hello there~ I am Irene from Singapore Airport. I was transferred to Kerning City to celebrate the new opening of our service! How can I help you?', new Map([
    [0, 'I would like to buy a plane ticket to Singapore'],
    [1, 'Let me go in to the departure point'],
  ]));
  if (answer === 0) {
    if (yield ctx.askYesNo('The ticket will cost you 5,000 mesos. Will you purchase the ticket?')) {
      if (ctx.canAddItem(TICKET_TO_SINGAPORE, 1)) {
        if (ctx.addMoney(-5000)) {
          ctx.addItem(TICKET_TO_SINGAPORE, 1);
          yield ctx.sayOk('Thank you for choosing Wizet Airline! Enjoy your flight!');
        } else {
          yield ctx.sayOk("You don't have enough mesos.");
        }
      } else {
        yield ctx.sayOk('Please check if your inventory is full or not.');
      }
    }
  } else if (answer === 1) {
    if (yield ctx.askYesNo('Would you like to go in now? You will lose your ticket once you go in~ Thank you for choosing Wizet Airline.')) {
      if (ctx.hasItem(TICKET_TO_SINGAPORE)) {
        if (ctx.getEventState(EventType.CM_AIRPORT) === EventState.AIRPORT_BOARDING) {
          ctx.removeItem(TICKET_TO_SINGAPORE, 1);
          ctx.warp(KERNING_AIRPORT, 'sp'); // Victoria Island : Kerning Airport
        } else {
          yield ctx.sayOk('Sorry, the plane has already taken off. Please wait a few minutes.');
        }
      } else {
        yield ctx.sayOk(`You need a #b#t${TICKET_TO_SINGAPORE}##k to get on the plane!`);
      }
    }
  }
}

export function* sellticket_cbd(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Shalon : Ticketing Usher (9270038) - Singapore : Changi Airport (540010000)
  const answer: number = yield ctx.askMenu('Hello there~ I am Shalon from Singapore Airport. How can I help you?', new Map([
    [0, 'I would like to buy a plane ticket to Kerning City'],
    [1, 'Let me go in to the departure point'],
  ]));
  if (answer === 0) {
    if (yield ctx.askYesNo('The ticket will cost you 5,000 mesos. Will you purchase the ticket?')) {
      if (ctx.canAddItem(TICKET_TO_KERNING_CITY, 1)) {
        if (ctx.addMoney(-5000)) {
          ctx.addItem(TICKET_TO_KERNING_CITY, 1);
          yield ctx.sayOk('Thank you for choosing Wizet Airline! Enjoy your flight!');
        } else {
          yield ctx.sayOk("You don't have enough mesos.");
        }
      } else {
        yield ctx.sayOk('Please check if your inventory is full or not.');
      }
    }
  } else if (answer === 1) {
    if (yield ctx.askYesNo('Would you like to go in now? You will lose your ticket once you go in~ Thank you for choosing Wizet Airline.')) {
      if (ctx.hasItem(TICKET_TO_KERNING_CITY)) {
        if (ctx.getEventState(EventType.CM_AIRPORT) === EventState.AIRPORT_BOARDING) {
          ctx.removeItem(TICKET_TO_KERNING_CITY, 1);
          ctx.warp(BEFORE_DEPARTURE_TO_KERNING_CITY, 'sp'); // Singapore : Before Departure (To Kerning City)
        } else {
          yield ctx.sayOk('Sorry, the plane has already taken off. Please wait a few minutes.');
        }
      } else {
        yield ctx.sayOk(`You need a #b#t${TICKET_TO_KERNING_CITY}##k to get on the plane!`);
      }
    }
  }
}

export function* goback_kerning(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Xinga : Pilot (9270017) - Victoria Island : Kerning Airport (540010100)
  if (ctx.getFieldId() === 540010100) {
    // Victoria Island : Kerning Airport
    if (yield ctx.askYesNo('The plane will be taking off soon, will you leave now? You will have to buy the plane ticket again to come in here.')) {
      yield ctx.sayNext('The ticket is not refundable, hope to see you again!');
      ctx.warp(103000000); // Kerning City : Kerning City
    }
  }
}

export function* goback_cbd(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kerny : Pilot (9270018) - Singapore : Before Departure (To Kerning City) (540010001)
  //   / On the way to Kerning City (540010002) / Victoria Island : On the way to CBD (540010101)
  if (ctx.getFieldId() === 540010001) {
    // Singapore : Before Departure (To Kerning City)
    if (yield ctx.askYesNo('The plane will be taking off soon, will you leave now? You will have to buy the plane ticket again to come in here.')) {
      yield ctx.sayNext('The ticket is not refundable, hope to see you again!');
      ctx.warp(540010000); //  Singapore : Changi Airport
    }
  }
}

export function* Malay_Warp2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Audrey : Malaysia Tour Guide (9201135)
  //   Singapore : CBD (540000000) / Malaysia : Trend Zone Metropolis (550000000) / Kampung Village (551000000)
  const handleWarp = function* (locations: [number, number][]): Generator<ScriptMessage, void, any> {
    const options = new Map<number, string>();
    locations.forEach(([mapId, price], i) => options.set(i, `#m${mapId}# (${price.toLocaleString()} mesos)`));
    const answer: number = yield ctx.askMenu('Where would you like to travel?', options);
    if (answer >= 0 && answer < locations.length) {
      const [mapId, price] = locations[answer];
      if (yield ctx.askYesNo(`Would you like to travel to #b#m${mapId}##? To head over to #m${mapId}#, it'll cost you #b${price.toLocaleString()} mesos#k=. Would you like to go right now?`)) {
        if (ctx.addMoney(-price)) {
          ctx.warp(mapId);
        } else {
          yield ctx.sayNext('You do not seem to have enough mesos.');
        }
      } else {
        yield ctx.sayNext('You know where to come if you need a ride!');
      }
    }
  };
  if (ctx.getFieldId() === 540000000) {
    // Singapore : CBD
    yield* handleWarp([
      [550000000, 1000], // Malaysia : Trend Zone Metropolis
      [551000000, 10000], // Malaysia : Kampung Village
    ]);
  } else if (ctx.getFieldId() === 550000000) {
    // Malaysia : Trend Zone Metropolis
    yield* handleWarp([
      [540000000, 1000], // Singapore : CBD
      [551000000, 10000], // Malaysia : Kampung Village
    ]);
  } else if (ctx.getFieldId() === 551000000) {
    // Malaysia : Kampung Village
    yield* handleWarp([
      [540000000, 10000], // Singapore : CBD
      [550000000, 10000], // Malaysia : Trend Zone Metropolis
    ]);
  }
}

// Ported from kinoko's WorldTour.treeboss00 (Krexel boss portal). Party system
// landed in Batch 9, so the party-wide requirement check (when the user is in a
// party) and partyWarpInstance entry are now in place. The entry requirement
// itself is: Lv. 70+, holding a Soul Lantern (4000385), and quest 4530 started
// or completed ("Savior of Ulu City").
export function* treeboss00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Singapore : Ruins of Krexel I (541020700) - boss00 (81, -1751)
  const SOUL_LANTERN = 4000385;
  const SAVIOR_OF_ULU_CITY = 4530;
  const meetsRequirement = (u: { getLevel(): number; getInventoryManager(): { hasItem(itemId: number, quantity?: number): boolean }; getQuestManager(): { hasQuestStarted(questId: number): boolean; hasQuestCompleted(questId: number): boolean } }): boolean => {
    if (u.getLevel() < 70) return false;
    if (!u.getInventoryManager().hasItem(SOUL_LANTERN, 1)) return false;
    const qm = u.getQuestManager();
    return qm.hasQuestStarted(SAVIOR_OF_ULU_CITY) || qm.hasQuestCompleted(SAVIOR_OF_ULU_CITY);
  };
  const user = ctx.getUser();
  if (user.hasParty()) {
    if (!user.isPartyBoss()) {
      ctx.message('You are not the leader of the party.');
      return;
    }
    const members = ctx.field.getUserPool().getPartyMembers(user.getPartyId());
    if (!members.every(meetsRequirement)) {
      ctx.message('One or more members of your party do not meet the requirements to enter.');
      return;
    }
  } else if (!meetsRequirement(user)) {
    ctx.message('You do not meet the requirements to enter.');
    return;
  }
  ctx.partyWarpInstance([541020800], 'sp', 541020700, 60 * 30);
}

export function* treeboss01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Commando Jim (9270045) - Singapore : Ruins of Krexel II (541020800)
  if (yield ctx.askYesNo('Are you sure you want to leave The Ruin of Krexel II? I can take you to the safer place...')) {
    ctx.warp(541020700);
  }
}

export function* treeBossSG(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // treeBossSG (5411001) - Singapore : Ruins of Krexel II (541020800)
  const src = ctx.getSource();
  if (!src) return;
  ctx.field.broadcastChangeBgm('Bgm00/GoPicnic');
  ctx.spawnMob(9420520, src.x, src.y, MobAppearType.REGEN, src.flip);
}
