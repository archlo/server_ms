import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const JUN = 2159000, ULRIKA = 2159001, VON = 2159002;
const VITA = 2159006, VITA_FREE = 2159007, J = 2159010;
const SCHILLER = 2159008, GELIMER = 2159012;

const MAP_HIDESEEK = 931000001, MAP_LAB1 = 931000010, MAP_LAB2 = 931000011, MAP_LAB4 = 931000013;
const MAP_ESCAPE1 = 931000020, MAP_ESCAPE2 = 931000021;
const EDELSTEIN = 310000000;

const RESISTANCE_HIDE_SEEK = 23007; // QuestRecordType.ResistanceHideSeek
const EDELSTEIN_UNLOCK_TOWN_QUESTS = 23977; // QuestRecordType.EdelsteinUnlockTownQuests
const RESISTANCE_CHECKY_FLIER = 23006; // QuestRecordType.ResistanceCheckyFlier

export function* talk2159000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Jun (2159000)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000000)
  ctx.setSpeakerId(JUN);
  yield ctx.sayNext("I'm glad you made it. Safety in numbers, right? I feel like we're being watched... Shouldn't we think about heading back? The grown-ups in town say the mines aren't safe...");
  ctx.setSpeakerId(VON);
  yield ctx.sayNext("Sheesh, why are you such a scaredy cat? We've come all this way! We should at least do something before we go back.");
}

export function* talk2159001(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ulrika (2159001)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000000)
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext("There you are, #h0#! You're late. Get over here.");
  ctx.setFlipSpeaker(false);

  ctx.setSpeakerId(VON);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("What was the hold up? You scared or something?");
  ctx.setSpeakerOnRight(false);

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("Don't be ridiculous.");
  ctx.setPlayerAsSpeaker(false);

  ctx.setSpeakerOnRight(true);
  ctx.setSpeakerId(JUN);
  yield ctx.sayBoth("You're not s-s-scared at all? I am, a little b-b-bit... The grown-ups warned us never to venture into the #bVerne Mines#k... Plus, there are all those #rBlack Wings#k around, watching us, I just know it.");

  ctx.setSpeakerId(VON);
  yield ctx.sayBoth("We snuck here, Jun. No one saw us. No one's watching us, okay? Come on, when else would we have ever gotten the chance to leave #bEdelstein#k? Don't be a chicken.");

  ctx.setSpeakerId(JUN);
  yield ctx.sayBoth("But what if we get in trouble?");
  ctx.setSpeakerOnRight(false);

  ctx.setSpeakerId(ULRIKA);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth("Jun, we're already here. If we're going to get in trouble, let's at least have some fun first. Let's play hide-and-seek!");
  ctx.setFlipSpeaker(false);

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("Hide and seek?");
  ctx.setPlayerAsSpeaker(false);

  ctx.setSpeakerId(VON);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("Ugh, la-ame.");
  ctx.setSpeakerOnRight(false);

  ctx.setSpeakerId(ULRIKA);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth("Don't be a brat, Von. What? Are you scared to hide all by yourself in these big, bad caves? *snicker*\r\n#h0#, since you were late, you're it. Count to 10 and then come find us. No peeking.");
  ctx.setFlipSpeaker(false);

  ctx.warp(MAP_HIDESEEK);
}

export function* talk2159002(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Von (2159002)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000000)
  yield ctx.sayNext("If Jun's too chicken, let's leave him here. But why's it have to be hide-and-seek? Let's play something cool...");
  yield ctx.sayPrev("That's not what I said...");
}

export function* talk2159013(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Cutie (2159013)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000000)
  yield ctx.sayOk("My heart is pounding, but this is kind of exciting. We're going to get in so much trouble if we're caught, though.");
}

export function* talk2159014(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Fattie (2159014) - No clue what this should be
}

export function* talk2159003(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Jun (2159003)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001)
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp1=1')) {
    yield ctx.sayNext('Eep! You found me.');
    yield ctx.sayBoth("Eh, I wanted to go further into the wagon, but my head wouldn't fit.");
    yield ctx.sayBoth('Did you find Ulrika and Von yet? Von is really, really good at hiding.\r\n\r\n\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 5 exp');
    ctx.addExp(5);
    ctx.addQRValue(RESISTANCE_HIDE_SEEK, 'exp1=1');
  } else {
    yield ctx.sayNext('Did you find Ulrika and Von yet? Von is really, really good at hiding.');
  }
}

export function* talk2159004(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Ulrika (2159004)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001)
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp2=1')) {
    ctx.addExp(5);
    ctx.addQRValue(RESISTANCE_HIDE_SEEK, 'exp2=1');
    yield ctx.sayNext("Haha, you found me. Guess I should've found a better hiding spot.");
    yield ctx.sayBoth("Have you found Jun and Von yet? Von's going to be pretty hard to find. Better keep your eyes open.\r\n\r\n\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 5 exp");
  } else {
    yield ctx.sayNext("Have you found Jun and Von yet? Von's going to be pretty hard to find. Better keep your eyes open.");
  }
}

export function* talk2159005(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Von (2159005)
  //   Dangerous Hide-and-Seek : Behind the Mine (931000030)
  yield ctx.sayNext("Aww, you found me. I thought I found a great spot, too."); // Unsure if GMS-like
}

export function* talk2159015(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Cutie (2159015)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001)
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp3=1')) {
    ctx.addExp(3);
    ctx.addQRValue(RESISTANCE_HIDE_SEEK, 'exp3=1');
    yield ctx.sayNext("Aw shucks. You found me. Wow, you're really good at this game!\r\n\r\n\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 3 exp");
  } else {
    yield ctx.sayNext('Hehehe... I should have hidden somewhere else.');
  }
}

export function* talk2159016(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Fattie (2159016)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001)
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp4=1')) {
    ctx.addExp(3);
    ctx.addQRValue(RESISTANCE_HIDE_SEEK, 'exp4=1');
    yield ctx.sayNext("D'oh! You found me. But I'm tiny! Are you a professional at this game or something?\r\n\r\n\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 3 exp");
  } else {
    yield ctx.sayNext('Drats. Might as well eat another piece of candy.');
  }
}

export function* talk2159011(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Suspicious Hollow (2159011)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001)
  if (ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp1=1') && ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp2=1') && ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp3=1') && ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'exp4=1')) {
    if (yield ctx.askYesNo('#b(What a suspicious hole. Maybe Von is hiding inside. Peek inside?)#k')) {
      ctx.addExp(35);
      ctx.playPortalSE();
      ctx.warp(MAP_LAB1);
    } else {
      yield ctx.sayOk("#b(Even Von wouldn't hide here, right?)#k");
    }
  } else {
    yield ctx.sayOk('#bFind your hiding friends before continuing.#k');
  }
}

export function* talk2159006(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Vita (2159006)
  //   Dangerous Hide-and-Seek : Suspicious Laboratory (931000010 / 931000011 / 931000012)
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'vel00=1')) {
    yield ctx.sayNext('Stay back!');
    yield ctx.sayBoth('How did you get here? This place is prohibited!');

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth("Who's talking? Where are you?!");
    ctx.setPlayerAsSpeaker(false);

    yield ctx.sayBoth('Look up.');
    ctx.addQRValue(RESISTANCE_HIDE_SEEK, 'vel00=1');
    ctx.reservedEffect('Effect/Direction4.img/Resistance/ClickVel');
    return;
  }
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'vel00=2')) {
    yield ctx.sayNext("My name is #b#p2159006##k. I'm one of #rDoctor #p2159012#'s#k test subjects. But that's not important right now. You have to get out of here before someone sees you!");

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth("Wait, what are you talking about? Someone's doing experiments on you?! And who's #p2159012#?");
    ctx.setPlayerAsSpeaker(false);

    yield ctx.sayBoth("You've never heard of Doctor #p2159012#, the Black Wings' mad scientist? This is his lab, where he conducts experiments...on people.");

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('Experiments...on people? Are you serious?');
    ctx.setPlayerAsSpeaker(false);

    yield ctx.sayBoth('Yes! And if he catches you here, he won\'t be merciful. Get out of here! Quickly!');

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('What? But what about you?!');
    ctx.setPlayerAsSpeaker(false);

    yield ctx.sayBoth("Shhh! Did you hear that? Someone's coming! It's got to be Doctor #p2159012#! Oh no!");

    ctx.addQRValue(RESISTANCE_HIDE_SEEK, 'vel00=2');
    ctx.warp(MAP_LAB2);
    return;
  }

  yield ctx.sayNext("Whew, something must have distracted them. Now's your chance. GO!");

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("But if I flee, you'll be left here alone...");
  ctx.setPlayerAsSpeaker(false);

  yield ctx.sayBoth("Forget about me. You can't help me. Doctor #p2159012# would realize right away if I'm missing, and then he'd summon the Black Wings to look for us. No, forget me and save yourself. Please!");

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("I can't just leave you here! And you shouldn't give up hope so easily!");
  ctx.setPlayerAsSpeaker(false);

  yield ctx.sayBoth("But it IS hopeless. I'm stuck in here. But thank you for caring. It's been a long time since anyone's been kind to me. But now, hurry! You must go!");
  if (!(yield ctx.askYesNo('#b(#p2159006# closes her eyes like she\'s given up. What should you do? How about trying to break open the vat?)#k'))) {
    yield ctx.sayNext('#b(You tried to hit the vat with all your might, but your hand slipped!)#k');
  }

  ctx.addExp(60);
  ctx.warp(MAP_LAB4);
}

export function* talk2159007(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Vita (2159007)
  //   Dangerous Hide-and-Seek : Suspicious Laboratory (931000013)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000020 / 931000021)
  //   Dangerous Hide-and-Seek : Behind the Mine (931000030)
  if (ctx.getFieldId() === MAP_LAB4) {
    yield ctx.sayBoth("Whoa. Wh-what happened? The glass is broken... Did that vibration earlier break it?");

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth("Now, there's nothing stopping you right? Let's get out of here!");
    ctx.setPlayerAsSpeaker(false);

    yield ctx.sayBoth('But...');

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('Do you WANT to stay here or something?');
    ctx.setPlayerAsSpeaker(false);

    yield ctx.sayBoth('Of course not!');

    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth("Then hurry up! Let's go!");
    ctx.setPlayerAsSpeaker(false);

    ctx.warp(MAP_ESCAPE1);
  } else if (ctx.getFieldId() !== MAP_ESCAPE2) {
    yield ctx.sayOk("It's been... a really long time since I've been outside the laboratory.");
  }
}

export function* talk2159008(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Schiller (2159008)
  //   Dangerous Hide-and-Seek : Suspicious Laboratory (931000011)
  //   Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000020 / 931000021)
  if (ctx.getFieldId() !== MAP_ESCAPE1) {
    return;
  }
  ctx.setSpeakerId(SCHILLER);
  yield ctx.sayNext('Little rats. I say, how DARE you try to escape this place?');

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Shoot, we were spotted!');
  ctx.setPlayerAsSpeaker(false);

  yield ctx.sayBoth("Now, now, children. Don't make this harder than it needs to be. Just walk towards me, nice and easy... Wait, you're not one of the test subjects. You're one of the townspeople, aren't you?");

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("That's right. I'm a resident of Edelstein, not a test subject. You can't boss ME around.");
  ctx.setPlayerAsSpeaker(false);

  yield ctx.sayBoth("Oh my, oh my. I told them to make sure the townspeople kept their kids away from the mines... Alas, it's too late now. I can't allow you to tell anyone about this laboratory, so I guess you'll just have to stay here and...help with the experiments. *snicker*");

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Hmph. Big words, but let\'s see if you can catch me first.');
  ctx.setPlayerAsSpeaker(false);

  yield ctx.sayBoth("Why, you insolent, little-- Ahem, ahem, ahem. Your words don't matter. Time for me to pull out the big guns. I do hope you're ready. If not, you will suffer.");

  ctx.user.addHp(-Math.floor(ctx.user.getHp() / 2));
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#b(Oh no! Schiller's attack HALVED your HP! He's tougher than you anticipated.)#k");
  ctx.setPlayerAsSpeaker(false);

  yield ctx.sayBoth("I say, got any more big words, kiddo? I'll make sure Gelimer performs some especially atrocious experiments on you. But I'll be nice if you come with me quiet-like.");

  ctx.setSpeakerId(J);
  yield ctx.sayBoth('Hold it right there!');

  ctx.warp(MAP_ESCAPE2);
}

export function* talk2159010(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // J (2159010)
  //   Dangerous Hide-and-Seek : Behind the Mine (931000030)
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext("Looks like we lost him. Of course, I could've easily handled him, no problemo, but I wasn't sure I could protect you kiddos at the same time. *chuckle* What're you two doing here anyway? Didn't your parents warn you to steer clear of the mines?");
  ctx.setFlipSpeaker(false);

  ctx.setSpeakerId(VITA_FREE);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth("It's my fault! #h0# was just trying to help! #h0# rescued me!");
  ctx.setSpeakerOnRight(false);

  ctx.setSpeakerId(J);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth('Rescued you, eh? Hm, you are dressed kind of funny, little girl. Ooooh. Were you a prisoner of the Black Wings?');
  ctx.setFlipSpeaker(false);

  ctx.setSpeakerId(VITA_FREE);
  ctx.setSpeakerOnRight(true);
  yield ctx.sayBoth('#b(#p2159006# quickly explains the situation.)#k');
  ctx.setSpeakerOnRight(false);

  ctx.setSpeakerId(J);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth('Ah, yes, I knew the Black Wings were up to something dangerous. I knew it all along. I must tell the others so we can devise a plan.');
  ctx.setFlipSpeaker(false);

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('But who are you? Where did you come from? And why did you rescue us?');
  ctx.setPlayerAsSpeaker(false);

  ctx.setSpeakerId(J);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth("I suppose I can't hide it after everything you've seen today, including but not limited to my heroic rescue and brazen bravery. *cough* You know our grand city of Edelstein is currently under the control of the Black Wings, right?");
  yield ctx.sayBoth('The stolen mines, the occupation of City Hall, the existence of the Watchmen... They are all signs that we no longer have our liberty. Despite all that, the Black Wings will never rule our hearts!');
  yield ctx.sayBoth('I am a proud member of the Resistance, a group secretly fighting and undermining the Black Wings. I cannot tell you who I am, but I go by the codename of J.');
  yield ctx.sayBoth("Now, please return to town and stay away from the mines. As for you, #p2159006#, come with me. If you're left unprotected, I fear the Black Wings will come look for you. No one can keep you safe like I can! Now, keep my words a secret. The fate of the Resistance depends on your discretion.");
  ctx.setFlipSpeaker(false);

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Wait, before you go, tell me one thing. How can I join the Resistance?');
  ctx.setPlayerAsSpeaker(false);

  ctx.setSpeakerId(J);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth("Ah, little youngling, so you wish to fight the Black Wings, do you? Your heart is noble, but there is little you can do to aid our efforts until you reach Lv. 10. Do so, and I will have someone from the Resistance contact you. That's a promise, kiddo. Now, I must be off, but perhaps we will meet again someday!");
  ctx.setFlipSpeaker(false);

  ctx.forceCompleteQuest(23007);
  ctx.addExp(90);
  ctx.addItem(2000000, 3);
  ctx.addItem(2000003, 3);
  ctx.warp(EDELSTEIN, 'st00');
}

export function* talk2159012(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Gelimer (2159012)
  //   Dangerous Hide-and-Seek : Suspicious Laboratory (931000011)
  ctx.setNotCancellable(true); // Not GMS-like, being able to cancel this dialog is awkward.
  yield ctx.sayNext('The experiment is going well, quite well. The endless supply of Rue is certainly speeding things along. Joining the Black Wings was a wise decision, a wise decision indeed. Muahaha!');

  ctx.setSpeakerId(SCHILLER);
  yield ctx.sayBoth('I say, you have great foresight about these things.');

  ctx.setSpeakerId(GELIMER);
  yield ctx.sayBoth('The android the Black Wings wanted will be completed soon. Oh yes, very soon. Then, the next stage will begin! I will conduct an experiment wilder than their wildest dreams!');

  ctx.setSpeakerId(SCHILLER);
  yield ctx.sayBoth('Pardon? The next stage?');

  ctx.setSpeakerId(GELIMER);
  yield ctx.sayBoth("Teeheehee, do you still not comprehend what I'm trying to create? Look around! Here's a clue: it's eons more interesting than a simple android. Eons more interesting.");

  ctx.setSpeakerId(SCHILLER);
  yield ctx.sayBoth('What?? All these test subjects... I say, sir, just what are you planning to do?');

  ctx.setSpeakerId(GELIMER);
  yield ctx.sayBoth("Now, now, you may not understand the grandness of my experiments. I don't expect you to. No, I don't expect you to. Just focus on your job and make sure none of the test subjects run away.");
  yield ctx.sayBoth('Hey... Did you hear that?');

  ctx.setSpeakerId(SCHILLER);
  yield ctx.sayBoth('Huh? Well... Now that you mention it, I do hear something. Yes, I do hear something...');

  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect('Effect/Direction4.img/Resistance/TalkInLab');
}

export function* Resi_tutor10(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000000) - Unsure if GMS-like, not sure what this should do
  ctx.setQRValue(EDELSTEIN_UNLOCK_TOWN_QUESTS, '1'); // Added this here so even perma-citizens can get the town quests.
}

export function* Resi_tutor20(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001)
  ctx.screenEffect('resistance/tutorialGuide');
  ctx.forceStartQuest(23007);
}

export function* Resi_tutor30(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Suspicious Laboratory (931000010)
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/resistanceTutorial/userTalk');
}

export function* Resi_tutor40(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Suspicious Laboratory (931000011)
  ctx.setSpeakerId(GELIMER);
  yield* talk2159012(ctx);
}

export function* Resi_tutor50(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Suspicious Laboratory (931000012)
  ctx.setDirectionMode(false, 0);
  ctx.setSpeakerId(VITA);
  yield* talk2159006(ctx);
}

export function* Resi_tutor50_1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
}

export function* Resi_tutor60(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000020)
  ctx.setSpeakerId(VITA_FREE);
  yield ctx.sayNext("It's been...a really long time since I've been outside the laboratory. Where are we?");

  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("This is the road that leads to Edelstein, where I live! Let's get out of here before the Black Wings follow us.");
  ctx.setPlayerAsSpeaker(false);

  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow1');
}

export function* Resi_tutor70(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000021)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect('Effect/Direction4.img/Resistance/TalkJ');
}

export function* Resi_tutor80(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Behind the Mine (931000030)
  ctx.setDirectionMode(false, 0);
}

export function* Resi_tutor11(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000000) - tutor00 (-152, -19)
  ctx.setSpeakerId(ULRIKA);
  yield* talk2159001(ctx);
}

export function* Resi_tutor31(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Suspicious Laboratory (931000010) - tutor00 (841, -33)
  if (!ctx.hasQRValue(RESISTANCE_HIDE_SEEK, 'vel00=1')) {
    ctx.setSpeakerId(VITA);
    yield* talk2159006(ctx);
  }
}

export function* Resi_tutor61(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000020)
  //   tutor00 (-37, -20), tutor01 (-136, -20), tutor02 (-236, -20)
  yield* talk2159008(ctx);
}

export function* in2159011(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dangerous Hide-and-Seek : Neglected Rocky Mountain (931000001) - in00 (1440, 27)
  ctx.setSpeakerId(2159011);
  yield* talk2159011(ctx);
}

export function* q23005ing(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Edelstein Message Board (2152019)
  //   Black Wing Territory : Edelstein (310000000)
  if (ctx.hasQuestStarted(23005) && ctx.hasItem(4032783)) {
    ctx.removeItem(4032783);
    ctx.setQRValue(RESISTANCE_CHECKY_FLIER, '1');
    yield ctx.sayNext('You pin the poster to the message board.');
    return;
  }
  yield ctx.sayOk("It's a message board for Edelstein's Free Market. Supposedly, anyone can put up a poster, but the board is covered with propaganda about the Black Wings.");
}
