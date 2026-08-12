import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { FieldEffectPacket } from '../../field/FieldEffectPacket';

const ENTRANCE = 251010404;
const STAGE_1 = 925100000;
const STAGE_2 = 925100100;
const STAGE_3 = 925100200;
const STAGE_4 = 925100300;
const STAGE_5 = 925100400;
const BOSS = 925100500;

const OLD_METAL_KEY = 4001117;
const ROOKIE_MARK = 4001120;
const RISING_MARK = 4001121;
const VETERAN_MARK = 4001122;
const MARK_COUNT = 5;

const CAPTAIN_DAVY_JOHN = 9300119;

export function* davyJohn_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getFieldId() === ENTRANCE) {
    if (!ctx.getUser().isPartyBoss()) {
      yield ctx.sayOk('Please have your party leader speak to me.');
      return;
    }
    if (!ctx.getUser().checkParty(3, 60)) {
      yield ctx.sayOk('You need at least 3 party members at Lv. 60 or higher to enter.');
      return;
    }
    for (const item of [OLD_METAL_KEY, ROOKIE_MARK, RISING_MARK, VETERAN_MARK]) {
      const qty = ctx.getItemCount(item);
      if (qty > 0) ctx.removeItem(item, qty);
    }
    ctx.partyWarpInstance([STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5, BOSS], 'st00', ENTRANCE, 60 * 30);
  } else {
    if (yield ctx.askYesNo('Do you want to help me fight Lord Pirate?')) {
      ctx.warp(ENTRANCE);
    }
  }
}

export function* davyJohn_play(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const fieldId = ctx.getFieldId();
  if (fieldId === STAGE_2) {
    if (!ctx.getUser().isPartyBoss()) {
      yield ctx.sayOk('Please have your party leader speak with me.');
      return;
    }
    const stage3 = ctx.getInstanceVariable('3');
    if (stage3 === '1') {
      yield ctx.sayOk('Please proceed to the next stage.');
      return;
    }
    const stage2 = ctx.getInstanceVariable('2');
    if (stage2 === '1') {
      const vet = ctx.getItemCount(VETERAN_MARK);
      if (vet >= MARK_COUNT) {
        ctx.setInstanceVariable('3', '1');
        ctx.removeItem(VETERAN_MARK, MARK_COUNT);
        yield ctx.sayOk('Please proceed to the next stage.');
      } else {
        yield ctx.sayOk(`Please bring me ${MARK_COUNT} Veteran Pirate Marks. (${vet}/${MARK_COUNT})`);
      }
    } else {
      const stage1 = ctx.getInstanceVariable('1');
      if (stage1 === '1') {
        const rising = ctx.getItemCount(RISING_MARK);
        if (rising >= MARK_COUNT) {
          ctx.setInstanceVariable('2', '1');
          ctx.removeItem(RISING_MARK, MARK_COUNT);
          yield ctx.sayNext(`Great job! Now I require ${MARK_COUNT} Veteran Pirate Marks.`);
        } else {
          yield ctx.sayOk(`Please bring me ${MARK_COUNT} Rising Pirate Marks. (${rising}/${MARK_COUNT})`);
        }
      } else {
        const rookie = ctx.getItemCount(ROOKIE_MARK);
        if (rookie >= MARK_COUNT) {
          ctx.setInstanceVariable('1', '1');
          ctx.removeItem(ROOKIE_MARK, MARK_COUNT);
          yield ctx.sayNext(`Great job! Now I require ${MARK_COUNT} Rising Pirate Marks.`);
        } else {
          yield ctx.sayOk(`Please bring me ${MARK_COUNT} Rookie Pirate Marks. (${rookie}/${MARK_COUNT})`);
        }
      }
    }
  } else if (fieldId === BOSS) {
    if (ctx.field.getMobPool().getCount() > 0) {
      yield ctx.sayOk('Please eliminate all the monsters first!');
      return;
    }
    if (!ctx.getUser().isPartyBoss()) {
      yield ctx.sayOk('Please have your party leader speak with me.');
      return;
    }
    if (yield ctx.askYesNo('You have done us a great favour! Allow me to help you on your way out.')) {
      ctx.addExpAll(80000);
      ctx.warp(ENTRANCE);
    }
  } else {
    if (yield ctx.askYesNo('Would you like to leave?')) {
      ctx.warp(ENTRANCE);
    }
  }
}

export function* davy_next0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('davyjohn_stage1');
  const count = parseInt(countStr) || 0;
  if (count >= 7 && ctx.field.getMobPool().getCount() === 0) {
    ctx.warp(STAGE_2);
  } else {
    ctx.scriptProgressMessage('Open more chests and defeat the monsters!');
  }
}

export function* davy_next1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getInstanceVariable('3') === '1') {
    ctx.warp(STAGE_3);
  } else {
    ctx.scriptProgressMessage('Complete the mark collection first!');
  }
}

export function* davy_next2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('davyjohn_stage3');
  const count = parseInt(countStr) || 0;
  if (count >= 8 && ctx.field.getMobPool().getCount() === 0) {
    ctx.warp(STAGE_4);
  } else {
    ctx.scriptProgressMessage('Open more chests and defeat the monsters!');
  }
}

export function* davy_next3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('davyjohn_stage3');
  const count = parseInt(countStr) || 0;
  if (count >= 8 && ctx.field.getMobPool().getCount() === 0) {
    ctx.warp(STAGE_5);
  } else {
    ctx.scriptProgressMessage('Open more chests and defeat the monsters!');
  }
}

export function* davy_next4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('davyjohn_stage4');
  const count = parseInt(countStr) || 0;
  if (count >= 4) {
    ctx.warp(BOSS);
  } else {
    ctx.scriptProgressMessage('Use Old Metal Keys on the doors!');
  }
}

export function* davy_chest_mob0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('davyjohn_stage1');
  const count = (parseInt(countStr) || 0) + 1;
  ctx.setInstanceVariable('davyjohn_stage1', String(count));
  const user = ctx.getUser();
  ctx.spawnMob(9300109, user.getX(), user.getY());
  ctx.spawnMob(9300110, user.getX(), user.getY());
  yield ctx.sayNext('Monsters have been released from the chest!');
}

export function* davy_chest_mob1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('davyjohn_stage3');
  const count = (parseInt(countStr) || 0) + 1;
  ctx.setInstanceVariable('davyjohn_stage3', String(count));
  const user = ctx.getUser();
  ctx.spawnMob(9300115, user.getX(), user.getY());
  ctx.spawnMob(9300116, user.getX(), user.getY());
  yield ctx.sayNext('Monsters have been released from the chest!');
}

export function* davy_door(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getItemCount(OLD_METAL_KEY) === 0) {
    yield ctx.sayOk('You need an Old Metal Key to lock this door.');
    return;
  }
  ctx.removeItem(OLD_METAL_KEY);
  const countStr = ctx.getInstanceVariable('davyjohn_stage4');
  const count = (parseInt(countStr) || 0) + 1;
  ctx.setInstanceVariable('davyjohn_stage4', String(count));
  yield ctx.sayNext('Door locked!');
}

export function* achieve_davy(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getFieldId() === BOSS && ctx.field.getMobPool().getBy(m => m.getTemplateId() === CAPTAIN_DAVY_JOHN) === undefined) {
    ctx.spawnMob(CAPTAIN_DAVY_JOHN, 566, 238);
  }
}
