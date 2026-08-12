import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const GOLDEN_TICKET_ID = 4001431;
const PREMIUM_TICKET_ID = 4001432;
const TIME_LIMIT = 1800;

export function* outGoldenTemple(_ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mr. Yoo : Golden Temple PR Manager (9000078) - Golden Temple : Golden Temple (809060000 / 950100000)
  // TODO
}

export function* MD_monkey(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dao : Monkey Temple Guide (9000080) - Golden Temple : Golden Temple (809060000 / 950100000)
  const answer: number = yield ctx.askMenu('Are you here because you heard about the Monkey Temple inside the Golden Temple?', new Map([
    [0, 'I want to enter the Monkey Temple.'],
    [1, 'Please tell me more about the Monkey Temple.'],
  ]));
  if (answer === 0) {
    const dungeon: number = yield ctx.askMenu('Which temple do you wish to enter? And you know that must enter alone, right?', new Map([
      [0, 'Monkey Temple 1 (Lv. 15 Wild Monkey'],
      [1, 'Monkey Temple 2 (Lv. 21 Mama Monkey'],
      [2, 'Monkey Temple 3 (Lv. 20 White Baby Monkey'],
      [3, 'Monkey Temple 4 (Lv. 34 White Mama Monkey)'],
    ]));
    if (!ctx.hasItem(PREMIUM_TICKET_ID) && !ctx.removeItem(GOLDEN_TICKET_ID, 1)) {
      yield ctx.sayOk("I'm sorry but you can't enter the Monkey Temple without a ticket. Let me explain the Monkey Temple to you again so you can understand how to obtain a ticket.");
      return;
    }
    ctx.warpInstance([950100100 + (dungeon * 100)], 'out00', 950010000, TIME_LIMIT);
  } else if (answer === 1) {
    yield ctx.sayOk("This is a forest where the monkeys outside of the Golden Temple live. \r\n\r\n1. Benefits of the Monkey Temple \r\n#b- Yields more EXP than other monsters of the same level \r\n- Drops various scrolls#k \r\n\r\n2. How to obtain the Golden Ticket required to enter \r\n- Mr. Yoo's quest can be completed once per day \r\n- Freely enter as desired for an hour if you possess a Premium Golden Ticket.");
  }
}

export function* MD_goblin(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Chan : Goblin Cave Guard (9000075) - Golden Temple : Golden Temple (809060000 / 950100000)
  const answer: number = yield ctx.askMenu('What do you want? Please step aside.', new Map([
    [0, 'I want to enter the Goblin Cave.'],
    [1, 'Please tell me more about the Goblin Cave.'],
  ]));
  if (answer === 0) {
    const dungeon: number = yield ctx.askMenu("You need a Golden Ticket to enter. You can only enter when you're alone, too. Where do you want to go?", new Map([
      [0, 'Goblin Temple 1 (Lv. 43 Blue Goblin)'],
      [1, 'Goblin Temple 2 (Lv. 54 Red Goblin)'],
      [2, 'Goblin Temple 3 (Lv. 66 Stone Goblin)'],
    ]));
    if (!ctx.hasItem(PREMIUM_TICKET_ID) && !ctx.removeItem(GOLDEN_TICKET_ID, 1)) {
      yield ctx.sayOk("I'm sorry but you can't enter the Goblin Cave without a ticket. Let me explain the Goblin Cave to you again so you can understand how to obtain a ticket.");
      return;
    }
    ctx.warpInstance([950100500 + (dungeon * 100)], 'out00', 950010000, TIME_LIMIT);
  } else if (answer === 1) {
    yield ctx.sayOk("This is a Cave where the Goblins outside of the Golden Temple live. \r\n\r\n1. Benefits of the Goblin Cave \r\n#b- Yields more EXP than other monsters of the same level \r\n- Drops Sunburst#k \r\n\r\n2. How to obtain the Golden Ticket required to enter \r\n- Mr. Yoo's quest can be completed once per day \r\n- Freely enter as desired for an hour if you possess a Premium Golden Ticket.");
  }
}

export function* goMonkey(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Golden Temple : Golden Temple (809060000) - in00 (1328, 531) / (950100000) - in00 (-827, 532)
  ctx.setSpeakerId(9000080);
  yield* MD_monkey(ctx);
}

export function* goGoblin(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Golden Temple : Golden Temple (809060000) - in01 (-532, 531) / (950100000) - in01 (977, 532)
  ctx.setSpeakerId(9000075);
  yield* MD_goblin(ctx);
}
