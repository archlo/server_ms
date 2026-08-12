import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';

const CYGNUS_TUTORIAL = 20022; // QuestRecordType.CygnusTutorial

export function* TalkToTutor_Cygnus(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const answer: number = yield ctx.askMenu("Wait! You'll figure the stuff out by the time you reach Lv. 10 anyway, but if you absolutely want to prepare beforehand, you may view the following information.\r\n\r\nTell me, what would you like to know?", new Map([
    [0, 'About you'],
    [1, 'Mini Map'],
    [2, 'Quest Window'],
    [3, 'Inventory'],
    [4, 'Regular Attack Hunting'],
    [5, 'How to Pick Up Items'],
    [6, 'How to Equip Items'],
    [7, 'Skill Window'],
    [8, 'How to Use Quick Slots'],
    [9, 'How to Break Boxes'],
    [10, 'How to Sit in a Chair'],
    [11, 'World Map'],
    [12, 'Quest Notifications'],
    [13, 'Enhancing Stats'],
    [14, 'Who are the Cygnus Knights?'],
  ]));
  switch (answer) {
    case 0:
      yield ctx.sayNext('I serve under Shinsoo, the guardian of Empress Cygnus. My master, Shinsoo, has ordered me to guide everyone who comes to Maple World to join Cygnus Knights. I will be assisting and following you around until you become a Knight or reach Lv. 11. Please let me know if you have any questions.');
      break;
    case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11: case 12: case 13:
      ctx.tutorMsg(answer, 4000);
      break;
    case 14:
      yield ctx.sayOk('The Black Mage is trying to revive and conquer our peaceful Maple World. As a response to this threat, Empress Cygnus has formed a knighthood, now known as Cygnus Knights. You can become a Knight when you reach Lv. 10.');
      break;
  }
}

export function* createCygnus(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Shinsoo (1101001) - Empress' Road : Ereve (130000000)
  ctx.setConsumeItemEffect(2022458);
  yield ctx.sayOk('Don\'t stop training. Every ounce of your energy is required to protect the world of Maple....');
}

export function* startEreb(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Ereve (130000000)
}

export function* cygnusJobTutorial(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Neinheart's Job Introduction : Cygnus Knights (913040100-913040106)
  switch (ctx.getFieldId()) {
    case 913040100:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene0');
      break;
    case 913040101:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene1');
      break;
    case 913040102:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene2');
      break;
    case 913040103:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene3');
      break;
    case 913040104:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene4');
      break;
    case 913040105:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene5');
      break;
    case 913040106:
      ctx.reservedEffect('Effect/Direction.img/cygnusJobTutorial/Scene6');
      ctx.setDirectionMode(false, 7700);
      break;
  }
}

export function* tutorHelper(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress's Road : Forest of Beginning 1 (130030000) - scr00 (-2205, -141)
  if (ctx.getQRValue(CYGNUS_TUTORIAL) !== '1') {
    ctx.hireTutor(true);
    ctx.tutorMsgText("Welcome to Maple World! I'm Mimo. I'm in charge of guiding you until you reach Lv. 10 and become a Knight-in-Training. Double-click for further information!", 200, 4000);
    ctx.setQRValue(CYGNUS_TUTORIAL, '1'); // requirement for 20010
  }
}

export function* tutorMinimap(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress's Road : Forest of Beginning 2 (130030001) - scr00 (-170, 41)
  ctx.tutorMsg(1, 4000);
}

export function* tutorWorldmap(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress's Road : Small Bridge (130030006) - scr00 (2407, 40)
  ctx.tutorMsg(11, 4000);
  ctx.forceStartQuest(20015);
}

export function* tutorquest(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress's Road : Forest of Beginning 2-5 (130030001-130030004) - west00
  if (ctx.getFieldId() === 130030001) {
    if (ctx.hasQuestStarted(20010)) {
      ctx.playPortalSE();
      ctx.warp(130030002, 'east00');
    } else {
      ctx.message('Please click on the NPC first to receive a quest.');
    }
  } else if (ctx.getFieldId() === 130030002) {
    if (ctx.hasQuestCompleted(20011)) {
      ctx.playPortalSE();
      ctx.warp(130030003, 'east00');
    } else {
      ctx.message('Please complete the required quest before proceeding.');
    }
  } else if (ctx.getFieldId() === 130030003) {
    if (ctx.hasQuestCompleted(20012)) {
      ctx.playPortalSE();
      ctx.warp(130030004, 'east00');
    } else {
      ctx.message('Please complete the required quest before proceeding.');
    }
  } else if (ctx.getFieldId() === 130030004) {
    if (ctx.hasQuestCompleted(20013)) {
      ctx.playPortalSE();
      ctx.warp(130030005, 'east00');
    } else {
      ctx.message('Please complete the required quest before proceeding.');
    }
  }
}

export function* erebItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // erebItem0 (1302000) - Empress's Road : Forest of Beginning 5 (130030004)
  ctx.dropRewards([
    Reward.money(10, 10, 0.7),
    Reward.item(2000000, 1, 1, 0.1),
    Reward.item(2000001, 1, 1, 0.1),
    Reward.item(2010000, 1, 1, 0.1),
    Reward.item(4032267, 1, 1, 1.0, 20013), // Building Stone
    Reward.item(4032268, 1, 1, 1.0, 20013), // Drape
  ]);
}

export function* q20010s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Welcome to Ereve (20010 - start)
  yield ctx.sayNext("Welcome to Ereve! And you are? Oh, you're #b#h ##k! \r\nGood to meet you. I've been waiting. You've come to become a Cygnus Knight, right? My name is Kimu, and I'm currently guiding Noblesses like you at the request of Empress Cygnus.");
  yield ctx.sayBoth("If you want to officially become a part of Cygnus Knights, you must first meet the Empress. She's at the center of this island, accompained by Shinsoo. My brothers and I would like to share with you a few things that are considered #bBasic Knowledge#k in Maple World before you go. Would that be okay?");
  yield ctx.sayBoth("Oh, let me warn you that this is a Quest. You may have noticed that NPCs around Maple World occasionally ask you for various favors. A favor of that sort is called a #bQuest#k. You will receive reward items or EXP upon completing Quests, so I strongly suggest you diligently fulfill the favors of Maple NPCs.");
  if (yield ctx.askAccept('Would you like to meet #bKizan#k, who can tell you about hunting? You can find Kizan by following the arrow to the left.')) {
    ctx.forceStartQuest(20010);
    ctx.tutorMsg(2, 4000);
  } else {
    yield ctx.sayNext("Whoa, whoa! Are you really declining my offer? Well, you'll be able to #blevel-up quicker #kwith our help, so let me know if you change your mind. Even if you've declined a Quest, you can receive the Quest again if you just come and talk to me.");
  }
}

export function* q20010e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Welcome to Ereve (20010 - end)
  yield ctx.sayNext("Are you the Noblesse my brother Kimu sent? Nice to meet you! I'm Kizan. I'll give you the reward Kimu asked me to give you. Remember, you can check your Inventory by pressing the #bI key#k. Red potions help you recover HP, and blue ones help recover MP. It's a good idea to learn how to use them beforehand so you'll be ready with them when you're in danger. \r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0# \r\n\r\n#v2000020# 5 #t2000020# \r\n#v2000021# 5 #t2000021# \r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 15 exp");
  if (ctx.addItems([
    [2000020, 5],
    [2000021, 5],
  ])) {
    ctx.addExp(15);
    ctx.forceCompleteQuest(20010);
    ctx.tutorMsg(3, 4000);
  } else {
    yield ctx.sayNext('Please check if your inventory is full or not.');
  }
}

export function* q20011s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // I'll Show You How to Hunt (20011 - start)
  yield ctx.sayNext("There are a number of ways to hunt, but the most basic way is with your #bRegular Attack#k. All you need is a weapon in your hand, since it's a simple matter of just swinging your weapon at monsters.");
  yield ctx.sayBoth("Press the #bC#k to use your Regular Attack. Usually the C is located #bat the bottom left of the keyboard#k, but you don't need me to tell you that, right? Find the C and try it out!");
  if (yield ctx.askAccept("Now that you've tried it, we've got to test it out. In this area, you can find the weakest #r#o100120##ks in Ereve, which is perfect for you. Try hunting #r1#k. I'll give you a reward when you get back.")) {
    ctx.forceStartQuest(20011);
    ctx.tutorMsg(4, 4000);
  } else {
    yield ctx.sayNext("You don't want to? It's not even that hard, and you'll receive special equipment as a reward! Well, give it some thought and let me know if you change your mind.");
  }
}

export function* q20011e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // I'll Show You How to Hunt (20011 - end)
  yield ctx.sayNext("Ah, it seems like you've successfully hunted a #o100120#. Pretty simple, right? Regular Attacks may be easy to use, but they are pretty weak. Don't worry, though. #p1102006# will teach you how to use more powerful skills. Wait, let me give you a well-deserved quest reward before you go.");
  yield ctx.sayBoth("This equipment is for Noblesses. It's much cooler than what you're wearing right now, isn't it? Follow the arrows to your left to meet my younger brother #b#p1102006##k. How about you change into your new Noblesse outfit before you go? \r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0# \r\n#i1002869# #t1002869# - 1 \r\n#i1052177# #t1052177# - 1 \r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 31 exp");
  if (ctx.addItems([
    [1002869, 1],
    [1052177, 1],
  ])) {
    ctx.addExp(31);
    ctx.forceCompleteQuest(20011);
    ctx.tutorMsg(6, 4000);
  } else {
    yield ctx.sayNext('Please check if your inventory is full or not.');
  }
}

export function* q20012s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // How Well Do You Know Your Skills? (20012 - start)
  yield ctx.sayNext("I've been waiting for you, #h0#. My name is #p1102006# and I'm the third brother you are going to meet. So, you've learned about using Regular Attacks, correct? Well, next you'll be learning about your #bSkills#k, which you will find very helpful in Maple World.");
  yield ctx.sayBoth("You earn Skill Points every time you level up, which means you probably have a few saved up already. Press the #bK key#k to see your skills. Invest your Skill Points in the skill you wish to strengthen and don't forget to #bplace the skill in a Quick Slot for easy use#k.");
  if (yield ctx.askAccept('Time to practice before you forget. You will find a lot of #o100121#s in this area. Why don\'t you hunt #r3 #o100121#s#k using your #bThree Snails#b skill and bring me 1 #b#t4000483##k as proof? I\'ll wait for you here.')) {
    ctx.forceStartQuest(20012);
    ctx.tutorMsg(8, 4000);
  } else {
    yield ctx.sayNext('Regular Attacks are basic skills that are easy to use. It is important to remember that real hunting is done using your Skills. I suggest you reconsider.');
  }
}

export function* q20012e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // How Well Do You Know Your Skills? (20012 - end)
  yield ctx.sayNext("You've successfully defeated the #o100121#s and brought me a #t4000483#. That's very impressive! #bYou earn 3 Skill Points every time you level up, after you officially become a knight, that is. Keep following the arrow to the left, and you'll meet #b#p1102007##k, who will guide you through the next step.\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0# \r\n#fUI/UIWindow2.img/QuestIcon/8/0# 40 exp");
  if (ctx.removeItem(4000483, 1)) {
    ctx.addExp(40);
    ctx.forceCompleteQuest(20012);
  }
}

export function* q20013s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Box with Goodies Inside (20013 - start)
  yield ctx.sayNext('#b(*clang clang*)#k');
  yield ctx.sayBoth("Whoa! Hey! You scared me. I didn't know I had a visitor. You must be the Noblesse #p1102006# was talking about. Welcome! I'm #p1102007#, and my hobby is making #bChairs#k. I'm thinking about making you one as a welcome present.");
  yield ctx.sayBoth("But wait, I can't make you one because I don't have enough materials. Could you find me the materials I need? Around this area, you will find a lot of Boxes with items inside. Could you bring me back a #t4032267# and a #t4032268# found inside those Boxes?");
  yield ctx.sayBoth("Do you know how to get items from boxes? All you have to do is break the Boxes like you're attacking a monster. The difference is that you can attack monsters using your Skills, but you can #bonly use Regular Attacks to break Boxes#k.");
  if (yield ctx.askAccept("Please bring me 1 #b#t4032267##k and 1 #b#t4032268##k found inside those Boxes. I'll make you an awesome Chair as soon as I have what I need. I'll wait here!")) {
    ctx.forceStartQuest(20013);
    ctx.tutorMsg(9, 4000);
  } else {
    yield ctx.sayNext("Hmm, was that too much to ask? Is it because you don't know how to break Boxes? I'll tell you how if you accept my Quest. Let me know if you change your mind.");
  }
}

export function* q20013e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // A Box with Goodies Inside (20013 - end)
  yield ctx.sayNext("Did you bring me a Building Stone and a Drape? Let's see. Ah, these are just what I need! They indeed are a #t4032267# and a #t4032268#! I'll make you a Chair right away.");
  yield ctx.sayBoth("Here it is, a #t3010060#. What do you think? Nifty, huh? You can #bquickly recover your HP by sitting in this Chair#k. It will be stored in the #bSet-up#k window in your Inventory, so confirm that you've received the chair and head over to #b#p1102008##k. You'll see him if you keep following the arrow to the left. \r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0# \r\n#i3010060# 1 #t3010060# \r\n#fUI/UIWindow2.img/QuestIcon/8/0# 95 exp");
  if (ctx.canAddItem(3010060, 1)) {
    if (ctx.hasItem(4032267, 1) && ctx.hasItem(4032268, 1)) {
      ctx.removeItem(4032267, 1);
      ctx.removeItem(4032268, 1);
      ctx.addItem(3010060, 1);
      ctx.addExp(95);
      ctx.forceCompleteQuest(20013);
      ctx.tutorMsg(10, 4000);
    }
  } else {
    yield ctx.sayNext('Please check if your inventory is full or not.');
  }
}

export function* q20015s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Greetings From the Young Empress (20015 - start)
  yield ctx.sayNext('Did you know? Maple World may look peaceful, but certain areas are filled with forces of darkness. The Black Mage and those who want to revive the Black Mage are threatening Maple World.');
  yield ctx.sayBoth("We can't just sit here and do nothing while our enemies get stronger. Our own fear will only come back to haunt us.");
  if (yield ctx.askAccept("But I won't worry too much. Someone as determined as you will be able to protect the Maple World from danger, right? If you are brave enough to volunteer to become one of the Knights, I know I can count on you. \r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0# \r\n#i1142065# #t1142065# - 1")) {
    if (ctx.addItem(1142065, 1)) {
      ctx.forceCompleteQuest(20015);
      ctx.forceCompleteQuest(29905);
      yield ctx.sayNext("Heehee, I knew you'd say that. But you know you still have a ways to go before you can fight for Maple World, right?");
      yield ctx.sayPrev("Neinheart, my Tactician, who is standing right next to me, will help you become an honorable Knight. I'll be looking forward to your progress. I'm counting on you!");
    } else {
      yield ctx.sayNext('Please check if your inventory is full or not.');
    }
  }
}

export function* q20016s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Do You Know the Black Mage? (20016 - start)
  yield ctx.sayNext("Hello, #h0#. Welcome to Cygnus Knights. My name is #p1101002# and I am currently serving as the young Empress's Tactician. We'd better get acquainted since we'll be seeing a lot of each other. Haha!");
  yield ctx.sayBoth("I'm sure you have a lot of questions since everything happened so quickly. I'll explain it all, one by one, from where you are to what you're here to do.");
  yield ctx.sayBoth("This island is called Ereve. Thanks to the Empress's magic, this island usually floats around like a boat in the sky and patrols around Maple World. Right now, however, we've stopped here for a reason.");
  yield ctx.sayBoth("The young Empress is the ruler of Maple World. What? This is the first time you've heard of her? Ah, yes. Well, she's the ruler of Maple World but she doesn't like to control it. She watches from afar to make sure that all is well. Well, at least that's her usual role.");
  yield ctx.sayBoth("But that's not the case right now. We've been finding signs all over Maple World that foreshadow the revival of the Black Mage. We can't have the Black Mage come back to terrorize Maple World as he has in the past!");
  yield ctx.sayBoth("But that was ages ago and people today don't realize how scary the Black Mage is. We've all become spoiled by the peaceful Maple World we enjoy today and forgotten how chaotic and frightening Maple World once was. If we don't do something, the Black Mage will once again rule Maple World!");
  yield ctx.sayBoth("This is why the young Empress has decided to take matters into her own hands. She's forming a knighthood of brave Maplers to defeat the Black Mage once and for all. You know what you need to do, right? I'm sure you have an idea since you, yourself, signed up to be a Knight.");
  yield ctx.sayBoth("We have to get stronger so we can defeat the Black Mage if he revives. Our primary goal is to prevent him from destroying Maple World, and you will play a prominent role in that.");
  if (yield ctx.askAccept('That concludes my explanation. Have I answered all your questions? \r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0# \r\n#fUI/UIWindow2.img/QuestIcon/8/0# 380 exp')) {
    ctx.addExp(380);
    ctx.forceCompleteQuest(20016);
    yield ctx.sayNext("I'm glad you're clear about our current situation, but you know, at your current level, you're not even strong enough to face the Black Mage's minions, let alone the Black Mage himself. Not even his minions' minions, as a matter of fact. How will you protect Maple World at your current level?");
    yield ctx.sayBoth("Although you've been accepted into the knighthood, you cannot be recognized as a knight yet. You are not an Official Knight because you're not even a Knight-in-Training. If you remain at your current level, you'll be nothing more than the handyman of #p1101000# Knights.");
    yield ctx.sayBoth("But no one starts as a strong Knight on day one. The Empress didn't want someone strong. She wanted someone with courage whom she could develop into a strong Knight through rigorous training. So, you should first become a Knight-in-Training. We'll talk about your missions when you get to that point.");
    yield ctx.sayPrev("Take the portal on the left to reach the Training Forest. There, you will find #p1102000#, the Training Instructor, who will teach you how to become stronger. I don't want to find you wandering around aimlessly until you reach Lv. 10, you hear?");
  } else {
    yield ctx.sayNext("Oh, do you still have some questions? Talk to me again and I'll explain it to you from the very beginning.");
  }
}

export function* q20017s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // The First Knight Training (20017 - start)
  yield ctx.sayNext("Hmm? #p1101002# sent you, huh? You must be the newbie that recently joined Cygnus Knights. Welcome, and nice to meet you! My name is #p1102000#. I'm the Training Instructor who trains all Noblesses like yourself. Of course, I'm not a human as you can tell.");
  yield ctx.sayBoth("We are called Piyos. You've seen #p1101001# who is at the Empress's side all the time, haven't you? Piyos are of the same family as #p1101001#, but we belong to different types. Of course, you haven't seen any of us since we only live in Ereve. You'll get used to Piyos in no time.");
  yield ctx.sayBoth("Oh, and did you know that there are no monsters in Ereve? Not even a smidgeon of evil dare enter Ereve. But don't you worry. You'll be able to train with illusory monsters created by #p1101001# called Mimis.");
  if (yield ctx.askAccept('You seem prepared! Looking at what you\'ve accomplished, I think you should jump right into hunting more advanced Mimis. How about you hunt #b15 #r#o100122#s in #m130010100##k#k? Use the portal on the left to reach the #bTraining Forest II#k.')) {
    ctx.forceStartQuest(20017);
    ctx.tutorMsg(12, 4000);
  } else {
    yield ctx.sayNext("Hmm, there is nothing to worry about. This will be a breeze for someone your level. Muster your courage and let me know when you're ready.");
  }
}

export function* q20020s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // 5 Different Paths of Cygnus Knights (20020 - start)
  yield ctx.sayNext("You must have worked diligently, seeing how you've already reached Lv. 10. Very well, then. I think you're ready to progress. You have what it takes to become a Knight-in-Training. But before anything, I'd like to ask you a question. Have you thought about what kind of Knight you would like to become?");
  yield ctx.sayBoth("There are 5 different paths of Cygnus Knights to choose from. The choice is completely yours, but you can't change your mind after you've made your decision, so spend some time considering your options. Let me show you what you would look like if you were to become a Knight.");
  const answer: number = yield ctx.askMenu('What do you think? Would you like to see yourself as a Knight first? It\'s pointless if you\'ve already made up your mind.', new Map([
    [0, 'I want to see what I would look like as a Chief Knight.'],
    [1, "No, thanks. I don't need to see what I'd look like as a Chief Knight."],
  ]));
  if (answer === 0) {
    if (yield ctx.askYesNo('Would you like to see what you would look like as a Chief Knight? You will be able to select your Job after. Please talk to the Chief Knights once you decide on a path. The choice is completely yours.')) {
      ctx.forceCompleteQuest(20020);
      ctx.forceCompleteQuest(20100);
      ctx.hireTutor(false);
      ctx.setDirectionMode(true, 0);
      ctx.warp(913040100);
    } else {
      yield ctx.sayOk("Please talk to me after you've given this some more thought. Don't think too hard. Whichever you choose will become your destiny.");
    }
  } else {
    if (yield ctx.askYesNo('You don\'t want to see a preview of yourself as a Chief Knight? Fine, then I will allow you to select the path you wish to pursue.')) {
      ctx.forceCompleteQuest(20020);
      ctx.forceCompleteQuest(20100);
      ctx.hireTutor(false);
    } else {
      yield ctx.sayOk("Please talk to me after you've given this some more thought. Don't think too hard. Whichever you choose will become your destiny.");
    }
  }
}
