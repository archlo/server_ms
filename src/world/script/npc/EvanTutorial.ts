import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const EVAN_DRAGON_EYES = 22012; // QuestRecordType.EvanDragonEyes
const EVAN_DREAM_EFFECT = 22013; // QuestRecordType.EvanDreamEffect
const EVAN_TUTORIAL_EFFECT = 22014; // QuestRecordType.EvanTutorialEffect

export function* evanAlone(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Entrance (900010000)
  // Hidden Street : Lush Forest (900020100)
}

export function* evantalk00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Entrance (900010000) - scr00 (-996, -11)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo00=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'mo00=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon00');
}

export function* mirtalk00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Entrance (900010000) - scr01 (-411, -10)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'dt00=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;mo00=o');
  ctx.screenEffect('evan/dragonTalk00');
}

export function* evantalk01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Entrance (900010000) - scr02 (-215, -10)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo01=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;mo00=o;mo01=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon01');
}

export function* evantalk02(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Entrance (900010000) - scr03 (298, -6)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo02=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;mo00=o;mo01=o;mo02=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon02');
}

export function* evantalk10(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Trail (900010100) - scr00 (410, -9)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo10=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;mo00=o;mo01=o;mo10=0;mo02=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon10');
}

export function* mirtalk01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Trail (900010100) - scr01 (691, -10)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'dt01=o')) return;
  ctx.screenEffect('evan/dragonTalk01');
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;dt01=o;mo00=o;mo01=o;mo10=o;mo02=o');
}

export function* evantalk11(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Trail (900010100) - scr02 (928, -12)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo11=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;dt01=o;mo00=o;mo01=o;mo10=o;mo02=o;mo11=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon11');
}

export function* contactDragon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest Trail (900010100) - in00 (1523, 36)
  ctx.playPortalSE();
  ctx.warp(900090100); // Video : Tutorial 0
}

export function* meetWithDragon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Video : Tutorial 0 (900090100)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction4.img/meetWithDragon/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 6000);
}

export function* evantalk20(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest (900010200) - scr00 (-1780, -8)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo20=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;dt01=o;mo00=o;mo01=o;mo10=o;mo02=o;mo11=o;mo20=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon20');
}

export function* evantalk21(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest (900010200) - scr01 (-1154, -10)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'mo21=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;dt01=o;mo00=o;mo01=o;mo10=o;mo02=o;mo11=o;mo20=o;mo21=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon21');
}

export function* dragoneyes(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dream World : Dream Forest (900010200) - scr02 (-661, -12)
  ctx.setQRValue(EVAN_DRAGON_EYES, '1');
}

export function* dragon_dream(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dragon (1013001) - Dream World : Dream Forest (900010200)
  yield ctx.sayNext('You, who are destined to be a Dragon Master... You have finally arrived.');
  yield ctx.sayBoth('Go and fulfill your duties as the Dragon Master...');
  ctx.warp(900090101); // Video : Tutorial 1
}

export function* PromiseDragon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Video : Tutorial 1 (900090101)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect('Effect/Direction4.img/PromiseDragon/Scene0');
  ctx.setDirectionMode(false, 4000);
}

export function* evanleaveD(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Utah's House : Small Attic (100030100)
  // Dream World : Dream Forest (900010200)
  // Hidden Street : Lost Forest Entrance (900020200)
  ctx.setDirectionMode(false, 0);
}

export function* evanRoom0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Utah's House : Small Attic (100030100) - tutor00 (4, -115)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon30');
}

export function* evanRoom1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Utah's House : Small Attic (100030100) - tutor01 (221, -13)
  if (ctx.hasQRValue(EVAN_DREAM_EFFECT, 'hand=o')) return;
  ctx.addQRValue(EVAN_DREAM_EFFECT, 'dt00=o;dt01=o;mo00=o;mo01=o;mo10=o;mo02=o;mo20=o;hand=o;mo21=o');
  yield ctx.sayImage(['UI/tutorial/evan/0/0']);
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon70');
}

export function* evanlivingRoom(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Utah's House : Living Room (100030101) - out00 (373, 33)
  ctx.playPortalSE();
  ctx.warp(100030102, 'in00'); // Utah's Farm : Front Yard
}

export function* evanGarden0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Utah's House : Front Yard (100030102) - west00 (-2234, 37)
  ctx.playPortalSE();
  ctx.warp(100030200, 'east00'); // Farm Street : Small Forest Trail
}

export function* evanGarden1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Utah's House : Front Yard (100030102) - east00 (253, 36)
  if (!ctx.hasQuestStarted(22008)) {
    ctx.message('You cannot go to the Back Yard without a reason');
    return;
  }
  ctx.playPortalSE();
  ctx.warpInstance([100030103], 'west00', 100030102, 60 * 10); // Utah's Backyard
}

export function* inDragonEgg(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Farm Street : Farm Center (100030300) - in00 (181, -865)
  if (!ctx.hasQuestStarted(22005)) {
    ctx.playPortalSE();
    ctx.warp(100030301); // Farm Street : Forest Hall (Hall of Fame)
    return;
  }
  ctx.playPortalSE();
  ctx.warp(900020100, 'out00'); // Hidden Street : Lush Forest
}

export function* babyPig(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Piglet (1013200) - Hidden Street : Lush Forest (900020100/900020110)
  if (ctx.getFieldId() === 900020100) {
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayOk("#b(I'm too far from the Piglet. I have to move closer to grab it.)");
  } else if (ctx.getFieldId() === 900020110) {
    if (!ctx.hasQuestStarted(22005)) {
      return;
    }
    if (!ctx.addItem(4032449, 1)) {
      yield ctx.sayOk('Please check if your inventory is full or not.');
      return;
    }
    ctx.forceCompleteQuest(22015); // Npc/1013200.img/condition1/22015
  }
}

export function* evanFall(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lush Forest (900020100) - scr00-scr14
  ctx.playPortalSE();
  if (!ctx.hasQuestStarted(22005)) { // failsafe incase somehow someone gets in this map without having the quest
    ctx.warp(100030300); // Farm Street : Farm Center
    return;
  }
  ctx.warp(900090102); // Video : Tutorial 2
}

export function* crash_Dragon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Video : Tutorial 2 (900090102)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction4.img/crash/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 3000);
}

export function* evantalk40(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lost Forest Entrance (900020200) - scr00 (-1093, -10)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'mo40=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o;mo40=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon40');
}

export function* evantalk41(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lost Forest Entrance (900020200) - scr01 (-523, -12)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'mo41=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o;mo40=o;mo41=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon41');
}

export function* evantalk42(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lost Forest Entrance (900020200) - scr02 (152, -9)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'mo42=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o;mo40=o;mo41=o;mo42=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon42');
}

export function* evantalk50(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lost Forest Trail (900020210) - scr00 (609, -8)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'mo50=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o;mo40=o;mo41=o;mo50=o;mo42=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon50');
}

export function* evantalk60(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lost Forest (900020220) - scr00 (-707, -11)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'mo60=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'mo30=o;mo40=o;mo41=o;mo50=o;mo42=o;mo60=o');
  ctx.avatarOriented('Effect/OnUserEff.img/guideEffect/evanTutorial/evanBalloon60');
}

export function* dragonEgg(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dragon Nest (1013002) - Hidden Street : Lost Forest (900020220)
  ctx.playPortalSE();
  ctx.warp(900090103); // Video : Job Advancement
}

export function* getDragonEgg(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Video : Job Advancement (900090103)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction4.img/getDragonEgg/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 6500);
}

export function* DragonEggNotice(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lush Forest (900020110) - scr00 (834, -308)
  if (ctx.hasQRValue(EVAN_TUTORIAL_EFFECT, 'egg=o')) return;
  ctx.addQRValue(EVAN_TUTORIAL_EFFECT, 'egg=o;mo30=o;mo40=o;mo41=o;mo50=o;mo42=o;mo60=o');
  ctx.forceCompleteQuest(22011); // Show Dragon Egg in Skill Window
  yield ctx.sayImage(['UI/tutorial/evan/8/0']);
  ctx.message('You have received a Dragon Egg.');
}

export function* babyPigOut(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Lush Forest (900020110) - out00 (-143, 38)
  ctx.warp(100030300, 'in00');
}

export function* giveEggEvan(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hen (1013104) - Utah's House : Front Yard (100030102)
  if (!ctx.hasQuestStarted(22007) || ctx.hasItem(4032451)) {
    return;
  }
  if (!ctx.addItem(4032451, 1)) {
    yield ctx.sayOk('Please check if your inventory is full or not.');
    return;
  }
  yield ctx.sayNext('#b(You have obtained an Egg. Deliver it to Utah.)');
}

export function* evanFarmCT(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Farm Street : Farm Center (100030300) - west00 (196, 31)
  if (ctx.hasQuestStarted(22010) || ctx.hasQuestCompleted(22010)) {
    ctx.playPortalSE();
    ctx.warp(100030310, 'east00'); // Farm Street : Large Forest Trail
    return;
  }
  ctx.message('You are not allowed to leave the farm yet.');
}

export function* q22000s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Strange Dream (22000 - start)
  yield ctx.sayNext('Did you sleep well, Evan?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#bYes, what about you, Mom?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('I did as well, but you seem so tired. Are you sure you slept okay? Did the thunder and lightning last night keep you up?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#bOh, no. It's not that, Mom. I just had a strange dream last night.");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('A strange dream? What kind of strange dream?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#bWell there was this dragon in the middle of the forest and he spoke to me!');
  ctx.setPlayerAsSpeaker(false);
  if (!(yield ctx.askAccept("Hahaha, a dragon? That's incredible. I'm glad he didn't swallow you whole! You should tell #p1013101# about your dream. I'm sure he'll enjoy it."))) {
    yield ctx.sayNext("Hm? Don't you want to tell #p1013101#? You have to be nice to your brother, dear.");
    return;
  }
  yield ctx.sayNext("#b#p1013101##k went to the #b#m100030102##k to feed #p1013102#. You'll see him right outside.");
  ctx.forceStartQuest(22000);
  yield ctx.sayImage(['UI/tutorial/evan/1/0']);
}

export function* q22000e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Strange Dream (22000 - end)
  yield ctx.sayNext("Hey, Evan. You up? What's with the dark circles under your eyes? Didn't sleep well? Huh? A strange dream? What was it about? Whoa? A dream about a dragon?");
  yield ctx.sayBoth('Muahahahahaha, a dragon? Are you serious? I don\'t know how to interpret dreams, but that sounds like a good one! Did you see a dog in your dream, too? Hahaha!\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 20 exp');
  ctx.forceCompleteQuest(22000);
  ctx.addExp(20);
  yield ctx.sayImage(['UI/tutorial/evan/2/0']);
}

export function* q22001s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Feeding Bull Dog (22001 - start)
  yield ctx.sayNext('Haha. I had a good laugh. Hahaha. But enough with that nonsense. Feed #p1013102#, would you?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#bWhat? That's your job, #p1013101#!");
  ctx.setPlayerAsSpeaker(false);
  if (!(yield ctx.askAccept("You little brat! I told you to call me Older Brother! You know how much #p1013102# hates me. He'll bite me if I go near him. You feed him. He likes you."))) {
    yield ctx.sayNext('Stop being lazy. Do you want to see your brother bitten by a dog? Hurry up! Talk to me again and accept the quest!');
    return;
  }
  if (!ctx.addItem(4032447, 1)) { // Dog Food
    yield ctx.sayOk('Please check if your inventory is full or not.');
    return;
  }
  ctx.forceStartQuest(22001);
  yield ctx.sayNext("Hurry up and head #bleft#k to feed #b#p1013102##k. He's been barking to be fed all morning.");
}

export function* q22002s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sandwich for Breakfast (22002 - start)
  yield ctx.sayNext("Did you feed #p1013102#? You should have some breakfast now then, Evan. Today's breakfast is a #t2022620#. I've brought it with me. Hee hee. I was going to eat it myself if you didn't agree to feed #p1013102#.");
  if (!(yield ctx.askAccept("Here, I'll give you this #bSandwich#k, so #bgo talk to mom when you finish eating#k. She says she has something to tell you."))) {
    yield ctx.sayNext("Oh, what? Aren't you going to have breakfast? Breakfast is the most important meal of the day! Talk to me again if you change your mind. If you don't, I'm going to eat it myself.");
    return;
  }
  if (!ctx.addItem(2022620, 1)) { // Homemade Sandwich
    yield ctx.sayOk('Please check if your inventory is full or not.');
    return;
  }
  ctx.forceStartQuest(22002);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext('#b(Mom has something to say? Eat your #t2022620# and head back inside the house.)');
  yield ctx.sayImage(['UI/tutorial/evan/3/0']);
}

export function* q22002e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sandwich for Breakfast (22002 - end)
  yield ctx.sayNext('Did you eat your breakfast, Evan? Then, will you do me a favor?\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#i1003028# 1 #t1003028#\r\n#i2022621# 5 #t2022621#s\r\n#i2022622# 5 #t2022622#\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 60 exp');
  if (!ctx.addItems([
    [1003028, 1], // Straw Hat
    [2022621, 5], // Tasty Milk
    [2022622, 5], // Squeezed Juice
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(60);
  ctx.forceCompleteQuest(22002);
  yield ctx.sayImage(['UI/tutorial/evan/4/0']);
}

export function* q22003s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Delivering the Lunch Box (22003 - start)
  if (!(yield ctx.askAccept('Your #bDad#k forgot his Lunch Box when he left for the farm this morning. Will you #bdeliver this Lunch Box#k to your Dad in #b#m100030300##k, honey?'))) {
    yield ctx.sayNext('Good kids listen to their mothers. Now, Evan, be a good kid and talk to me again.');
    return;
  }
  ctx.forceStartQuest(22003);
  if (!ctx.addItem(4032448, 1)) { // Lunch Made with Love
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  yield ctx.sayNext("Heehee, my Evan is such a good kid! Head #bleft after you exit the house#k. Rush over to your dad. I'm sure he's starving.");
  yield ctx.sayBoth("Come back to me if you happen to lose the Lunch Box. I'll make his lunch again.");
  yield ctx.sayImage(['UI/tutorial/evan/5/0']);
}

export function* q22004s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Fixing the Fence (22004 - start)
  yield ctx.sayNext("The #o1210100#s at the farm have been acting strange these past couple days. They've been angry and irritable for no reason. I was worried so I came out to the farm early this morning and sure enough, it seems like a few of these #o1210100#s got past the fence.");
  if (!(yield ctx.askAccept("Before I go and find the #o1210100#s, I should mend the broken fence. Luckily, it wasn't damaged too badly. I just need a few #t4032498#es to fix it right up. Will you bring me #b3#k #b#t4032498#es#k, Evan?"))) {
    yield ctx.sayNext('Hm, #p1013101# would have done it at the drop of a hat.');
    return;
  }
  ctx.forceStartQuest(22004);
  yield ctx.sayNext("Oh, that's very nice of you. You'll be able to find #b#t4032498#es#k from the nearby #r#o0130100#s#k. They're not too strong, but use your skills and items when you find yourself in danger.");
  yield ctx.sayImage(['UI/tutorial/evan/6/0']);
}

export function* q22004e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Fixing the Fence (22004 - end)
  yield ctx.sayNext("Ah, did you bring all the #t4032498#es? That's my kid! What shall I give you as a reward... Let's see... Oh, right!\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#i3010097# 1 #t3010097#\r\n#i2022621# 15 #t2022621#s\r\n#i2022622# 15 #t2022622#s\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 210 exp");
  ctx.removeItem(4032498);
  if (!ctx.addItems([
    [3010097, 1], // Strong Wooden Chair
    [2022621, 15], // Tasty Milk
    [2022622, 15], // Squeezed Juice
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(210);
  ctx.forceCompleteQuest(22004);
  yield ctx.sayNext("Here. I made this new chair from the wooden boards I had left over after fixing the fence. It may not seem like much, but it's sturdy. I'm sure it'll come in handy.");
  yield ctx.sayImage(['UI/tutorial/evan/7/0']);
}

export function* q22007e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Collecting Eggs (22007 - end)
  yield ctx.sayNext("Oh, did you bring the egg? Here, give it to me, I'll give you the incubator then.");
  yield ctx.askYesNo('Alright, here you go. I have no idea how to use it, but it\'s yours.\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 360 exp');
  if (!ctx.removeItem(4032451, 1)) {
    yield ctx.sayNext('Are you sure you have the Egg with you?');
    return;
  }
  ctx.addExp(360);
  ctx.forceCompleteQuest(22007);
  yield ctx.sayImage(['UI/tutorial/evan/9/0']);
}

export function* q22008s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Chasing away the Foxes (22008 - start)
  if (!(yield ctx.askAccept('It\'s strange. The chickens are acting funny. They used to hatch way more #t4032451#s. Do you think the Foxes have something to do with it? If so, we better hurry up and do something.'))) {
    yield ctx.sayNext("Are you scared of the #o9300385#es? Don't tell anyone you're related to me. That's shameful.");
  }
  ctx.forceStartQuest(22008);
  yield ctx.sayNext("Right? Let us go and defeat those Foxes. Go on ahead and defeat #r10 #o9300385#es#k in #b#m100030103##k first. I'll follow you and take care of what's left behind. Now, hurry over to #m100030103#!");
  yield ctx.sayImage(['UI/tutorial/evan/10/0']);
}

export function* q22008e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Chasing away the Foxes (22008 - end)
  yield ctx.sayNext('Did you defeat the #b#o9300385#es#k?');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#bWhat happened to slaying the Foxes left behind?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth("Oh, that? Haha. I did chase them, sort of, but I wanted to make sure that they do not catch up to you. I wouldn't want you eaten by a #o9300385# or anything. So I just let them be.");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#bAre you sure you weren\'t just hiding because you were scared of the Foxes?');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('What? No way! Sheesh, I fear nothing!');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#bWatch out! There's a #o9300385# right behind you!");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('Eeeek! Mommy!');
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth('#b...');
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('...');
  yield ctx.sayBoth("You little brat! I'm your older brother. Don't you mess with me! Your brother has a weak heart, you know. Don't surprise me like that!");
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayBoth("#b(This is why I don't want to call you Older Brother...)");
  ctx.setPlayerAsSpeaker(false);
  yield ctx.sayBoth('Hmph! Anyway, I\'m glad you were able to defeat the #o9300385#es. As a reward, I\'ll give you something an adventurer gave me a long time ago. Here you are.\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#i1372043# 1 #t1372043#\r\n#i2022621# 25 #t2022621#\r\n#i2022622# 25 #t2022622#s\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 910 exp');
  if (!ctx.addItems([
    [1372043, 1], // Wooden Wand
    [2022621, 25], // Tasty Milk
    [2022622, 25], // Squeezed Juice
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(910);
  ctx.forceCompleteQuest(22008);
  yield ctx.sayNext("#bThis is a weapon that Magicians use. It's a Wand#k. You probably won't really need it, but it'll make you look important if you carry it around. Hahahahaha.");
  yield ctx.sayPrev('Anyway, the Foxes have increased, right? How weird is that? Why are they growing day by day? We should really look into it and get to the bottom of this.');
}
