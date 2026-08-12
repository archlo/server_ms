import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const STAGE_2 = 921160200;
const STAGE_6 = 921160600;
const BOSS = 921160700;
const RETURN_MAP = 910002000;

const PRISON_KEY = 4001528;
const PRISON_GUARD_ANI = 9300454;

const WEATHER_HINT = 5120017;

export function* prisonBreak_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (!ctx.getUser().isPartyBoss()) {
    yield ctx.sayOk('Please have your party leader talk to me.');
    return;
  }
  if (!ctx.getUser().checkParty(3, 50)) {
    yield ctx.sayOk('You need at least 3 party members at Lv. 50 or higher to enter.');
    return;
  }
  ctx.partyWarpInstance([921160100, STAGE_2, 921160300, 921160400, 921160500, STAGE_6, BOSS], 'st00', RETURN_MAP, 60 * 30);
}

export function* prisonBreak_stage1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Sshh! You must escape the tower by quietly avoiding the obstacles.');
}

export function* prisonBreak_stage2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'You must defeat all the guards. Otherwise they will call other guards, and that is bad.');
}

export function* prisonBreak_stage3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'They created a maze to keep people from entering or escaping. Find the door that leads to the Aerial Prison!');
}

export function* prisonBreak_stage4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Defeat all the guards that are defending the door!');
}

export function* prisonBreak_stage5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'This is the last obstacle. Press on to the Aerial Prison.');
}

export function* prisonBreak_stage6(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Open the prison door by defeating the guard and recovering the prison key.');
}

export function* prisonBreak_boss(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Please free us by defeating the Prison Guard!');
  if (ctx.field.getMobPool().getBy(m => m.getTemplateId() === PRISON_GUARD_ANI) === undefined) {
    ctx.spawnMob(PRISON_GUARD_ANI, -1281, -181);
  }
}

export function* prisonBreak_next(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const fieldId = ctx.getFieldId();
  let warp = false;
  if (fieldId === STAGE_6) {
    const hasKey = ctx.getItemCount(PRISON_KEY) > 0;
    if (hasKey) {
      ctx.removeItem(PRISON_KEY);
      warp = true;
    } else {
      ctx.scriptProgressMessage('Find the prison key from the chests!');
    }
  } else {
    warp = ctx.field.getMobPool().getCount() === 0;
    if (!warp) {
      ctx.scriptProgressMessage('Defeat all monsters first!');
    }
  }
  if (warp) {
    ctx.warp(fieldId + 100);
  }
}

export function* prisonBreak_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getFieldId() === BOSS) {
    if (ctx.field.getMobPool().getCount() > 0) {
      ctx.scriptProgressMessage('Defeat the Prison Guard first!');
      return;
    }
    ctx.addExpAll(50000);
    ctx.warp(RETURN_MAP);
  } else if (yield ctx.askYesNo('Are you sure you want to leave? You will not be able to return.')) {
    ctx.warp(RETURN_MAP);
  }
}
