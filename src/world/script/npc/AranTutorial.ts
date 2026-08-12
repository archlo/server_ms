import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';
import { BodyPart } from '../../item/BodyPart';

const ARAN_TUTORIAL = 21002; // QuestRecordType.AranTutorial
const ARAN_GUIDE_EFFECT = 21003; // QuestRecordType.AranGuideEffect
const ARAN_HELPER_CLEAR = 21019; // QuestRecordType.AranHelperClear

export function* TalkToTutor_Aran(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const answer: number = yield ctx.askMenu("Is there anything you're still curious about? If so, I'll try to explain it better.", new Map([
    [0, 'Who am I?'],
    [1, 'Where am I?'],
    [2, 'Who are you?'],
    [3, 'Tell me what I have to do.'],
    [4, 'Tell me about my Inventory.'],
    [5, 'How do I advance my skills?'],
    [6, 'I want to know how to equip items.'],
    [7, 'How do I use quick slots?'],
    [8, 'How can I open breakable containers?'],
    [9, 'I want to sit in a chair but I forgot how.'],
  ]));
  switch (answer) {
    case 0:
      yield ctx.sayNext("You are one of the heroes that saved Maple World from the Black Mage hundreds of years ago. You've lost your memory due to the curse of the Black Mage.");
      break;
    case 1:
      yield ctx.sayNext("This island is called Rien, and this is where the Black Mage's curse put you to sleep. It's a small island covered in ice and snow, and the majority of the residents are Penguins.");
      break;
    case 2:
      yield ctx.sayNext("I'm Lilin, a clan member of Rien, and I've been waiting for your return as the prophecy foretold. I'll be your guide for now.");
      break;
    case 3:
      yield ctx.sayNext("Let's not waste any more time and just get to town. I'll give you the details when we get there.");
      break;
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      ctx.tutorMsg(answer + 10, 4000);
      break;
  }
}

export function* aranDirection(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (914090000-914090201)
  switch (ctx.getFieldId()) {
    case 914090010:
      ctx.reservedEffect('Effect/Direction1.img/aranTutorial/Scene0');
      break;
    case 914090011:
      ctx.reservedEffect(`Effect/Direction1.img/aranTutorial/Scene1${ctx.getGender()}`);
      break;
    case 914090012:
      ctx.reservedEffect(`Effect/Direction1.img/aranTutorial/Scene2${ctx.getGender()}`);
      break;
    case 914090013:
      ctx.reservedEffect('Effect/Direction1.img/aranTutorial/Scene3');
      ctx.setDirectionMode(false, 12000);
      break;
    case 914090100:
      ctx.reservedEffect(`Effect/Direction1.img/aranTutorial/HandedPoleArm${ctx.getGender()}`);
      ctx.setDirectionMode(false, 5000);
      break;
    case 914090200:
      ctx.reservedEffect('Effect/Direction1.img/aranTutorial/Maha');
      ctx.setDirectionMode(false, 5000);
      break;
    case 914090201:
      ctx.reservedEffect('Effect/Direction1.img/aranTutorial/PoleArm');
      ctx.setDirectionMode(false, 5000);
      break;
  }
}

export function* aranTutorMono0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Wounded Soldier's Camp (914000000) - tutor00 (224, -156)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'm0=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'm0=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/legendBalloon1');
}

export function* aranTutorMono1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Wounded Soldier's Camp (914000000) - tutor01 (-113, -184)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'm1=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'm1=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/legendBalloon2');
}

export function* aranTutorMono2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Wounded Soldier's Camp (914000000) - tutor02 (-418, -288)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'm2=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'm2=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/legendBalloon3');
}

export function* aranTutorMono3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 1 (914000200) - tutor01 (2119, -45)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'm3=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'm3=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/legendBalloon6');
}

export function* aranTutorArrow0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Ready to Leave (914000100) - tutor00 (-381, -45) / tutor01 (-607, -44)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'a0=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'a0=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow3');
}

export function* aranTutorArrow1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 1 (914000200) - tutor02 (1936, -45)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'a1=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'a1=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow1');
}

export function* aranTutorArrow2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 2 (914000210) - tutor01 (498, -41)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'a2=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'a2=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow1');
}

export function* aranTutorArrow3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 3 (914000220) - tutor01 (-945, -45)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'a3=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'a3=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow1');
}

export function* aranTutorAloneX(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Wounded Soldier's Camp (914000000) - out00 (-680, -14)
  ctx.playPortalSE();
  ctx.warp(914000100, 'in00');
}

export function* aranTutorOut1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Ready to Leave (914000100) - out00 (-1219, -2)
  if (!ctx.hasQuestStarted(21000)) {
    ctx.message('You can only exit after you accept the quest from Athena Pierce, who is to your right.');
  } else {
    ctx.addSkill(20000017, 1, 1);
    ctx.addSkill(20000018, 1, 1);
    ctx.playPortalSE();
    ctx.warp(914000200, 'east00');
  }
}

export function* aranTutorOut2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 1 (914000200) - west00 (1305, -1)
  ctx.addSkill(20000014, 1, 1);
  ctx.addSkill(20000015, 1, 1);
  ctx.playPortalSE();
  ctx.warp(914000210, 'east00');
}

export function* aranTutorOut3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 2 (914000210) - west00 (-133, 0)
  ctx.addSkill(20000016, 1, 1);
  ctx.playPortalSE();
  ctx.warp(914000220, 'east00');
}

export function* aranTutorGuide0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 1 (914000200) - tutor00 (2387, -46)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'g0=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'g0=1');
  ctx.message('To use a Regular Attack on monsters, press the Ctrl key.');
  ctx.screenEffect('aran/tutorialGuide1');
}

export function* aranTutorGuide1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 2 (914000210) - tutor00 (850, -45)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'g1=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'g1=1');
  ctx.message('You can use Consecutive Attacks by pressing the Ctrl key multiple times.');
  ctx.screenEffect('aran/tutorialGuide2');
}

export function* aranTutorGuide2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Burning Forest 3 (914000220) - tutor00 (-586, -47)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'g2=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'g2=1');
  ctx.message('You can use a Command Attack by pressing both the arrow key and the attack key after a Consecutive Attack.');
  ctx.screenEffect('aran/tutorialGuide3');
}

export function* aranTutorLost(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Dead End Forest (914000300) - tutor00 (-1887, -44)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'fin=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'fin=1');
  ctx.reservedEffect('Effect/Direction1.img/aranTutorial/Child');
  ctx.reservedEffect('Effect/Direction1.img/aranTutorial/ClickChild');
}

export function* outChild(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Black Road : Dead End Forest (914000300) - east00 (-1757, 2)
  if (ctx.hasQuestStarted(21001)) {
    ctx.warp(914000400, 'west00');
  } else {
    ctx.warp(914000220, 'west00');
  }
}

export function* talkHelena(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Athena Pierce (1209000) - Black Road : Ready to Leave (914000100)
  if (ctx.getQRValue(ARAN_TUTORIAL) !== '1') {
    yield ctx.sayNext("Aran, you're awake! How are you feeling? Hm? You want to know what's been going on?");
    yield ctx.sayBoth("We're almost done preparing for the escape. You don't have to worry. Everyone I could possibly find has boarded the ark, and Shinsoo has agreed to guide the way. We'll head to Victoria Island as soon as we finish the remaining preparations.");
    yield ctx.sayBoth("The other heroes? They've left to fight the Black Mage. They're buying us time to scape. What? You want to fight with them? No! You cant! You're hurt. You must leave with us!");
    ctx.setQRValue(ARAN_TUTORIAL, '1');
    ctx.reservedEffect('Effect/Direction1.img/aranTutorial/Trio');
  } else {
    const answer: number = yield ctx.askMenu('We are in a dire situation. What would you like to know?', new Map([
      [0, 'About the Black Mage'],
      [1, 'About the preparations for the escape'],
      [2, 'About the other heroes'],
    ]));
    if (answer === 0) {
      yield ctx.sayNext("I heard the Black Mage is very close. We can't even go into the forest because the dragons serving the Black Mage are there. That's why we're taking this route. We don't have any choice but to fly to Victoria Island, Aran...");
    } else if (answer === 1) {
      yield ctx.sayNext("We're almost ready to go. We can head over to Victoria Island as soon as the remaining few people board the ark. Shinsoo says there isn't anyone left in Ereve he needs to protect, so he's agreed to guid us.");
    } else if (answer === 2) {
      yield ctx.sayOk("The other heroes... They've already left to fight the Black Mage. They're slowing the Black Mage down so the rest of us can escape. They didn't want to take you with them because you were injured. Escape with us, Aran, as soon as we rescue the child!");
    }
  }
}

export function* q21000s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Find the Missing Kid 1 (21000 - start)
  if (!(yield ctx.askAccept("Oh, no! I think there's still a child in the forest! Aran, I'm very sorry, but could you rescue the child? I know you're injured, but I don't have anyone else to ask!"))) {
    yield ctx.sayNext("No, Aran... We can't leave a kid behind. I know it's a lot to ask, but please reconsider. Please!");
    return;
  }
  ctx.forceStartQuest(21000);
  yield ctx.sayNext('#bThe child is probably lost deep inside the forest!#k We have to escape before the Black Mage finds us. You must rush into the forest and bring the child back with you!');
  yield ctx.sayBoth('Don\'t panic, Aran. If you wish the check the status of the quest, press #bQ#k and view the Quest window.');
  yield ctx.sayBoth("Please, Aran! I'm begging you. I can't bear to lose another person to the Black Mage!");
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow1');
}

export function* q21001s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Find the Missing Kid 2 (21001 - start)
  if (!(yield ctx.askAccept('*Sniff sniff* I was so scared... Please take me to Athena Pierce.'))) {
    yield ctx.sayNext('*Sob* Aran has declined my request!');
    return;
  }
  ctx.addItem(4001271, 1);
  ctx.forceStartQuest(21001);
  ctx.warp(914000300, 'sp');
}

export function* q21001e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Find the Missing Kid 2 (21001 - end)
  if (!(yield ctx.askYesNo('You made it back safely! What about the child?! Did you bring the child with you?!'))) {
    yield ctx.sayNext('What about the child? Please give me the child.');
    return;
  }
  ctx.removeItem(4001271);
  ctx.forceCompleteQuest(21001);
  ctx.setNotCancellable(true);
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext("Oh, what a relief. I'm so glad...");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("Hurry and board the ship! We don't have much time!");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("We don't have any time to waste. The Black Mage's forces are getting closer and closer! We're doomed if we don't leave right this moment!");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Leave, now!');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("Aran, please! I know you want to stay and fight the Black Mage, but it's too late! Leave it to the others and come to Victoria Island with us!");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("No, I can't!");
  yield ctx.sayBoth("Athena Pierce, why don't you leave for Victoria Island first? I promise I'll come for you later. I'll be alright. I must fight the Black Mage with the other heroes!");
  ctx.setDirectionMode(true, 0);
  ctx.removeEquipped(BodyPart.WEAPON);
  ctx.warp(914090010);
}

// SNOW ISLAND SCRIPTS ---------------------------------------------------------------------------------------------

export function* iceCave(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Ice Cave (140090000)
  ctx.removeSkill(20000014);
  ctx.removeSkill(20000015);
  ctx.removeSkill(20000016);
  ctx.removeSkill(20000017);
  ctx.removeSkill(20000018);
  ctx.reservedEffect('Effect/Direction1.img/aranTutorial/ClickLilin');
}

export function* rienTutor1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Cold Forest 1 (140090100) - west00 (-1951, 82)
  if (!ctx.hasQuestCompleted(21010)) {
    ctx.message('You must complete the quest before proceeding to the next map.');
    return;
  }
  ctx.playPortalSE();
  ctx.warp(140090200, 'east00');
}

export function* rienTutor2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Cold Forest 2 (140090200) - west00 (-3562, 85)
  if (!ctx.hasQuestCompleted(21011)) {
    ctx.message('You must complete the quest before proceeding to the next map.');
    return;
  }
  ctx.playPortalSE();
  ctx.warp(140090300, 'east00');
}

export function* rienTutor3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Cold Forest 3 (140090300) - west00 (-5209, 84)
  if (!ctx.hasQuestCompleted(21012)) {
    ctx.message('You must complete the quest before proceeding to the next map.');
    return;
  }
  ctx.playPortalSE();
  ctx.warp(140090400, 'east00');
}

export function* rienTutor4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Cold Forest 4 (140090400) - west00 (117, 83)
  if (!ctx.hasQuestCompleted(21013)) {
    ctx.message('You must complete the quest before proceeding to the next map.');
    return;
  }
  ctx.playPortalSE();
  ctx.warp(140090500, 'east00');
}

export function* rienTutor5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Cold Forest 5 (140090500) - tutor00 (-458, 39)
  ctx.tutorMsgText("You're very close to town. I'll head over there first since I have some things to take care of. You take your time.", 200, 4000);
}

export function* rienTutor6(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Cold Forest 5 (140090500) - tutor01 (-863, 39)
  ctx.hireTutor(false);
}

export function* rienTutor7(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Dangerous Forest (140010000) - west00 (-1332, 84)
  if (ctx.hasQuestCompleted(21014) || ctx.getJob() !== 2000) {
    ctx.playPortalSE();
    ctx.warp(140010100, 'east00');
  } else {
    ctx.playPortalSE();
    ctx.warp(140000000, 'st00');
  }
}

export function* rienTutor8(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Rien (140000000) - west00 (-2457, 83)
  ctx.playPortalSE();
  ctx.warp(140010000, 'east00');
}

export function* rienArrow(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Dangerous Forest (140010000)
  if (ctx.hasQRValue(ARAN_GUIDE_EFFECT, 'rien=1')) return;
  ctx.addQRValue(ARAN_GUIDE_EFFECT, 'rien=1');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow3');
}

export function* enterRienFirst(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Snow Island : Dangerous Forest (140010000) - east00 (-101, 83)
  if (ctx.hasQuestCompleted(21014)) {
    ctx.playPortalSE();
    ctx.warp(140000000, 'west00');
  } else {
    ctx.playPortalSE();
    ctx.warp(140000000, 'st00');
  }
}

export function* rienItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // rienItem0 (1402000) - Snow Island : Cold Forest 4 (140090400)
  ctx.dropRewards([
    Reward.money(10, 10, 0.7),
    Reward.item(2000000, 1, 1, 0.1),
    Reward.item(2000001, 1, 1, 0.1),
    Reward.item(2010000, 1, 1, 0.1),
    Reward.item(4032309, 1, 1, 1.0, 21013), // Piece of Bamboo
    Reward.item(4032310, 1, 1, 1.0, 21013), // Wood
  ]);
}

export function* awake(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Lilin (1202000) - Snow Island : Ice Cave (140090000)
  if (!ctx.hasQRValue(ARAN_HELPER_CLEAR, 'helper=clear')) {
    ctx.setFlipSpeaker(true);
    yield ctx.sayNext("You've finally awoken...!");
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('And you are...?');
    ctx.setPlayerAsSpeaker(false);
    yield ctx.sayBoth("The hero who fought against the Black Mage... I've been waiting for you to wake up!");
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth('Who... Who are you? And what are you talking about?');
    yield ctx.sayBoth("And who am I...? I can't remember anything... Ouch, my head hurts!");
    ctx.reservedEffect('Effect/Direction1.img/aranTutorial/face');
    ctx.reservedEffect('Effect/Direction1.img/aranTutorial/ClickLilin');
    ctx.setQRValue(ARAN_HELPER_CLEAR, 'helper=clear');
  } else {
    ctx.setFlipSpeaker(true);
    yield ctx.sayNext('Are you alright?');
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayBoth("I can't remember anything. Where am I? And who are you...?");
    ctx.setPlayerAsSpeaker(false);
    yield ctx.sayBoth("Stay calm. There is no need to panic. You can't remember anything because the curse of the Black Mage erased your memory. I'll tell you everything you need to know... step by step.");
    yield ctx.sayBoth("You're a hero who fought the Black Mage and saved Maple World hundreds of years ago. But at the very last moment, the curse of the Black Mage put you to sleep for a long, long time. That's when you lost all of your memories.");
    yield ctx.sayBoth("This island is called Rien, and it's where the Black Mage trapped you. Despite its name, this island is always covered in ice and snow because of the Black Mage's curse. You were found deep inside the Ice Cave.");
    yield ctx.sayBoth("My name is Lilin and I belong to the clan of Rien. The Rien Clan has been waiting for a hero to return for a long time now, and we finally found you. You've finally returned!");
    yield ctx.sayBoth("I've said too much. It's okay if you don't really understand everything I just told you. You'll get it eventually. For now, #byou should head to town#k. I'll stay by your side and help you until you get there.");
    ctx.warp(140090100, 'st00');
    ctx.hireTutor(true);
  }
}

export function* q21010s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Return of the Hero (21010 - start)
  yield ctx.sayNext("Hm, what's a human doing on this island? Wait, it's #p1201000#. What are you doing here, #p1201000#? And who's that beside you? Is it someone you know, #p1201000#? What? The hero, you say?");
  yield ctx.sayBoth('#i4001170#');
  yield ctx.sayBoth("Ah, this must be the hero you and your clan have been waiting for. Am I right, Lilin? Ah, I knew you weren't just accompanying an average passerby...");
  if (!(yield ctx.askAccept("Oh, but it seems our hero has become very weak since the Black Mage's curse. It only makes sense, considering that the hero has been asleep for hundreds of years. #bHere, I'll give you a HP Recovery Potion...#k"))) {
    yield ctx.sayNext("Oh, no need to decline my offer. It's no big deal. It's just a potion. Well, let me know if you change your mind.");
    return;
  }
  ctx.user.setHp(25);
  if (!ctx.hasItem(2000022) && !ctx.addItem(2000022, 1)) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.forceStartQuest(21010);
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext("Drink it first. Then we'll talk.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#b(How do I drink the potion? I don't remember...)#k");
  ctx.tutorMsg(14, 4000);
}

export function* q21010e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Return of the Hero (21010 - end)
  if (ctx.user.getHp() < ctx.user.getMaxHp()) {
    yield ctx.sayNext("You didn't drink the potion yet.");
    return;
  }
  yield ctx.sayNext("We've been digging and digging inside the Ice Cave in the hope of finding a hero, but I never thought I'd actually see the day... The prophecy was true! You were right, Lilin! Now that one of the legendary heroes has returned, we have no reason to fear the Black Mage!");
  yield ctx.sayBoth("Oh, I've kept you too long. I'm sorry, I got a little carried away. I'm sure the other Penguins feel the same way. I know you're busy, but could you #bstop and talk to the other Penguins#k on your way to town? They would be so honored.\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#i2000022# 5 #t2000022#\r\n#i2000023# 5 #t2000022#\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 16 exp");
  if (!ctx.addItems([
    [2000022, 5], // Special Rien Red Potion
    [2000023, 5], // Special Rien Blue Potion
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(16);
  ctx.forceCompleteQuest(21010);
  ctx.setFlipSpeaker(true);
  yield ctx.sayBoth("Oh you've leveled up! You may have even received some skill points. In Maple World, you can acquire 3 skill points every time you level up. Press the #bK key#k to view the Skill window.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#b(Everyone's been so nice to me, but I just can't remember anything. Am I really a hero? I should check my skills and see. But how do I check then?)#k");
  ctx.tutorMsg(15, 4000);
}

export function* q21011e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The Missing Weapon (21011 - end)
  yield ctx.sayNext("Wait, are you... No way.... Are you the hero that #p1201000# has been talking about all this time?! #p1201000#! Don't just nod... Tell me! Is this the hero you've been waiting for?!");
  yield ctx.sayBoth('#i4001171#');
  yield ctx.sayBoth("I'm sorry. I'm just so overcome with emotions... *Sniff sniff* My goodness, I'm starting to tear up. You must be so happy, #p1201000#.");
  yield ctx.sayBoth("Wait a minute... You're not carrying any weapons. From what I've heard, each of the heroes had a special weapon. Oh, you must have lost it during the battle against the Black Mage.");
  if (!(yield ctx.askYesNo("This isn't good enough to replace your weapon, but #bcarry this sword with you for now#k. It's my gift to you. A hero can't be walking around empty-handed.\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#v1302000# 1 #t1302000#\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 35 exp"))) {
    yield ctx.sayNext("*sniff sniff* Isn't this sword good enough for you, just for now? I'd be so honored...");
    return;
  }
  if (!ctx.addItem(1302000, 1)) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(35);
  ctx.forceCompleteQuest(21011);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext('#b(Your skills are nowhere close to being hero-like... But a sword? Have you ever even held a sword in your lifetime? You can\'t remember... How do you even equip it?)');
  ctx.tutorMsg(16, 4000);
}

export function* q21012s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Abilities Lost (21012 - start)
  yield ctx.sayNext("Welcome, hero! What's that? You want to know how I knew who you were? That's easy. I eavesdropped on some people talking loudly next to me. I'm sure the rumor has spread through the entire island already. Everyone knows that you've returned!");
  yield ctx.sayBoth("Anyway, what's with the long face? Is something wrong? Hm? You're not sure whether you're really a hero or not? You lost your memory?! No way... It must be because you were trapped inside the ice for hundreds and hundreds of years.");
  if (!(yield ctx.askAccept('Hm, how about trying out that sword? Wouldn\'t that bring back some memories? How about #bfighting some monsters#k?'))) {
    yield ctx.sayNext("Hm... You don't think that would help? Think about it. It could help, you know...");
    return;
  }
  ctx.forceStartQuest(21012);
  yield ctx.sayNext('It just so happens that there are a lot of #r#o9300383##k near here. How about defeating just #r3#k of them? It could help you remember a thing or two.');
  yield ctx.sayBoth('Ah, you\'ve also forgotten how to use your skills? #bPlace skills in the quick slots for easy access#k. You can also place consumable items in the slots, so use the slots to your advantage.');
  ctx.tutorMsg(17, 4000);
}

export function* q21012e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Abilities Lost (21012 - end)
  if (!(yield ctx.askYesNo("Hm... Your expression tells me that the exercise didn't jog any memories. But don't you worry. They'll come back, eventually. Here, drink this potion and power up!\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#i2000022# 10 #t2000022#\r\n#i2000023# 10 #t2000022#\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 57 exp"))) {
    yield ctx.sayNext("What? You don't want the potion?");
    return;
  }
  if (!ctx.addItems([
    [2000022, 10], // Special Rien Red Potion
    [2000023, 10], // Special Rien Blue Potion
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(57);
  ctx.forceCompleteQuest(21012);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayOk("#b(Even if you're really the hero everyone says you are... What good are you without any skills?)#k");
}

export function* q21013s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Gift for the Hero (21013 - start)
  if ((yield ctx.askMenu("Ah, you're the hero. I've been dying to meet you.", new Map([[0, '(Seems a bit shy...)']]))) !== 0) {
    return;
  }
  if (!(yield ctx.askAccept("I have something I've been waiting to give you as a gift for a very long time... I know you're busy, especially since you're on your way to town, but will you accept my gift?"))) {
    yield ctx.sayNext("I'm sure it will come in handy during your journey. Please, don't decline my offer.");
    return;
  }
  ctx.forceStartQuest(21013);
  yield ctx.sayNext('The parts of the gift have been packed inside a box nearby. Sorry to trouble you, but could you break the box and bring me a #b#t4032309##k and some #b#t4032310##k? I\'ll assemble them for you right away.');
  ctx.tutorMsg(18, 4000);
}

export function* q21013e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Gift for the Hero (21013 - end)
  yield ctx.sayNext("Ah, you've brought all the components. Give me a few seconds to assemble them... Like this... And like that... and...\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#v3010062# 1 #t3010062#\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 95 exp");
  ctx.removeItem(4032309);
  ctx.removeItem(4032310);
  if (!ctx.addItem(3010062, 1)) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(95);
  ctx.forceCompleteQuest(21013);
  yield ctx.sayBoth("Here, a fully-assembled chair, just for you! I've always wanted to give you a chair as a gift, because I know a hero can occasionally use some good rest. Tee hee.");
  yield ctx.sayBoth('A hero is not invincible. A hero is a human. I\'m sure you will face challenges and even falter at times. But you are a hero because you have what it takes to overcome any obstacles you may encounter.');
  ctx.tutorMsg(19, 4000);
}

export function* q21015s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Basic Fitness Training 1 (21015 - start)
  yield ctx.sayNext("Alright. I've done enough explaining for now. Let's move on to the next stage. What's the next stage, you ask? I just told you. Train as hard as you can until you become strong enough to defeat the Black Mage with a single blow.");
  yield ctx.sayBoth("You may have been a hero in the past, but that was hundreds of years ago. Even if it weren't for the curse of the Black Mage, all those years you spent frozen in time have stiffened your body. You must loosen up a bit and slowly regain your agility. How do you do that, you ask?");
  if (!(yield ctx.askAccept("Don't you know that you must first master the fundamentals? So the wise thing to do is begin with #bBasic Training#k. Oh, of course, I forgot that you lost your memory. Well, that's why I'm here. You'll just have to experience it yourself. Shall we begin?"))) {
    yield ctx.sayNext("What are you so hesitant about? You're a hero! You gotta strike while the iron is hot! Come on, let's do this!");
    return;
  }
  ctx.forceStartQuest(21015);
  ctx.setNotCancellable(true);
  yield ctx.sayNext('The population of Rien may be mostly Penguins, but even this island has monsters. You\'ll find #o0100131#s if you go to #b#m140020000##k, located on the right side of the town. Please defeat #r10 of those #o0100131#s#k. I\'m sure you\'ll have no trouble defeating the #o0100131#s that even the slowest penguins here can defeat.');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow3');
}

export function* q21016s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Basic Fitness Training 2 (21016 - start)
  if (!(yield ctx.askAccept('Shall we continue with your Basic Training? Before accepting, please make sure you have properly equipped your sword and your skills and potions are readily accessible.'))) {
    yield ctx.sayNext("Are you not ready to hunt the #o0100132#s yet? Always proceed if and only if you are fully ready. There's nothing worse than engaging in battles without sufficient preparation.");
    return;
  }
  ctx.forceStartQuest(21016);
  ctx.setNotCancellable(true);
  yield ctx.sayNext('Alright. This time, let\'s have you defeat #r#o0100132#s#k, which are slightly more powerful than #o0100131#s. Head over to #b#m140020100##k and defeat #r15#k of them. That should help you build your strength. Alright! Let\'s do this!');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow3');
}

export function* q21017s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Basic Fitness Training 3 (21017 - start)
  ctx.setFlipSpeaker(true);
  yield ctx.sayNext("It seems like you're warmed up now. This is when rigorous training can really help you build a strong foundation. Let's proceed with the Basic Training, shall we?");
  yield ctx.sayBoth('Go defeat some #r#o0100133#s#k in #b#m140020200##k this time. I think about  #r20#k should do it. Go on ahead and... Hm? Do you have something you\'d like to say?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("Isn't the number getting bigger and bigger?");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('Of course it is. What, are you not happy with 20? Would you like to defeat 100 of them instead? Oh, how about 999 of them? Someone in Sleepywood would be able to do it easily. After all, we are training...');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('Oh no, no, no. Twenty is plenty.');
  ctx.setPlayerAsSpeaker(false);
  if (!(yield ctx.askAccept('You don\'t have to be so modest. I understand your desire to quickly become the hero you once were. This sort of attitude is what makes you a hero.'))) {
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayNext("#b(You declined out of fear, but it's not like you can run away like this. Take a big breath, calm down, and try again.)#k");
    return;
  }
  ctx.forceStartQuest(21017);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext('#b(You accepted, thinking you might end up having to 999 of them if you let her keep talking.)#k');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('Please go ahead and slay 20 #o0100133#s.');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow3');
}

export function* q21018s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Basic Fitness Test (21018 - start)
  yield ctx.sayNext('Now, you will undergo a test t hat will determine whether you\'re fit or not. All you have to do is take on the most powerful monster on this island, #o0100134#s. About #r50#k of them would suffice, but...');
  if (!(yield ctx.askAccept("We can't have you wipe out the entire population of #o0100134#s, since they aren't many of them out there. How about 5 of them? You're here to train, not to destroy the ecosystem."))) {
    yield ctx.sayNext("Oh, is 5 not enough? If you feel the need to train further, please feel free to slay more than that. If you slay all of them, I'll just have to look the other way even if it breaks my heart, since they will have been sacrificed for a good cause...");
    return;
  }
  ctx.forceStartQuest(21018);
  yield ctx.sayNext('#o0100134#s can be found in deeper parts of the island. Continue going left until you reach #b#m140010200##k, and defeat #r5 #o0100134#s#k.');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/aranTutorial/tutorialArrow1');
}
