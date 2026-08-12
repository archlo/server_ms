import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Reward } from '../../../provider/reward/Reward';

export function* tutorialSkip(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Administrator (2007)
  //   Maple Road : Mushroom Park (10000)
  if (yield ctx.askYesNo('Would you like to skip the tutorials and head straight to Lith Harbor?')) {
    ctx.warp(104000000); // Lith Harbor : Lith Harbor
  } else {
    yield ctx.sayNext('Enjoy your trip.');
  }
}

export function* tutoChatNPC(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Mushroom Park (10000) - tuto00 (-95, 428)
  yield* tutorialSkip(ctx);
}

export function* begin5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Robin (2003)
  //   Maple Road : Inside the Dangerous Forest (50000)
  const answer: number = yield ctx.askMenu('Now...ask me any questions you may have on traveling!!', new Map([
    [0, 'How do I move?'],
    [1, 'How do I take down the monsters?'],
    [2, 'How can I pick up an item?'],
    [3, 'What happens when I die?'],
    [4, 'When can I choose a job?'],
    [5, 'Tell me more about this island!'],
    [6, 'What should I do to become a Warrior?'],
    [7, 'What should I do to become a Bowman?'],
    [8, 'What should I do to become a Magician?'],
    [9, 'What should I do to become a Thief?'],
    [10, 'How do I raise the character stats? (S)'],
    [11, 'How do I check the items that I just picked up?'],
    [12, 'How do I put on an item?'],
    [13, "How do I check out the items that I'm wearing?"],
    [14, 'What are skills? (K)'],
    [15, 'How do I get to Victoria Island?'],
    [16, 'What are mesos?'],
  ]));
  switch (answer) {
    case 0:
      yield ctx.sayNext("Alright this is how you move. Use #bleft, right arrow#k to move around the flatland and slanted roads, and press #bAlt#k to jump. A select number of shoes improve your speed and jumping abilities.");
      yield ctx.sayBoth("In order to attack the monsters, you'll need to be equipped with a weapon. When equipped, press #bCtrl#k to use the weapon. With the right timing, you'll be able to easily take down the monsters.");
      break;
    case 1:
      yield ctx.sayNext("Here's how to take down a monster. Every monster possesses an HP of its own and you'll take them down by attacking with either a weapon or through spells. Of course the stronger they are, the harder it is to take them down.");
      yield ctx.sayBoth("Once you make the job advancement, you'll acquire different kinds of skills, and you can assign them to HotKeys for easier access. If it's an attacking skill, you don't need to press Ctrl to attack, just press the button assigned as a HotKey.");
      break;
    case 2:
      yield ctx.sayNext("This is how you gather up an item. Once you take down a monster, an item will be dropped to the ground. When that happens, stand in front of the item and press #bZ#k or #b0 on the NumPad#k to acquire the item.");
      yield ctx.sayBoth("Remember, though, that if your item inventory is full, you won't be able to acquire more. So if you have an item you don't need, sell it so you can make something out of it. The inventory may expand once you make the job advancement.");
      break;
    case 3:
      yield ctx.sayNext("Curious to find out what happens when you die? You'll become a ghost when your HP reaches 0. There will be a tombstone in that place and you won't be able to move, although you still will be able to chat.");
      yield ctx.sayBoth("There isn't much to lose when you die if you are just a beginner. Once you have a job, however, it's a different story. You'll lose a portion of your EXP when you die, so make sure you avoid danger and death at all cost.");
      break;
    case 4:
      yield ctx.sayNext("When do you get to choose your job? Hahaha, take it easy, my friend. Each job has a requirement set for you to meet. Normally a level between 8 and 10 will do, so work hard.");
      yield ctx.sayBoth("Level isn't the only thing that determines the advancement, though. You also need to boost up the levels of a particular ability based on the occupation. For example, to be a warrior, your STR has to be over 35, and so forth, you know what I'm saying? Make sure you boost up the abilities that has direct implications to your job.");
      break;
    case 5:
      yield ctx.sayNext("Want to know about this island? It's called Maple Island and it floats in the air. It's been floating in the sky for a while so the nasty monsters aren't really around. It's a very peaceful island, perfect for beginners!");
      yield ctx.sayBoth("But, if you want to be a powerful player, better not think about staying here for too long. You won't be able to get a job anyway. Underneath this island lies an enormous island called Victoria Island. That place is so much bigger than here, it's not even funny.");
      break;
    case 6:
      yield ctx.sayNext("You want to become a #bWarrior#k? Hmm, then I suggest you head over to Victoria Island. Head over to a warrior-town called #rPerion#k and see #bDances with Balrog#k. He'll teach you all about becoming a true warrior. Ohh, and one VERY important thing: You'll need to be at least level 10 in order to become a warrior!!");
      break;
    case 7:
      yield ctx.sayNext("You want to become a #bBowman#k? You'll need to go to Victoria Island to make the job advancement. Head over to a bowman-town called #rHenesys#k and talk to the beautiful #bAthena Pierce#k and learn the in's and out's of being a bowman. Ohh, and one VERY important thing: You'll need to be at least level 10 in order to become a bowman!!");
      break;
    case 8:
      yield ctx.sayNext("You want to become a #bMagician#k? For you to do that, you'll have to head over to Victoria Island. Head over to a magician-town called #rEllinia#k, and at the very top lies the Magic Library. Inside, you'll meet the head of all wizards, #bGrendel the Really Old#k, who'll teach you everything about becoming a wizard.");
      yield ctx.sayBoth("Oh by the way, unlike other jobs, to become a magician you only need to be at level 8. What comes with making the job advancement early also comes with the fact that it takes a lot to become a true powerful mage. Think long and carefully before choosing your path.");
      break;
    case 9:
      yield ctx.sayNext("You want to become a #bThief#k? In order to become one, you'll have to head over to Victoria Island. Head over to a thief-town called #rKerning City#k, and on the shadier side of town, you'll see a thief's hideaway. There, you'll meet #bDark Lord#k who'll teach you everything about being a thief. Ohh, and one VERY important thing: You'll need to be at least level 10 in order to become a thief!!");
      break;
    case 10:
      yield ctx.sayNext("You want to know how to raise your character's ability stats? First press #bS#k to check out the ability window. Every time you level up, you'll be awarded 5 ability points aka AP's. Assign those AP's to the ability of your choice. It's that simple.");
      yield ctx.sayBoth("Place your mouse cursor on top of all abilities for a brief explanation. For example, STR for warriors, DEX for bowman, INT for magician, and LUK for thief. That itself isn't everything you need to know, so you'll need to think long and hard on how to emphasize your character's strengths through assigning the points.");
      break;
    case 11:
      yield ctx.sayNext("You want to know how to check out the items you've picked up, huh? When you defeat a monster, it'll drop an item on the ground, and you may press #bZ#k to pick up the item. That item will then be stored in your item inventory, and you can take a look at it by simply pressing #bI#k.");
      break;
    case 12:
      yield ctx.sayNext("You want to know how to wear the items, right? Press #bI#k to check out your item inventory. Place your mouse cursor on top of an item and double-click on it to put it on your character. If you find yourself unable to wear the item, chances are your character does not meet the level & stat requirements. You can also put on the item by opening the equipment inventory (#bE#k) and dragging the item into it. To take off an item, double-click on the item at the equipment inventory.");
      break;
    case 13:
      yield ctx.sayNext("You want to check on the equipped items, right? Press #bE#k to open the equipment inventory, where you'll see exactly what you are wearing right at the moment. To take off an item, double-click on the item. The item will then be sent to the item inventory.");
      break;
    case 14:
      yield ctx.sayNext("The special 'abilities' you get after acquiring a job are called skills. You'll acquire skills that are specifically for that job. You're not at that stage yet, so you don't have any skills yet, but just remember that to check on your skills, press #bK#k to open the skill book. It'll help you down the road.");
      break;
    case 15:
      yield ctx.sayNext("How do you get to Victoria Island? On the east of this island there's a harbor called Southperry. There, you'll find a ship that flies in the air. In front of the ship stands the captain. Ask him about it.");
      yield ctx.sayBoth("Oh yeah! One last piece of information before I go. If you are not sure where you are, always press #bW#k. The world map will pop up with the locator showing where you stand. You won't have to worry about getting lost with that.");
      break;
    case 16:
      yield ctx.sayNext("It's the currency used in MapleStory. You may purchase items through mesos. To earn them, you may either defeat the monsters, sell items at the store, or complete quests...");
      break;
  }
}

export function* begin7(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Shanks (22000)
  //   Maple Road : Southperry (2000000)
  if (!(yield ctx.askYesNo("Take this ship and you'll head off to a bigger continent. For #e150 mesos#n, I'll take you to #bVictoria Island#k. The thing is, once you leave this place, you can't ever come back. What do you think? Do you want to go to Victoria Island?"))) {
    yield ctx.sayOk("Hmm... I guess you still have things to do here?");
    return;
  }
  if (ctx.getLevel() < 7) {
    yield ctx.sayOk("Let's see... I don't think you are strong enough. You'll have to be at least Level 7 to go to Victoria Island.");
    return;
  }
  // Lucas's Recommendation Letter
  if (ctx.hasItem(4031801)) {
    yield ctx.sayNext("Okay, now give me 150 mesos... Hey, what's that? Is that the recommendation letter from Lucas, the chief of Amherst? Hey, you should have told me you had this. I, Shanks, recognize greatness when I see one, and since you have been recommended by Lucas, I see that you have a great, great potential as an adventurer. No way would I charge you for this trip!");
    yield ctx.sayBoth("Since you have the recommendation letter, I won't charge you for this. Alright, buckle up, because we're going to head to Victoria Island right now, and it might get a bit turbulent!!");
    if (ctx.removeItem(4031801, 1)) {
      ctx.warp(2010000); // goLith
    }
  } else {
    yield ctx.sayNext("Bored of this place? Here... Give me #e150 mesos#n first...");
    if (ctx.addMoney(-150)) {
      yield ctx.sayNext("Awesome! #e150#n mesos accepted! Alright, off to Victoria Island!");
      ctx.warp(2010000); // goLith
    } else {
      yield ctx.sayOk("What? You're telling me you wanted to go without any money? You're one weirdo...");
    }
  }
}

export function* infoSwordman(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dances with Balrog : Warrior Job Instructor (10202) - Maple Road : Split Road of Destiny (1020000)
  yield ctx.sayNext("Warriors possess an enormous power with stamina to back it up, and they shine the brightest in melee combat situation. Regular attacks are powerful to begin with, and armed with complex skills, the job is perfect for explosive attacks.");
  if (yield ctx.askYesNo("Would you like to experience what it's like to be a Warrior?")) {
    ctx.warp(1020100); // goSwordman
  } else {
    yield ctx.sayNext("If you wish to experience what it's like to be a Warrior, come see me again.");
  }
}

export function* infoMagician(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Grendel the Really Old : Magician Job Instructor (10201) - Maple Road : Split Road of Destiny (1020000)
  yield ctx.sayNext("Magicians are armed with flashy element-based spells and secondary magic that aids party as a whole. After the 2nd job adv., the elemental-based magic will provide ample amount of damage to enemies of opposite element.");
  if (yield ctx.askYesNo("Would you like to experience what it's like to be a Magician?")) {
    ctx.warp(1020200); // goMagician
  } else {
    yield ctx.sayNext("If you wish to experience what it's like to be a Magician, come see me again.");
  }
}

export function* infoArcher(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Athena Pierce : Bowman Job Instructor (10200) - Maple Road : Split Road of Destiny (1020000)
  yield ctx.sayNext("Bowmen are blessed with dexterity and power, taking charge of long-distance attacks, providing support for those at the front line of the battle. Very adept at using landscape as part of the arsenal.");
  if (yield ctx.askYesNo("Would you like to experience what it's like to be a Bowman?")) {
    ctx.warp(1020300); // goArcher
  } else {
    yield ctx.sayNext("If you wish to experience what it's like to be a Bowman, come see me again.");
  }
}

export function* infoRogue(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dark Lord : Thief Job Instructor (10203) - Maple Road : Split Road of Destiny (1020000)
  yield ctx.sayNext("Thieves are a perfect blend of luck, dexterity, and power that are adept at surprise attacks against helpless enemies. A high level of avoidability and speed allows the thieves to attack enemies with various angles.");
  if (yield ctx.askYesNo("Would you like to experience what it's like to be a Thief?")) {
    ctx.warp(1020400); // goRogue
  } else {
    yield ctx.sayNext("If you wish to experience what it's like to be a Thief, come see me again.");
  }
}

export function* infoPirate(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kyrin : Pirate Job Instructor (10204) - Maple Road : Split Road of Destiny (1020000)
  yield ctx.sayNext("Pirates are blessed with outstanding dexterity and power, utilizing their guns for long-range attacks while using their power on melee combat situations. Gunslingers use elemental-based bullets for added damage, while Infighters transform to a different being for maximum effect.");
  if (yield ctx.askYesNo("Would you like to experience what it's like to be a Pirate?")) {
    ctx.warp(1020500); // goPirate
  } else {
    yield ctx.sayNext("If you wish to experience what it's like to be a Pirate, come see me again.");
  }
}

export function* infoAttack(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Inside the Small Forest (40000) - tuto00 (88, 194)
  ctx.avatarOriented('UI/tutorial.img/20');
}

export function* infoPickup(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Inside the Small Forest (40000) - tuto01 (657, 133)
  ctx.avatarOriented('UI/tutorial.img/21');
}

export function* infoReactor(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Rainbow Street : Amherst (1000000) - tuto00 (567, 228) / tuto01 (202, 226)
  ctx.avatarOriented('UI/tutorial.img/22');
}

export function* infoSkill(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Inside the Small Forest (40000) - tuto02 (824, 133)
  ctx.avatarOriented('UI/tutorial.img/23');
}

export function* infoMinimap(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Mushroom Park (10000) - tuto01 (280, 455)
  ctx.avatarOriented('UI/tutorial.img/25');
}

export function* infoWorldmap(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Inside the Dangerous Forest (50000) - tuto00 (1228, 244)
  ctx.avatarOriented('UI/tutorial.img/26');
}

export function* glTutoMsg0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Mushroom Park (10000) - glBmsg0/glBmsg1
  // Maple Road : Snail Park (20000) - glBmsg0
  // Maple Road : Snail Garden (30000) - glBmsg0
  ctx.balloonMsg('Once you leave this area you won\'t be able to return.', 150, 5);
}

export function* entertraining(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Entrance to Adventurer Training Center (1010000) - in00 (74, 154)
  if (ctx.hasQuestStarted(1041)) {
    ctx.playPortalSE();
    ctx.warp(1010100, 'out00');
  } else if (ctx.hasQuestStarted(1042)) {
    ctx.playPortalSE();
    ctx.warp(1010200, 'out00');
  } else if (ctx.hasQuestStarted(1043)) {
    ctx.playPortalSE();
    ctx.warp(1010300, 'out00');
  } else if (ctx.hasQuestStarted(1044)) {
    ctx.playPortalSE();
    ctx.warp(1010400, 'out00');
  } else {
    ctx.message('Only the adventurers that have been trained by Mai may enter.');
  }
}

export function* go10000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Mushroom Park (10000)
  ctx.screenEffect('maplemap/enter/10000');
}

export function* go20000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Snail Park (20000)
  ctx.screenEffect('maplemap/enter/20000');
}

export function* go30000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Snail Garden (30000)
  ctx.screenEffect('maplemap/enter/30000');
}

export function* go40000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Inside the Small Forest (40000)
  ctx.screenEffect('maplemap/enter/40000');
}

export function* go50000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Inside the Dangerous Forest (50000)
  ctx.screenEffect('maplemap/enter/50000');
}

export function* go1000000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Rainbow Street : Amherst (1000000)
  ctx.screenEffect('maplemap/enter/1000000');
}

export function* go1010000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Entrance to Adventurer Training Center (1010000)
  ctx.screenEffect('maplemap/enter/1010000');
}

export function* go1010100(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Adventurer Training Center 1 (1010100)
  ctx.screenEffect('maplemap/enter/1010100');
}

export function* go1010200(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Adventurer Training Center 2 (1010200)
  ctx.screenEffect('maplemap/enter/1010200');
}

export function* go1010300(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Adventurer Training Center 3 (1010300)
  ctx.screenEffect('maplemap/enter/1010300');
}

export function* go1010400(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Adventurer Training Center 4 (1010400)
  ctx.screenEffect('maplemap/enter/1010400');
}

export function* go1020000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Split Road of Destiny (1020000)
  ctx.screenEffect('maplemap/enter/1020000');
}

export function* go2000000(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Southperry (2000000)
  ctx.screenEffect('maplemap/enter/2000000');
}

export function* goAdventure(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Maple Road : Entrance - Mushroom Town Training Camp (0)
  ctx.setDirectionMode(true, 0);
  ctx.squibEffect(`Effect/Direction3.img/goAdventure/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 14200);
}

export function* goSwordman(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (1020100)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction3.img/swordman/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 3000);
}

export function* goMagician(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (1020200)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction3.img/magician/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 4000);
}

export function* goArcher(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (1020300)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction3.img/archer/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 3000);
}

export function* goRogue(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (1020400)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction3.img/rogue/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 3000);
}

export function* goPirate(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (1020500)
  ctx.setDirectionMode(true, 0);
  ctx.reservedEffect(`Effect/Direction3.img/pirate/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 4000);
}

export function* goLith(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // null (2010000)
  ctx.setDirectionMode(true, 0);
  ctx.squibEffect(`Effect/Direction3.img/goLith/Scene${ctx.getGender()}`);
  ctx.setDirectionMode(false, 5000);
}

export function* mBoxItem0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // mBoxItem0 (2000) - Orbis : Top of the Hill (200000300)
  // mBoxItem0 (2001) - Rainbow Street : Amherst (1000000) / Amherst Townstreet (1000002)
  // mBoxItem0 (9008000 / 9008001)
  ctx.dropRewards([
    Reward.money(10, 10, 0.7),
    Reward.item(2000000, 1, 1, 0.1),
    Reward.item(2000001, 1, 1, 0.1),
    Reward.item(2010000, 1, 1, 0.1),
    Reward.item(4031161, 1, 1, 1.0, 1008), // Rusty Screw
    Reward.item(4031162, 1, 1, 1.0, 1008), // Old Wooden Board
  ]);
}

export function* q1021s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Roger's Apple (1021 - start)
  yield ctx.sayNext(`Hey, ${ctx.getGender() === 0 ? 'Man' : 'Miss'}~ What's up? Haha! I am Roger who teaches you new travellers with lots of information.`);
  yield ctx.sayBoth('You are asking who made me do this? Ahahahaha! Myself! I wanted to do this and just be kind to you new travellers.');
  if (!(yield ctx.askAccept('So..... Let me just do this for fun! Abaracadabra~!'))) {
    return;
  }
  ctx.user.setHp(25);
  yield ctx.sayNext("Surprised? If HP becomes 0, then you are in trouble. Now, I will give you  #rRoger's Apple#k. Please take it. You will feel stronger. Open the item window and double click to consume. Hey, It's very simple to open the item window. Just press #bI#k on your keyboard.");
  yield ctx.sayBoth("Please take all Roger's Apples that I gave you. You will be able to see the HP bar increasing right away. Please talk to me again when you recover your HP 100%.");
  if (!ctx.hasItem(2010007) && !ctx.addItem(2010007, 1)) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.forceStartQuest(1021);
  ctx.avatarOriented('UI/tutorial.img/28');
}

export function* q1021e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Roger's Apple (1021 - end)
  if (ctx.user.getHp() < ctx.user.getMaxHp()) {
    yield ctx.sayNext("Hey, your HP is not fully recovered yet. Did you take all the Roger's Apple that I gave you? Are you sure?");
    return;
  }
  yield ctx.sayNext("How easy is it to consume the item? Simple, right? You can set a #bhotkey#k on the right bottom slot. Haha you didn't know that! right? Oh, and if you are a beginner, HP will automatically recover itself as time goes by. Well it takes time but this is one of the strategies for the beginners.");
  yield ctx.sayBoth('Alright! Now that you have learned alot, I will give you a present. This is a must for your travel in Maple World, so thank me! Please use this under emergency cases!');
  yield ctx.sayBoth('Okay, this is all I can teach you. I know it\'s sad but it is time to say good bye. Well take care of yourself and Good luck my friend!\r\n\r\n#fUI/UIWindow2.img/QuestIcon/4/0#\r\n#i2010000# 3 #t2010000#\r\n#i2010009# 3 #t2010009#\r\n\r\n#fUI/UIWindow2.img/QuestIcon/8/0# 10 exp');
  if (!ctx.addItems([
    [2010000, 3], // Apple
    [2010009, 3], // Green Apple
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addExp(10);
  ctx.forceCompleteQuest(1021);
}
