import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

export function* consume_2430112(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Miracle Cube Fragment (2430112)
  if (ctx.hasItem(2430112, 10)) {
    if (ctx.canAddItem(2049400, 1) && ctx.removeItem(2430112, 10)) {
      ctx.addItem(2049400, 1); // Advanced Potential Scroll
    } else {
      yield ctx.sayNext("Please check if your inventory is full or not.");
    }
  } else if (ctx.hasItem(2430112, 5)) {
    if (ctx.canAddItem(2049401, 1) && ctx.removeItem(2430112, 5)) {
      ctx.addItem(2049401, 1); // Potential Scroll
    } else {
      yield ctx.sayNext("Please check if your inventory is full or not.");
    }
  }
}

export function* blackBag(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Bag (2430032)
  ctx.spawnMob(9300388, ctx.user.getX(), ctx.user.getY());
  ctx.removeItem(2430032);
}
