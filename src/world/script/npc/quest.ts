import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Util } from '../../../util/Util';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { InventoryType as InvType } from '../../item/InventoryType';

export function* q3314e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3314;
let potions = [ 2022199, 2022224, 2022228 ];
let russellon = 2111009;
ctx.setSpeakerId(russellon);
yield ctx.sayNext("Hahaha.... You're looking pale. That means it's working. " + "This experiment is a major success! Muahaha! I knew this would work on someone that's strong enough to destroy Roids! #b\r\n" + "#L0#(I knew this was a human experiment!)#l");
yield ctx.sayNext("You seem very surprised. Don't be! It's not a dangerous pill..." + "except for the side effect of death...luckily, there's an antidote for this... #b\r\n" + "#L0#(This is NOT what I need!)#l");
yield ctx.sayNext("So this proves that it's possible to temporarily change the human body state." + "This will make it much easier to work on Life Alchemy. This... will finally make his wish come true... #b\r\n" + "#L0#Who's he?#l");
yield ctx.sayNext("Yes, him. He was the best at Life Alchemy. As brilliant an alchemist as anyone I've ever met. " + "If he was around, this would have been over much earlier, but... the truth is, he's missing... \r\n\r\n" + "#fUI/UIWindow2.img/QuestIcon/5/0# \r\n\r\n" + "#fUI/UIWindow2.img/QuestIcon/8/0# 12500 exp \r\n\r\n" + "#fUI/UIWindow2.img/QuestIcon/11/0# Insight 40");
if (ctx.hasQuestStarted(questId)) {
  ctx.addExp(12500);
  /* trait exp !ported */;
  ctx.addItem(2050004, 10);
  let russellonPotion = Util.getRandomFromCollection(potions);
  ctx.addItem(russellonPotion, 20);
  ctx.forceCompleteQuest(questId);
}
yield ctx.sayNext("No one knows how or why he went missing. He had been getting antsy in days before he went missing, " + "and started secretly conducting experiments that no one knew existed...no matter how much we asked, " + "he never divulged any information on it. He was conducting experiments like a mad man... " + "research, research, more research. That's all he did, in the name of Life Alchemy... " + "then, that's when #bthat#k happened...");
yield ctx.sayNext("Even in the town of alchemists like Magatia, no one ever witnessed an explosion that big... " + "I can't even begin to fathom what kind of experiments he conducted. What kind of a monster was he digging up...? " + "The head of the alchemist society had already searched his house, so he should know what happened... " + "yet he's never revealed anything...");
yield ctx.sayNext("Even this experiment started off as joint research between him and myself. " + "But he's missing now, and it was impossible to go further with the experiment. " + "I knew what to do with potions and pills, but that was still tough. I'm continuing this on his behalf, but... " + "I don't understand why he thought of conducting a study on altering the state of the body...");
yield ctx.sayPrev("I am sure he's alive. There's a reason why he should be...");
}

export function* q3360s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3360;
  ctx.setSpeakerId(2111006);
  yield ctx.sayNext("Oh, you're here! Good thing, because I, Parwen, have found the master key that will allow you to enter the Secret Passage! Isn't it great? Tell me Parwen is great!");
  const response = yield ctx.askAccept("Now, the passcode is very long and complex, so I suggest you write it down somewhere. I'm only going to tell you this once, okay? Are you ready?");
  if (response) {
    const passPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) password += passPool.charAt(Util.getRandom(0, passPool.length - 1));
    ctx.forceStartQuest(questId);
    ctx.setQRValue(questId, '0');
    ctx.forceStartQuest(7061);
    ctx.setQRValue(7061, password);
    ctx.forceStartQuest(7062);
    ctx.setQRValue(7062, '00');
    yield ctx.sayOk("The passcode is #b" + password + "#k. You didn't forget it, did you? Enter this passcode at the entrance of Secret Passage, and you will have unlimited access to it.");
  } else {
    yield ctx.sayOk("You don't have something to write on, do you? Talk to me again when you're ready to get the passcode.");
  }
}

export function* q3514e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3514;
let sorcerer = 2140002;
ctx.setSpeakerId(sorcerer);
yield ctx.sayNext("Hmm, I see you've drank all of the potion. So how was it? " + "Wasn't I right about the effects? My potion is perfection!");
yield ctx.sayNext("What? You're ok with losing HP? That's nonsense! It's just not true! \r\n\r\n" + "#fUI/UIWindow2.img/QuestIcon/11/0# Willpower 50\r\n" + "#fUI/UIWindow2.img/QuestIcon/8/0# 4,916,000 exp");
/* trait exp !ported */;
ctx.addExp(4916000);
ctx.forceCompleteQuest(questId);
}

export function* q3523s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3523;
let recoveredMemory = 7081;
let balrog = 1022000;
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3524s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3524;
let recoveredMemory = 7081;
let grendel = 1032001;
ctx.setSpeakerId(grendel);
yield ctx.sayNext("That is some greatly refined magic. Something possessed only by those who call themselves great wizards... " + "Come to think of it, there was a beginner a long time ago who showed great potential to become a great wizard. " + "The name was... #h #.");
yield ctx.sayNext("You were just a beginner who didn't even know how to use Energy Bolt. " + "Now, look at you! You're all grown up! I'm so proud. I knew you could do it.");
yield ctx.sayNext("Continue to grow and advance. " + "As the one who has made you into a wizard, I can promise you that you will become a more powerful wizard...");
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3525s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3525;
let recoveredMemory = 7081;
let athena = 1012100;
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3526s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3526;
let recoveredMemory = 7081;
let darkLord = 1052001;
ctx.setSpeakerId(darkLord);
yield ctx.sayNext("The way you moved without a trace...you must have exceptional talent. " + "Long time no see, #h #.");
yield ctx.sayNext("Since when did you grow up to this point? You're no less inferior to any Dark Lord. " + "You were just a greenhorn that couldn't even hide their presence...Hmph, well, it's been a while since then. " + "Still, it feels weird to see you become so strong. I guess this is how it feels to be proud.");
yield ctx.sayNext("But don't let your guard down. Know that there's still more progress to be made. " + "As the one who has made you into a thief, I know you that you can be even stronger...!");
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3527s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3527;
let recoveredMemory = 7081;
let kyrin = 1090000;
ctx.setSpeakerId(kyrin);
yield ctx.sayNext("A stable position, with a calm demanor-- but I can tell you're hiding your explosive attacking abilities-- " + "you've become quite an impressive pirate, #h #. It's been a while.");
yield ctx.sayNext("You used to be a kid that was scared of water-- and look at you now. " + "I knew you'd grow to a formidable pirate, but like this? I am thrilled to see you all grown up like this.");
yield ctx.sayNext("What I can tell you is-- keep going. " + "As the person responsible for making you a pirate, I have no doubt in my mind that you still have room to grow-- " + "and that you will become an even more powerful force.");
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3529s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3529;
let recoveredMemory = 7081;
let neinheart = 1101002;
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3539s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3539;
let recoveredMemory = 7081;
let lilin = 1201000;
ctx.setSpeakerId(lilin);
yield ctx.sayNext("Oh, hello Aran. What brings you all the way back to Rien?");
yield ctx.sayNext("Memories? Memories with Aran... hmmm... there's plenty of that, of course. " + "Seeing you slowly piecing together your past while regaining the ability that made you a hero in the first place... " + "that itself is what I'd call fond memories...");
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3540s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3540;
let recoveredMemory = 7081;
let chiefStan = 1012003;
ctx.setSpeakerId(chiefStan);
yield ctx.sayNext("Wow, Evan! How nice to see you! Indeed, I have so many memories of you...");
yield ctx.sayNext("Well, I wouldn't go so far as to call it a memory, but... " + "When you, Gustav's shy little kid, stopped by on an errand... I had no idea that you'd rescue Camila! " + "Just look at you now, a bona fide hero of Maple World!");
yield ctx.sayNext("It's amazing how time flies.");
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3541s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3541;
let recoveredMemory = 7081;
let claudine = 2151003;
ctx.setSpeakerId(claudine);
yield ctx.sayNext("Long time, no see, #h #. I heard you left Edelstein to grow stronger... What brings you here?");
yield ctx.sayNext("Memories? Are you talking about our past together? " + "I can think of a few, but the one I remember most vividly is when you first came by the Underground Base, " + "saying you wanted to become part of the Resistance. " + "You were but a novice then... Look how strong you've become. Oh, how time flies!");
yield ctx.sayNext("But, I don't think it's quite the time for us to sit back and reminisce. We're still in the middle of battle. " + "Why don't we talk about our memories after the Black Wings are defeated and our town is recovered? " + "Then, we can talk and laugh all night long.");
ctx.forceStartQuest(questId);
ctx.forceCompleteQuest(questId);
ctx.forceStartQuest(recoveredMemory);
ctx.setQRValue(recoveredMemory, "1");
}

export function* q3759e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3759;
  ctx.setSpeakerId(2085000);
  yield ctx.sayNext("Whoa, you've brought it! Just hold on a minute! I'll make you the special potion.");
  yield ctx.sayNext("Alrighty! Are you ready? If you're are, I will go ahead and sprinkle this potion on you. You'll be able to fly then!");
  ctx.removeItem(4032531, 1);
  ctx.forceCompleteQuest(questId);
  const job = ctx.getJob();
  const soaringSkill = job >= 3000 ? 30001026 : job >= 2000 ? 20001026 : job >= 1000 ? 10001026 : 1026;
  ctx.giveSkill(soaringSkill);
  ctx.chatScript('You have obtained the Soaring skill!');
  yield ctx.sayPrev("Ok. Looks like you're all set to use the Soaring skill. There's one thing you should keep in mind. You can only use the Soaring skill where there's Dragon energy. The only such place that I know of is the Crimson Sky Dock.");
}

export function* q3933s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3933;
let ardin = 2101003;
ctx.setSpeakerId(ardin);
yield ctx.sayNext("I didn't think you'd be this strong. I feel like you have what it takes to become a member of the Sand Bandits. " + "The most important aspect of being a member is power, and I think you have that. " + "I also... want to test you one more time, just to make sure you're the right one. What do you think? Can you handle it?");
let response = yield ctx.askAccept("To truly see your strength, I'll have to face you myself. " + "Don't worry, I'll summon my other self to face off against you. Are you ready?");
if (response) {
  yield ctx.sayNext("Good. I like your confidence.");
  ctx.forceStartQuest(questId);
  ctx.warpInstanceIn(926000000);
} else {
  yield ctx.sayOk("Remember, you can't become a member of the Sand Bandits without my approval. I'll be waiting.");
}
}

export function* q3941s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3941;
let karcasa = 2101013;
let tigun = 2101004;
let isTigun = ctx.getnOptionByCTS(CharacterTemporaryStat.Morph) == 6;
ctx.setSpeakerId(karcasa);
if (isTigun) {
  yield ctx.sayNext("...aren't you #p" + String(tigun) + "#? " + "Long time! Thankfully, I was able to secure the silk that the queen has been desperately looking for. " + "As usual, the item is the finest you can find in this world... but why are you sweating so much? #b\r\n" + "#L0#(altering voice) No, it's just the sun...#l\r\n");
  yield ctx.sayNext("Well, since when was Ariant NOT hot? " + "It's always been like this, and I thought you never seemed to mind the heat, but... Why is your face rapidly turning red? " + "Are you okay? #b\r\n" + "#L0#(altering voice) I, I am okay. Don't worry about me...#l\r\n");
  yield ctx.sayNext("Are you sure you are okay? #p" + String(tigun) + "#, you look like you are not feeling too well. " + "Do you need some medicine? I have some cold medicine from El Nath. I'll sell it to you for cheap. #b\r\n" + "#L0#I told you I am fine!#l\r\n");
  let response = yield ctx.askAccept("Are you sure? But the weird thing is you sound much different from the norm. " + "Are you sure you don't have the cold? I mean, you are not acting like yourself at all. " + "Normally you'd always bargain hard for Lidium Ore, and... are you really #p" + String(tigun) + "#?");
  if (response) {
    yield ctx.sayNext("You don't act like you normally would. Normally, you'd be much more talkative than this... " + "Is there something going on? Wait... how come your face is turning redder and redder?" + "You must be enraged at something. I'm sorry, I'll bring the silk right now. Please wait.");
    ctx.forceStartQuest(3941); ctx.setQRValue(3941, "1");
  } else {
    yield ctx.sayOk("Hm. Come back when you're feeling better, alright?");
  }
} else {
  yield ctx.sayOk("What is it? You're looking for the Queen's silk? You know I can't just give that to some stranger, right?");
}
}

export function* q3941e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3941;
let karcasa = 2101013;
let tigun = 2101004;
let silk = 4031571;
let isTigun = ctx.getnOptionByCTS(CharacterTemporaryStat.Morph) == 6;
ctx.setSpeakerId(karcasa);
if (isTigun) {
  yield ctx.sayNext("Okay, here it is. Please handle this with care. This silk is very, very hard to find. " + "If it's damaged anywhere, you'll be in jail in no time. \r\n" + "#fUI/UIWindow2.img/QuestIcon/4/0# \r\n" + "1 " + ctx.formatInlineItem(silk));
  if (ctx.canAddItem(silk, 1)) {
    ctx.addItem(silk, 1);
    ctx.forceCompleteQuest(questId);
  } else {
    yield ctx.sayOk("Er, #p" + String(tigun) + "#, it looks like you can't hold the silk. Talk to me again after you make some space.");
  }
} else {
  yield ctx.sayOk("Okay, here it is. Please handle this with... huh? #p" + String(tigun) + "#, where did you go?");
}
}

export function* q3953e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 3953;
let muhamad = 2100001;
let lidium = 4011008;
ctx.setSpeakerId(muhamad);
let resOne = yield ctx.sayNext("If you're going to keep blabbing some nonsense about how Deo has turned into a monster, I'm not interested! " + "...Huh? Hmm... isn't this Lidium? Looking at its color, this is high-quality Lidium...and it's in good condition..." + "Hmm... you're giving this to me? Well... I can't say no to Lidium. Fine... what is it? #b\r\n\r\n" + "#L0#I want to inform you that Deo is a monster.#l\r\n" + "#L1#Have you heard that a group of merchants crossing through the desert were attacked by the monsters?#l");
if (resOne == 1) {
  let resTwo = yield ctx.sayNext("The merchants? ...They probably lacked protection. " + "There aren't any particularly dangerous monsters in the Burning Road, but we should always remain cautious... " + "You must be careful in the desert. #b\r\n\r\n" + "#L0#This won't happen if we defeat Deo.#l\r\n" + "#L1#This is all because of the Queen's negligence in maintaining the safety of the town.#l");
  if (resTwo == 1) {
    let resThree = yield ctx.sayNext("You're right! It's because of the Queen! " + "Ever since her reign, the ever-wise Abdullah VIII has changed and Ariant is slowly perishing..." + "like an oasis drying out! And it's all her fault! #b\r\n\r\n" + "#L0#What is the guardian of deserts doing when we're under the Queen's tyranny?#l\r\n" + "#L1#We must hurry up and form an army to escape from the Queen's oppression.#l");
    if (resThree == 0) {
      let resFour = yield ctx.sayNext("...I agree. Only if Deo had helped us a little... " + "How could he be so heartless? #b\r\n\r\n" + "#L0#Perhaps, Deo has already turned into a monster.#l\r\n" + "#L1#He couldn't have done anything as a monster, right?#l");
      if (resFour == 0) {
        yield ctx.sayNext("What are you talking about? Deo has turned into...a monster? " + "But he's the guardian deity of Ariant... Well, Ariant isn't the same as it used to be. #b\r\n\r\n" + "#L0#I know...and on top of that, Queen Areda is sucking the life out of the desert. " + "Perhaps Deo's divine powers were lost and he gradually turned into a monster...#l");
        ctx.forceCompleteQuest(questId);
        ctx.removeItem(lidium, 1);
        yield ctx.sayOk("You might be right. I can't believe Ariant has changed like this, " + "but this could be directly related to Deo's transformation. " + "Perhaps, it really is time for us to defeat Deo...");
      } else {
        yield ctx.sayOk("No. Surely Deo still has his powers and still cares for Ariant deep inside...");
      }
    } else {
      yield ctx.sayOk("Yes, but we can't be too hasty. We need to wait until the time is right.");
    }
  } else {
    yield ctx.sayOk("And what would that achieve? Deo is the guardian of the desert, is he not?");
  }
} else {
  yield ctx.sayOk("Didn't I just say I'm not interested in hearing about Deo turning into a monster? Stop wasting my time!");
}
}

export function* q6006e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 6006;
let blue_dragon_turtle_etc = 4000262;
let green_hobi_etc = 4000261;
let silver_mane = 80001305;
ctx.setSpeakerId(2060005);
yield ctx.sayNext("You've gathered all the materials. With them, I can upgrade that Hog into a silver Mane!");
yield ctx.sayNext("It is done. Your hog is now #bSilver Mane#k.");
yield ctx.sayOk("I'm glad you love Monster Riding, but your Silver Mane won't be able to run well if you don't take care of its health. Care for it well, okay?");
ctx.removeItem(4000262, 500);
ctx.removeItem(4000261, 500);
ctx.deductMesos(50000000);
ctx.giveSkill(silver_mane);
ctx.forceCompleteQuest(6006);
}

export function* q6010e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 6010;
let draco = 80001306;
yield ctx.sayOk("Once you are ready to accept your new companion, step up.\r\n" + "You will now be encountering a mysterious being totally unlike anything you've ever faced.");
yield ctx.sayOk("You are the one who has already exceeded the boundaries and the limits of a human being... the only time the proud Red Draco bows its head is to you. Hopefully you'll experience new, amazing adventures that are surely to await you with Red Draco...");
ctx.giveSkill(draco);
}

export function* q20520e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 20520;
yield ctx.sayNext("Wow, you have already reached Level 50, yet why are you still walking around like that? I mean, you've reached Level 50, but you are still walking around with your own feet. That's an unusual behavior for a Knight like you.");
if (yield ctx.askYesNo("Well, I suppose it's up to you, but by doing that, you also risk marring the pride and honor of the Empress. This is why I am here to give you a helpful pointer. It's called #bMonster Riding#k. Of course you're interested in this, right?")) {
  yield ctx.sayOk("There's a special mount that only the Cygnus Knights can enjoy. If you are interested, come visit me at #bEreve.#k");
}
ctx.forceCompleteQuest(20520);
}

export function* q20522e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 20522;
let mimiana_egg = 4220137;
if (!ctx.hasItem(mimiana_egg)) {
  yield ctx.sayNext("The riding for Knights are a bit different from the ride available for regular folks." + " This takes place through a creature that is of the Mimi race that can be found on this island; they are called #bMimianas#k. Instead of riding monsters, the Knights ride Mimiana. " + "There's one thing that you should never, ever forget.");
  yield ctx.sayNext("Don't think of this as just a form of a mount or transportation. These mounts can be your friend, your comrade, your colleague... all of the above. Even a friend close enough to entrust your life! That's why the Knights of Ereve actually grow their own mounts.");
  if (yield ctx.askYesNo("Now, here's a Mimiana egg. Are you ready to raise a Mimiana and have it as your traveling companion for the rest of its life?")) {
    if (ctx.getEmptyInventorySlots(InvType.ETC) == 0) {
      yield ctx.sayOk("Please check and see if your Etc. inventory is full or not.");
    } else {
      ctx.addItem(mimiana_egg, 1);
      yield ctx.sayOk("Mimiana's egg can be raised by #bsharing your daily experiences with it.#k Once Mimiana fully grows up please come see me.");
    }
  }
} else if (ctx.hasItem(mimiana_egg)) {
  yield ctx.sayNext("Hey there! How's Mimiana's egg?");
  yield ctx.sayNext("Oh, were you able to awaken Mimiana Egg? That's amazing... Most knights can't even dream of awakening it in such a short amount of time.");
  ctx.removeItem(mimiana_egg, 1);
  ctx.forceCompleteQuest(20522);
}
}

export function* q21200s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21200;
ctx.setSpeakerId(1510009);
if (yield ctx.askYesNo("How is your training going? Wow, you've reached such a high level! That's amazing. I knew you would do just fine on Victorial Island... Oh, look at me. I'm wasting your time. I know you're busy, but you'll have to return to the island for a bit.")) {
  ctx.forceStartQuest(questId);
  yield ctx.sayNext("Your #b#p1201001##k in #b#m140000000##k is acting strange all of a sudden. According to the records, the Polearm acts this way when it is calling for its master. #bPerhaps it's calling for you#k. Please return to the island and check things out.");
  return;
} else {
  return;
}
}

export function* q21200e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21200;
ctx.setSpeakerId(1201001);
yield ctx.sayNext("Voom voom voom voom...");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("#b(The #p1201001# is producing an undulating echo. But who is that boy standing over there?)");
yield ctx.sayNext("You've never seen him before. He doesn't look human.");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("Yo, Aran! Do you not hear me? I said, do you not hear me! Ugh, how frustrating!");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("#b(Hm? Who's voice was that? It sounds like an angry boy...)");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("Ugh, my only master had to end up trapped in ice for hundreds of years, abandoning me completely, and is now completely ignoring me.");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("Who...are you?");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("Aran? Do you hear me now? It's me! Don't you recognize me? I'm your weapon, #b#p1201002# the polearm#k!");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("#b(...#p1201002#? A #p1201001# can talk?");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("What's with that suspicious look on your face? I know you've lost your memory, but did you forget about me, too? How could you?!");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("I'm so sorry, but I can't remember a thing.");
ctx.setSpeakerId(1201002);
if (yield ctx.askYesNo("Sorry doesn't cut it! Do you know how lonely and bored I was for hundreds of years? I don't care what it takes! Remember me! Remember me now!")) {
  ctx.forceCompleteQuest(questId);
  ctx.setPlayerAsSpeaker(true);
  yield ctx.sayNext("#b(The voice that claims to be #p1201002#? the #p1201001# is yelling in frustration. You don't think this conversation is going anywhere. You better go talk to #p1510009# first.)");
  return;
} else {
  return;
}
}

export function* q21201e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21201;
ctx.setSpeakerId(1201002);
yield ctx.sayNext("First you promise to defeat the Black Mage and make me a famous weapon, then you abandon me for hundreds of years, and now you're telling me you don't remember who I am? What the...?! Do you think I'll let you get away with that? You're the one who begged and pined for me!");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("I did tell #p1203000# to make a polearm for me if I could prove my worth.");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("After all that begging, shouldn't you treat me with a little more love and respect? Ya know, a weapon like me's rare and a wonderful thing. I am the ultimate #p1201001# that can help you defeat the Black Mage. How could you ditch me for hundreds of years...");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("Hey, I never begged for you.");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("What? You never begged for me? Ha! #p1203000# told me you got on your knees, begged for me in tears, and... Wait a sec. Aran! Did you just remember who I am?!");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("Maybe a little bit...");
ctx.setSpeakerId(1201002);
yield ctx.sayNext("Aran, it is you! *Sniff sniff* Wait, *ahem* I didn't get emotional, it's just allergies. I know the Black Mage has stripped you of your abilities so you probably don't even have the strength to lift me... but at least you remember me! I'm glad that your memory's starting to return.");
if (yield ctx.askYesNo("Evn though you've lost your memory, you're still my master. You endured some very tough training in the past, and I'm sure your body still remembers the skills that got you through those hard times. Alright, I'll restore your abilities!")) {
  if (!ctx.canAddItem(1142130, 1)) {
    yield ctx.sayOk("Please make some space in your equipment inventory.");
    return;
  }
  ctx.forceCompleteQuest(questId);
  ctx.addItem(1142130, 1);
  ctx.jobAdvance(2110);
  yield ctx.sayNext("Your level isn't what it used to be back in your glory days, so I can't restore all of your old abilities. But the few that I can restore should help you level up faster. Now hurry up and train so you can return to the old you.");
}
}

export function* q21202s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21202;
ctx.setSpeakerId(1203000);
yield ctx.sayNext("Hmm... What's a young person like you doing in this secluded place?");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("I've come to get the best Polearm there is!");
ctx.setSpeakerId(1203000);
yield ctx.sayNext("The best Polearm? You should be able to purchase it in some town or other...");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("I hear that you are the best blacksmith in all of Maple World! I want nothing less than a weapon made by you!");
ctx.setSpeakerId(1203000);
if (yield ctx.askYesNo("I'm too old to make weapons now, but... I do have a Polearm that i made way back when. It's still in excellent shape. But I can't give it to you because that Polearm is extremely sharp, so sharp it could even hurt its master. Do you still want it?")) {
  ctx.forceStartQuest(questId);
  yield ctx.sayOk("Well, if you say so... I can't object to that. I'll tell you what. I'll give you a quick test, and if you pass it, the #p1201001# is yours. Head over to the #bTraining Center#k and take on the #r#o9831006##k that are there. your job is to bring back #b30 Sign of Acceptances#k.");
  return;
} else {
  return;
}
}

export function* q21202e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21202;
ctx.setSpeakerId(1203000);
yield ctx.sayNext("Oh, have you brought me the Sign of Acceptances? You're stronger than I thought! But more importantly, I am impressed with the amount of courage you displayed when you agreed to take this dangerous weapon without any hesitation. You deserve it. The #p1201001# is yours.");
yield ctx.sayNext("(After a long time passed, #p1203000# handed you the #p1201001# which was carefully wrapped in cloth.)");
if (yield ctx.askYesNo("Here, this is #p1201002#, the Polearm you've asked for. Please take good care of it.")) {
  ctx.warpInstanceOut(140030000);
  ctx.forceCompleteQuest(questId);
  ctx.removeItem(4032311, 30);
}
}

export function* q21300s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21300;
ctx.setSpeakerId(1510009);
yield ctx.sayNext("How is the training going? Hm, Lv. 60? You still ahve a long way to go, but it's definitely praiseworthy compared to the first time I met you. Continue to train diligently, and I'm sure you'll regain your strength soon!");
if (yield ctx.askYesNo("But first, you must head to #b#m140000000##k your #b#p1201001##k is acting weird again. I think it has something to tell you. It might be able to restore your abilities, so please hurry.")) {
  ctx.forceStartQuest(questId);
  yield ctx.sayOk("Anyway, I thought it was really something that a weapon had its own identity, but this weapon gets extremely annoying. It cries, saying that I'm not paying attention to its needs, and now... Oh, please keep this a secret from the Polearm. I don't think it's a good idea to upset the weapon any more than I already have.");
  return;
} else {
  return;
}
}

export function* q21301e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21301;
ctx.setSpeakerId(1201002);
if (yield ctx.askYesNo("Did you slay the #o2600111#? Yippy! You're my master, indeed! Now, give me the Red Jade you fuond! I'll reattach it and... Wait, why aren't you saying anything? Don't tell me you didn't bring it back...")) {
  yield ctx.sayNext("What? You didn't bring the Red Jade?! Why not?! Did you forget?! Yikes, I never thought the Black Mage's curse would turn you into a dummy...");
  yield ctx.sayNext("No, I can't let this drive me to despair. Now more than ever, I must stay optimistic and alert. Argh...");
  yield ctx.sayNext("You can go back if you want, but I'm sure the thief has already fled the scene. You'll just have to make a new Red Jade. You've made one before, so you remember the required materials, don't you? So hurry it up.");
  ctx.forceCompleteQuest(questId);
  return;
} else {
  return;
}
}

export function* q21302e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21302;
ctx.setSpeakerId(1201002);
yield ctx.sayNext("Oh, isn't that... Hey, did you remember how to make the Red Jade? You may be a dummy who has amnesia, but this is why I can't leave you. Now hurry, give me the gem!");
if (yield ctx.askYesNo("Okay, now that I have the power of Red Jade, I'll restore more of your abilities. Your level has gotten much higher since the last time we met, so I'm sure I can work my  magic a bit more this time!")) {
  if (!ctx.canAddItem(1142131, 1)) {
    yield ctx.sayOk("Please make some space in your equipment inventory.");
    return;
  }
  ctx.forceCompleteQuest(questId);
  ctx.addItem(1142131, 1);
  ctx.jobAdvance(2111);
  ctx.removeItem(4032312, 1);
  yield ctx.sayNext("Please get back all of your abilities soon. I want to explore with you like we did in the good old days.");
}
}

export function* q21303s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21303;
ctx.setSpeakerId(1203001);
yield ctx.sayNext("*Sob sob* #p1203001# is sad. #p1203001# is mad. #p1203001# cries. *Sob sob*");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("Wh...What's wrong?");
ctx.setSpeakerId(1203001);
yield ctx.sayNext("#p1203001# made gem. #bGem as red as apple#k. But #rthief#k stole gem. #p1203001# no longer has gem. #p1203001# is sad...");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("A thief stole your red gem?");
ctx.setSpeakerId(1203001);
if (yield ctx.askYesNo("yes, #p1203001# wants gem back. #p1203001# reward you if you find gem. Catch thief and you get reward.")) {
  ctx.forceStartQuest(questId);
  yield ctx.sayNext("The thief wen that way! Which way? Hold on...eat with right hand, not left hand... #bLeft#k! He went left! Go left and you find thief.");
  return;
} else {
  return;
}
}

export function* q21400s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21400;
ctx.setSpeakerId(1510009);
if (yield ctx.askYesNo("How is the training going? I know you're busy, but please come to #bRien#k immediately. The #bMaha#k has started to act weird again... But it's even weirder now. it's different from before. It's... darker than usual.")) {
  ctx.forceStartQuest(questId);
  yield ctx.sayOk("I have a bad feeling about this. Please come back here. I've never seen or heard Maha like this, but I can sense the suffering it's going through. #bOnly you, the master of Maha, can do something about it#k!");
  return;
} else {
  return;
}
}

export function* q21401s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21401;
  ctx.setSpeakerId(1201002);
  yield ctx.sayNext("Why do I look like this, you ask? I don't want to talk about it, but I suppose I can't hide from you since you're my master...");
  yield ctx.sayNext("While you were trapped inside ice for hundreds of years, I, too, was frozen. It was a long time to be away from you. That's when the seed of darkness was planted in my heart.");
  yield ctx.sayNext("But since you awoke, I thought the darkness had gone away. I thought things would return to the way they were, but I was mistaken.");
  if (yield ctx.askYesNo("Please, Aran. Please stop me from becoming enraged. Only you can control me. It's out of my hands now. Please do whatever it takes to #rstop me from going berserk#k!")) {
    ctx.forceStartQuest(questId);
    ctx.warpInstanceIn(914020000);
    ctx.setInstanceTime(20 * 60);
  }
}

export function* q21401e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 21401;
ctx.setSpeakerId(1201002);
yield ctx.sayNext("Thank you, Aran. If it weren't for you, I would have become enraged and who knows what could have happened. Thank you NOT! It's only your duty as my mster...");
if (yield ctx.askYesNo("Anyways, I just noticed how high of a level you've reached. If you were able to control me in my state of rage, I think you're ready to handle more abilities")) {
  if (!ctx.canAddItem(1142132, 1)) {
    yield ctx.sayOk("Please make some space in your equipment inventory.");
    return;
  }
  ctx.addItem(1142132, 1);
  ctx.jobAdvance(2112);
  ctx.forceCompleteQuest(questId);
  yield ctx.sayNext("Your skills have been restored. Those skills have been dormant for so long that you'll have to re-train yourself. but you'll be as good as new once you complete your training.");
  yield ctx.sayNext("Even with all that, however, you still have a long way to go until you return to the old you.");
}
}

export function* q22300s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 22300;
let echo = 20011005;
let heroSuccessor = 1142158;
let mir = 1013000;
ctx.setSpeakerId(mir);
yield ctx.sayNext("Master, master, look at this. There's something wrong with one of my scales!");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("That's...?! \r\n\r\n" + "Mir, one of your scales is showing the #bOnyx Dragon's Mark#k!");
ctx.setSpeakerId(mir);
yield ctx.sayNext("Really? That's weird... \r\n\r\n" + "Oh, I know! Then that means it's time.");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("It's time?");
ctx.setSpeakerId(mir);
yield ctx.sayNext("It's time for us to inherit Freud and Afrien's powers. " + "We've gotten very strong lately. And master's spirit is growing too...");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("Huh? Really?");
ctx.setSpeakerId(mir);
yield ctx.sayNext("You didn't know that? An Onyx Dragon responds to a strong spirit, " + "so I've been feeling that every day. It's not particularly strong unlike with the previous Dragon Masters, " + "but we'll be able to match them someday. \r\n\r\n" + "Ah, the scale fell off.");
ctx.setPlayerAsSpeaker(true);
yield ctx.sayNext("But the scale is still shining.");
ctx.setSpeakerId(mir);
let response = yield ctx.askAccept("Master, take this scale. It feels like I've shed something to take another step forward.");
if (response) {
  if (ctx.canAddItem(heroSuccessor, 1)) {
    ctx.giveSkill(echo);
    ctx.addItem(heroSuccessor, 1);
    ctx.forceStartQuest(questId);
    ctx.forceCompleteQuest(questId);
    ctx.setPlayerAsSpeaker(true);
    yield ctx.sayNext(ctx.join(["(You received #p", String(mir), "#'s dragon scale. " + "As you place your hand on the scale, it magically transforms into #i", String(heroSuccessor), "#.)"]));
    yield ctx.sayNext("(You have learned #b#q" + String(echo) + "##k.)");
    yield ctx.sayNext("Yay, a new skill! Now I really look like Freud's true successor!");
    ctx.setSpeakerId(mir);
    yield ctx.sayPrev("Hehe. Congratulations, master. Let's keep on growing to surpass our predecessors!");
  } else {
    yield ctx.sayOk("Master, make some space in your Equip inventory first.");
  }
}
}

export function* q29906e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29906;
return;
}

export function* q29907e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29907;
return;
}

export function* q29910s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29910;
let medal = 1142009;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29911s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29911;
let medal = 1142010;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29912s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29912;
let medal = 1142011;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29913s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29913;
let medal = 1142012;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29914s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29914;
let medal = 1142013;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29924s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29924;
let medal = 1142129;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29925s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29925;
let medal = 1142130;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29926s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29926;
let medal = 1142131;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29927s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29927;
let medal = 1142132;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}

export function* q29928s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const questId = 29928;
let medal = 1142133;
if (ctx.canAddItem(medal, 1)) {
  ctx.chatScript("You have earned a new medal.");
  ctx.forceStartQuest(questId);
  ctx.forceCompleteQuest(questId);
}
}
