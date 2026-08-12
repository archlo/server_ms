import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';
import { BodyPart } from '../../item/BodyPart';
import { JobConstants } from '../../job/JobConstants';

export function* WendelinHeal(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Wendelline : Treatment Specialist (2151006) - Resistance Headquarters : Training Room Entrance (310010010)
  if (yield ctx.askYesNo('Are you hurt? Allow me to treat your wounds.')) {
    ctx.user.setHp(ctx.user.getMaxHp());
    ctx.user.setMp(ctx.user.getMaxMp());
    yield ctx.sayOk("There you go. You're fully healed.");
  }
}

export function* edelstein_taxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Taxi : Affiliated with Black Wings (2150007) - Black Wing Territory : Edelstein (310000000)
  if (!(yield ctx.askYesNo("Hello, welcome to the Edelstein Taxi. I can take members of the Black Wings safely and quickly to #bVerne Mines#k. And if you're not part of the Black Wings? Well, I guess I'll take you as long as you pay... So, are you going to the mines?"))) {
    yield ctx.sayNext('Let me know if you change your mind.');
    return;
  }
  const hat = ctx.getEquippedItemId(BodyPart.CAP) === 1003134;
  const cost = hat ? 3000 : 10000;
  const askWhat = hat
    ? "Oh, you're a member of the Black Wings. I have a special discount for the Black Wings. You can ride for a mere #b3000 Mesos#k. Hop on."
    : 'Please pay #b10000 Mesos#k to go to Verne Mine.';
  if (!(yield ctx.askYesNo(askWhat))) {
    yield ctx.sayNext('Let me know if you change your mind.');
    return;
  }
  if (!ctx.addMoney(-cost)) {
    yield ctx.sayOk('It appears that you do not have enough mesos.');
    return;
  }
  ctx.warp(310040200); // Dry Road : Mine Entrance
}

export function* intoResiTR(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Elevator Control (2151007) - Resistance Headquarters : Training Room Entrance (310010010)
  ctx.setSpeakerId(2151007);
  const rooms: [number, string][] = [
    [310010100, 'Underground 2nd Floor Training Room A'],
    [310010200, 'Underground 3rd Floor Training Room B'],
    [310010300, 'Underground 4th Floor Training Room C'],
    [310010400, 'Underground 5th Floor Training Room D'],
    [931000400, 'Underground 6th Floor Training Room E'],
  ];
  const options = new Map<number, string>();
  rooms.forEach(([, label], i) => options.set(i, label));
  const answer: number = yield ctx.askMenu("An elevator that will take you to your desired training room.\r\nChoose the floor you'd like to go to.", options);
  if (answer >= 0 && answer < rooms.length) {
    const mapId = rooms[answer][0];
    if (answer === 4) {
      if (!ctx.hasQuestStarted(23118)) {
        yield ctx.sayOk('You cannot go there at this time.');
        return;
      }
      ctx.playPortalSE();
      ctx.warpInstance([mapId], 'out00', 310010000, 60 * 5);
      return;
    }
    ctx.playPortalSE();
    ctx.warp(mapId, 'out00');
  }
}

export function* giveDress(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Gabrielle's Suitcase (2159301) - Edelstein : Guarded Mansion (931010010)
  if (!ctx.field.getMobPool().isEmpty()) {
    ctx.message('Defeat the robots first.');
    return;
  }
  if (ctx.addItem(4032757, 1)) {
    yield ctx.sayOk("#b(You've grabbed Gabrielle's clothes. Deliver them quickly to #p2152006#.)#k");
    return;
  }
  yield ctx.sayOk('#bYour Etc inventory is full. Empty out at least one slot.#k');
}

export function* talk2159305(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Wonny (2159305) - Black Wing Territory : Edelstein (310000000)
  if (ctx.hasQuestStarted(23938)) {
    const hour = new Date().getUTCHours();
    if (hour === 22 && !ctx.hasQRValue(23984, '1')) { // EdelsteinWonny10PM
      ctx.setQRValue(23984, '1');
      yield ctx.sayNext("What are you looking at? I'm not standing here because I miss #p2154004#. I just... want to make sure that no thieves get in. Yeah.");
    }
  }
}

export function* talkPavio(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Fabio (2159300) - Edelstein : Shady Hair Salon (931010030)
  if (ctx.field.getMobPool().isEmpty()) {
    yield ctx.sayNext("What are you doing?! How dare you try to destroy the #o5100002#s I worked so hard to obtain! Do you realize how expensive these are? I paid an exorbitant amount of money so that I could learn a new perm!!");
    yield ctx.sayBoth("What? You've come in the name of the Watchmen to keep an eye on me? I don't even have the freedom to pursure beautiful hair?! I won't stand for this! I'm going to require compensation for the damage you've caused!");
    ctx.setQRValue(23979, '1'); // EdelsteinFabioFirebombs
  }
}

export function* q23905e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Town Filled With Suspicion (23905 - end)
  yield ctx.sayNext("So you met #p2152016#. I told you it wouldn't be pleasant. Still, #p2152016# is the nicest of all the <Watchmen>.");
  yield ctx.sayBoth("As you've no doubt learned, our town is under the control of the Black Wings. And let me make one thing clear: we hate it. That's why we were suspicious of you, an outsider.");
  yield ctx.sayBoth("Now that it's been confirmed that you are not one of <Them>, the townspeople won't be suspicious of you. So let me be the first to welcome you to #m310000000#! As long as you do not aid our enemies, the residents of #m310000000# will accept you as a friend.");
  ctx.setQRValue(23977, '1'); // EdelsteinUnlockTownQuests
  ctx.forceCompleteQuest(23905);
}

export function* edelItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // edelItem0 (3102000) - Black Wing Territory : Edelstein / Edelstein Park / Park 2 / Park 3
  ctx.dropRewards([
    Reward.item(2022712, 1, 1, 1.0),
    Reward.item(2022712, 1, 1, 0.7),
    Reward.item(2022712, 1, 1, 0.3),
  ]);
}

export function* edelItem1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // edelItem1 (3102001) - Concrete Road : Edelstein Park 3 / Hidden Street : Dahlia Garden
  ctx.dropRewards([
    Reward.item(4032752, 1, 1, 1, 23919),
  ]);
}

export function* enterResiTR(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Resistance Headquarters : Training Room Entrance (310010010) - in00 (-397, 62)
  yield* intoResiTR(ctx);
}

export function* enterDangerHair(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wing Territory : Edelstein (310000000) - in03 (1090, 587)
  ctx.playPortalSE();
  if (ctx.hasQuestStarted(23940) && !ctx.hasQRValue(23979, '1')) { // EdelsteinFabioFirebombs
    const hour = new Date().getUTCHours();
    if (hour === 18) {
      ctx.warpInstance([931010030], 'out00', 310000000, 10 * 60);
      return;
    }
  }
  ctx.warp(310000003, 'out00'); // Edelstein : Edelstein Hair Salon
}

export function* outPavio(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Edelstein : Shady Hair Salon (931010030) - out00 (308, 24)
  ctx.playPortalSE();
  ctx.warp(310000000, 'in03');
}

export function* enterMansion(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wing Territory : Edelstein (310000000) - in01 (1290, -53)
  ctx.playPortalSE();
  if (ctx.hasQuestStarted(23925) && !ctx.hasItem(4032757)) {
    ctx.warpInstance([931010010], 'out00', 310000000, 10 * 60);
    ctx.scriptProgressMessage("Defeat the robots and get Gabrielle's clothes.");
    return;
  }
  ctx.warp(310000004, 'out00');
}

export function* outMansion(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Edelstein : Guarded Mansion (931010010) - out00 (-325, 46)
  ctx.playPortalSE();
  ctx.warp(310000000, 'in01');
}

export function* enterSecJobResi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wing Territory : Edelstein (310000000) - in02 (1864, -16)
  ctx.playPortalSE();
  if (ctx.hasQuestStarted(23023) || ctx.hasQuestStarted(23024) || ctx.hasQuestStarted(23025)) {
    ctx.warpInstance([931000100, 931000101], 'out00', 310000000, 10 * 60);
    return;
  }
  if (ctx.hasQuestStarted(23121) && !ctx.hasQRValue(23131, '1')) { // ResistanceWaterTrade
    ctx.warpInstance([931000420], 'out00', 310000000, 10 * 60);
    ctx.scriptProgressMessage('Thieves have attacked! Defeat all the thieves and then go see Ace the Pilot.');
    return;
  }
  ctx.warp(310000010, 'out00'); // Edelstein : Edelstein Temporary Airport
}

export function* enterBlackWing(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dry Road : Mine Entrance (310040200) - east00 (2240, -15)
  if (ctx.getEquippedItemId(BodyPart.CAP) !== 1003134) {
    ctx.message("You can't enter without proof that you are a member of the Black Wings. Equip something with the Black Wings' logo on it to enter.");
    return;
  }
  ctx.playPortalSE();
  ctx.warp(310050000, 'west00');
}

export function* enterFranRoom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Verne Mine : Power Plant Lobby (310050000) - in00 (-289, 17)
  ctx.warpInstance([931020010], 'out00', 310050000, 10 * 60);
}

export function* enterEelroom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Verne Mine : Power Plant Lobby (310050000) - in01 (728, 17)
  ctx.warpInstance([931020011], 'out00', 310050000, 10 * 60);
}

export function* ThirdJobResi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Verne Mine : Power Plant Security (310050100) - in00 (793, 16)
  ctx.playPortalSE();
  if (ctx.hasQuestStarted(23033) || ctx.hasQuestStarted(23034) || ctx.hasQuestStarted(23035)) {
    ctx.warpInstance([931000200], 'out00', 310050100, 60 * 15);
  }
}

export function* FourthJobResi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Leery Corridor (310060221) - in00 (953, 20)
  ctx.playPortalSE();
  if (!ctx.hasItem(4032743)) {
    ctx.message('You cannot enter without a keycard.');
    return;
  }
  if (ctx.hasQuestStarted(23043) || ctx.hasQuestStarted(23044) || ctx.hasQuestStarted(23045)) {
    ctx.message('Find the missing Job Instructor!');
    const job = ctx.getJob();
    if (JobConstants.isBattleMageJob(job)) {
      ctx.warpInstance([931000300, 931000310, 931000320], 'sp', 310050100, 60 * 15);
    } else if (JobConstants.isWildHunterJob(job)) {
      ctx.warpInstance([931000301, 931000311, 931000321], 'sp', 310050100, 60 * 15);
    } else if (JobConstants.isMechanicJob(job)) {
      ctx.warpInstance([931000302, 931000312, 931000322], 'sp', 310050100, 60 * 15);
    }
  }
}

export function* enterNewWeapon1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Booby Trap! Laboratory Jail (931000310) - west00 (-799, -103)
  ctx.playPortalSE();
  ctx.warp(931000320);
}

export function* enterNewWeapon2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Booby Trap! Laboratory Jail (931000311) - west00 (-791, -104)
  ctx.playPortalSE();
  ctx.warp(931000321);
}

export function* enterNewWeapon3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Booby Trap! Laboratory Jail (931000312) - west00 (-798, -105)
  ctx.playPortalSE();
  ctx.warp(931000322);
}

export function* edelPortal0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // edelPortal0 (3100000) - Verne Mine : Power Plant Security (310050100)
  ctx.warp(931020000, 'out00');
  ctx.setReactorState(3100000, 0);
}

export function* edelPortal1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // edelPortal1 (3100001) - Verne Mine : Power Plant Security (310050100)
  ctx.warp(931020001, 'out00');
  ctx.setReactorState(3100001, 0);
}

export function* edelPortal2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // edelPortal2 (3100002) - Verne Mine : Power Plant Security (310050100)
  ctx.warp(931020002, 'out00');
  ctx.setReactorState(3100002, 0);
}
