import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

export function* hwang(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Captain Hwang (2092001) - Herb Town : Herb Town (251000000)
  if (ctx.hasQuestStarted(22587)) {
    ctx.warpInstance([925110001], 'out00', 251000000, 60 * 30);
  }
}

export function* Pottery(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Potter (2092101) - Hidden Street : Pirate Treasure Vault (925110000)
  if (ctx.hasQuestStarted(22408)) {
    if (ctx.field.getMobPool().getCount() > 0) {
      ctx.setPlayerAsSpeaker(true);
      yield ctx.sayOk("#b(I can't rescue #p2092101# with all these pirates here.)");
      return;
    }
    if (!ctx.addItem(4032497, 1)) {
      yield ctx.sayNext('Please check if your inventory is full or not.');
      return;
    }
    yield ctx.sayOk("Thank you for rescuing me. Let's hurry and get back to town.");
    ctx.warp(251000000, 'east00');
  }
}

export function* enterPottery(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Herb Town : Red-Nose Pirate Den 3 (251010403) - in00 (-867, 77)
  if (ctx.hasQuestStarted(22408)) {
    ctx.warpInstance([925110000], 'out00', 251000000, 60 * 10);
  }
}
