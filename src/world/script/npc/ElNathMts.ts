import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';

export function* getAboard(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Isa the Station Guide : Platform Usher (2012006) - Orbis : Orbis Station Entrance (200000100)
  const platforms: [number, string][] = [
    [200000111, 'Platform to Board a Ship to Victoria Island'],
    [200000121, 'Platform to Board a Ship to Ludibrium'],
    [200000131, 'Platform to Board a Ship to Leafre'],
    [200000141, 'Platform to Ride a Crane to Mu Lung'],
    [200000151, 'Platform to Ride a Genie to Ariant'],
    [200000161, 'Platform to Board a Ship to Ereve'],
    [200000170, 'Platform to Board a Ship to Edelstein'],
  ];
  const options = new Map<number, string>();
  platforms.forEach(([, label], i) => options.set(i, label));
  const answer: number = yield ctx.askMenu('There are many Platforms at the Orbis Station. You must find the correct Platform for your destination. Which Platform would you like to go to?', options);
  if (answer >= 0 && answer < platforms.length) {
    const [mapId, platform] = platforms[answer];
    if (yield ctx.askYesNo(`Even if you took the wrong passage you can get back here using the portal, so no worries. Will you move to the #b${platform}#k?`)) {
      ctx.warp(mapId, 'west00');
    }
  }
}

export function* station_in(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Orbis : Orbis Station Entrance (200000100) - east00 (1219, 86)
  yield* getAboard(ctx);
}

export function* oBoxItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // oBoxItem0 (2002000) - Orbis : Orbis / Orbis Park
  ctx.dropRewards([
    Reward.money(20, 20, 0.7),
    Reward.item(2000000, 1, 1, 0.1), // Red Potion
    Reward.item(2000001, 1, 1, 0.1), // Orange Potion
    Reward.item(2010000, 1, 1, 0.1), // Apple
    Reward.item(4031198, 1, 1, 0.8, 3043), // Empty Potion Bottle
  ]);
}

// AQUA ROAD SCRIPTS -----------------------------------------------------------------------------------------------

export function* aqua_taxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dolphin (2060009) - Aquarium : Aquarium (230000000) / Herb Town : Pier on the Beach (251000100)
  if (ctx.getFieldId() === 230000000) {
    // Aquarium : Aquarium
    const answer: number = yield ctx.askMenu('Oceans are all connected to each other. Place you can\'t reach by foot can easily reached oversea. How about taking #bDolphin Taxi#k with us today?', new Map([
      [0, 'Go to the Sharp Unknown.'],
      [1, 'Go to Herb Town.'],
      [2, 'Go to the Sea of Fog'],
    ]));
    if (answer === 0) {
      if (yield ctx.askYesNo('There is a fee of 1000 mesos. Would you like to go there now?')) {
        if (ctx.addMoney(-1000)) {
          ctx.warp(230030200); // Aqua Road : The Sharp Unknown
        } else {
          yield ctx.sayNext("I don't think you have enough money...");
        }
      } else {
        yield ctx.sayOk('OK. If you ever change your mind, please let me know.');
      }
    } else if (answer === 1) {
      if (yield ctx.askYesNo('There is a fee of 10000 mesos. Would you like to go there now?')) {
        if (ctx.addMoney(-10000)) {
          ctx.warp(251000100); // Herb Town : Pier on the Beach
        } else {
          yield ctx.sayNext("I don't think you have enough money...");
        }
      } else {
        yield ctx.sayOk('OK. If you ever change your mind, please let me know.');
      }
    } else if (answer === 2) {
      if (yield ctx.askYesNo("Umm... You want to go to the Sea of Fog? I really don't think you should... Well... What I mean is... Do you want to go now?")) {
        ctx.warp(923020000); // Sea of Fog : Shipwrecked Ghost Ship
        ctx.setQRValue(7050, ''); // QuestRecordType.UnityPortal
      } else {
        yield ctx.sayOk('OK. If you ever change your mind, please let me know.');
      }
    }
  } else if (ctx.getFieldId() === 251000100) {
    // Herb Town : Pier on the Beach
    const answer: number = yield ctx.askMenu("Oceans are all connected to each other. Place you can't reach by foot can easily reached oversea. How about taking #bDolphin Taxi#k with us today?", new Map([
      [0, 'Go to Aquarium.'],
    ]));
    if (answer === 0) {
      if (yield ctx.askYesNo('There is a fee of 10000 mesos. Would you like to go there now?')) {
        if (ctx.addMoney(-10000)) {
          ctx.warp(230000000); // Aquarium : Aquarium
        } else {
          yield ctx.sayNext("I don't think you have enough money...");
        }
      } else {
        yield ctx.sayOk('OK. If you ever change your mind, please let me know.');
      }
    }
  }
}

export function* Pianus(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Aqua Road : The Dangerous Cave (230040410) - boss00 (1090, 46)
  ctx.playPortalSE();
  ctx.warp(230040420, 'out00'); // Aqua Road : The Cave of Pianus
}

export function* aquaItem3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // aquaItem3 (2302006) - Aqua Road : Ocean I.C / Crystal Gorge / Red Coral Forest / Turban Shell Hill / Forked Road West/East Sea
  ctx.dropRewards([
    Reward.item(4032476, 1, 1, 0.2, 22407), // Captain Alpha's Buckle
  ]);
}
