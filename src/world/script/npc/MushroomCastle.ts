import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Util } from '../../../util/Util';
import { MobAppearType } from '../../field/mob/MobAppearType';

const MUSHROOM_CASTLE_OPENING = 2311; // QuestRecordType.MushroomCastleOpening
const MUSHROOM_CASTLE_INVESTIGATION = 2314; // QuestRecordType.MushroomCastleInvestigation
const MUSHROOM_CASTLE_INVESTIGATION2 = 2322; // QuestRecordType.MushroomCastleInvestigation2
const MUSHROOM_CASTLE_THORN_REMOVER = 2324; // QuestRecordType.MushroomCastleThornRemover
const MUSHROOM_CASTLE_PEPE = 2330; // QuestRecordType.MushroomCastlePepe

function enterThemeDungeon(ctx: ScriptContext): void {
  if (ctx.getQRValue(MUSHROOM_CASTLE_OPENING) === '1') {
    ctx.warp(106020000, 'left00'); // Mushroom Castle : Mushroom Forest Field
  } else {
    ctx.warp(106020001); // TD_MC_Openning
  }
}

export function* q2314s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Exploring Mushroom Forest (1) (2314 - start)
  if (!(yield ctx.askAccept('In order to rescue the princess, you must first investigate the Mushroom Forest. King Pepe has somehow set up a powerful barrier preventing anyone from entering the castle. Please investigate this matter for us right away.'))) {
    yield ctx.sayOk('Please do not give up on the Mushking Empire!');
    return;
  }
  ctx.forceStartQuest(2314);
  yield ctx.sayNext('You\'ll run into the barrier in the Mushroom Forest if you head over to the east from your current location. Please be careful, though. From what I\'ve heard, the area is infested with many atrocious monsters.');
}

export function* investigate1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Deep Inside Mushroom Forest (106020300)
  //   investigate1 (1112, -18)
  if (ctx.hasQuestStarted(2314) && ctx.getQRValue(MUSHROOM_CASTLE_INVESTIGATION) !== '1') {
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayNext('This looks to be a type of "Mushroom Spore" that has been transformed by magic into a strong defense barrier. It doesn\'t appear penetrable through physical force. Return to the #bSecretary of Domestic Affairs#k and report this matter.');
    ctx.setPlayerAsSpeaker(false);
    ctx.avatarOriented('Effect/OnUserEff.img/normalEffect/mushroomcastle/chatBalloon1');
    ctx.setQRValue(MUSHROOM_CASTLE_INVESTIGATION, '1');
    return;
  }
  if (ctx.hasItem(2430014) && !ctx.hasQuestCompleted(2338)) {
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayOk('It seems as if the barrier could be broken using a Killer Mushroom Spore.');
    ctx.setPlayerAsSpeaker(false);
  }
}

export function* q2314e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayOk('I see that you have thoroughly investigated the barrier in the Mushroom Forest. What was it like?');
  ctx.forceCompleteQuest(2314);
  ctx.addExp(1650);
  yield ctx.sayOk('So I see it wasn\'t an ordinary barrier by any means. Great work! If it weren\'t for your help, we wouldn\'t have had a clue.');
}

export function* q2322s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Over the Castle Walls (2) (2322 - start)
  if (!(yield ctx.askAccept('Like I told you, we can\'t be relieved just because the barrier has been broken. The castle of the Mushking Empire is impenetrable from the outside, so it won\'t be easy for you to enter. First, would you mind investigating the outer walls of the castle?'))) {
    yield ctx.sayOk('Oh, really? You think you have a better idea?! Come talk to me when you get stuck outside the Castle Walls.');
    return;
  }
  ctx.forceStartQuest(2322);
  yield ctx.sayNext('Head over to the castle from the #b#m106020400##k, past the Mushroom Forest. Good luck.');
}

export function* obstacle(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Deep Inside Mushroom Forest (106020300)
  //   obstacle (1313, -11)
  if (ctx.hasQuestCompleted(2338)) {
    ctx.playPortalSE();
    ctx.warp(106020400, 'left00');
  } else if (ctx.removeItem(4000507, 1)) {
    ctx.playPortalSE();
    ctx.warp(106020400, 'left00');
  } else {
    if (ctx.hasItem(2430014)) {
      ctx.message('You must remove the barrier by using the Killer Mushroom Spore first.');
    } else {
      ctx.message('The overgrown vines are blocking the way.');
    }
    ctx.scriptProgressMessage('You cannot move forward due to the barrier.');
  }
}

export function* killarmush(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Killer Mushroom Spore (2430014)
  if (ctx.getFieldId() !== 106020300) {
    yield ctx.sayOk('It doesn\'t look like there\'s anything to use the Killer Mushroom Spore on around here!');
    return;
  }
  const ptObstacle = ctx.field.getPortalByName('obstacle');
  if (!ptObstacle) {
    return;
  }
  const close = ctx.user.getX() >= (ptObstacle.x - 300); // 210 in Vertisy
  if (!close) {
    ctx.message('You must be closer in order to use the Killer Mushroom Spore.'); // Not GMS-like, unsure what this should say.
    return;
  }
  if (yield ctx.askAccept('#bDo you want to use the killer mushroom Spore?#k\r\n\r\n#r#e<Caution>\r\n#nNot for human consumption!\r\nIf ingested, seek medical attention immediately!')) {
    if (!ctx.removeItem(2430014, 1)) {
      return;
    }
    yield ctx.sayNext('Success! The barrier is broken!');
    ctx.scriptProgressMessage('Mushroom Forest Barrier Removal Complete 1/1');
    ctx.message('The Mushroom Forest Barrier has been removed and penetrated.');
    if (!ctx.hasQuestStarted(2338)) {
      ctx.forceStartQuest(2338);
    }
    ctx.forceCompleteQuest(2338); // Unsure if this is right, referenced Vertisy for this ID

    ctx.playPortalSE();
    ctx.warp(106020400, 'left00');
  }
}

export function* gotocastle(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Split Road of Destiny (106020400)
  //   right00 (1388, -24)
  const thorns = ctx.getQRValue(MUSHROOM_CASTLE_THORN_REMOVER) !== '1';
  ctx.playPortalSE();
  ctx.warp(thorns ? 106020500 : 106020501);
}

export function* investigate2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Castle Wall Edge (106020500)
  //   investigate2 (258, -14)
  //   investigate2-1 (258, -114)
  if (ctx.getQRValue(MUSHROOM_CASTLE_INVESTIGATION2) !== '1') {
    ctx.setNotCancellable(true);
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayNext('The colossal castle wall is covered with thorny vines. It\'s going to be difficult getting into the castle. For now, go report this to the #b#p1300003##k.');
    ctx.setPlayerAsSpeaker(false);
    ctx.setQRValue(MUSHROOM_CASTLE_INVESTIGATION2, '1');
    ctx.scriptProgressMessage('Castle Wall Investigation Completed 1/1');
  }
}

export function* removethorns(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Thorn Remover (2430015)
  if (ctx.getFieldId() !== 106020500) {
    yield ctx.sayOk('There\'s nothing to use the #bThorn Remover#k on around here.');
    return;
  }
  if (yield ctx.askAccept('Do you wish to use the #bThorn Remover#k?')) {
    if (!ctx.removeItem(2430015, 1)) {
      return;
    }
    ctx.setQRValue(MUSHROOM_CASTLE_THORN_REMOVER, '1');
    ctx.warp(106020502); // TD_MC_gasi
  }
}

export function* q2338s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Killer Mushroom Spores, Again (2338 - start)
  if (ctx.hasItem(2430014)) {
    yield ctx.sayOk('Just use the #bKiller Mushroom Spores#k I gave you.'); // Not GMS-like
    return;
  }
  yield ctx.sayOk('You need more Killer Mushroom Spores?'); // Not GMS-like
  ctx.forceStartQuest(2338);
}

export function* TD_MC_jump(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Shadow Cliffs (106020403)
  //   top00 (1174, -970)
  ctx.warp(106020600 + Util.getRandom(0, 1));
}

export function* TD_MC_faild(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : On the Watch (106020601)
  //   trap00 (-936, -139)
  ctx.reservedEffect('Effect/Direction2.img/mushCatle/nugu');
  ctx.message('You\'ve been spotted by the guard and will now be sent to the bottom of the cliff.');
  // As seen here: https://youtu.be/E-oFRZcYbF4?t=277
  // For some reason this effect has no field node, unless I used the wrong one.
  // TODO(#PORT_GAPS): ServerExecutor.schedule not ported - using setTimeout as approximation.
  setTimeout(() => {
    if (ctx.user.getField()?.getFieldId() === 106020601) {
      ctx.warp(106020403); // Mushroom Castle : Shadow Cliffs
    }
  }, 2000);
}

export function* go_secretroom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Skyscraper 3 (106021000)
  //   in00 (927, -97)
  if (ctx.hasQuestStarted(2335) && ctx.removeItem(4032405, 1)) {
    ctx.message('You used the Secret Key to enter.');
    ctx.warpInstance([106021001], 'out00', 106021000, 60 * 60);
    return;
  }
  ctx.message('You can\'t enter without the Secret Key.'); // Not GMS-like
}

export function* in_secretroom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Security Room (106021001 ~ 106021010)
  ctx.forceCompleteQuest(2335);
  ctx.message('Quest Complete: Eliminate the Minions');
  ctx.addExp(1200);
}

export function* find_james(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Central Castle Tower (106021201)
  //   find_james (-46, 96)
  if (!ctx.hasQuestCompleted(2325)) {
    ctx.avatarOriented('Effect/OnUserEff.img/normalEffect/mushroomcastle/chatBalloon2');
  }
}

export function* q2325e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // James's Whereabouts (1) (2325 - end)
  yield ctx.sayNext('H-h-help! I\'m so scared!');
  ctx.setNpcAction(1300008, 'out');
  yield ctx.sayBoth('What? My brother sent you here? Whew... I\'m safe now. Thank you so much.');
  ctx.forceCompleteQuest(2325);
  ctx.addExp(800);
}

export function* q2327s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // James's Whereabouts (3) (2327 - start)
  if (!(yield ctx.askYesNo('Okay, it\'s time to use the #b#t4001317##k that #b#h0##k brought me to escape. I\'ll escape first, so please watch my back, okay? Again, thank you so much! I\'ll be sure to tell my brother about you.'))) {
    return;
  }
  yield ctx.sayNext('Thank you so much. Let me put on this disguise before we start.');
  ctx.setNpcAction(1300008, 'hat');
  ctx.forceCompleteQuest(2327);
  ctx.addExp(800);
}

export function* TD_MC_keycheck(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : East Castle Tower (106021400)
}

export function* TD_MD_Bgate(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : The Last Castle Tower (106021402)
  //   left00 (-192, 140)
  ctx.playPortalSE();
  ctx.warp(106021401, 'right00');
}

export function* q2332s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Where's Violetta? (2332 - start)
  if (ctx.getFieldId() === 106021400) {
    ctx.forceStartQuest(2332);
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayNext('This is #b#t4032388##k! This will allow us to enter the #m106021600#, where #bPrincess #p1300002##k is imprisoned.');
    ctx.setPlayerAsSpeaker(false);
    ctx.scriptProgressMessage('Acquired the Wedding Hall Key 1/1');
  }
}

export function* TD_MC_Egate(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : East Castle Tower (106021400)
  //   left00 (-190, 141)
  ctx.playPortalSE();
  ctx.warp(106021300, 'right00');
}

export function* TD_MC_enterboss1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : East Castle Tower (106021400)
  //   TD_MC_enterboss1 (268, -699)
  ctx.setSpeakerId(1300012); // Door to East Castle Tower
  const choice = yield ctx.askMenu('You will be moved to the #b#m106021401##k. Where would you like to go?\r\n', new Map([
    [0, '1. Bringing Down King Pepe (Party: 1-6 / Level: 30 or higher)'],
    [1, '2. Saving Violetta (Solo only / Level: 30 or higher)'],
  ]));
  if (choice === 0) {
    if (ctx.getLevel() < 30) {
      yield ctx.sayOk('You must be in a party of 1-6 members at level 30 or higher to continue.');
      return;
    }
    if (!ctx.getUser().checkParty(1, 30)) {
      yield ctx.sayOk('You must be in a party and all members must be level 30 or higher.');
      return;
    }
    ctx.playPortalSE();
    ctx.partyWarpInstance([106021500], 'out01', 106021400, 10 * 60, { pepeVariant: String(Util.getRandom(0, 2)) });
  } else if (choice === 1) {
    if (!ctx.hasItem(4032388)) {
      yield ctx.sayOk('You cannot enter without the #t4032388#.');
      return;
    }
    ctx.playPortalSE();
    ctx.warp(106021401, 'out00');
  }
}

export function* TD_MC_bossEnter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Door to East Castle Tower (1300012)
  //   Mushroom Castle : East Castle Tower (106021400)
  yield* TD_MC_enterboss1(ctx);
}

export function* TD_MC_enterboss2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : The Last Castle Tower (106021402)
  //   right00 (255, 141)
  ctx.setSpeakerId(1300013);
  if (!ctx.hasItem(4032388) || !(yield ctx.askYesNo('You can enter the #m106021600# using the #t4032388#. Would you like to enter?'))) {
    return;
  }
  ctx.playPortalSE();
  ctx.warpInstance([106021600], 'left00', 106021402, 10 * 60); // Not GMS-like, would warp to "sp" instead.
}

export function* TD_MC_violetaEnter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Blocked Entrance (1300013)
  //   Mushroom Castle : The Last Castle Tower (106021402)
  yield* TD_MC_enterboss2(ctx);
}

export function* summon_pepeking(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Entrance to Wedding Hall (106021500 ~ 106021509)
  const variant = Number(ctx.getInstanceVariable('pepeVariant') || '0');
  ctx.spawnMob(3300005 + variant, 100, -100, MobAppearType.REGEN, true);
}

export function* out_pepeking(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Entrance to Wedding Hall (106021500)
  //   out01 (-487, -66)
  if (ctx.getQRValue(MUSHROOM_CASTLE_PEPE) === '001001001' && !ctx.hasItem(4032388)) {
    const mobPool = ctx.field.getMobPool();
    if (!mobPool.getBy((m) => m.getTemplateId() === 3300005)
        && !mobPool.getBy((m) => m.getTemplateId() === 3300006)
        && !mobPool.getBy((m) => m.getTemplateId() === 3300007)) {
      if (!ctx.addItem(4032388, 1)) {
        ctx.message('Please make room in your Etc inventory.'); // Unsure if GMS-like
        return;
      }
      ctx.message('You have acquired a key to the Wedding Hall. King Pepe must have dropped it.');
    }
  }
  ctx.playPortalSE();
  ctx.warp(106021400, 'TD_MC_enterboss1'); // Not GMS-like, portalName is QOL.
}

export function* findvioleta(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Wedding Hall (106021600 ~ 106021609)
  if (ctx.hasQuestStarted(2332)) {
    ctx.forceCompleteQuest(2332);
    ctx.addExp(800);
    ctx.scriptProgressMessage('<Where is Violetta?> Quest Complete 1/1');
  }
}

export function* q2333s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Story of Betrayal (2333 - start)
  if (ctx.getInstanceVariable('spawnedPM') === '1') {
    ctx.setFlipSpeaker(true);
    yield ctx.sayOk('#bThe #o3300008#! Please defeat the #o3300008#!');
    ctx.setFlipSpeaker(false);
    ctx.forceStartQuest(2333);
  } else {
    ctx.setFlipSpeaker(true);
    yield ctx.sayNext('Ah, you\'re the brave hero that has come to save me, #b#h0##k! I knew you\'d come! *Sniff sniff*');
    ctx.setFlipSpeaker(false);
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('Are you alright, Princess?');
    ctx.setPlayerAsSpeaker(false);
    ctx.setFlipSpeaker(true);
    yield ctx.sayBoth('Yes, I\'m fine. But my father... how is my father? Is he alright?');
    ctx.setFlipSpeaker(false);
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('Yes, #b#p1300000##k is in a safe place outside the castle with his ministers.');
    ctx.setPlayerAsSpeaker(false);
    ctx.setSpeakerId(1300001);
    ctx.setSpeakerOnRight(true);
    yield ctx.sayBoth('How dare you step foot in here! You\'re terribly mistaken if you think this is how it ends!');
    ctx.setSpeakerOnRight(false);
    ctx.setSpeakerId(1300002);
    ctx.setFlipSpeaker(true);
    yield ctx.sayBoth('Watch out! It\'s dangerous. He\'s trying to summon the one who\'s behind all of this!');
    ctx.setFlipSpeaker(false);
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('The one who\'s behind all of this? Are you saying there is someone else that\'s responsible for this?');
    ctx.setPlayerAsSpeaker(false);
    ctx.setSpeakerId(1300001);
    ctx.setSpeakerOnRight(true);
    yield ctx.sayBoth('Silence! He\'ll be here soon!');
    ctx.setSpeakerOnRight(false);
    ctx.setSpeakerId(1300002);
    ctx.setFlipSpeaker(true);
    yield ctx.sayBoth('#bThe #o3300008#! Please defeat the #o3300008#!');
    ctx.setFlipSpeaker(false);
    ctx.setInstanceVariable('spawnedPM', '1');
    ctx.spawnMob(3300008, 215, 142, 23, true);
    ctx.forceStartQuest(2333);
    ctx.scriptProgressMessage('New Mission! Defeat the Prime Minister!');
  }
}

export function* q2333e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Story of Betrayal (2333 - end)
  if (!ctx.canAddItem(4032386, 1)) {
    ctx.setFlipSpeaker(true);
    yield ctx.sayOk('Please have at least 1 slot empty in your Etc window.');
    ctx.setFlipSpeaker(false);
    return;
  }
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext('You did it, #b#h0##k! I don\'t know how to thank you.');
  ctx.setFlipSpeaker(false);
  ctx.setSpeakerId(1300001);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth('No way! Even the #o3300008#?!');
  ctx.setSpeakerOnRight(false);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#b#p1300001##k! This is where your foolhardy dreams end! I will spare your life, but you must head back to where you came from. Go back to #bIce Land#k at once!');
  yield ctx.sayBoth('Wait! Before you go, I must get something that can serve as evidence that I defeated you in a battle.');
  ctx.setPlayerAsSpeaker(false);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth('Grrrr...');
  ctx.setSpeakerOnRight(false);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Give me your crown! Princess, please take the crown.');
  ctx.setPlayerAsSpeaker(false);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth('You mark my words. This isn\'t over between us!');
  ctx.setSpeakerOnRight(false);
  ctx.forceCompleteQuest(2333);
  // ctx.addItem(4032386, 1); // You get both items afterwards
  ctx.addExp(3000);
  ctx.warp(106021700);
}

export function* q2334s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Identity of the Princess (2334 - start)
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext('Thank you so much, #b#h0##k. You are the hero that has saved our empire from danger. I\'m so grateful for what you\'ve done, I don\'t know how to thank you. And please understand why I can\'t show you my face.');
  yield ctx.sayBoth('It\'s humiliating to say this, but ever since I was a baby, my family has kept my face veiled from the world. They feared of men falling hopelessly in love with me. I\'ve grown so accustomed to it that I even shy away from women. I know, it\'s rude of me to have my back turned against the hero, but I\'ll need some time to muster my courage before I can greet you face to face.');
  ctx.setFlipSpeaker(false);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('I see...\r\n#b(Wow, how pretty could she be?)');
  ctx.setPlayerAsSpeaker(false);

  ctx.forceCompleteQuest(2334);
  ctx.addExp(1000);
  ctx.setNpcAction(1300002, 'face');

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#b(What the--)');
  yield ctx.sayBoth('#b(Is that what\'s considered pretty in the world of mushrooms?!)');
  ctx.setPlayerAsSpeaker(false);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth('I\'m so shy, I\'m blushing. Anyways, thank you, #b#h0##k.');
  ctx.setFlipSpeaker(false);
}

export function* q2335s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Eliminating the Rest (2335 - start)
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext('This is not the end, #b#h0##k. Minions of the #b#o3300008##k can still be found scattered throughout the castle.');
  const accepted = yield ctx.askAccept('From what I\'ve heard, there is a place near #b#m106021000##k where a group of the #o3300008#\'s minions can be found. I\'ve picked up a key that the #o3300008# has dropped the other day. Here, use this key.');
  if (accepted) {
    if (!ctx.addItem(4032405, 1)) {
      yield ctx.sayOk('Please have at least 1 slot empty in your Etc window.');
      ctx.setFlipSpeaker(false);
      return;
    }
    ctx.forceStartQuest(2335);
    yield ctx.sayNext('For one last time, good luck.');
  }
  ctx.setFlipSpeaker(false);
}

export function* pepeking_effect(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Entrance to Wedding Hall (106021500 ~ 106021509)
  const variant = Number(ctx.getInstanceVariable('pepeVariant') || '0');
  const which = variant === 2 ? 'W' : (variant === 1 ? 'G' : 'B');
  ctx.screenEffect('pepeKing/frame/W');
  ctx.screenEffect(`pepeKing/pepe/pepe${which}`);
  ctx.screenEffect('pepeKing/frame/B');
  ctx.screenEffect('pepeKing/chat/nugu');
}

export function* TD_MC_first(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Singing Mushroom Forest : Ghost Mushroom Forest (100020400)
  //   TD00 (-1094, 214)
  if (ctx.getLevel() < 30) { // TODO : maybe prevent entering without the quest?
    ctx.message('A strange force is blocking you from entering.');
  } else {
    ctx.playPortalSE();
    enterThemeDungeon(ctx);
  }
}

export function* TD_MC_title(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Mushroom Forest Field (106020000)
  ctx.screenEffect('temaD/enter/mushCatle');
}

export function* TD_MC_Openning(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (106020001)
  ctx.setQRValue(MUSHROOM_CASTLE_OPENING, '1');
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect('Effect/Direction2.img/open/back0');
  ctx.reservedEffect('Effect/Direction2.img/open/back1');
  ctx.reservedEffect('Effect/Direction2.img/open/light');
  ctx.reservedEffect('Effect/Direction2.img/open/pepeKing');
  ctx.reservedEffect('Effect/Direction2.img/open/line');
  ctx.reservedEffect('Effect/Direction2.img/open/violeta0');
  ctx.reservedEffect('Effect/Direction2.img/open/violeta1');
  ctx.reservedEffect('Effect/Direction2.img/open/frame');
  ctx.reservedEffect('Effect/Direction2.img/open/chat');
  ctx.reservedEffect('Effect/Direction2.img/open/out');
  ctx.setDirectionMode(false, 13000);
}

export function* TD_MC_gasi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (106020502)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi1');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi2');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi22');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi3');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi4');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi5');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi6');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi7');
  ctx.reservedEffect('Effect/Direction2.img/gasi/gasi8');
  ctx.setDirectionMode(false, 9000);
}

export function* TD_MC_gasi2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Mushroom Castle : Castle Wall Edge (106020501)
}
