import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { FieldEffectPacket } from '../../field/FieldEffectPacket';
import { Util } from '../../../util/Util';
import * as UnityPortal from './UnityPortal';

const EXIT = 910340000;
const STAGE_1 = 910340100;
const STAGE_2 = 910340200;
const STAGE_3 = 910340300;
const STAGE_4 = 910340400;
const STAGE_5 = 910340500;
const BONUS = 910340600;

const COUPON = 4001007;

const WEATHER_HINT = 5120017;

/** Util.isInteger is not in the TS Util subset; small local helper. */
function isInteger(s: string): boolean {
  return /^-?\d+$/.test(s);
}

/** Broadcast a screen+sound pair to the whole field (port of broadcastScreenEffect/broadcastSoundEffect). */
function broadcastScreenSound(ctx: ScriptContext, screen: string, sound: string): void {
  ctx.field.broadcastPacket(FieldEffectPacket.screen(screen));
  ctx.field.broadcastPacket(FieldEffectPacket.sound(sound));
}

/** FieldEffectPacket.objectState("gate") broadcasts an object-state change
 *  used by Kerning PQ stages to trigger the gate-opening visual effect. */
function setObjectStateGate(ctx: ScriptContext): void {
  ctx.field.broadcastPacket(FieldEffectPacket.objectState('gate'));
}

/** ScriptManagerImpl::getAreaCheck ported via ScriptContext.getAreaCheck(). */
function getAreaCheck(ctx: ScriptContext): string {
  return ctx.getAreaCheck();
}

/** Returns true if the field contains a mob with the given template id. */
function hasMob(ctx: ScriptContext, templateId: number): boolean {
  return ctx.field.getMobPool().getBy((m) => m.getTemplateId() === templateId) !== undefined;
}

export function* party_exit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : First Time Together Lobby (910340700) - out00 (-259, 158)
  yield* UnityPortal.returnPortal(ctx, 103000000, null); // Kerning City : Kerning City
}

export function* party_portal(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : First Time Together <1st Stage> (910340100) - next000 (716, 106)
  // Hidden Street : First Time Together <2nd Stage> (910340200) - next000 (-218, 91)
  // Hidden Street : First Time Together <3rd Stage> (910340300) - next000 (1331, -122)
  // Hidden Street : First Time Together <4th Stage> (910340400) - next000 (1655, 118)
  const fieldId = ctx.getFieldId();
  let gateKey: string | null = null;
  let nextStage: number | null = null;
  switch (fieldId) {
    case STAGE_1: gateKey = 'stage1_gate'; nextStage = STAGE_2; break;
    case STAGE_2: gateKey = 'stage2_gate'; nextStage = STAGE_3; break;
    case STAGE_3: gateKey = 'stage3_gate'; nextStage = STAGE_4; break;
    case STAGE_4: gateKey = 'stage4_gate'; nextStage = STAGE_5; break;
    default: return; // Not a gated stage.
  }
  if (ctx.getInstanceVariable(gateKey) === '1') {
    ctx.warp(nextStage, 'st00');
  }
}

// Ported from kinoko's KerningPQ.party1_enter (Lakelis). Party system landed in
// Batch 9, so the isPartyBoss / checkParty gating and partyWarpInstance entry are
// now in place. (Note: kinoko erroneously checks field 100000200 here where the NPC
// is in 103000000; the TS keeps the GMS-correct Kerning City field.)
export function* party1_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Lakelis (9020000)
  //   Kerning City : Kerning City (103000000)
  //   Hidden Street : First Time Together Lobby (910340700)
  if (ctx.getFieldId() === 103000000) {
    // Kerning City : Kerning City
    if (yield ctx.askYesNo('Would you like to move to First Time Toegether Lobby?')) {
      ctx.setQRValue(7050, ''); // QuestRecordType.UnityPortal
      ctx.warp(910340700); // Hidden Street : First Time Together Lobby
    }
  } else if (ctx.getFieldId() === 910340700) {
    const answer: number = yield ctx.askMenu("#e<Party Quest: First Time Together>#n\r\nInside, you'll find many obstacles that can only be solved by working with a party. Interested? Then have you #bParty Leader#k talk to me.", new Map([
      [0, 'I want to do the Party Quest'],
      [1, 'I want to hear the details'],
    ]));
    if (answer === 0) {
      if (!ctx.getUser().isPartyBoss()) {
        yield ctx.sayOk("If you'd like to enter here, the leader of your party will have to talk to me. Talk to your party leader about this.");
        return;
      }
      if (!ctx.getUser().checkParty(3, 20)) {
        yield ctx.sayOk("You cannot enter because your party doesn't have 3 members. You need 3 party members at Lv. 20 or higher to enter, so double-check and talk to me again.");
        return;
      }
      ctx.removeItem(COUPON);
      ctx.partyWarpInstance([STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5, BONUS], 'st00', EXIT, 60 * 30);
    } else if (answer === 1) {
      yield ctx.sayOk("I'm waiting for brave adventurers. Please work together, share your strengths and wisdom to solve the challenges, and defeat the vicious #rKing Slime#k! King Slime will appear when you complete the challenges. You will need to find the right location and collect Passes corresponding to the answer to the quiz.\r\n\r\n#e - Level:#n 20 or above #r(Recommended Level: 20 - 29)#k\r\n#e - Time Limit:#n 30 min.\r\n#e - Players:#n 3 - 4\r\n#e - Reward:#n #v1072369# #t1072369# #b(Dropped by King Slime)#k\r\nVarious Use, Etc, and Equip items");
    }
  }
}

// Ported from kinoko's KerningPQ.party1_play (Cloto). Stage 1's full coupon-collection
// flow is ported. Stages 2 & 3 are ported up to the getAreaCheck dependency (stubbed —
// see getAreaCheck). Stages 4 & 5 mirror kinoko, whose dialog text is itself a TODO —
// only the structural gate/clear logic is implemented with placeholder dialog.
export function* party1_play(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Cloto (9020001)
  //   Hidden Street : First Time Together <1st Stage> (103000800 / 910340100 / 910340101)
  //   Hidden Street : First Time Together <2nd Stage> (103000801 / 910340200 / 910340201)
  //   Hidden Street : First Time Together <3rd Stage> (103000802 / 910340300 / 910340301)
  //   Hidden Street : First Time Together <4th Stage> (103000803 / 910340400 / 910340401)
  //   Hidden Street : First Time Together <Last Stage> (103000804 / 910340500 / 910340501)
  const user = ctx.getUser();
  const fieldId = ctx.getFieldId();
  switch (fieldId) {
    case STAGE_1: {
      if (ctx.getInstanceVariable('stage1_gate') === '1') {
        return;
      }
      const requiredPassCount = Math.max(ctx.getInstanceUserCount() - 1, 2);
      if (user.isPartyBoss()) {
        // Introduction (shown once).
        if (ctx.getInstanceVariable('stage1_intro') !== '1') {
          ctx.setInstanceVariable('stage1_intro', '1');
          yield ctx.sayNext("Hello and welcome to the first stage. As you can see, this place is full of Ligators. Each Ligator will drop one #bcoupon#k when defeated. Each party member, except the party leader, must come talk to me and then bring me the exact number of #bcoupons#k that I ask for. Once everyone #bcompletes their individual missions#k, the party can move on to the next stage. Good luck!");
          return;
        }
        // Check pass count.
        const count = ctx.getInstanceVariable('stage1_count');
        const passCount = isInteger(count) ? parseInt(count, 10) : 0;
        if (passCount < requiredPassCount) {
          yield ctx.sayNext("I'm sorry, but at least one party member still hasn't completed their mission. Everyone except the party leader must clear their mission to move on.");
          return;
        }
        // Stage clear.
        ctx.addExpAll(100);
        ctx.setInstanceVariable('stage1_gate', '1');
        setObjectStateGate(ctx);
        yield ctx.sayNext("Congratulations on clearing this stage! I will create a portal that will lead you to the next one. You're on a time limit, so please hurry! Good luck!");
      } else {
        // Introduction (per-member).
        const mission = ctx.getInstanceVariable(user.getCharacterName());
        if (mission === 'clear') {
          yield ctx.sayNext("You've completed the mission! Please help other party members who may have not completed the mission yet.");
          return;
        }
        if (!isInteger(mission)) {
          const coupons = Util.getRandom(5, 20);
          yield ctx.sayNext('First, you must complete the mission I give. Once you complete the mission, you will receive a Pass, which will allow you to pass through.');
          ctx.setInstanceVariable(user.getCharacterName(), String(coupons));
          yield ctx.sayBoth(`Your mission is to collect #r${coupons} Coupons#k. You can obtain the coupons by defeating the #rLigators#k found here.`);
          return;
        }
        // Check coupon count.
        const couponCount = parseInt(mission, 10);
        if (ctx.getItemCount(COUPON) !== couponCount || !ctx.removeItem(COUPON, couponCount)) {
          yield ctx.sayNext(`I'm sorry, but that is not the right number of coupons. Your mission is to collect #r${couponCount} Coupons#k. You can obtain the coupons by defeating the #rLigators#k found here.`);
          return;
        }
        ctx.setInstanceVariable(user.getCharacterName(), 'clear');
        // Increment pass count.
        const count = ctx.getInstanceVariable('stage1_count');
        const passCount = (isInteger(count) ? parseInt(count, 10) : 0) + 1;
        ctx.setInstanceVariable('stage1_count', String(passCount));
        if (passCount < requiredPassCount) {
          ctx.scriptProgressMessage(`You've collected ${passCount} passes.`);
          yield ctx.sayNext("You've completed the mission! Please help other party members who may have not completed the mission yet.");
          return;
        }
        // All individual missions cleared -> notify.
        ctx.field.blowWeather(WEATHER_HINT, 'All individual missions have been cleared. The Party Leader should come talk to me.');
        broadcastScreenSound(ctx, 'quest/party/clear', 'Party1/Clear');
        yield ctx.sayNext("You've completed the mission! Please tell your party leader to come talk to me to proceed.");
      }
      break;
    }
    case STAGE_2: {
      if (ctx.getInstanceVariable('stage2_gate') === '1' || !user.isPartyBoss()) {
        return;
      }
      const answer = ctx.getInstanceVariable('stage2_answer');
      if (answer === '') {
        // Random combination of 3 correct ropes out of 4.
        const list = ['1', '1', '1', '0'];
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }
        ctx.setInstanceVariable('stage2_answer', list.join(''));
        yield ctx.sayNext("Hi. Welcome to the 2nd Stage. Next to me, you'll see a number of ropes. Out of these ropes, #b3 are connected to the portal that sends you to the next stage#k. All you need to do is have #b3 party members to find the answer ropes and hang on them#k. BUT, it doesn't count as an answer if you hang on the rope too low; please bring yourself up enough to be counted as a correct answer. Also, only 3 members of your party are allowed on the ropes. Once they are hanging on, the leader of the party must #bdouble-click me to check and see if the answer's correct or not#k. Now, find the right ropes to hang on!");
        return;
      }
      if (answer !== getAreaCheck(ctx)) {
        broadcastScreenSound(ctx, 'quest/party/wrong_kor', 'Party1/Failed');
        return;
      }
      ctx.setInstanceVariable('stage2_gate', '1');
      broadcastScreenSound(ctx, 'quest/party/clear', 'Party1/Clear');
      setObjectStateGate(ctx);
      break;
    }
    case STAGE_3: {
      if (ctx.getInstanceVariable('stage3_gate') === '1' || !user.isPartyBoss()) {
        return;
      }
      const answer = ctx.getInstanceVariable('stage3_answer');
      if (answer === '') {
        // Random combination of 3 correct platforms out of 5.
        const list = ['1', '1', '1', '0', '0'];
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }
        ctx.setInstanceVariable('stage3_answer', list.join(''));
        yield ctx.sayNext("Hello. Welcome to the 3rd stage. Next to you you'll see barrels with kittens inside on top of the platforms. Out of these platforms, #b3 of them lead to the portals for the next stage. 3 of the party members need to find the correct platform to step on and clear the stage#k.\r\nBUT, you need to stand firm right at the center of it, not standing on the edge, in order to be counted as a correct answer, so make sure to remember that. Also, only 3 members of your party are allowed on the platforms. Once the members are on them, the leader of the party must #bdouble-click me to check and see if the answer's right or not#k. Now, find the correct platforms~!");
        yield ctx.sayBoth("If there aren't enough people to stand on the platforms, purchase a #t4001454# #v4001454# from #p9020002# and place it on the correct platform. The platform will mistake #t4001454# for a character. Nifty, huh?");
        return;
      }
      const current = getAreaCheck(ctx);
      if (answer !== current) {
        let count = 0;
        for (let i = 0; i < answer.length && i < current.length; i++) {
          if (answer.charAt(i) === current.charAt(i)) {
            count++;
          }
        }
        ctx.broadcastMessage(`Currently, you've selected ${count} answer platforms`);
        ctx.scriptProgressMessage(`Currently, you've selected ${count} answer platforms`);
        broadcastScreenSound(ctx, 'quest/party/wrong_kor', 'Party1/Failed');
        return;
      }
      ctx.setInstanceVariable('stage3_gate', '1');
      broadcastScreenSound(ctx, 'quest/party/clear', 'Party1/Clear');
      setObjectStateGate(ctx);
      break;
    }
    case STAGE_4: {
      if (ctx.getInstanceVariable('stage4_gate') === '1' || !user.isPartyBoss()) {
        return;
      }
      // Introduction (shown once). Dialog text not provided by kinoko (TODO there).
      if (ctx.getInstanceVariable('stage4_intro') !== '1') {
        yield ctx.sayNext('Welcome to the 4th Stage. Eliminate the #rCurse Eyes#k that appear here to clear the stage.');
        ctx.setInstanceVariable('stage4_intro', '1');
        return;
      }
      // Check if the Curse Eyes are still alive (template id 9300002).
      if (hasMob(ctx, 9300002)) {
        yield ctx.sayNext('The monsters are still alive. Eliminate all the #rCurse Eyes#k first!');
        return;
      }
      // Stage clear.
      yield ctx.sayNext('Congratulations on clearing this stage! I will create a portal that will lead you to the next one. You\'re on a time limit, so please hurry! Good luck!');
      ctx.addExpAll(100);
      ctx.setInstanceVariable('stage4_gate', '1');
      setObjectStateGate(ctx);
      break;
    }
    case STAGE_5: {
      if (ctx.getInstanceVariable('stage5_gate') === '1' || !user.isPartyBoss()) {
        return;
      }
      // Introduction (shown once). Dialog text not provided by kinoko (TODO there).
      if (ctx.getInstanceVariable('stage5_intro') !== '1') {
        yield ctx.sayNext('Welcome to the Last Stage. Defeat the #rKing Slime#k to clear the stage!');
        ctx.setInstanceVariable('stage5_intro', '1');
        return;
      }
      // Check if King Slime is still alive (template id 9300003).
      if (hasMob(ctx, 9300003)) {
        yield ctx.sayNext('The #rKing Slime#k is still alive. Defeat him to clear the stage!');
        return;
      }
      // Stage clear.
      yield ctx.sayNext('Congratulations on clearing this stage! You have completed the Party Quest!');
      ctx.addExpAll(100);
      ctx.setInstanceVariable('stage5_gate', '1');
      setObjectStateGate(ctx);
      break;
    }
  }
}

// Nella (9020002). kinoko's party1_out is itself a TODO stub (`sm.sayNext("TODO")`).
// The TS provides a functional exit-warp dialog instead, which is more useful for
// players wanting to leave an instance stage.
export function* party1_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : First Time Together <1st Stage..Last Stage / Bonus / Exit> (multiple)
  const answer: number = yield ctx.askMenu('Would you like to leave this place?', new Map([
    [0, 'Yes. I would like to leave this place.'],
  ]));
  if (answer === 0) {
    ctx.warp(EXIT, 'st00');
  }
}

// Ported from kinoko's KerningPQ.StageMsg_together. Per-stage weather hints now
// match kinoko. The forced mob respawn in stages 4/5 (kinoko's respawnMobs(Instant.MAX))
// is not modeled by the TS MobPool.tryRespawn API, so it is noted but skipped.
export function* StageMsg_together(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Map entry script for King Slime PQ stages.
  switch (ctx.getFieldId()) {
    case STAGE_1:
      ctx.field.blowWeather(WEATHER_HINT, 'Everyone! Talk to Cloto, and defeat Ligators to find the coupons Cloto wants!.');
      break;
    case STAGE_2:
      ctx.field.blowWeather(WEATHER_HINT, 'Find 3 ropes that can open the door to the next stage, then grab onto them!.');
      break;
    case STAGE_3:
      ctx.field.blowWeather(WEATHER_HINT, 'Find the 3 Platforms that can open the door to the next stage.');
      break;
    case STAGE_4:
      ctx.field.setMobSpawn(false);
      ctx.field.getMobPool().respawnMobs();
      ctx.field.blowWeather(WEATHER_HINT, 'Eliminate the vicious Curse Eyes!');
      break;
    case STAGE_5:
      ctx.field.setMobSpawn(false);
      ctx.field.getMobPool().respawnMobs();
      ctx.field.blowWeather(WEATHER_HINT, 'Defeat King Slime!');
      break;
  }
}