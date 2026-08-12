import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { FieldEffectPacket } from '../../field/FieldEffectPacket';
import { Randomizer } from '../../../util/Randomizer';

const STAGE_1 = 922010100;
const STAGE_2 = 922010400;
const STAGE_3 = 922010600;
const STAGE_5 = 922010800;
const CLEAR = 922010900;
const RETURN_MAP = 221023300;

const PASS_ITEM = 2430115;
const PASS_REQUIRED = 20;

const WEATHER_HINT = 5120017;

export function* party2_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (ctx.getFieldId() === 221023300) {
    const answer: number = yield ctx.askMenu("#e<Party Quest: Dimensional Schism>#n\r\nYou can't go any higher because of the extremely dangerous creatures above. Would you like to collaborate with party members to complete the quest?", new Map([
      [0, 'I want to participate in the party quest.'],
      [1, 'I want to find party members.'],
      [2, 'I would like to hear more details.'],
    ]));
    if (answer === 0) {
      if (!ctx.getUser().isPartyBoss()) {
        yield ctx.sayOk('Please have your party leader speak to me.');
        return;
      }
      if (!ctx.getUser().checkParty(3, 120)) {
        yield ctx.sayOk('You cannot participate because you do not have at least 3 party members at Lv. 120 or higher.');
        return;
      }
      ctx.partyWarpInstance([STAGE_1, STAGE_2, STAGE_3, STAGE_5, CLEAR], 'st00', RETURN_MAP, 60 * 20);
    } else if (answer === 1) {
      ctx.broadcastMessage('Party search not available in this build.');
    } else if (answer === 2) {
      yield ctx.sayNext("#e<Party Quest: Dimensional Crack>#n\r\nA Dimensional Crack has appeared in Ludibrium! We desperately need brave adventurers who can defeat the monsters pouring through. You must pass through several stages by defeating monsters and solving quizzes, and ultimately defeat the boss.\r\n#e - Level:#n 120 or above\r\n#e - Time Limit:#n 20 min\r\n#e - Number of Participants:#n 3 to 6");
    }
  } else {
    if (yield ctx.askYesNo('Would you like to go to the Ludibrium Dimensional Crack entrance?')) {
      ctx.warp(RETURN_MAP);
    }
  }
}

export function* party2_play(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const fieldId = ctx.getFieldId();
  if (fieldId === STAGE_1) {
    const countStr = ctx.getInstanceVariable('stage1_passes');
    const count = parseInt(countStr) || 0;
    if (count >= PASS_REQUIRED) {
      yield ctx.sayOk('You have collected all the passes. Proceed to the next stage through the portal.');
    } else {
      yield ctx.sayOk(`Welcome! Please collect ${PASS_REQUIRED} Dimensional Passes from the monsters in this stage. Currently: ${count}/${PASS_REQUIRED}`);
    }
  } else if (fieldId === STAGE_2) {
    const cleared = ctx.getInstanceVariable('stage2_cleared');
    if (cleared === '1') {
      yield ctx.sayOk('You have defeated all the lurking monsters. Proceed to the next stage through the portal.');
    } else {
      yield ctx.sayOk('Defeat all the Dark Eyes and Shadow Eyes hiding in the dimensional cracks to proceed.');
    }
  } else if (fieldId === STAGE_3) {
    yield ctx.sayNext('The boxes contain hidden portals, try to get to the top!');
  } else if (fieldId === STAGE_5) {
    yield ctx.sayNext('Welcome to the 5th stage. 3 party members must stand on the correct platforms. The answer: 9*9+100-43 = ? Find the correct 3 positions and stand on them.');
  } else if (fieldId === CLEAR) {
    if (ctx.field.getMobPool().getCount() === 0) {
      if (yield ctx.askYesNo('You have successfully cleared the Ludibrium PQ, would you like to return?')) {
        ctx.warp(RETURN_MAP);
      }
    } else {
      yield ctx.sayOk('Defeat the remaining monsters first!');
    }
  }
}

export function* party2_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (yield ctx.askYesNo('Are you sure you want to leave your party behind and leave the quest?')) {
    ctx.warp(RETURN_MAP);
  }
}

export function* stage3_portal(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const orderStr = ctx.getInstanceVariable('stage3_order');
  let order: number[];
  if (!orderStr) {
    order = [3, 2, 1, 1, 3, 2, 3, 1, 2, 1];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    ctx.setInstanceVariable('stage3_order', order.join(''));
  } else {
    order = orderStr.split('').map(Number);
  }
  const stepStr = ctx.getInstanceVariable('stage3_step');
  let step = parseInt(stepStr) || 0;
  if (step >= 10) {
    ctx.setInstanceVariable('stage3_complete', '1');
    ctx.field.broadcastPacket(FieldEffectPacket.screen('quest/party/clear'));
    ctx.field.broadcastPacket(FieldEffectPacket.objectState('gate'));
    return;
  }
  const correct = order[step];
  const answer: number = yield ctx.askMenu('Which box?', new Map([
    [1, 'Box 1'],
    [2, 'Box 2'],
    [3, 'Box 3'],
  ]));
  if (answer === correct) {
    step++;
    ctx.setInstanceVariable('stage3_step', String(step));
    yield ctx.sayNext('Correct! Proceed to the next box.');
  } else {
    step = 0;
    ctx.setInstanceVariable('stage3_step', '0');
    yield ctx.sayNext('Wrong! Starting over from the beginning.');
  }
}

export function* party_ludimaze_goal(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (yield ctx.askYesNo('You done with the PQ?')) {
    ctx.warp(RETURN_MAP);
  }
}

export function* ludi_s1Clear(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const countStr = ctx.getInstanceVariable('stage1_passes');
  const count = parseInt(countStr) || 0;
  if (count >= PASS_REQUIRED) {
    ctx.warp(STAGE_2);
  } else {
    ctx.scriptProgressMessage(`Need ${PASS_REQUIRED - count} more Dimensional Passes`);
  }
}

export function* ludi_s2Clear(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const cleared = ctx.getInstanceVariable('stage2_cleared');
  if (cleared === '1') {
    ctx.warp(STAGE_3);
  } else {
    ctx.scriptProgressMessage('Defeat all monsters in the dimensional cracks first');
  }
}

export function* ludi_mapEnter_stage1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Collect 20 Dimensional Passes from the monsters to proceed!');
}

export function* ludi_mapEnter_stage2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Defeat the Dark Eyes and Shadow Eyes in each dimensional crack!');
}

export function* ludi_mapEnter_stage3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, 'Find the correct boxes to reach the top!');
}

export function* ludi_mapEnter_stage5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.field.blowWeather(WEATHER_HINT, '3 members must stand on the correct platforms! Answer: 9*9+100-43');
}
