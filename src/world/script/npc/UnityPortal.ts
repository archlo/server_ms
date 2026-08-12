import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const UNITY_PORTAL = 7050; // QuestRecordType.UnityPortal

const AVAILABLE_FIELDS = new Set([
  100000000, // Henesys : Henesys
  101000000, // Ellinia : Ellinia
  102000000, // Perion : Perion
  103000000, // Kerning City : Kerning City
  105000000, // Sleepywood : Sleepywood
  105040300, // Dungeon : Sleepywood
  120000000, // Nautilus : Nautilus Harbor
  200000200, // Orbis : Orbis Park
  211000000, // El Nath : El Nath
  220000000, // Ludibrium : Ludibrium
  221000000, // Omega Sector : Omega Sector
  222000000, // Korean Folk Town : Korean Folk Town
  230000000, // Aquarium : Aquarium
  240000000, // Leafre : Leafre
  250000000, // Mu Lung : Mu Lung
  251000000, // Herb Town : Herb Town
  260000000, // The Burning Road : Ariant
  261000000, // Sunset Road : Magatia
  310000000, // Black Wing Territory : Edelstein
  540000000, // Singapore : CBD
  600000000, // New Leaf City : NLC Town Center
  800000000, // Zipangu : Mushroom Shrine
]);

export function* returnPortal(ctx: ScriptContext, fallbackMapId = 100000000, fallbackPortalName: string | null = 'sp'): Generator<ScriptMessage, void, any> {
  const returnMap = ctx.getQRValue(UNITY_PORTAL); // QuestRecordType.UnityPortal
  if (returnMap && /^-?\d+$/.test(returnMap)) {
    const returnMapId = parseInt(returnMap, 10);
    if (AVAILABLE_FIELDS.has(returnMapId)) {
      ctx.playPortalSE();
      ctx.warp(returnMapId, returnMapId < 540000000 ? 'unityPortal2' : 'sp'); // missing portal for CBD, NLC and Mushroom Shrine
      ctx.setQRValue(UNITY_PORTAL, '');
      return;
    }
    console.error(`[UnityPortal] Tried to use Dimensional Mirror to warp to ${returnMapId}`);
  }
  ctx.playPortalSE();
  if (!fallbackPortalName) {
    ctx.warp(fallbackMapId);
  } else {
    ctx.warp(fallbackMapId, fallbackPortalName);
  }
}

export function* unityPortal(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dimensional Mirror : Multi-Functional Portal (9010022)
  //   Henesys / Ellinia / Perion / Kerning City / Sleepywood / Dungeon : Sleepywood / Nautilus Harbor
  //   Orbis Park / El Nath / Ludibrium / Omega Sector / Korean Folk Town / Aquarium / Leafre / Mu Lung
  //   Herb Town / The Burning Road / Sunset Road : Magatia / Edelstein / Singapore : CBD / NLC / Mushroom Shrine
  const options = new Map<number, string>([
    [0, 'Ariant Coliseum'],
    [1, 'Mu Lung Dojo'],
    [2, 'Monster Carnival 1'],
    [3, 'Monster Carnival 2'],
    [4, 'Sea of Fog'],
    [5, "Nett's Pyramid"],
    [6, 'Dusty Platform'],
    [8, 'Golden Temple'],
    [9, 'Moon Bunny'],
    [10, 'First Time Together'],
    [11, 'Dimensional Crack'],
    [12, 'Forest of Poison Haze'],
    [13, 'Remnants of the Goddess'],
    [14, 'Lord Pirate'],
    [15, 'Romeo and Juliet'],
    [16, 'Resurrection of the Hoblin King'],
    [17, "Dragon's Nest"],
  ]);

  const fieldId = ctx.getFieldId();
  if (!AVAILABLE_FIELDS.has(fieldId)) {
    console.error(`[UnityPortal] Tried to use Dimensional Mirror from field ID : ${fieldId}`);
    return;
  }
  const answer: number = yield ctx.askSlideMenu(0, options);
  switch (answer) {
    case 0:
      // Ariant Coliseum : Battle Arena Lobby
      ctx.warp(980010000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId)); // QuestRecordType.UnityPortal
      break;
    case 1:
      // Mu Lung Dojo : Mu Lung Dojo Entrance
      ctx.warp(925020000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 2:
      // Monster Carnival : Spiegelmann's Office
      ctx.warp(980000000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 3:
      // The 2nd Monster Carnival : Spiegelmann's Office
      ctx.warp(980030000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 4:
      // Sea of Fog : Shipwrecked Ghost Ship
      ctx.warp(923020000, 'sp');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 5:
      // Hidden Street : Pyramid Dunes
      ctx.warp(926010000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 6:
      // Hidden Street : Abandoned Subway Station
      ctx.warp(910320000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 7:
      // Hidden Street : Happyville
      ctx.warp(209000000, 'st00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 8:
      // Golden Temple : Golden Temple
      ctx.warp(950100000, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 9:
      // Hidden Street : Moon Bunny Lobby
      ctx.warp(910010500, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 10:
      // Hidden Street : First Time Together Lobby
      ctx.warp(910340700, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 11:
      // Ludibrium : Eos Tower 101st Floor
      ctx.warp(221023300, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 12:
      // Elin Forest : Deep Fairy Forest
      ctx.warp(300030100, 'west00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 13:
      // Orbis : The Unknown Tower
      ctx.warp(200080101, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 14:
      // Herb Town : Over the Pirate Ship
      ctx.warp(251010404, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 15:
      // Magatia : Alcadno - Hidden Room
      ctx.warp(261000021, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 16:
      // El Nath : Shammos's Solitary Room
      ctx.warp(211000002, 'out00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
    case 17:
      // Leafre : Crimson Sky Dock
      ctx.warp(240080000, 'left00');
      ctx.setQRValue(UNITY_PORTAL, String(fieldId));
      break;
  }
}

export function* unityPortal2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Henesys / Ellinia / Perion / Kerning City / Sleepywood / Dungeon : Sleepywood / Nautilus Harbor
  // Orbis Park / El Nath / Ludibrium / Omega Sector / Korean Folk Town / Aquarium / Leafre / Mu Lung
  // Herb Town / The Burning Road / Sunset Road : Magatia / Edelstein - unityPortal2 portals
  yield* unityPortal(ctx);
}

// RETURN SCRIPTS --------------------------------------------------------------------------------------------------

export function* aMatchMove2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ariant Coliseum : Battle Arena Lobby (980010000) - out00 (-601, 274)
  yield* returnPortal(ctx);
}

export function* dojang_exit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mu Lung Dojo : Mu Lung Dojo Entrance (925020000) - out00 (-2142, 50)
  yield* returnPortal(ctx);
}

export function* mc_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Monster Carnival : Spiegelmann's Office (980000000) - out00 (-518, 133)
  // The 2nd Monster Carnival : Spiegelmann's Office (980030000) - out00 (-411, 133)
  yield* returnPortal(ctx, 103000000, null); // Kerning City : Kerning City
}

export function* aqua_taxi3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dolphin (2060010) - Sea of Fog : Shipwrecked Ghost Ship (923020000)
  if (yield ctx.askYesNo('Do you want to go back now?')) {
    yield* returnPortal(ctx, 230000000, null); // Aquarium : Aquarium
  }
}

export function* nets_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Pyramid Dunes (926010000) - out00 (-169, 212)
  yield* returnPortal(ctx);
}

export function* met_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Abandoned Subway Station (910320000) - out00 (-209, -167)
  yield* returnPortal(ctx);
}

export function* goback(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Golden Temple : Golden Temple (809060000) - out00 (1830, 472)
  // Golden Temple : Golden Temple (950100000) - out00 (-1391, 470)
  yield* returnPortal(ctx);
}

export function* party2_exit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ludibrium : Eos Tower 101st Floor (221023300) - out00 (173, 2005)
  yield* returnPortal(ctx, 221023200, 'in00'); // Ludibrium : Eos Tower 100th Floor
}

export function* exit_party6(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Elin Forest : Deep Fairy Forest (300030100) - west00 (-344, 149)
  yield* returnPortal(ctx, 300030000, 'east00'); // Elin Forest : Eastern Region of Mossy Tree Forest
}

export function* exit_party3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Orbis : The Unknown Tower (200080101) - out00 (-322, 173)
  yield* returnPortal(ctx, 200080100, 'in00'); // Orbis : Entrance to Orbis Tower
}

export function* davy_exit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Herb Town : Over the Pirate Ship (251010404) - out00 (-1954, 243)
  yield* returnPortal(ctx, 251010401, 'in00'); // Herb Town : Red-Nose Pirate Den 1
}

export function* exit_juliet(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Magatia : Alcadno - Hidden Room (261000021) - out00 (-474, 146)
  yield* returnPortal(ctx, 261000020, 'in00'); // Magatia : Alcadno Society
}

export function* exit_romio(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Magatia : Zenumist - Hidden Room (261000011) - out00 (-314, 181)
  yield* returnPortal(ctx, 261000010, 'in00'); // Magatia : Zenumist Society
}

export function* exit_shmmosP(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // El Nath : Shammos's Solitary Room (211000002) - out00 (-282, 64)
  yield* returnPortal(ctx, 211000001, 'in00'); // El Nath : Chief's Residence
}

export function* exit_dragonR(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Crimson Sky Dock (240080000) - left00 (-512, 80)
  yield* returnPortal(ctx, 240030102, 'right00'); // Leafre : The Forest That Disappeared
}
