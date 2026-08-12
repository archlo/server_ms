import { MobAppearType } from '../../field/mob/MobAppearType';
import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';
import { FieldEffectPacket } from '../../field/FieldEffectPacket';
import * as UnityPortal from './UnityPortal';

const MOON_BUNNY = 9300061;
const MOON_REACTOR = 9101000;
const PRIMROSE_REACTORS = new Set([9108000, 9108001, 9108002, 9108003, 9108004, 9108005]);

const PRIMROSE_SEED = 4001453;
const MOON_BUNNYS_RICE_CAKE = 4001101;
const A_RICE_CAKE_ON_TOP_OF_MY_HEAD = 1002798;

export function* moonrabbit_exit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Moon Bunny Lobby (910010500) - out00 (-420, 267)
  yield* UnityPortal.returnPortal(ctx, 100000200, 'event00'); // Henesys : Henesys Park
}

// Ported from kinoko's HenesysPQ.moonrabbit. Party system landed in Batch 9, so
// the isPartyBoss / checkParty gating and partyWarpInstance entry are now in place.
export function* moonrabbit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Tory (1012112)
  //   Henesys : Henesys Park (100000200)
  //   Hidden Street : Shortcut (910010100)
  //   Hidden Street : Shortcut (910010400)
  //   Hidden Street : Moon Bunny Lobby (910010500)
  if (ctx.getFieldId() === 100000200) {
    // Henesys : Henesys Park
    if (yield ctx.askYesNo('Would you like to move to Moon Bunny Lobby?')) {
      ctx.setQRValue(7050, ''); // QuestRecordType.UnityPortal
      ctx.warp(910010500); // Hidden Street : Moon Bunny Lobby
    }
  } else if (ctx.getFieldId() === 910010500) {
    // Hidden Street : Moon Bunny Lobby
    const answer: number = yield ctx.askMenu("#e<Party Quest: Moon Bunny's Rice Cake>#n\r\nHello, I'm Tory. Have you been to Primrose Hill? It's a beautiful hill where primroses bloom. I hear that a tiger named Growlie over at Primerose Hill is hungry. Won't you go with your party members and help Growlie?", new Map([
      [0, 'Go to Primrose Hill'],
      [1, 'Learn about Primrose Hill'],
    ]));
    if (answer === 0) {
      if (!ctx.getUser().isPartyBoss()) {
        yield ctx.sayOk("If you'd like to enter here, the leader of your party will have to talk to me. Talk to your party leader about this.");
        return;
      }
      if (!ctx.getUser().checkParty(3, 10)) {
        yield ctx.sayOk("You cannot enter because your party doesn't have 3 members. You need 3 party members at Lv. 10 or higher to enter, so double-check and talk to me again.");
        return;
      }
      ctx.removeItem(PRIMROSE_SEED);
      ctx.removeItem(MOON_BUNNYS_RICE_CAKE);
      // Hidden Street : Primrose Hill -> Hidden Street : Back to Town
      ctx.partyWarpInstance([910010000], 'sp', 910010300, 600);
    } else if (answer === 1) {
      yield ctx.sayOk("#e<Party Quest: Moon Bunny's Rice Cake>#n\r\nA mysterious Moon Bunny that only appears in #b#m910010000##k during full moons. #b#p1012112##k of #b#m100000200##k is looking for Maplers to find #r#t4001101##k for #b#p1012114##k. If you want to meet the Moon Bunny, plant Primrose Seeds in the designated locations and summon forth a full moon. Protect the Moon Bunny from wild animals until all #r10 Rice Cakes#k are made.\r\n#e - Level:#n 10 or above #r(Recommended Level: 10 - 20)#k\r\n#e - Time Limit:#n 10 min.\r\n#e - Number of Participants:#n 3 to 6\r\n#e - Items:#n #v1002798# #t1002798#\r\n#b(obtained by giving Tory 10 Rice Cakes.)#k");
    }
  } else {
    // Hidden Street : Shortcut
    const exitAnswer: number = yield ctx.askMenu("I appreciate you giving some rice cakes for the hungry Growlie. It looks like you'll have nothing to do here now. Would you like to leave this place?", new Map([
      [0, 'I want to give you the rest of my rice cakes.'],
      [1, 'Yes, please get me out of here.'],
    ]));
    if (exitAnswer === 0) {
      const giveAnswer: number = yield ctx.askMenu("Oh, my! You brought Moon Bunny's Rice Cakes for me? Well, I've prepared some gifts to show you my appreciation. How many rice cakes do you want to give me?", new Map([
        [0, `#t${MOON_BUNNYS_RICE_CAKE}# x10 - #t${A_RICE_CAKE_ON_TOP_OF_MY_HEAD}#`],
      ]));
      if (giveAnswer === 0) {
        if (!ctx.canAddItem(A_RICE_CAKE_ON_TOP_OF_MY_HEAD, 1)) {
          yield ctx.sayOk('Please check and see if you have enough space in your inventory.');
          return;
        }
        if (!ctx.removeItem(MOON_BUNNYS_RICE_CAKE, 10)) {
          yield ctx.sayOk("Are you sure you have rice cakes with you? Don't you tease me now!");
          return;
        }
        ctx.addItem(A_RICE_CAKE_ON_TOP_OF_MY_HEAD, 1);
        yield ctx.sayNext("Thank you so much. I'm really going to enjoy these.");
      }
    } else if (exitAnswer === 1) {
      ctx.removeItem(PRIMROSE_SEED);
      ctx.removeItem(MOON_BUNNYS_RICE_CAKE);
      ctx.warp(910010500); // Hidden Street : Moon Bunny Lobby
    }
  }
}

// Ported from kinoko's HenesysPQ.moonrabbit_tiger (Growlie). The "clear" instance
// flag and the 10-rice-cake submission logic (with screen/sound effects and
// partyWarp out) are now implemented.
// Note: screen/sound effects are broadcast via field.broadcastPacket(FieldEffectPacket.*).
export function* moonrabbit_tiger(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Growlie (1012114)
  //   Hidden Street : Primrose Hill (910010000)
  //   Hidden Street : Primrose Hill (910010001)
  const user = ctx.getUser();
  if (ctx.getInstanceVariable('clear') === '1') {
    if (user.isPartyBoss()) {
      yield ctx.sayNext("Mmmm... this is delicious. Please come see me next time for more #b#t4001101##k, Have a good trip!");
      ctx.partyWarp(910010100, 'st00'); // Hidden Street : Shortcut
    } else {
      yield ctx.sayOk("Please proceed with the party leader.");
    }
    return;
  }
  const options = new Map<number, string>([
    [0, 'Please tell me what this place is all about.'],
    [2, 'I would like to leave this place.'],
  ]);
  if (user.isPartyBoss()) {
    // Insert the rice-cake submission choice between explanation and leave.
    options.set(1, "I have brought Moon Bunny's Rice Cake.");
  }
  const answer: number = yield ctx.askMenu("Growl! I am Growlie, always ready to protect this place. What brought you here?", options);
  if (answer === 0) {
    yield ctx.sayNext("This place can be best described as the prime spot where you can taste the delicious rice cakes made by Moon Bunny every full moon.");
    yield ctx.sayBoth("Gather up the primrose seeds from the primrose leaves all over this area, and plant the seeds at the footing near the crescent moon to see the primrose bloom.");
    yield ctx.sayBoth("When the flowers of primrose blooms, the full moon will rise, and that's when the Moon Bunnies will appear and start pounding the mill. Your task is to fight off the monsters to make sure that Moon Bunny can concentrate on making the best rice cake possible.");
    yield ctx.sayBoth("I would like for you and your party members to cooperate and get me 10 rice cakes. I strongly advise you to get me the rice cakes within the allotted time.");
  } else if (answer === 1) {
    const itemCount = ctx.getItemCount(MOON_BUNNYS_RICE_CAKE);
    if (itemCount >= 10) {
      yield ctx.sayNext("Oh... isn't this rice cake made by Moon Bunny? Please hand me the rice cake.");
      if (ctx.removeItem(MOON_BUNNYS_RICE_CAKE, 10)) {
        ctx.field.broadcastPacket(FieldEffectPacket.screen('quest/party/clear'));
        ctx.field.broadcastPacket(FieldEffectPacket.sound('Party1/Clear'));
        ctx.addExpAll(1600);
        ctx.setInstanceVariable('clear', '1');
        yield ctx.sayBoth("Mmmm... this is delicious. Please come see me next time for more #b#t4001101##k, Have a good trip!");
        ctx.partyWarp(910010100, 'st00'); // Hidden Street : Shortcut
      } else {
        yield ctx.sayNext("Did you happen to lose the rice cake?");
      }
    } else {
      yield ctx.sayNext("I advise you to check and make sure you have gathered #b10 #t4001101#s#k.");
    }
  } else if (answer === 2) {
    if (yield ctx.askYesNo("If you leave now, you will not be able to complete the mission. Are you sure you want to leave?")) {
      yield ctx.sayNext("Alright, then. See you around.");
      ctx.warp(910010300, 'st00'); // Hidden Street : Back to Town
    } else {
      yield ctx.sayNext("Good. Keep trying.");
    }
  }
}

// Ported from kinoko's HenesysPQ.moonrabbit_bonus (Tommy). The party-boss gate for
// the Pig Town instance entry is now in place.
export function* moonrabbit_bonus(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Tommy (1012113)
  //   Hidden Street : Shortcut (910010100)
  //   Hidden Street : Pig Town (910010200)
  //   Hidden Street : Pig Town (910010201)
  //   Hidden Street : Back to Town (910010300)
  if (ctx.getFieldId() === 910010100) {
    // Hidden Street : Shortcut
    yield ctx.sayNext("Hello, there! I'm Tommy. There's a Pig Town nearby where we're standing. The pigs there are rowdy and uncontrollable to the point where they have stolen numerous weapons from travelers. They were kicked out from their towns, and are currently hiding out at the Pig Town.");
    if (ctx.getUser().isPartyBoss()) {
      const answer: number = yield ctx.askMenu('What do you think about making your way there with your party members and teach those rowdy pigs a lesson?', new Map([
        [0, 'Yeah, that sounds good! Take me there!'],
      ]));
      if (answer === 0) {
        ctx.partyWarpInstance([910010200], 'sp', 910010400, 300);
      }
    } else {
      yield ctx.sayPrev("If you really want to teach those pigs a lesson, then please enter the place through your party leader.");
    }
  } else if (ctx.getFieldId() === 910010200) {
    // Hidden Street : Pig Town
    const answer: number = yield ctx.askMenu('Would you like to stop hunting and leave this place?', new Map([
      [0, 'Yes. I would like to leave this place.'],
    ]));
    if (answer === 0) {
      ctx.warp(910010400, 'st00'); // Hidden Street : Shortcut
    }
  } else if (ctx.getFieldId() === 910010300) {
    // Hidden Street : Back to Town
    const answer: number = yield ctx.askMenu("I think you're done with everything here. Would you like to leave this place?", new Map([
      [0, 'Yes. I would like to leave this place.'],
    ]));
    if (answer === 0) {
      ctx.removeItem(PRIMROSE_SEED);
      ctx.removeItem(MOON_BUNNYS_RICE_CAKE);
      ctx.warp(910010500); // Hidden Street : Moon Bunny Lobby
    }
  }
}

// Ported from kinoko's HenesysPQ.moonrabbit_mapEnter. field.setMobSpawn and
// field.blowWeather are available (Field.ts). kinoko's blowWeather duration arg
// is not modeled by the TS Field.blowWeather(itemId, message?) overload, so the
// duration (20s) is omitted.
export function* moonrabbit_mapEnter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Primrose Hill (910010000) / (910010001)
  ctx.field.setMobSpawn(false);
  ctx.field.blowWeather(5120016, 'Primrose Seeds fall from Primroses. If you pick up the seeds and plant them near the moon, the Moon Bunny will appear.');
  ctx.spawnReactor(MOON_REACTOR, 239, 64, false, 0, true); // Spawn the Moon Bunny reactor (WZ may not list it as life).
}

export function* moonItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // moonItem0 (9102002)
  //   Hidden Street : Primrose Hill (910010000)
  //   Hidden Street : Primrose Hill (910010001)
  ctx.dropRewards([
    Reward.item(PRIMROSE_SEED, 1, 1, 1.0),
  ]);
}

// Ported from kinoko's HenesysPQ.moonMob0. Spawns the Moon Bunny, re-enables mob
// spawn, shows the weather hint and broadcasts the protection message.
export function* moonMob0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // moonMob0 (9101000)
  //   Hidden Street : Primrose Hill (910010000)
  //   Hidden Street : Primrose Hill (910010001)
  ctx.spawnMob(MOON_BUNNY, -180, -196, MobAppearType.REGEN, false); // Moon Bunny
  ctx.field.setMobSpawn(true);
  ctx.field.blowWeather(5120016, "Protect the Moon Bunny that's pounding the mill, and gather up 10 Moon Bunny's Rice Cakes!");
  ctx.broadcastMessage('Protect the Moon Bunny!');
}