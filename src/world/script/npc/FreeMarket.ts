import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

function* enterPortal(ctx: ScriptContext, value: string): Generator<ScriptMessage, void, any> {
  ctx.playPortalSE();
  ctx.warp(910000000, 'out00'); // Hidden Street : Free Market Entrance
  ctx.setQRValue(7600, value); // QuestRecordType.FreeMarket
}

export function* market00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Free Market Entrance (910000000) - out00 (-538, 30)
  const value = ctx.getQRValue(7600); // QuestRecordType.FreeMarket
  ctx.playPortalSE();
  switch (value) {
    case '01': ctx.warp(100000100, 'market00'); break;
    case '02': ctx.warp(220000000, 'market00'); break;
    case '03': ctx.warp(211000100, 'market00'); break;
    case '04': ctx.warp(102000000, 'market00'); break;
    case '05': ctx.warp(230000000, 'market01'); break;
    case '06': ctx.warp(221000000, 'market00'); break;
    case '07': ctx.warp(200000000, 'market00'); break;
    case '08': ctx.warp(801000300, 'market00'); break;
    case '09': ctx.warp(240000000, 'market00'); break;
    case '10': ctx.warp(250000000, 'market00'); break;
    case '11': ctx.warp(251000000, 'market00'); break;
    case '12': ctx.warp(600000000, 'market00'); break;
    case '13': ctx.warp(260000000, 'market00'); break;
    case '14': ctx.warp(222000000, 'market00'); break;
    case '15': ctx.warp(540000000, 'market00'); break;
    case '16': ctx.warp(541000000, 'market00'); break;
    case '17': ctx.warp(120000200, 'market00'); break;
    case '18': ctx.warp(261000000, 'market0'); break;
    case '19': ctx.warp(130000200, 'st00'); break;
    case '20': ctx.warp(550000000, 'market00'); break;
    case '21': ctx.warp(551000000, 'market00'); break;
    case '22': ctx.warp(140000000, 'market00'); break;
    case '23': ctx.warp(103050000, 'market00'); break;
    case '24': ctx.warp(310000000, 'market00'); break;
    default:
      console.error(`[FreeMarket] Tried to leave Free Market with QR value : ${value}`);
      ctx.warp(100000100, 'market00'); // Henesys : Henesys Market
      break;
  }
  ctx.setQRValue(7600, ''); // QuestRecordType.FreeMarket
}

export function* market01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Henesys : Henesys Market (100000100) - market00 (838, 155)
  yield* enterPortal(ctx, '01');
}

export function* market02(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ludibrium : Ludibrium (220000000) - market00 (-684, 103)
  yield* enterPortal(ctx, '02');
}

export function* market03(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // El Nath : El Nath Market (211000100) - market00 (-1098, -85)
  yield* enterPortal(ctx, '03');
}

export function* market04(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Perion : Perion (102000000) - market00 (1157, 581)
  yield* enterPortal(ctx, '04');
}

export function* market05(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Aquarium : Aquarium (230000000) - market01 (1511, 38)
  yield* enterPortal(ctx, '05');
}

export function* market06(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Omega Sector : Omega Sector (221000000) - market00 (3577, 25)
  yield* enterPortal(ctx, '06');
}

export function* market07(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Orbis : Orbis (200000000) - market00 (2399, -517)
  yield* enterPortal(ctx, '07');
}

export function* market08(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Zipangu : Showa Street Market (801000300) - market00 (258, 151)
  yield* enterPortal(ctx, '08');
}

export function* market09(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Leafre (240000000) - market00 (-1936, -32)
  yield* enterPortal(ctx, '09');
}

export function* market10(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mu Lung : Mu Lung (250000000) - market00 (-197, -547)
  yield* enterPortal(ctx, '10');
}

export function* market11(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Herb Town : Herb Town (251000000) - market00 (1020, -66)
  yield* enterPortal(ctx, '11');
}

export function* market12(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // New Leaf City : NLC Town Center (600000000) - market00 (2021, 18)
  yield* enterPortal(ctx, '12');
}

export function* market13(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Burning Road : Ariant (260000000) - market00 (433, 273)
  yield* enterPortal(ctx, '13');
}

export function* market14(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Korean Folk Town : Korean Folk Town (222000000) - market00 (-1399, 149)
  yield* enterPortal(ctx, '14');
}

export function* market15(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Singapore : CBD (540000000) - market00 (4582, 43)
  yield* enterPortal(ctx, '15');
}

export function* market16(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Singapore : Boat Quay Town (541000000) - market00 (34, -109)
  yield* enterPortal(ctx, '16');
}

export function* market17(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nautilus : Mid Floor - Hallway (120000200) - market00 (1867, 148)
  yield* enterPortal(ctx, '17');
}

export function* market18(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sunset Road : Magatia (261000000) - market0 (336, -227)
  yield* enterPortal(ctx, '18');
}

export function* market19(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Crossroads of Ereve (130000200) - st00 (-160, 91)
  yield* enterPortal(ctx, '19');
}

export function* market20(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Malaysia : Trend Zone Metropolis (550000000) - market00 (2685, 649)
  yield* enterPortal(ctx, '20');
}

export function* market21(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Malaysia : Kampung Village (551000000) - market00 (-233, 132)
  yield* enterPortal(ctx, '21');
}

export function* market22(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Rien (140000000) - market00 (772, -335)
  yield* enterPortal(ctx, '22');
}

export function* market23(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Victoria Road : Kerning City Back Alley (103050000) - market00 (-471, 154)
  yield* enterPortal(ctx, '23');
}

export function* market24(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Wing Territory : Edelstein (310000000) - market00 (780, -16)
  yield* enterPortal(ctx, '24');
}
