import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

export function* TD_NC_title(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Tera Forest   : Tera Forest Time Gate (240070000)
  // Neo City : <Year 2021> Average Town Entrance (240070100)
  // Neo City : <Year 2099> Midnight Harbor Entrance (240070200)
  // Neo City : <Year 2215> Bombed City Center Retail District (240070300)
  // Neo City : <Year 2216> Ruined City Intersection (240070400)
  // Neo City : <Year 2230> Dangerous Tower Lobby (240070500)
  // Neo City : <Year 2503> Air Battleship Bow (240070600)
  const fieldId = ctx.getFieldId();
  if (fieldId === 240070000) {
    // Tera Forest : Tera Forest Time Gate
    ctx.screenEffect('temaD/enter/teraForest');
  } else if (fieldId === 240070100) {
    // Neo City : <Year 2012> Average Town Entrance
    ctx.screenEffect('temaD/enter/neoCity1');
  } else if (fieldId === 240070200) {
    // Neo City : <Year 2099> Midnight Harbor Entrance
    ctx.screenEffect('temaD/enter/neoCity2');
  } else if (fieldId === 240070300) {
    // Neo City : <Year 2215> Bombed City Center Retail District
    ctx.screenEffect('temaD/enter/neoCity3');
  } else if (fieldId === 240070400) {
    // Neo City : <Year 2216> Ruined City Intersection
    ctx.screenEffect('temaD/enter/neoCity4');
  } else if (fieldId === 240070500) {
    // Neo City : <Year 2230> Dangerous Tower Lobby
    ctx.screenEffect('temaD/enter/neoCity5');
  } else if (fieldId === 240070600) {
    // Neo City : <Year 2503> Air Battleship Bow
    ctx.screenEffect('temaD/enter/neoCity6');
  }
}

export function* TD_neoCity_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Time Gate (2083006)
  //   Tera Forest   : Tera Forest Time Gate (240070000)
  const destinations = [
    240070100, // Neo City : <Year 2012> Average Town Entrance
    240070200, // Neo City : <Year 2099> Midnight Harbor Entrance
    240070300, // Neo City : <Year 2215> Bombed City Center Retail District
    240070400, // Neo City : <Year 2216> Ruined City Intersection
    240070500, // Neo City : <Year 2230> Dangerous Tower Lobby
    240070600, // Neo City : <Year 2503> Air Battleship Bow
  ];
  const names = [
    'Neo City : <Year 2012> Average Town Entrance',
    'Neo City : <Year 2099> Midnight Harbor Entrance',
    'Neo City : <Year 2215> Bombed City Center Retail District',
    'Neo City : <Year 2216> Ruined City Intersection',
    'Neo City : <Year 2230> Dangerous Tower Lobby',
    'Neo City : <Year 2503> Air Battleship Bow',
  ];
  const options = new Map<number, string>();
  for (let i = 0; i < destinations.length; i++) {
    options.set(i, names[i]);
  }
  const answer: number = yield ctx.askSlideMenu(1, options);
  if (answer >= 0 && answer < destinations.length) {
    ctx.warp(destinations[answer], 'left00');
  }
}

export function* TD_chat_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Tera Forest   : Tera Forest Time Gate (240070000)
  //   TD_neo (491, 151)
  yield* TD_neoCity_enter(ctx);
}
