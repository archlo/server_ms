import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

// Ported from kinoko's MiniDungeon.handleMiniDungeon. Party system landed in Batch 9,
// so the non-leader block and partyWarpInstance entry are now in place. Solo players
// fall through the same code path (partyWarpInstance uses just this user when no
// same-field party members are returned).
function* handleMiniDungeon(ctx: ScriptContext, mapId: number, dungeonId: number, timeLimit: number): Generator<ScriptMessage, void, any> {
  if (ctx.getFieldId() === mapId) {
    const user = ctx.getUser();
    if (user.hasParty() && !user.isPartyBoss()) {
      ctx.message('You are not the leader of the party.');
    } else {
      ctx.playPortalSE();
      ctx.partyWarpInstance([dungeonId], 'out00', mapId, timeLimit);
    }
  } else {
    ctx.playPortalSE();
    ctx.warp(mapId, 'MD00');
  }
}

export function* MD_mushroom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Singing Mushroom Forest : Ghost Mushroom Forest (100020400) - MD00 (289, -867)
  // Singing Mushroom Forest : Warm Shade (100020500) - out00 (497, -716)
  yield* handleMiniDungeon(ctx, 100020400, 100020500, 7200);
}

export function* MD_coldeye(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // North Forest : Young Tree Forest (101030300) - MD00 (-1300, -338)
  // North Forest : One-Eyed Lizard (101030400) - out00 (194, 267)
  yield* handleMiniDungeon(ctx, 101030300, 101030400, 7200);
}

export function* MD_golem(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Golem's Temple : Golem's Temple 4 (100040400) - MD00 (978, -359)
  // Golem's Temple : Golem's Castle Ruins (100040500) - out00 (-232, 1142)
  // Dungeon : Sleepy Dungeon IV (105040304) - MD00 (717, 674)
  if (ctx.getFieldId() === 105040304) {
    // Dungeon : Sleepy Dungeon IV
    ctx.message('You cannot go to that place.');
  } else {
    yield* handleMiniDungeon(ctx, 100040400, 100040500, 7200);
  }
}

export function* MD_drake(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Drake Cave : Cave Exit (105020400) - MD00 (2442, 107)
  // Drake Cave : Blue Drake Cave (105020500) - out00 (441, -1029)
  yield* handleMiniDungeon(ctx, 105020400, 105020500, 7200);
}

export function* MD_pig(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Beach : Wave Beach (120020100) - MD00 (1077, -56)
  // Beach : The Pig Beach (120020200) - out00 (612, 212)
  yield* handleMiniDungeon(ctx, 120020100, 120020200, 7200);
}

export function* MD_rabbit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ludibrium : Eos Tower 71st - 90th Floor (221022200) - MD00 (-233, -1572)
  // Mini Dungeon : Drummer Bunny's Lair (221023401) - out00 (196, 466)
  yield* handleMiniDungeon(ctx, 221022200, 221023401, 7200);
}

export function* MD_roundTable(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Battlefield of Fire and Water (240020500) - MD00 (772, 119)
  // Mini Dungeon : The Round Table of Kentaurus (240020501) - out00 (839, -779)
  yield* handleMiniDungeon(ctx, 240020500, 240020501, 7200);
}

export function* MD_remember(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : The Dragon Nest Left Behind (240040511) - MD00 (1028, 1099)
  // Mini Dungeon : The Restoring Memory (240040800) - out00 (1080, 1094)
  yield* handleMiniDungeon(ctx, 240040511, 240040800, 7200);
}

export function* MD_protect(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Destroyed Dragon Nest (240040520) - MD00 (-1082, 1106)
  // Mini Dungeon : Newt Secured Zone (240040900) - out00 (305, 445)
  yield* handleMiniDungeon(ctx, 240040520, 240040900, 7200);
}

export function* MD_treasure(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Herb Town : Red-Nose Pirate Den 2 (251010402) - MD00 (549, -234)
  // Mini Dungeon : Pillage of Treasure Island (251010410) - out00 (361, -394)
  yield* handleMiniDungeon(ctx, 251010402, 251010410, 7200);
}

export function* MD_sand(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sunset Road : Sahel 2 (260020600) - MD00 (-180, -178)
  // Mini Dungeon : Hill of Sandstorms (260020630) - out00 (742, 97)
  yield* handleMiniDungeon(ctx, 260020600, 260020630, 7200);
}

export function* MD_error(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Alcadno Research Institute : Lab - Area C-1 (261020300) - MD00 (234, -93)
  // Hidden Street : Critical Error (261020301) - out00 (-310, -85)
  yield* handleMiniDungeon(ctx, 261020300, 261020301, 7200);
}

export function* MD_high(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Malaysia : Fantasy Theme Park 3 (551030000) - MD00 (-160, 638)
  // Malaysia : Longest Ride on ByeBye Station (551030001) - out00 (-131, 158)
  yield* handleMiniDungeon(ctx, 551030000, 551030001, 7200);
}

export function* MD_cakeEnter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // New Leaf City : NLC Town Center (600000000) - yn00 (1771, 499)
  ctx.message('You cannot go to that place.');
}