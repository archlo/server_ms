import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Util } from '../../../util/Util';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { InventoryType as InvType } from '../../item/InventoryType';

export function* friend00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayNext("I see... you don't have as many friends as I thought you would. Hahaha, just kidding! Anyway if you feel like changing your mind, please feel free to come back and we'll talk business. If you make a lot of friends, then you know ... hehe ...");
let response = yield ctx.askYesNo("I hope I can make as much as yesterday... well, hello! Don't you want to extend your buddy list? You look like someone who'd have a whole lot of friends... well, what do you think? With some money I can make it happen for you. Remember, though, it only applies to one character at a time, so it won't affect any of your other characters on your account. Do you want to extend your buddy list?");
if (response) {
  let response = yield ctx.askYesNo("Alright, good call! It's not that expensive actually. #b250,000 mesos and I'll add 5 more slots to your buddy list#k. And no, I won't be selling them individually. Once you buy it, it's going to be permanently on your buddy list. So if you're one of those that needs more space there, then you might as well do it. What do you think? Will you spend 250,000 mesos for it?");
  if (response) {
    if (ctx.getMesos() < 250000) {
      yield ctx.sayOk("Hey... are you sure you have #b250,000 mesos#k? If so, then check and see if you have extended your buddy list to the max. Even if you pay up, the most you can have on your buddy list is #b100#k.");
    } else {
      ctx.giveMesos(-250000);
      yield ctx.sayNext("Alright! Your buddy list will have 5 extra slots by now. Check and see for it yourself. And if you still need more room on your buddy list, you know who to find. Of course, it isn't going to be for free ... well, so long ...");
    }
  } else {
    yield ctx.sayOk("Let me know when you want to increase your buddy list.");
  }
} else {
  yield ctx.sayOk("Let me know when you want to increase your buddy list.");
}
}

export function* petmaster(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 100000200) {
  yield ctx.sayNext("Hello there, I'm #bCloy#k of Victoria Island's main disciple. " + "Mar the Fairy summoned me here to see if the pets are being taken care of here in Ludibrium. " + "What can I do for you?\r\n" + "feel free to ask me questions.");
} else {
  yield ctx.sayNext("Hello there, I'm #bMar the Fairy#k of Victoria Island's main disciple. " + "Mar the Fairy summoned me here to see if the pets are being taken care of here in Ludibrium. " + "What can I do for you?\r\n" + "feel free to ask me questions.");
}
let answer = yield ctx.sayNext("What do you want to know more of?#b\r\n" + "#L0#Tell me more about Pets.#l\r\n" + "#L1#How do I raise Pets?#l\r\n" + "#L2#Do Pets die too?#l\r\n" + "#L3#What are the commands for Brown and Black Kitty?#l\r\n" + "#L4#What are the commands for Brown Puppy?#l\r\n" + "#L5#What are the commands for Pink and White Bunny?#l\r\n" + "#L6#What are the commands for Mini Kargo?#l\r\n" + "#L7#What are the commands for Rudolph and Dasher?#l\r\n" + "#L8#What are the commands for Black Pig?#l\r\n" + "#L9#What are the commands for Panda?#l\r\n" + "#L10#What are the commands for Husky?#l\r\n" + "#L11#What are the commands for Dino Boy and Dino Girl?#l\r\n" + "#L12#What are the commands for Monkey?#l\r\n" + "#L13#What are the commands for Turkey?#l\r\n" + "#L14#What are the commands for White Tiger?#l\r\n" + "#L15#What are the commands for Penguin?#l\r\n" + "#L16#What are the commands for Golden Pig?#l\r\n" + "#L17#What are the commands for Robot?#l\r\n" + "#L18#What are the commands for Mini Yeti?#l\r\n" + "#L19#What are the commands for Jr. Balrog?#l\r\n" + "#L20#What are the commands for Baby Dragon?#l\r\n" + "#L21#What are the commands for Green/Red/Blue Dragon?#l\r\n" + "#L22#What are the commands for Black Dragon?#l\r\n" + "#L23#What are the commands for Jr. Reaper?#l\r\n" + "#L24#What are the commands for Porcupine?#l\r\n" + "#L25#What are the commands for Snowman?#l\r\n" + "#L26#What are the commands for Skunk?#l\r\n" + "#L27#Please teach me about transferring pet ability points.#l");
let selection = answer;
if (selection == 0) {
  yield ctx.sayNext("So you want to know more about Pets. Long ago I made a doll, " + "sprayed Water of Life on it, and cast spell on it to create a magical animal. " + "I know it sounds unbelievable, but it's a doll that became an actual living thing. " + "They understand and follow people very well.");
  yield ctx.sayNext("But Water of Life only comes out little at the very bottom of the World Tree, so I can't give him too much time in life... " + "I know, it's very unfortunate... but even if it becomes a doll again I can always bring life back into it so be good to it while you're with it.");
  yield ctx.sayNext("Oh yeah, they'll react when you give them special commands. You can scold them, love them... it all\r\ndepends on how you take care of them. " + "They are afraid to leave their masters so be nice to them, show them love. They can get sad and lonely fast...");
  yield ctx.sayNext("Depending on the command you give, pets can love it, hate, and display other kinds of reactions to it. " + "If you give the pet a command and it follows you well, your intimacy goes up. " + "Double click on the pet and you can check the intimacy, level, fullness and etc...");
  yield ctx.sayNext("Talk to the pet, pay attention to it and its intimacy level will go up and eventually his overall level will go up too. " + "As the intimacy level rises, the pet's overall level will rise soon after. " + "As the overall level rises, one day the pet may even talk like a person a little bit, so try hard raising it. " + "Of course it won't be easy doing so...");
  yield ctx.sayNext("It may be a live doll but they also have life so they can feel the hunger too. " + "#bFullness#k shows the level of hunger the pet's in. 100 is the max, and the lower it gets, " + "it means that the pet is getting hungrier. After a while, it won't even follow your command and be on the offensive, " + "so watch out over that.");
  yield ctx.sayNext("Oh yes! Pets can't eat the normal human food. " + "Instead my disciple #bDoofus#k sells #bPet Food#k at the Henesys Market so if you need food for your pet, find Henesys. " + "It'll be a good idea to buy the food in advance and feed the pet before it gets really hungry.");
  yield ctx.sayNext("Oh, and if you don't feed the pet for a long period of time, it goes back home by itself. " + "You can take it out of its home and feed it but it's not really good for the pet's health, " + "so try feeding him on a regular basis so it doesn't go down to that level, alright? I think this will do.");
  yield ctx.sayNext("Dying... well, they aren't technically ALIVE per se, so I don't know if dying is the right term to use. " + "They are dolls with my magical power and the power of Water of Life to become a live object. " + "Of course while it's alive, it's just like a live animal...");
  yield ctx.sayNext("After some time... that's correct, they stop moving. " + "They just turn back to being a doll, after the effect of magic dies down and Water of Life dries out. " + "But that doesn't mean it's stopped forever, because once you pour Water of Life over, it's going to be back alive.");
  yield ctx.sayNext("Even if it someday moves again, it's sad to see them stop altogether. " + "Please be nice to them while they are alive and moving. Feed them well, too. " + "Isn't it nice to know that there's something alive that follows and listens to only you?");
}
if (selection == 1) {
  yield ctx.sayNext("Depending on the command you give, pets can love it, hate, and display other kinds of reactions to it. " + "If you give the pet a command and it follows you well, your intimacy goes up. " + "Double click on the pet and you can check the intimacy, level, fullness and etc...");
}
if (selection == 2) {
  yield ctx.sayNext("Dying... well, they aren't technically ALIVE per se, so I don't know if dying is the right term to use. " + "They are dolls with my magical power and the power of Water of Life to become a live object. " + "Of course while it's alive, it's just like a live animal...");
}
if (selection == 3) {
  yield ctx.sayNext("These are the commands for #rBrown Kitty and Black Kitty#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bcutie#k (Level 10 ~ 30)\r\n" + "#bup, stand, rise#k (Level 20 ~ 30)");
}
if (selection == 4) {
  yield ctx.sayNext("These are the commands for #rBrown Puppy#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, baddog, dummy#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n#bpee#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bdown#k (Level 10 ~ 30)\r\n" + "#bup, stand, rise#k (Level 20 ~ 30)");
}
if (selection == 5) {
  yield ctx.sayNext("These are the commands for #rPink Bunny and White Bunny#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bhug#k (Level 10 ~ 30)\r\n" + "#bsleep, sleepy, gotobed#k (Level 20 ~ 30)");
}
if (selection == 6) {
  yield ctx.sayNext("These are the commands for #rMini Kargo#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpee#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bthelook, charisma#k (Level 10 ~ 30)\r\n" + "#bdown#k (Level 10 ~ 30)\r\n" + "#bgoodboy, goodgirl#k (Level 20 ~ 30)");
}
if (selection == 7) {
  yield ctx.sayNext("These are the commands for #rRudolph and Dasher#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bup, stand#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#bmerryxmas, merrychristmas#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 11 ~ 30)\r\n" + "#blonely, alone#k (Level 11 ~ 30)\r\n" + "#bcutie#k (Level 11 ~ 30)\r\n" + "#bmush, go#k (Level 21 ~ 30)");
}
if (selection == 8) {
  yield ctx.sayNext("These are the commands for #rBlack Pig#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bhand#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bsmile#k (Level 10 ~ 30)\r\n" + "#bthelook, charisma#k (Level 20 ~ 30)");
}
if (selection == 9) {
  yield ctx.sayNext("These are the commands for #rPanda#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bchill, relax#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bletsplay#k (Level 10 ~ 30)\r\n" + "#bmeh, bleh#k (Level 10 ~ 30)\r\n" + "#bsleep#k (Level 20 ~ 30)");
}
if (selection == 10) {
  yield ctx.sayNext("These are the commands for #rHusky#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, baddog, dummy#k (Level 1 ~ 30)\r\n" + "#bhand#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bdown#k (Level 10 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bup, stand, rise#k (Level 20 ~ 30)");
}
if (selection == 11) {
  yield ctx.sayNext("These are the commands for #rDino Boy and Dino Girl#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bsmile, laugh#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bcutie#k (Level 10 ~ 30)\r\n" + "#bsleep, nap, sleepy#k (Level 20 ~ 30)");
}
if (selection == 12) {
  yield ctx.sayNext("These are the commands for #rMonkey#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#brest#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpee#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bup, stand#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bplay#k (Level 10 ~ 30)\r\n" + "#bmelong#k (Level 10 ~ 30)\r\n" + "#bsleep, gotobed, sleepy#k (Level 20 ~ 30)");
}
if (selection == 13) {
  yield ctx.sayNext("These are the commands for #rTurkey#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno, rudeboy, mischief#k (Level 1 ~ 30)\r\n" + "#bstupid#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bup, stand#k (Level 1 ~ 30)\r\n" + "#btalk, chat, gobble#k (Level 10 ~ 30)\r\n" + "#byes, goodboy#k (Level 10 ~ 30)\r\n" + "#bsleepy, birdnap, doze#k (Level 20 ~ 30)\r\n" + "#bbirdeye, thanksgiving, fly, friedbird, imhungry#k (Level 30)");
}
if (selection == 14) {
  yield ctx.sayNext("These are the commands for #rWhite Tiger#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#brest, chill#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bactsad, sadlook#k (Level 10 ~ 30)\r\n" + "#bwait#k (Level 20 ~ 30)");
}
if (selection == 15) {
  yield ctx.sayNext("These are the commands for #rPenguin#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bhug, hugme#k (Level 10 ~ 30)\r\n" + "#bwing, hand#k (Level 10 ~ 30)\r\n" + "#bsleep#k (Level 20 ~ 30)\r\n" + "#bkiss, smooch, muah#k (Level 20 ~ 30)\r\n" + "#bfly#k (Level 20 ~ 30)\r\n" + "#bcute, adorable#k (Level 20 ~ 30)");
}
if (selection == 16) {
  yield ctx.sayNext("These are the commands for #rGolden Pig#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 11 ~ 30)\r\n" + "#bloveme, hugme#k (Level 11 ~ 30)\r\n" + "#bsleep, sleepy, gotobed#k (Level 21 ~ 30)\r\n" + "#bignore / impressed / outofhere#k (Level 21 ~ 30)\r\n" + "#broll, showmethemoney#k (Level 21 ~ 30)");
}
if (selection == 17) {
  yield ctx.sayNext("These are the commands for #rRobot#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#battack, charge#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bgood, thelook, charisma#k (Level 11 ~ 30)\r\n" + "#bspeack, talk, chat, say#k (Level 11 ~ 30)\r\n" + "#bdisguise, change, transform#k (Level 11 ~ 30)");
}
if (selection == 18) {
  yield ctx.sayNext("These are the commands for #rMini Yeti#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bdance, boogie, shakeit#k (Level 1 ~ 30)\r\n" + "#bcute, cutie, pretty, adorable#k (Level 1 ~ 30)\r\n" + "#biloveyou, likeyou, mylove#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 11 ~ 30)\r\n" + "#bsleep, nap, sleepy, gotobed#k (Level 11 ~ 30)");
}
if (selection == 19) {
  yield ctx.sayNext("These are the commands for #rJr. Balrog#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bliedown#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#biloveyou|mylove|likeyou#k (Level 1 ~ 30)\r\n" + "#bcute|cutie|pretty|adorable#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bsmirk|crooked|laugh#k (Level 1 ~ 30)\r\n" + "#bmelong#k (Level 11 ~ 30)\r\n" + "#bgood|thelook|charisma#k (Level 11 ~ 30)\r\n" + "#bspeak|talk|chat|say#k (Level 11 ~ 30)\r\n" + "#bsleep|nap|sleepy#k (Level 11 ~ 30)\r\n" + "#bgas#k (Level 21 ~ 30)");
}
if (selection == 20) {
  yield ctx.sayNext("These are the commands for #rBaby Dragon#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#biloveyou|loveyou#k (Level 1 ~ 30)\r\n#bpoop#k (Level 1 ~ 30)\r\n" + "#bstupid|ihateyou|dummy#k (Level 1 ~ 30)\r\n#bcutie#k (Level 11 ~ 30)\r\n" + "#btalk|chat|say#k (Level 11 ~ 30)\r\n" + "#bsleep|sleepy|gotobed#k (Level 11 ~ 30)");
}
if (selection == 21) {
  yield ctx.sayNext("These are the commands for #rGreen/Red/Blue Dragon#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 15 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 15 ~ 30)\r\n" + "#biloveyou|loveyou#k (Level 15 ~ 30)\r\n" + "#bpoop#k (Level 15 ~ 30)\r\n" + "#bstupid|ihateyou|dummy#k (Level 15 ~ 30)\r\n" + "#btalk|chat|say#k (Level 15 ~ 30)\r\n" + "#bsleep|sleepy|gotobed#k (Level 15 ~ 30)\r\n" + "#bchange#k (Level 21 ~ 30)");
}
if (selection == 22) {
  yield ctx.sayNext("These are the commands for #rBlack Dragon#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 15 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 15 ~ 30)\r\n" + "#biloveyou|loveyou#k (Level 15 ~ 30)\r\n" + "#bpoop#k (Level 15 ~ 30)\r\n" + "#bstupid|ihateyou|dummy#k (Level 15 ~ 30)\r\n" + "#btalk|chat|say#k (Level 15 ~ 30)\r\n" + "#bsleep|sleepy|gotobed#k (Level 15 ~ 30)\r\n" + "#bcutie, change#k (Level 21 ~ 30)");
}
if (selection == 23) {
  yield ctx.sayNext("These are the commands for #rJr. Reaper#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#bplaydead, poop#k (Level 1 ~ 30)\r\n" + "#btalk|chat|say#k (Level 1 ~ 30)\r\n" + "#biloveyou, hug#k (Level 1 ~ 30)\r\n" + "#bsmellmyfeet, rockout, boo#k (Level 1 ~ 30)\r\n" + "#btrickortreat#k (Level 1 ~ 30)\r\n" + "#bmonstermash#k (Level 1 ~ 30)");
}
if (selection == 24) {
  yield ctx.sayNext("These are the commands for #rPorcupine#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#biloveyou|hug|goodboy#k (Level 1 ~ 30)\r\n" + "#btalk|chat|say#k (Level 1 ~ 30)\r\n" + "#bcushion|sleep|knit|poop#k (Level 1 ~ 30)\r\n" + "#bcomb|beach#k (Level 10 ~ 30)\r\n" + "#btreeninja#k (Level 20 ~ 30)\r\n" + "#bdart#k (Level 20 ~ 30)");
}
if (selection == 25) {
  yield ctx.sayNext("These are the commands for #rSnowman#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#bloveyou, mylove, ilikeyou#k (Level 1 ~ 30)\r\n" + "#bmerrychristmas#k (Level 1 ~ 30)\r\n" + "#bcutie, adorable, cute, pretty#k (Level 1 ~ 30)\r\n" + "#bcomb, beach/bad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say/sleep, sleepy, gotobed#k (Level 10 ~ 30)\r\n" + "#bchang#k (Level 20 ~ 30)");
}
if (selection == 26) {
  yield ctx.sayNext("These are the commands for #rSkunk#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad/no/badgirl/badboy#k (Level 1 ~ 30)\r\n" + "#brestandrelax, poop#k (Level 1 ~ 30)\r\n" + "#btalk/chat/say, iloveyou#k (Level 1 ~ 30)\r\n" + "#bsnuggle/hug, sleep, goodboy#k (Level 1 ~ 30)\r\n" + "#bfatty, blind, badbreath#k (Level 10 ~ 30)\r\n" + "#bsuitup, bringthefunk#k (Level 20 ~ 30)");
}
if (selection == 27) {
  yield ctx.sayNext("In order to transfer the pet ability points, closeness and level, " + "Pet AP Reset Scroll is required. If you take this\r\n" + "scroll to Mar the Fairy in Ellinia, she will transfer the level and closeness of the pet to another one. " + "I am especially giving it to you because I can feel your heart for your pet. However, I can't give this out for free. " + "I can give you this book for 250,000 mesos. Oh, I almost forgot! Even if you have this book, it is no use if you do not have a new pet to transfer the Ability points.");
  if (yield ctx.askYesNo("250,000 mesos will be deducted. Do you really want to buy?")) {
    if (ctx.getMesos() < 250000 || !ctx.canAddItem(4160011, 1)) {
      yield ctx.sayOk("Please check if your inventory has empty slot or you don't have enough mesos.");
    } else {
      yield ctx.sayOk("Thank you for your purchase.");
      ctx.deductMesos(250000);
      ctx.addItem(4160011, 1);
    }
  }
}
}

export function* pet_lifeitem(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let selection = yield ctx.sayNext("Do you have any business with me?#b\r\n" + "#L0#Please tell me about this place.#l\r\n" + "#L1#I'm here through a word from Mar the Fairy...#l");
if (selection == 0) {
  if (ctx.hasItem(4031035)) {
    yield ctx.sayNext("Jump over obstacles with your pet, and take that letter to my brother Trainer Frod. " + "Give him the letter and something good is going to happen to your pet.");
  } else {
    if (yield ctx.askYesNo("This is the road where you can go take a walk with your pet. " + "You can just walk around with it, or you can train your pet to go through the obstacles here. " + "If you aren't too close with your pet yet, that may present a problem and he will not follow your command as much... " + "\r\nSo, what do you think? Wanna train your pet?")) {
      ctx.addItem(4031035, 1);
      yield ctx.sayOk("Ok, here's the letter. " + "He wouldn't know I sent you if you just went there straight, " + "so go through the obstacles with your pet, go to the very top, and then talk to Trainer Frod to give him the letter. " + "It won't be hard if you pay attention to your pet while going through obstacles. " + "Good luck!");
    }
  }
}
if (selection == 1) {
  yield ctx.sayOk("Hey, are you sure you've met #bMar the Fairy#k? Don't lie to me if you've never met her before because it's obvious. That wasn't even a good lie!!");
}
}

export function* pet_letter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.hasItem(4031035)) {
  yield ctx.sayNext("Eh, that's my brother's letter! " + "Probably scolding me for thinking I'm not working and stuff...Eh? " + "Ahhh...you followed my brother's advice and trained your pet and got up here, huh? " + "Nice!! Since you worked hard to get here, I'll boost your intimacy level with your pet.");
  ctx.removeItem(4031035, 1);
  yield ctx.sayOk("What do you think? Don't you think you have gotten much closer with your pet? " + "If you have time, train your pet again on this obstacle course...of course, with my brother's permission.");
} else {
  yield ctx.sayOk("My brother told me to take care of the pet obstacle course, " + "but ... since I'm so far away from him, I can't help but wanting to goof around ...hehe, " + "since I don't see him in sight, might as well just chill for a few minutes.");
}
return;
}

export function* minigame00(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let items = [ 4080000, 4080001, 4080002, 4080003, 4080004, 4080005, 4080006, 4080007, 4080008, 4080009, 4080010, 4080011, 4080100];
let mesocost = 5000;
let selStr = "Hello! I am the MiniGame Master!\r\nIf you're here to purchase minigames, you're at the right place!\r\nIt will cost you "+ String(mesocost) +" meso per item\r\n\r\n#b";
let i = 0;
while (i < items.length) {
  selStr += "#L"+ String(i) +"##z"+ String(items[i]) +"##l\r\n";
  i += 1;
}
let answer = yield ctx.sayNext(selStr);
if (!ctx.canAddItem(items[answer], 1) || ctx.getMesos() < mesocost) {
  yield ctx.sayOk("I'm sorry, it seems that either you don't have enough money, or you don't have enough space");
} else {
  yield ctx.sayOk("Great Choice! Here you go");
  ctx.deductMesos(mesocost);
  ctx.addItem(items[answer], 1);
}
}

export function* Manji(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getChr().getLevel() < 50) {
  yield ctx.sayOk("Leave now.. before you get hurt.");
} else {
  if (yield ctx.askYesNo("You appear strong. Would you like to head to the Balrog Temple?")) {
    ctx.warp(105100100, 0);
  }
}
}

export function* go_xmas(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("Happy Holidays!");
}

export function* herb_in(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let mesos = ctx.getLevel() * 200;
if (ctx.hasQuestStarted(2050)) {
  let response = yield ctx.askYesNo("You want my herbs, do you? What kind of farmer would just let people trample over his family land? But... I could use the money. I need at least #r" + String(mesos) + "#k mesos to feel good about this.");
  if (response) {
    if (ctx.getMesos() > mesos) {
      ctx.deductMesos(mesos);
      ctx.warp(910130000);
    } else {
      yield ctx.sayOk("Sorry but it doesn't look like you have enough mesos!");
    }
  } else {
    yield ctx.sayOk("Alright, see you next time.");
  }
} else if (ctx.hasQuestCompleted(2050) && !ctx.hasQuestStarted(2051)) {
  let response = yield ctx.askYesNo("Would you like to enter The Forest of Endurance?");
  if (response) {
    ctx.warp(910130000);
  } else {
    yield ctx.sayOk("Alright, see you next time.");
  }
} else if (ctx.hasQuestStarted(2051)) {
  let response = yield ctx.askYesNo("Back again?! Well, I'm going to need at least #r" + String(mesos) + "#k mesos if you want me to turn a blind eye. I don't care if you ARE working for #b#p" + String(1103003) + "##k. What do you say?");
  if (response) {
    if (ctx.getMesos() > mesos) {
      ctx.deductMesos(mesos);
      ctx.warp(910130100);
    } else {
      yield ctx.sayOk("Sorry but it doesn't look like you have enough mesos!");
    }
  }
} else {
  let response = yield ctx.askYesNo("Hi, i'm Shane. I can let you into the Forest of Patience for a small fee. Would you like to enter for #b" + String(mesos) + "#k mesos?");
  if (response) {
    if (ctx.getLevel() > 25) {
      if (ctx.getMesos() > mesos) {
        ctx.deductMesos(mesos);
        ctx.removeBuff(CharacterTemporaryStat.DarkSight);
        ctx.warp(910130000);
      } else {
        yield ctx.sayOk("Sorry but it doesn't look like you have enough mesos!");
      }
    } else {
      yield ctx.sayOk("You must be a higher level to enter the Forest of Endurance.");
    }
  } else {
    yield ctx.sayOk("Alright, see you next time.");
  }
}
}

export function* herb_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to return to Ellinia?")) {
  ctx.warp(101000000);
}
}

export function* bush1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let rewards = [ 4020005, 4020006, 4020004, 4020001, 4020003, 4020000, 4020002 ];
ctx.warp(910130100);
}

export function* bush2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let rewards = [ [4020007, 2], [4020008, 2], [4010006, 2], [1032013, 1] ];
if (ctx.getFieldID() == 910130102) {
  if (yield ctx.askYesNo("You have reached the end of this jumpquest! I will send you back now")) {
    if (ctx.hasQuestStarted(9998)) {
      ctx.setQRValue(9998, "ellinia");
    } else {
      ctx.forceStartQuest(9998); ctx.setQRValue(9998, "ellinia=1");
    }
  }
  ctx.warp(101000000);
}
}

export function* subway_get1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 910360002) {
  if (yield ctx.askYesNo("You have reached the end of this jumpquest! I will send you back now")) {
    if (ctx.hasQuestStarted(9998)) {
      ctx.setQRValue(9998, "sub1");
    } else {
      ctx.forceStartQuest(9998); ctx.setQRValue(9998, "sub1=1");
    }
  }
  ctx.warp(103020000);
}
}

export function* subway_get2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 910360102) {
  if (yield ctx.askYesNo("You have reached the end of this jumpquest! I will send you back now")) {
    if (ctx.hasQuestStarted(9998)) {
      ctx.setQRValue(9998, "sub2");
    } else {
      ctx.forceStartQuest(9998); ctx.setQRValue(9998, "sub2=1");
    }
  }
  ctx.warp(103020000);
}
}

export function* subway_get3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 910360203) {
  if (yield ctx.askYesNo("You have reached the end of this jumpquest! I will send you back now")) {
    if (ctx.hasQuestStarted(9998)) {
      ctx.setQRValue(9998, "sub3");
    } else {
      ctx.forceStartQuest(9998); ctx.setQRValue(9998, "sub3=1");
    }
  }
  ctx.warp(103020000);
}
}

export function* subway_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to leave?")) {
  ctx.warp(103020000);
}
}

export function* flower_in(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let response = yield ctx.askYesNo("Once I lay my hand on the statue, a strange light covers me and it feels like I'm being sucked " + "into somewhere else. Is it okay to be moved to somewhere else randomly just like that?");
if (response) {
  ctx.removeBuff(CharacterTemporaryStat.DarkSight);
  ctx.warp(910530000);
}
}

export function* flower_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let response = yield ctx.askYesNo("Once I lay my hand on the statue, a strange light covers me and it feels like I'm being sucked " + "into where I originally came from. Am I done here? Is it okay to go back to where I came from?");
if (response) {
  ctx.warp(105000000);
}
}

export function* _3jobExit(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let response = yield ctx.askYesNo("Do you really want to leave?");
if (response) {
  ctx.warpInstanceOut(211000001);
}
}
const ___3jobExit = _3jobExit;

export function* balog_scroll(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let items = [ 2040728, 2040729, 2040730, 2040731, 2040732, 2040733, 2040734, 2040735, 2040736, 2040737, 2040738, 2040739 ];
let balrogLeather = 4001261;
if (ctx.hasItem(balrogLeather)) {
  yield ctx.sayNext("Hello #h0#. I see you have #c"+ String(balrogLeather) +"# Piece"+ (ctx.getQuantityOfItem(balrogLeather) > 1 ? "s" : "") +" of Balrog Leather, interested in exchanging those for items?");
} else {
  yield ctx.sayNext("Hello #h0#. I can exchange #z"+String(balrogLeather)+"#for items");
}
let selString = "Alright, this is what I can offer you\r\n#b";
let i = 0;
while (i < items.length) {
  selString += "#L"+ String(i) +"##z"+ String(items[i]) +"##l\r\n";
  i += 1;
}
let selection = yield ctx.sayNext(selString);
let quantity = yield ctx.askNumber("How many of your #b#z"+ String(balrogLeather) +"##k are you willing to trade for my #b#z"+ String(items[selection]) +"##k?" + "\r\nyou have #c"+ String(balrogLeather) +"# Piece"+ (ctx.getQuantityOfItem(balrogLeather) > 1 ? "s" : "") +" of Balrog Leather", 1, 1, 100);
if (!ctx.canAddItem(items[selection], 1)) {
  yield ctx.sayOk("You don't have enough space in your inventory.");
} else if (ctx.getQuantityOfItem(balrogLeather) < quantity) {
  yield ctx.sayOk("You don't fool me\r\nYou do not have enough leather pieces.");
} else {
  ctx.addItem(items[selection], quantity);
  ctx.removeItem(balrogLeather, quantity);
  yield ctx.sayOk("Thank you for your redemption");
}
}

export function* balog_InOut(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let response = yield ctx.askYesNo("If you leave now, you'll have to start over.\r\n" + "Are you sure you want to leave?");
if (response) {
  ctx.warpInstanceOut(105200000);
}
}

export function* hotel1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let array: Array<[string, number, number]> = [ ["Regular", 499, 105000011], ["VIP", 999, 105000012] ];
yield ctx.sayNext("Welcome. We're the Sleepywood Hotel. " + "Our hotel works hard to serve you the best at all times. " + "If you are tired and worn out from hunting, how about a relaxing stay at our hotel?");
let selection = yield ctx.sayNext("We offer two kinds of rooms for our service. " + "Please choose the one of your liking.\r\n#b" + "#L0#"+ array[0][0] +" sauna (" + String(array[0][1]) + " mesos)#l\r\n" + "#L1#"+ array[1][0] +" sauna (" + String(array[1][1]) + " mesos)#l");
if (selection == 0) {
  let response = yield ctx.askYesNo("You have chosen the regular sauna. \r\n" + "Your HP and MP will recover fast and you can even purchase some items there. " + "Are you sure you want to go in?");
} else if (selection == 1) {
  let response = yield ctx.askYesNo("You've chosen the VIP sauna. \r\n" + "Your HP and MP will recover even faster than that of the regular sauna and you can even find a special item in there. " + "Are you sure you want to go in?");
}
if (ctx.getMesos() < array[selection][1]) {
  yield ctx.sayOk("I'm sorry. It looks like you don't have enough mesos. It will cost you at least " + String(array[selection][1]) + " mesos to stay at our "+ array[selection][0] +" sauna.");
} else {
  ctx.warp(array[selection][2], 0);
  ctx.deductMesos(array[selection][1]);
}
}

export function* viola_pink(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 910530001) {
  ctx.warp(910530100);
}
}

export function* viola_blue(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 910530101) {
  ctx.warp(910530200);
}
}

export function* viola_white(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 910530202) {
  if (yield ctx.askYesNo("You have reached the end of this jumpquest! I will send you back now")) {
    if (ctx.hasQuestStarted(9998)) {
      ctx.setQRValue(9998, "sleepy");
    } else {
      ctx.forceStartQuest(9998); ctx.setQRValue(9998, "sleepy=1");
    }
  }
  ctx.warp(105000000);
}
}

export function* holySton(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let shooEvil = 2236;
let charm = 4032263;
let shamanDict = { 105010100: [0, "100000"], 105020000: [1, "010000"], 105020100: [2, "001000"], 105020200: [3, "000100"], 105020300: [4, "000010"], 105020400: [5, "000001"] } as Record<number, [number, string]>;
if (ctx.hasQuestStarted(shooEvil)) {
  let shamanEntry = shamanDict[ctx.getFieldID()];
  let shamanIndex = shamanEntry[0];
  let shamanStatus = ctx.getQRValue(shooEvil);
  let shamanParse = "000000";
  if (shamanStatus) {
    let shamanParse = shamanStatus;
  }
  if (shamanParse[shamanIndex] != "1" && ctx.hasItem(charm)) {
    ctx.removeItem(charm, 1);
    if (!shamanStatus) {
      let shamanStatus = shamanEntry[1];
    } else {
      if (shamanIndex == 0) {
        let shamanStatus = "1" + shamanParse.slice(shamanIndex+1);
      } else if (shamanIndex == 5) {
        let shamanStatus = shamanParse.slice(0, shamanIndex) + "1";
      } else {
        let shamanStatus = shamanParse.slice(0, shamanIndex) + "1" + shamanParse.slice(shamanIndex+1);
      }
    }
    ctx.setQRValue(shooEvil, shamanStatus);
    yield ctx.sayOk("You placed the charm onto the Shaman Rock.");
  } else if (!ctx.hasItem(charm) && shamanParse[shamanIndex] != "1" && shamanStatus != "111111") {
    yield ctx.sayOk("You do not have any more charms. Forfeit the quest and talk to Chrishrama again.");
  } else {
    yield ctx.sayOk("There's already a charm placed here.");
  }
}
}

export function* outSecondDH(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let response = yield ctx.askYesNo("Are you done with the Knighthood Exam? Should I let you out?");
if (response) {
  ctx.warp(130020000);
} else {
  yield ctx.sayOk("Okay, good luck hunting.");
}
}

export function* cygnus_lv120(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("Welcome to the Hall of Knights.");
}

export function* enterWolf(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to see the leader of the wolves?")) {
  ctx.warp(140010210);
}
}

export function* desc_tree(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("Merry Christmas! Feel free to show off your holiday spirit with ornaments!");
}

export function* go_tree1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let christmas_maps = [ 209000001, 209000002, 209000003, 209000004, 209000005, 209000006, 209000007, 209000008];
let room = yield ctx.sayNext("Hello I'm #p2001001#! I can take you to the room where the humongous Christmas tree is! For more information talk to #b#p2001000##k. Which room will you enter?\r\n#b" + "#L0#The room with the 1st tree#l\r\n" + "#L1#The room with the 2nd tree#l\r\n" + "#L2#The room with the 3rd tree#l\r\n" + "#L3#The room with the 4th tree#l\r\n" + "#L4#The room with the 5th tree#l\r\n" + "#L5#The room with the 6th tree#l\r\n" + "#L6#The room with the 7th tree#l\r\n" + "#L7#The room with the 8th tree#l\r\n");
ctx.warp(christmas_maps[room]);
}

export function* go_tree2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let christmas_maps = [ 209000009, 209000010, 209000011, 209000012, 209000013, 209000014, 209000015];
let room = yield ctx.sayNext("Hello I'm #p2001002#! I can take you to the room where the humongous Christmas tree is! For more information talk to #b#p2001000##k. Which room will you enter?\r\n#b" + "#L0#The room with the 9th tree#l\r\n" + "#L1#The room with the 10th tree#l\r\n" + "#L2#The room with the 11th tree#l\r\n" + "#L3#The room with the 12th tree#l\r\n" + "#L4#The room with the 13th tree#l\r\n" + "#L5#The room with the 14th tree#l\r\n" + "#L6#The room with the 15th tree#l\r\n");
ctx.warp(christmas_maps[room]);
}

export function* go_tree3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to see a land of polar bears?")) {
  ctx.warp(219000000);
}
}

export function* out_tree(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let response = yield ctx.askYesNo("Have you decorated your tree nicely? It's an interesting experience, to say the least, decorating a Christmas tree with other people. Don't cha think?  Oh yeah ... are you suuuuure you want to leave this place?");
if (response) {
  ctx.warp(209000000);
} else {
  yield ctx.sayNext("You need more time decorating trees, huh? If you ever feel like leaving this place, feel free to come talk to me~");
}
}

export function* go_victoria(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to return to town?")) {
  ctx.warp(ctx.getPreviousFieldID());
}
}

export function* ossyria3_1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let maps = [ 200080200, 200080600, 200081400, 200082100 ];
let mapString = "Where do you want to go?\r\n\r\n#b";
let i = 0;
while (i < maps.length) {
  if (maps[i] == ctx.getFieldID()) {
    i += 1;
    continue;
  } else {
    mapString += "#L"+ String(i) +"##m"+ String(maps[i]) +"##l\r\n";
  }
  i += 1;
}
let answer = yield ctx.sayNext(mapString);
ctx.warp(maps[answer], 0);
}

export function* elizaHarp1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/do");
let eternalSleep = 3114;
let songMaster = "CCGGAAGFFEEDDCGGFFEEDGGFFEEDCCGGAAGFFEEDDC";
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  if (songStatus) {
    let songProgress = songStatus;
  }
  songProgress += "C";
  let songCount = songProgress.length;
  if (!(songProgress == songMaster.slice(0, songCount))) {
    let songProgress = "";
    ctx.chat("The performance was a failure. Eliza seems very displeased.");
  }
  if (songProgress == songMaster) {
    let songProgress = "42";
    ctx.chat("The performance was a success. Eliza breathed a sigh of relief.");
  }
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* elizaHarp2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/re");
let eternalSleep = 3114;
let songMaster = "CCGGAAGFFEEDDCGGFFEEDGGFFEEDCCGGAAGFFEEDDC";
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  if (songStatus) {
    let songProgress = songStatus;
  }
  songProgress += "D";
  let songCount = songProgress.length;
  if (!(songProgress == songMaster.slice(0, songCount))) {
    let songProgress = "";
    ctx.chat("The performance was a failure. Eliza seems very displeased.");
  }
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* elizaHarp3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/mi");
let eternalSleep = 3114;
let songMaster = "CCGGAAGFFEEDDCGGFFEEDGGFFEEDCCGGAAGFFEEDDC";
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  if (songStatus) {
    let songProgress = songStatus;
  }
  songProgress += "E";
  let songCount = songProgress.length;
  if (!(songProgress == songMaster.slice(0, songCount))) {
    let songProgress = "";
    ctx.chat("The performance was a failure. Eliza seems very displeased.");
  }
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* elizaHarp4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/pa");
let eternalSleep = 3114;
let songMaster = "CCGGAAGFFEEDDCGGFFEEDGGFFEEDCCGGAAGFFEEDDC";
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  if (songStatus) {
    let songProgress = songStatus;
  }
  songProgress += "F";
  let songCount = songProgress.length;
  if (!(songProgress == songMaster.slice(0, songCount))) {
    let songProgress = "";
    ctx.chat("The performance was a failure. Eliza seems very displeased.");
  }
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* elizaHarp5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/sol");
let eternalSleep = 3114;
let songMaster = "CCGGAAGFFEEDDCGGFFEEDGGFFEEDCCGGAAGFFEEDDC";
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  if (songStatus) {
    let songProgress = songStatus;
  }
  songProgress += "G";
  let songCount = songProgress.length;
  if (!(songProgress == songMaster.slice(0, songCount))) {
    let songProgress = "";
    ctx.chat("The performance was a failure. Eliza seems very displeased.");
  }
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* elizaHarp6(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/la");
let eternalSleep = 3114;
let songMaster = "CCGGAAGFFEEDDCGGFFEEDGGFFEEDCCGGAAGFFEEDDC";
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  if (songStatus) {
    let songProgress = songStatus;
  }
  songProgress += "A";
  let songCount = songProgress.length;
  if (!(songProgress == songMaster.slice(0, songCount))) {
    let songProgress = "";
    ctx.chat("The performance was a failure. Eliza seems very displeased.");
  }
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* elizaHarp7(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.soundEffect("orbis/si");
let eternalSleep = 3114;
let songStatus = ctx.getQRValue(eternalSleep);
if (ctx.hasQuestStarted(eternalSleep) && songStatus != "42") {
  let songProgress = "";
  ctx.chat("The performance was a failure. Eliza seems very displeased.");
  ctx.setQRValue(eternalSleep, songProgress);
}
}

export function* oldBook1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let items = [  [2050003, 300], [2050004, 400], [4006000, 5000], [4006001, 5000] ];
if (ctx.hasQuestCompleted(3035)) {
  yield ctx.sayNext("What is it?\r\n#b" + "#L0#I want to buy something really rare.#l");
  let text = "Thanks to you. #bThe Book of Ancient#k is safely sealed. " + "As a result, I used up about half of the power I have accumulated over the last 800 years...but can now die in peace. " + "Would you happen to be looking for rare items by any chance? As a sign of appreciation for your hard work. " + "I'll sell some items in my possession to you and ONLY you. Pick out the one you want!\r\n #b";
  for (let i = 0; i < items.length; i++) {
    text += "#L"+ String(i) +"##z"+ String(items[i][0]) +"# - "+ String(items[i][1]) +" mesos#l\r\n";
  }
  let selection = yield ctx.sayNext(text);
  let number = yield ctx.askNumber("#b#z"+ String(items[selection][0]) +"##k?\r\n" + "Since you helped me, I'll sell it to you for cheap. \r\n" + "It'll cost you #b"+ String(items[selection][1]) +" mesos#k each. \r\n" + "How many would you like?", 1, 1, 100);
  let totalCost = number * items[selection][1];
  if (!ctx.canAddItem(items[selection][0], 1)) {
    yield ctx.sayOk("Please make some more space in your inventory.");
  } else if (ctx.getMesos() < totalCost) {
    yield ctx.sayOk("It seems you don't have enough mesos.");
  } else {
    ctx.addItem(items[selection][0], number);
    ctx.deductMesos(totalCost);
    yield ctx.sayOk("Thanks for your purchase.");
  }
} else {
  yield ctx.sayOk("I worry about #bThe Book of Ancient#k...");
}
}

export function* shammos2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayNext("Haha! FOOLS! I have betrayed you and have unsealed Rex, the Hoblin King!");
}

export function* goDungeon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayNext("Hey, you look like you want to go farther and deeper past this place. " + "Over there, though, you'll find yourself surrounded by aggressive, dangerous monsters, " + "so even if you feel that you're ready to go, please be careful. " + "Long ago, a few brave men from our town went in wanting to elliminate anyone threatening the town, " + "but never came back out...");
if (ctx.getLevel() >= 60) {
  let response = yield ctx.askYesNo("If you are thinking of going in, I suggest you change your mind. " + "But if you really want to go in...I'm only letting in the ones that are strong enough to stay alive in there. " + "I do not wish to see anyone else die. Let's see... Hmmm...! You look pretty strong. " + "All right, do you want to go in?");
  if (response) {
    ctx.warp(211040300, 5);
  } else {
    yield ctx.sayOk("I know taking the risk isn't easy. Come back if you change your mind later. It's my duty to guard this place.");
  }
} else {
  yield ctx.sayOk("I cannot let you enter the Dead Mine. Come back when you are at least Level 60.");
}
}

export function* holyStone(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let questIDs = [1431, 1432, 1433, 1435, 1436, 1437, 1439, 1440, 1442, 1443, 1445, 1446, 1447, 1448];
let hasQuest = false;
for (const qid of questIDs) {
  if (ctx.hasQuestStarted(qid)) {
    let hasQuest = true;
    break;
  }
}
if (hasQuest) {
  if (yield ctx.askYesNo("#b(A mysterious energy surrounds this stone. Do you want to investigate?)")) {
    ctx.warpInstanceIn(910540000);
  }
} else {
  yield ctx.sayOk("#b(A mysterious energy surrounds this stone)#k");
}
}

export function* oldBook5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let mesos = 500000;
if (ctx.hasQuestCompleted(3034)) {
  let response = yield ctx.askYesNo("You've been so much of a help to me... If you have any #t" + String(4004004) + "#, I can refine it for you for only #b" + String(mesos) + " meso#k each.");
  if (response) {
    let answer = yield ctx.askNumber("Okay, so how many do you want me to make?", 1, 1, 100);
    let totalCost = answer * mesos;
    let totalQty = answer * 10;
    if (!ctx.canAddItem(4005004, 1)) {
      yield ctx.sayOk("Please make some more space in your inventory.");
    } else if (ctx.getMesos() < totalCost) {
      yield ctx.sayOk("I'm sorry, but I am NOT doing this for free.");
    } else if (!ctx.hasItem(4004004, totalQty)) {
      yield ctx.sayOk("I need that ore to refine the Crystal. No exceptions..");
    } else {
      ctx.removeItem(4004004, totalQty);
      ctx.addItem(4005004, answer);
      ctx.deductMesos(totalCost);
      yield ctx.sayOk("Use it wisely.");
    }
  }
} else {
  yield ctx.sayOk("Go away, I'm trying to meditate.");
}
}

export function* ludi026(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayNext("Hello there, I'm #bMar the Fairy#k of Victoria Island's main disciple. " + "Mar the Fairy summoned me here to see if the pets are being taken care of here in Ludibrium. " + "What can I do for you?\r\n" + "feel free to ask me questions.");
const answer = yield ctx.sayNext("What do you want to know more of?#b\r\n" + "#L0#Tell me more about Pets.#l\r\n" + "#L1#How do I raise Pets?#l\r\n" + "#L2#Do Pets die too?#l\r\n" + "#L3#What are the commands for Brown and Black Kitty?#l\r\n" + "#L4#What are the commands for Brown Puppy?#l\r\n" + "#L5#What are the commands for Pink and White Bunny?#l\r\n" + "#L6#What are the commands for Mini Kargo?#l\r\n" + "#L7#What are the commands for Rudolph and Dasher?#l\r\n" + "#L8#What are the commands for Black Pig?#l\r\n" + "#L9#What are the commands for Panda?#l\r\n" + "#L10#What are the commands for Husky?#l\r\n" + "#L11#What are the commands for Dino Boy and Dino Girl?#l\r\n" + "#L12#What are the commands for Monkey?#l\r\n" + "#L13#What are the commands for Turkey?#l\r\n" + "#L14#What are the commands for White Tiger?#l\r\n" + "#L15#What are the commands for Penguin?#l\r\n" + "#L16#What are the commands for Golden Pig?#l\r\n" + "#L17#What are the commands for Robot?#l\r\n" + "#L18#What are the commands for Mini Yeti?#l\r\n" + "#L19#What are the commands for Jr. Balrog?#l\r\n" + "#L20#What are the commands for Baby Dragon?#l\r\n" + "#L21#What are the commands for Green/Red/Blue Dragon?#l\r\n" + "#L22#What are the commands for Black Dragon?#l\r\n" + "#L23#What are the commands for Jr. Reaper?#l\r\n" + "#L24#What are the commands for Porcupine?#l\r\n" + "#L25#What are the commands for Snowman?#l\r\n" + "#L26#What are the commands for Skunk?#l\r\n" + "#L27#Please teach me about transferring pet ability points.#l");
let selection = answer;
if (selection == 0) {
  yield ctx.sayNext("So you want to know more about Pets. Long ago I made a doll, " + "sprayed Water of Life on it, and cast spell on it to create a magical animal. " + "I know it sounds unbelievable, but it's a doll that became an actual living thing. " + "They understand and follow people very well.");
  yield ctx.sayNext("But Water of Life only comes out little at the very bottom of the World Tree, so I can't give him too much time in life... " + "I know, it's very unfortunate... but even if it becomes a doll again I can always bring life back into it so be good to it while you're with it.");
  yield ctx.sayNext("Oh yeah, they'll react when you give them special commands. You can scold them, love them... it all\r\ndepends on how you take care of them. " + "They are afraid to leave their masters so be nice to them, show them love. They can get sad and lonely fast...");
  yield ctx.sayNext("Depending on the command you give, pets can love it, hate, and display other kinds of reactions to it. " + "If you give the pet a command and it follows you well, your intimacy goes up. " + "Double click on the pet and you can check the intimacy, level, fullness and etc...");
  yield ctx.sayNext("Talk to the pet, pay attention to it and its intimacy level will go up and eventually his overall level will go up too. " + "As the intimacy level rises, the pet's overall level will rise soon after. " + "As the overall level rises, one day the pet may even talk like a person a little bit, so try hard raising it. " + "Of course it won't be easy doing so...");
  yield ctx.sayNext("It may be a live doll but they also have life so they can feel the hunger too. " + "#bFullness#k shows the level of hunger the pet's in. 100 is the max, and the lower it gets, " + "it means that the pet is getting hungrier. After a while, it won't even follow your command and be on the offensive, " + "so watch out over that.");
  yield ctx.sayNext("Oh yes! Pets can't eat the normal human food. " + "Instead my disciple #bDoofus#k sells #bPet Food#k at the Henesys Market so if you need food for your pet, find Henesys. " + "It'll be a good idea to buy the food in advance and feed the pet before it gets really hungry.");
  yield ctx.sayNext("Oh, and if you don't feed the pet for a long period of time, it goes back home by itself. " + "You can take it out of its home and feed it but it's not really good for the pet's health, " + "so try feeding him on a regular basis so it doesn't go down to that level, alright? I think this will do.");
  yield ctx.sayNext("Dying... well, they aren't technically ALIVE per se, so I don't know if dying is the right term to use. " + "They are dolls with my magical power and the power of Water of Life to become a live object. " + "Of course while it's alive, it's just like a live animal...");
  yield ctx.sayNext("After some time... that's correct, they stop moving. " + "They just turn back to being a doll, after the effect of magic dies down and Water of Life dries out. " + "But that doesn't mean it's stopped forever, because once you pour Water of Life over, it's going to be back alive.");
  yield ctx.sayNext("Even if it someday moves again, it's sad to see them stop altogether. " + "Please be nice to them while they are alive and moving. Feed them well, too. " + "Isn't it nice to know that there's something alive that follows and listens to only you?");
}
if (selection == 1) {
  yield ctx.sayNext("Depending on the command you give, pets can love it, hate, and display other kinds of reactions to it. " + "If you give the pet a command and it follows you well, your intimacy goes up. " + "Double click on the pet and you can check the intimacy, level, fullness and etc...");
}
if (selection == 2) {
  yield ctx.sayNext("Dying... well, they aren't technically ALIVE per se, so I don't know if dying is the right term to use. " + "They are dolls with my magical power and the power of Water of Life to become a live object. " + "Of course while it's alive, it's just like a live animal...");
}
if (selection == 3) {
  yield ctx.sayNext("These are the commands for #rBrown Kitty and Black Kitty#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bcutie#k (Level 10 ~ 30)\r\n" + "#bup, stand, rise#k (Level 20 ~ 30)");
  return;
}
if (selection == 4) {
  yield ctx.sayNext("These are the commands for #rBrown Puppy#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, baddog, dummy#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n#bpee#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bdown#k (Level 10 ~ 30)\r\n" + "#bup, stand, rise#k (Level 20 ~ 30)");
  return;
}
if (selection == 5) {
  yield ctx.sayNext("These are the commands for #rPink Bunny and White Bunny#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bhug#k (Level 10 ~ 30)\r\n" + "#bsleep, sleepy, gotobed#k (Level 20 ~ 30)");
  return;
}
if (selection == 6) {
  yield ctx.sayNext("These are the commands for #rMini Kargo#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpee#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 10 ~ 30)\r\n" + "#bthelook, charisma#k (Level 10 ~ 30)\r\n" + "#bdown#k (Level 10 ~ 30)\r\n" + "#bgoodboy, goodgirl#k (Level 20 ~ 30)");
  return;
}
if (selection == 7) {
  yield ctx.sayNext("These are the commands for #rRudolph and Dasher#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bup, stand#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#bmerryxmas, merrychristmas#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#btalk, say, chat#k (Level 11 ~ 30)\r\n" + "#blonely, alone#k (Level 11 ~ 30)\r\n" + "#bcutie#k (Level 11 ~ 30)\r\n" + "#bmush, go#k (Level 21 ~ 30)");
  return;
}
if (selection == 8) {
  yield ctx.sayNext("These are the commands for #rBlack Pig#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1~30)\r\n" + "#bhand#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bsmile#k (Level 10 ~ 30)\r\n" + "#bthelook, charisma#k (Level 20 ~ 30)");
  return;
}
if (selection == 9) {
  yield ctx.sayNext("These are the commands for #rPanda#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bchill, relax#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bletsplay#k (Level 10 ~ 30)\r\n" + "#bmeh, bleh#k (Level 10 ~ 30)\r\n" + "#bsleep#k (Level 20 ~ 30)");
  return;
}
if (selection == 10) {
  yield ctx.sayNext("These are the commands for #rHusky#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, baddog, dummy#k (Level 1 ~ 30)\r\n" + "#bhand#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bdown#k (Level 10 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bup, stand, rise#k (Level 20 ~ 30)");
  return;
}
if (selection == 11) {
  yield ctx.sayNext("These are the commands for #rDino Boy and Dino Girl#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bsmile, laugh#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bcutie#k (Level 10 ~ 30)\r\n" + "#bsleep, nap, sleepy#k (Level 20 ~ 30)");
  return;
}
if (selection == 12) {
  yield ctx.sayNext("These are the commands for #rMonkey#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#brest#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpee#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bup, stand#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bplay#k (Level 10 ~ 30)\r\n" + "#bmelong#k (Level 10 ~ 30)\r\n" + "#bsleep, gotobed, sleepy#k (Level 20 ~ 30)");
  return;
}
if (selection == 13) {
  yield ctx.sayNext("These are the commands for #rTurkey#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno, rudeboy, mischief#k (Level 1 ~ 30)\r\n" + "#bstupid#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bup, stand#k (Level 1 ~ 30)\r\n" + "#btalk, chat, gobble#k (Level 10 ~ 30)\r\n" + "#byes, goodboy#k (Level 10 ~ 30)\r\n" + "#bsleepy, birdnap, doze#k (Level 20 ~ 30)\r\n" + "#bbirdeye, thanksgiving, fly, friedbird, imhungry#k (Level 30)");
  return;
}
if (selection == 14) {
  yield ctx.sayNext("These are the commands for #rWhite Tiger#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#brest, chill#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bactsad, sadlook#k (Level 10 ~ 30)\r\n" + "#bwait#k (Level 20 ~ 30)");
  return;
}
if (selection == 15) {
  yield ctx.sayNext("These are the commands for #rPenguin#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 10 ~ 30)\r\n" + "#bhug, hugme#k (Level 10 ~ 30)\r\n" + "#bwing, hand#k (Level 10 ~ 30)\r\n" + "#bsleep#k (Level 20 ~ 30)\r\n" + "#bkiss, smooch, muah#k (Level 20 ~ 30)\r\n" + "#bfly#k (Level 20 ~ 30)\r\n" + "#bcute, adorable#k (Level 20 ~ 30)");
  return;
}
if (selection == 16) {
  yield ctx.sayNext("These are the commands for #rGolden Pig#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 11 ~ 30)\r\n" + "#bloveme, hugme#k (Level 11 ~ 30)\r\n" + "#bsleep, sleepy, gotobed#k (Level 21 ~ 30)\r\n" + "#bignore / impressed / outofhere#k (Level 21 ~ 30)\r\n" + "#broll, showmethemoney#k (Level 21 ~ 30)");
  return;
}
if (selection == 17) {
  yield ctx.sayNext("These are the commands for #rRobot#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bup, stand, rise#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#bbad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#battack, charge#k (Level 1 ~ 30)\r\n" + "#biloveyou#k (Level 1 ~ 30)\r\n" + "#bgood, thelook, charisma#k (Level 11 ~ 30)\r\n" + "#bspeack, talk, chat, say#k (Level 11 ~ 30)\r\n" + "#bdisguise, change, transform#k (Level 11 ~ 30)");
  return;
}
if (selection == 18) {
  yield ctx.sayNext("These are the commands for #rMini Yeti#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad, no, badboy, badgirl#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bdance, boogie, shakeit#k (Level 1 ~ 30)\r\n" + "#bcute, cutie, pretty, adorable#k (Level 1 ~ 30)\r\n" + "#biloveyou, likeyou, mylove#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say#k (Level 11 ~ 30)\r\n" + "#bsleep, nap, sleepy, gotobed#k (Level 11 ~ 30)");
  return;
}
if (selection == 19) {
  yield ctx.sayNext("These are the commands for #rJr. Balrog#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bliedown#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#biloveyou|mylove|likeyou#k (Level 1 ~ 30)\r\n" + "#bcute|cutie|pretty|adorable#k (Level 1 ~ 30)\r\n" + "#bpoop#k (Level 1 ~ 30)\r\n" + "#bsmirk|crooked|laugh#k (Level 1 ~ 30)\r\n" + "#bmelong#k (Level 11 ~ 30)\r\n" + "#bgood|thelook|charisma#k (Level 11 ~ 30)\r\n" + "#bspeak|talk|chat|say#k (Level 11 ~ 30)\r\n" + "#bsleep|nap|sleepy#k (Level 11 ~ 30)\r\n" + "#bgas#k (Level 21 ~ 30)");
  return;
}
if (selection == 20) {
  yield ctx.sayNext("These are the commands for #rBaby Dragon#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#biloveyou|loveyou#k (Level 1 ~ 30)\r\n#bpoop#k (Level 1 ~ 30)\r\n" + "#bstupid|ihateyou|dummy#k (Level 1 ~ 30)\r\n#bcutie#k (Level 11 ~ 30)\r\n" + "#btalk|chat|say#k (Level 11 ~ 30)\r\n" + "#bsleep|sleepy|gotobed#k (Level 11 ~ 30)");
  return;
}
if (selection == 21) {
  yield ctx.sayNext("These are the commands for #rGreen/Red/Blue Dragon#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 15 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 15 ~ 30)\r\n" + "#biloveyou|loveyou#k (Level 15 ~ 30)\r\n" + "#bpoop#k (Level 15 ~ 30)\r\n" + "#bstupid|ihateyou|dummy#k (Level 15 ~ 30)\r\n" + "#btalk|chat|say#k (Level 15 ~ 30)\r\n" + "#bsleep|sleepy|gotobed#k (Level 15 ~ 30)\r\n" + "#bchange#k (Level 21 ~ 30)");
  return;
}
if (selection == 22) {
  yield ctx.sayNext("These are the commands for #rBlack Dragon#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 15 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 15 ~ 30)\r\n" + "#biloveyou|loveyou#k (Level 15 ~ 30)\r\n" + "#bpoop#k (Level 15 ~ 30)\r\n" + "#bstupid|ihateyou|dummy#k (Level 15 ~ 30)\r\n" + "#btalk|chat|say#k (Level 15 ~ 30)\r\n" + "#bsleep|sleepy|gotobed#k (Level 15 ~ 30)\r\n" + "#bcutie, change#k (Level 21 ~ 30)");
  return;
}
if (selection == 23) {
  yield ctx.sayNext("These are the commands for #rJr. Reaper#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#bplaydead, poop#k (Level 1 ~ 30)\r\n" + "#btalk|chat|say#k (Level 1 ~ 30)\r\n" + "#biloveyou, hug#k (Level 1 ~ 30)\r\n" + "#bsmellmyfeet, rockout, boo#k (Level 1 ~ 30)\r\n" + "#btrickortreat#k (Level 1 ~ 30)\r\n" + "#bmonstermash#k (Level 1 ~ 30)");
  return;
}
if (selection == 24) {
  yield ctx.sayNext("These are the commands for #rPorcupine#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bno|bad|badgirl|badboy#k (Level 1 ~ 30)\r\n" + "#biloveyou|hug|goodboy#k (Level 1 ~ 30)\r\n" + "#btalk|chat|say#k (Level 1 ~ 30)\r\n" + "#bcushion|sleep|knit|poop#k (Level 1 ~ 30)\r\n" + "#bcomb|beach#k (Level 10 ~ 30)\r\n" + "#btreeninja#k (Level 20 ~ 30)\r\n" + "#bdart#k (Level 20 ~ 30)");
  return;
}
if (selection == 25) {
  yield ctx.sayNext("These are the commands for #rSnowman#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bstupid, ihateyou, dummy#k (Level 1 ~ 30)\r\n" + "#bloveyou, mylove, ilikeyou#k (Level 1 ~ 30)\r\n" + "#bmerrychristmas#k (Level 1 ~ 30)\r\n" + "#bcutie, adorable, cute, pretty#k (Level 1 ~ 30)\r\n" + "#bcomb, beach/bad, no, badgirl, badboy#k (Level 1 ~ 30)\r\n" + "#btalk, chat, say/sleep, sleepy, gotobed#k (Level 10 ~ 30)\r\n" + "#bchang#k (Level 20 ~ 30)");
  return;
}
if (selection == 26) {
  yield ctx.sayNext("These are the commands for #rSkunk#k. " + "The level mentioned next to the command shows the pet level required for it to respond.\r\n" + "#bsit#k (Level 1 ~ 30)\r\n" + "#bbad/no/badgirl/badboy#k (Level 1 ~ 30)\r\n" + "#brestandrelax, poop#k (Level 1 ~ 30)\r\n" + "#btalk/chat/say, iloveyou#k (Level 1 ~ 30)\r\n" + "#bsnuggle/hug, sleep, goodboy#k (Level 1 ~ 30)\r\n" + "#bfatty, blind, badbreath#k (Level 10 ~ 30)\r\n" + "#bsuitup, bringthefunk#k (Level 20 ~ 30)");
  return;
}
if (selection == 27) {
  yield ctx.sayNext("In order to transfer the pet ability points, closeness and level, " + "Pet AP Reset Scroll is required. If you take this\r\n" + "scroll to Mar the Fairy in Ellinia, she will transfer the level and closeness of the pet to another one. " + "I am especially giving it to you because I can feel your heart for your pet. However, I can't give this out for free. " + "I can give you this book for 250,000 mesos. Oh, I almost forgot! Even if you have this book, it is no use if you do not have a new pet to transfer the Ability points.");
  if (yield ctx.askYesNo("250,000 mesos will be deducted. Do you really want to buy?")) {
    if (ctx.getMesos() < 250000 || !ctx.canAddItem(4160011, 1)) {
      yield ctx.sayOk("Please check if your inventory has empty slot or you don't have enough mesos.");
    } else {
      yield ctx.sayOk("Thank you for your purchase.");
      ctx.deductMesos(250000);
      ctx.addItem(4160011, 1);
    }
  }
}
}

export function* ludi028(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let selection = yield ctx.sayNext("Do you have any business with me?#b\r\n" + "#L0#Please tell me about this place.#l\r\n" + "#L1#I'm here through a word from Mar the Fairy...#l");
if (selection == 0) {
  if (ctx.hasItem(4031128)) {
    yield ctx.sayNext("Jump over obstacles with your pet, and take that letter to my brother Trainer Neru. " + "Give him the letter and something good is going to happen to your pet.");
  } else {
    if (yield ctx.askYesNo("This is the road where you can go take a walk with your pet. " + "You can just walk around with it, or you can train your pet to go through the obstacles here. " + "If you aren't too close with your pet yet, that may present a problem and he will not follow your command as much... " + "\r\nSo, what do you think? Wanna train your pet?")) {
      ctx.addItem(4031128, 1);
      yield ctx.sayOk("Ok, here's the letter. " + "He wouldn't know I sent you if you just went there straight, " + "so go through the obstacles with your pet, go to the very top, and then talk to Trainer Neru to give him the letter. " + "It won't be hard if you pay attention to your pet while going through obstacles. " + "Good luck!");
    }
  }
} else if (selection == 1) {
  yield ctx.sayOk("Hey, are you sure you've met #bMar the Fairy#k? Don't lie to me if you've never met her before because it's obvious. That wasn't even a good lie!!");
}
}

export function* ludi029(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.hasItem(4031128)) {
  yield ctx.sayNext("Eh, that's my brother's letter! " + "Probably scolding me for thinking I'm not working and stuff...Eh? " + "Ahhh...you followed my brother's advice and trained your pet and got up here, huh? " + "Nice!! Since you worked hard to get here, I'll boost your intimacy level with your pet.");
  ctx.removeItem(4031128, 1);
  yield ctx.sayOk("What do you think? Don't you think you have gotten much closer with your pet? " + "If you have time, train your pet again on this obstacle course...of course, with my brother's permission.");
} else {
  yield ctx.sayOk("My brother told me to take care of the pet obstacle course, " + "but ... since I'm so far away from him, I can't help but wanting to goof around ...hehe, " + "since I don't see him in sight, might as well just chill for a few minutes.");
}
}

export function* Populatus01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Do you want to leave?")) {
  ctx.warpInstanceOut(220080000);
}
}

export function* tamepig_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let monster_riding_quest = 6002;
let pheromone_quest = 6003;
if (ctx.hasQuestStarted(monster_riding_quest)) {
  ctx.warpInstanceIn(923010000);
  ctx.setInstanceTime(5*60);
  ctx.chatBlue("Please protect the pig from the aliens!");
} else if (ctx.hasQuestCompleted(pheromone_quest)) {
  yield ctx.sayNext("I'll send you to the Tamable Hog's area.");
  ctx.warp(922200000);
} else {
  yield ctx.sayOk("Hiya, I'm a jellyfish and I like to breed animals.");
}
}

export function* babyfood(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("Hmmm... baby formula? Don't you think you're past that age?");
}

export function* goldrich(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("Heya! It's me! Gold Richie, I'm one of the richest person alive!");
}

export function* Sky_Train(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.setSpeakerId(2085000);
let res = yield ctx.sayNext("I wish I could soar through the sky... You know, if you are interested in flying, go see Chief Tatamo in Leafre.\r\n#b#L0# Can I purchase a tablet?");
}

export function* adin_enter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let ardinSandBandits = 3933;
let backStreet = 926000000;
if (ctx.hasQuestStarted(ardinSandBandits)) {
  let response = yield ctx.askYesNo("Are you ready to fight my other self?");
  if (response) {
    yield ctx.sayNext("Good. I like your confidence.");
    ctx.warpInstanceIn(backStreet);
  } else {
    yield ctx.sayOk("Remember, you can't become a member of the Sand Bandits without my approval. I'll be waiting.");
  }
} else {
  yield ctx.sayOk("I don't have the time to talk to you... In fact, I am not as free as you think.");
}
}

export function* ariant_gold1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let redScorpions = 3926;
let jewelry = 4031579;
if (ctx.hasQuestStarted(redScorpions)) {
  let jewelryStatus = ctx.getQRValue(redScorpions);
  let jewelryParse = "0000";
  let houseIndex = 0;
  if (jewelryStatus) {
    let jewelryParse = jewelryStatus;
  }
  if (jewelryParse[houseIndex] != "3" && ctx.hasItem(jewelry)) {
    ctx.removeItem(jewelry, 1);
    if (!jewelryStatus) {
      let jewelryStatus = "3000";
    } else {
      let jewelryStatus = "3" + jewelryParse.slice(houseIndex+1);
    }
    ctx.setQRValue(redScorpions, jewelryStatus);
    yield ctx.sayOk("You carefully placed the treasure on the ground.");
  } else if (!ctx.hasItem(jewelry) && jewelryParse[houseIndex] != "3" && jewelryStatus != "3333") {
    yield ctx.sayOk("You do not have any more treasure. Forfeit the quest and return to the Red Scorpion's Lair.");
  } else {
    yield ctx.sayOk("There's already treasure placed here.");
  }
} else if (!ctx.hasQuestCompleted(redScorpions)) {
  yield ctx.sayOk("This looks like a good place to drop the treasure.");
}
}

export function* ariant_gold2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let redScorpions = 3926;
let jewelry = 4031579;
if (ctx.hasQuestStarted(redScorpions)) {
  let jewelryStatus = ctx.getQRValue(redScorpions);
  let jewelryParse = "0000";
  let houseIndex = 1;
  if (jewelryStatus) {
    let jewelryParse = jewelryStatus;
  }
  if (jewelryParse[houseIndex] != "3" && ctx.hasItem(jewelry)) {
    ctx.removeItem(jewelry, 1);
    if (!jewelryStatus) {
      let jewelryStatus = "0300";
    } else {
      let jewelryStatus = jewelryParse.slice(0, houseIndex) + "3" + jewelryParse.slice(houseIndex+1);
    }
    ctx.setQRValue(redScorpions, jewelryStatus);
    yield ctx.sayOk("You carefully placed the treasure on the ground.");
  } else if (!ctx.hasItem(jewelry) && jewelryParse[houseIndex] != "3" && jewelryStatus != "3333") {
    yield ctx.sayOk("You do not have any more treasure. Forfeit the quest and return to the Red Scorpion's Lair.");
  } else {
    yield ctx.sayOk("There's already treasure placed here.");
  }
} else if (!ctx.hasQuestCompleted(redScorpions)) {
  yield ctx.sayOk("This looks like a good place to drop the treasure.");
}
}

export function* ariant_gold3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let redScorpions = 3926;
let jewelry = 4031579;
if (ctx.hasQuestStarted(redScorpions)) {
  let jewelryStatus = ctx.getQRValue(redScorpions);
  let jewelryParse = "0000";
  let houseIndex = 2;
  if (jewelryStatus) {
    let jewelryParse = jewelryStatus;
  }
  if (jewelryParse[houseIndex] != "3" && ctx.hasItem(jewelry)) {
    ctx.removeItem(jewelry, 1);
    if (!jewelryStatus) {
      let jewelryStatus = "0030";
    } else {
      let jewelryStatus = jewelryParse.slice(0, houseIndex) + "3" + jewelryParse.slice(houseIndex+1);
    }
    ctx.setQRValue(redScorpions, jewelryStatus);
    yield ctx.sayOk("You carefully placed the treasure on the ground.");
  } else if (!ctx.hasItem(jewelry) && jewelryParse[houseIndex] != "3" && jewelryStatus != "3333") {
    yield ctx.sayOk("You do not have any more treasure. Forfeit the quest and return to the Red Scorpion's Lair.");
  } else {
    yield ctx.sayOk("There's already treasure placed here.");
  }
} else if (!ctx.hasQuestCompleted(redScorpions)) {
  yield ctx.sayOk("This looks like a good place to drop the treasure.");
}
}

export function* ariant_gold4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let redScorpions = 3926;
let jewelry = 4031579;
if (ctx.hasQuestStarted(redScorpions)) {
  let jewelryStatus = ctx.getQRValue(redScorpions);
  let jewelryParse = "0000";
  let houseIndex = 3;
  if (jewelryStatus) {
    let jewelryParse = jewelryStatus;
  }
  if (jewelryParse[houseIndex] != "3" && ctx.hasItem(jewelry)) {
    ctx.removeItem(jewelry, 1);
    if (!jewelryStatus) {
      let jewelryStatus = "0003";
    } else {
      let jewelryStatus = jewelryParse.slice(0, houseIndex) + "3";
    }
    ctx.setQRValue(redScorpions, jewelryStatus);
    yield ctx.sayOk("You carefully placed the treasure on the ground.");
  } else if (!ctx.hasItem(jewelry) && jewelryParse[houseIndex] != "3" && jewelryStatus != "3333") {
    yield ctx.sayOk("You do not have any more treasure. Forfeit the quest and return to the Red Scorpion's Lair.");
  } else {
    yield ctx.sayOk("There's already treasure placed here.");
  }
} else if (!ctx.hasQuestCompleted(redScorpions)) {
  yield ctx.sayOk("This looks like a good place to drop the treasure.");
}
}

export function* jenu_homun(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let experiment = 3310;
let closedLab = 926120100;
if (ctx.hasQuestStarted(experiment)) {
  let control = yield ctx.askYesNo("Do you want to go to the closed laboratory and try controlling the Homun?");
  if (control) {
    yield ctx.sayNext("Concentrate...! It won't be an easy task trying to control the Magic Pentragram that triggers Homun's rage.");
    ctx.warpInstanceIn(closedLab);
    ctx.setInstanceTime(20 * 60);
  }
} else {
  yield ctx.sayOk("Alchemy and its alchemists are important. However, to have the town of Magatia bear this burden... " + "Magatia's integrity must be preserved. Do you have the power to protect the town of alchemists?");
}
}

export function* snow_rose(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let snowfieldRose = 3335;
let snowRoseGrows = 926120300;
let mayMist = 4000361;
if (ctx.hasQuestStarted(snowfieldRose)) {
  let response = yield ctx.askYesNo("Are you ready to grow the Snow Rose?");
  if (response) {
    ctx.warpInstanceIn(snowRoseGrows);
  } else {
    yield ctx.sayOk("Remember to bring #bMay Mist#k with you so the Snow Rose can bloom.");
  }
} else {
  yield ctx.sayOk("I want to become human. I want to be a human with a warm heart so I can hold her hand. But now...");
}
}

export function* drang_room1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let parwenKnows = 3320;
let deLangPotion = 3354;
let dranLab = {"MapID": 926120200};
if (ctx.hasQuestStarted(parwenKnows)) {
  let response = yield ctx.askYesNo(ctx.formatString("Are you ready to visit #m{MapID}#?", dranLab));
  if (response) {
    ctx.warpInstanceIn(dranLab["MapID"]);
  }
} else {
  if (ctx.hasQuestStarted(deLangPotion) || ctx.hasQuestCompleted(deLangPotion)) {
    yield ctx.sayOk("You really don't need to see that alchemist again, do you?");
  } else {
    yield ctx.sayOk("You're not ready for this yet.");
  }
}
}

export function* absence_wall(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let clue = 3311;
if (ctx.hasQuestStarted(clue)) {
  let response = yield ctx.askYesNo("Amidst the throng of spider webs, " + "there's a wall behind it that seems to have something written on it. " + "Perhaps you should take a closer look at the wall?");
  if (response) {
    yield ctx.sayNext("On a wall full of graffiti, " + "there seems to be a phrase that really stands out above the rest. " + "#bIt's in a form of a pendant#k... What does that mean?");
    ctx.setQRValue(clue, "5");
  }
} else {
  yield ctx.sayOk("A throng of webs has accumulated around this part of the home.");
}
}

export function* absence_box(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("A cabinet sits behind the pipes. A lot of handprints have been left behind by numerous previous investigators. " + "Nothing of interest can be found from carefully searching inside the cabinet.");
}

export function* absence_frame(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let silverPendant = 4031697;
let phylliaPendant = 3322;
if (ctx.hasQuestStarted(phylliaPendant)) {
  if (ctx.canAddItem(silverPendant, 1) && !ctx.hasItem(silverPendant)) {
    ctx.addItem(silverPendant, 1);
    yield ctx.sayOk("The hook behind the frame was unhooked, revealing a secret space within the frame. " + "There inside, a silver pendant was found. " + "After carefully removing the pendant, the frame was closed and placed back on the table.");
  } else if (ctx.hasItem(silverPendant)) {
    yield ctx.sayOk("There's nothing behind the frame anymore.");
  } else {
    yield ctx.sayNext("Unable to take what's inside the frame because your Etc. inventory is full.");
  }
} else {
  yield ctx.sayOk("A picture frame of a gentlemanly alchemist. Is he the missing alchemist?");
}
}

export function* absence_desk(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("A messy desk sits here. A lot of handprints have been left behind by numerous previous investigators. " + "Nothing of interest can be found from carefully searching the desk's surroundings.");
}

export function* alcadno_potion(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let lifeAlchemyMissing = 3314;
let russellonPill = 2438888;
if (ctx.hasQuestStarted(lifeAlchemyMissing)) {
  if (ctx.canAddItem(russellonPill, 1) && !ctx.hasItem(russellonPill)) {
    ctx.addItem(russellonPill, 1);
    yield ctx.sayOk("There seems to be a number of small pills on the desk. " + "Just take one from there...");
  } else if (ctx.hasItem(russellonPill)) {
    yield ctx.sayOk("You already have a pill. Use it and return to Russellon.");
  } else {
    yield ctx.sayOk("Please make room in your Use inventory.");
  }
}
}

export function* pipe1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let undergroundStudy = 3339;
if (ctx.hasQuestStarted(undergroundStudy) || ctx.hasQuestCompleted(undergroundStudy)) {
  if (!ctx.hasQuestStarted(7063)) {
    ctx.forceStartQuest(7063); ctx.setQRValue(7063, "1");
    yield ctx.sayNext("The pipe makes a sharp, shrieking metal noise, and turns a little to the right.");
  } else {
    yield ctx.sayOk("The pipe didn't move one bit.");
  }
} else {
  yield ctx.sayOk("The pipe didn't move one bit.");
}
}

export function* pipe2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let undergroundStudy = 3339;
if (ctx.hasQuestStarted(undergroundStudy) || ctx.hasQuestCompleted(undergroundStudy)) {
  let pipeStatus = ctx.getQRValue(7063);
  if (pipeStatus == "3") {
    let answer = yield ctx.askText("As the pipe moved downwards, a security device appeared. " + "A password may need to be entered.", "", 1, 15);
    if (answer == "my love Phyllia") {
      ctx.deleteQuest(7063);
      ctx.teleportToPortal(1);
    } else {
      yield ctx.sayOk("The security device rejected the password.");
    }
  } else {
    yield ctx.sayOk("The pipe didn't move one bit.");
  }
} else {
  yield ctx.sayOk("The pipe didn't move one bit.");
}
}

export function* pipe3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let undergroundStudy = 3339;
if (ctx.hasQuestStarted(undergroundStudy) || ctx.hasQuestCompleted(undergroundStudy)) {
  let pipeStatus = ctx.getQRValue(7063);
  if (pipeStatus == "1") {
    ctx.setQRValue(7063, "3");
    yield ctx.sayNext("The pipe makes a sharp, shrieking metal noise, and turns a little to the left.");
  } else {
    yield ctx.sayOk("The pipe didn't move one bit.");
  }
} else {
  yield ctx.sayOk("The pipe didn't move one bit.");
}
}

export function* juliet_start(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  ctx.setSpeakerId(2112003);
  if (ctx.getFieldID() !== 910002000) {
    const selection = yield ctx.sayNext("#e<Party Quest: Romeo & Juliet>#n \r\nMagatia faces a grave threat. We need brave adventurers to help us.\r\n\r\n#b#L0#Listen to Juliet's story.#l \r\n#L1#Start the quest.#l \r\n#L2#Find a party.#l\r\n#L3#Make a necklace with Alcadno Marbles.#l \r\n#L4#Combine two necklaces into one.#l");
    if (selection === 0) {
      yield ctx.sayNext("Romeo and I are in love. But I am an Alcadno, and he is a Zenumist. There's no hope for us to be together...");
      yield ctx.sayNext("The Alcadno and the Zenumist were not always enemies! There must be a way to bring peace to our two sides!");
      yield ctx.sayNext("But in spite of everything I've tried, Magatia is#b on the verge of war#k. It's all because#b someone stole the power source of both Zenumist and Alcadno#k. And the two sides are blaming each other for it!");
      yield ctx.sayNext("I got a tip that the real thief is#b a third party#k. If we're ever going to have peace -- and love for me and Romeo -- we need to find#b the third party#k and stop his evil plan!");
      yield ctx.sayNext("Fight for the peace of Magatia! \r\n#e-Level#n: 70+ #r(Recommended: 70 - 99)#k \r\n#e-Time Limit#n: 20 min \r\n#e-Players#n: 4 \r\n#e-Reward#n: \r\n#i1122117# Juliet's Pendant \r\n(Can be obtained from #bJuliet#k once you collect #r2#b Alcadno Marbles#k.) \r\n#i1122118# Symbol of Eternal Love \r\n(Can be traded for 1 #bRomeo's Pendant#k and 1 #bJuliet's Pendant#k)");
    } else if (selection === 1) {
      if (ctx.isPartyLeader()) {
        ctx.warpPartyIn(926100000);
      } else {
        yield ctx.sayNext('The party leader can proceed to the next stage.');
      }
    } else if (selection === 2) {
      ctx.openUI(0);
    } else if (selection === 3) {
      if (ctx.hasItem(4001160, 2)) {
        if (ctx.canAddItem(1122117, 1)) {
          ctx.removeItem(4001160, 2);
          ctx.addItem(1122117, 1);
        } else {
          yield ctx.sayNext('Please make some space in your equipment inventory.');
        }
      } else {
        yield ctx.sayNext("To make Juliet's Pendant, we need 2 Alcadno Marbles. You seem to be missing a few.");
      }
    } else if (selection === 4) {
      if (ctx.hasItem(1122116) && ctx.hasItem(1122117)) {
        if (ctx.canAddItem(1122118, 1)) {
          ctx.removeItem(1122116, 1);
          ctx.removeItem(1122117, 1);
          ctx.addItem(1122118, 1);
        } else {
          yield ctx.sayNext('Please make some space in your equipment inventory.');
        }
      } else {
        yield ctx.sayNext("You need Romeo's Pendant and Juliet's Pendant to combine them.");
      }
    }
  } else {
    const selection = yield ctx.sayNext("Brave Maplers, please help us preserve the fragile peace of Magatia!\r\n\r\n#b#L10#Go to #m261000021# to listen to Juliet's story.#l");
    if (selection === 10) {
      ctx.warp(261000021);
    }
  }
}

export function* PinkBeen_Summon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const KIRSTON = 2141000;
  ctx.setSpeakerId(KIRSTON);
  ctx.setParam(1);
  const res = yield ctx.askAccept("With only the Mirror of the Goddess, I can summon the Black Mage again! But... Why isn't it working? What is this strange energy? It's completely different from the Black Mage... AHHHH!\r\n\r\n#b(You place your hands on Kirston's shoulders.)#k");
  if (res) {
    ctx.spawnMob(8800000, 5, -46); // Pink Bean
    ctx.killMobs(8820000);
    ctx.spawnMob(8820000, 5, -46);
    ctx.killMobs(8820001);
    ctx.spawnMob(8820001, 5, -46);
    ctx.removeNpc(KIRSTON);
    ctx.killMobs(8820002);
    ctx.spawnMob(8820002, 5, -46);
  }
}

export function* PinkBeen_accept(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const NORMAL_PB_MAP = 270050100;
  const PB_ENTRANCE = 270050000;
  const response = yield ctx.sayNext("Would you like to fight #rPink Bean#k?\r\n#b#L0#Normal Mode (Level 160+)#l");
  if (ctx.getParty() === null) {
    ctx.createSoloParty();
  }
  if (!ctx.isPartyLeader()) {
    yield ctx.sayOk('Please have your party leader enter if you wish to face Pink Bean.');
  } else if (ctx.getLevel() >= 160) {
    ctx.warpInstanceIn(NORMAL_PB_MAP, PB_ENTRANCE, 30 * 60);
  } else {
    yield ctx.sayOk('You must be at least level 160 to enter.');
  }
}

export function* PinkBeen_Out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  if (yield ctx.askYesNo('Are you sure you want to leave? Your whole party will be ported out.')) {
    ctx.warpInstanceOut(270050000);
  }
}

export function* talk2152014(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let FATTIE = 2159014;
ctx.setSpeakerId(FATTIE);
yield ctx.sayOk("I'm so hot, I'm probably blinding you. I also like balloons. And now, I won't share my balloons with you, so don't even ask.");
}

export function* talk2153004(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let harryLion = 23944;
let bwToken = 4032766;
let victoriaIsland = [ 100000000, 101000000, 102000000, 103000000, 104000000, 120000000 ];
const warpToVictoriaIsland = function*() {
  let destination = Util.getRandomFromCollection(victoriaIsland);
  ctx.warp(destination);
}
if (ctx.hasQuestCompleted(harryLion)) {
  if (ctx.hasItem(bwToken)) {
    ctx.removeItem(bwToken, 1);
    warpToVictoriaIsland();
  } else if (ctx.getMesos() >= 10000) {
    ctx.chat("Consumed 10000 mesos instead of a Black Wings Token to operate the Black Portal.");
    ctx.deductMesos(10000);
    warpToVictoriaIsland();
  } else {
    ctx.chat("You need 10000 mesos to operate the Black Portal without a Black Wings Token.");
  }
} else {
  ctx.chat("You don't have permission to use the Black Portal.");
}
}

export function* secretElevatorUp(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.warp(310030200, 3);
}

export function* talk2159009(ctx: ScriptContext): Generator<ScriptMessage, void, any> {

}

export function* checkRueEater(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
ctx.warp(931020030, 2);
}

export function* Event05(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("No lock is safe from me.");
}

export function* tamepig_out(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let zoo_map = 230000003;
if (ctx.hasItem(4031508, 5) && ctx.hasItem(4031507, 5)) {
  yield ctx.sayNext("Wow! You've succeeded in collecting 5 of each #bKenta'sReport#k and #bPheromone#k! Good. Now I will send you to #m" + String(zoo_map)+"#. Please talk to me when you get there.");
  ctx.warpInstanceOut(zoo_map);
} else {
  if (yield ctx.askYesNo("Do you want to leave?")) {
    ctx.warpInstanceOut(zoo_map);
  }
}
}

export function* ninja_maze(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.getFieldID() == 800040211) {
  if (yield ctx.askYesNo("You have reached the end of this jumpquest! I will send you back now")) {
    if (ctx.hasQuestStarted(9998)) {
      ctx.setQRValue(9998, "ninja");
    } else {
      ctx.forceStartQuest(9998); ctx.setQRValue(9998, "ninja=1");
    }
  }
  ctx.warp(800040000);
}
}

export function* boss_cat(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let orange_marble = 4031064;
let fried_chicken = 2020001;
let questions = [ "Question no.1:What's the name of the vegetable store owner in Showa Town?\r\n#b" + "#L0#Sami #l\r\n" + "#L1#Kami #l\r\n" + "#L2#Umi #l\r\n",  "Question no.2: Which of these NPCs does NOT stand in front of the movie theater at Showa Town?\r\n#b" + "#L0#Sky #l\r\n" + "#L1#Furano #l\r\n" + "#L2#Shinta #l\r\n",  "Question no.3: What is the name of the NPC that transfers travelers from Showa Town to the Mushroom Shrine?\r\n#b" + "#L0#Spinel #l\r\n" + "#L1#Perry #l\r\n" + "#L2#Transporter #l\r\n" ];
let correct_answers = [2, 2, 1];
let correct = 0;
if (ctx.hasQuestStarted(8012) && !ctx.hasItem(orange_marble)) {
  if (!ctx.hasItem(fried_chicken, 300)) {
    yield ctx.sayOk("I like pretty objects, the ones that sparkle. Sparkles won't turn their back on you like those mean humans." + " Sure, I stole that marble, but boo-hoo! I've been abused by humans for as long as all the other cats here." + " If you want your precious marble back, you'll get it on my terms. Tell you what, I'm going to ask you some questions." + " If you get them all right, the Orange Marble is yours. But taking my questionnaire is gonna cost you. I want #b300 #z+" + String(fried_chicken)+"##k." + " And if you mess up a question, I expect another #b300 #z+"+String(fried_chicken)+"##k to let you start again.");
  } else {
    let give_chicken = yield ctx.askYesNo("Did you get them all? Are you going to try to answer all of my questions?");
    if (!ctx.canAddItem(orange_marble, 1)) {
      yield ctx.sayOk("Please check your pockets to see if you have room in your ETC inventory");
    } else if (give_chicken) {
      ctx.removeItem(fried_chicken, 300);
      yield ctx.sayNext("Good job! The alley cats are gonna feast tonight! Now, on to my questions, I'm sure you're aware of this, but remember, if you get a single one wrong, it's over. This is all or nothing!");
      for (let i = 0; i < questions.length; i++) {
        let answer = yield ctx.sayNext(questions[i]);
        if (answer != correct_answers[i]) {
          yield ctx.sayOk("You're wrong! So thanks for the chicken! See you again.");
          break;
        }
        correct += 1;
      }
      if ((correct == 3)) {
        yield ctx.sayNext("Wow, you answered all the questions correctly! I may not be the most fond of humans, but I HATE breaking a promise! So, as promised, here's the Orange Marble.\r\nYou earned it!");
        ctx.addItem(orange_marble, 1);
        yield ctx.sayOk("Our business is concluded, thank you very much! You can leave now!");
      }
    } else {
      yield ctx.sayOk("I'm going to starve because of you.");
    }
  }
} else {
  yield ctx.sayOk("Meow");
}
}

export function* con1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to go to the Hideout?")) {
  ctx.warp(801040000);
}
}

export function* con2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (yield ctx.askYesNo("Would you like to go back to Showa Town?")) {
  ctx.warp(801000000, 11);
}
}

export function* s_dungeon(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let comb = 4000138;
if (ctx.getParty() === null) {
  yield ctx.sayOk("You must be in a party of one or more to enter.");
} else if (!ctx.isPartyLeader()) {
  yield ctx.sayOk("Please have your party leader talk to me.");
} else if (ctx.checkParty() && ctx.hasItem(comb)) {
  yield ctx.sayNext("#e<Boss: Yakuza Boss>#n \r\n" + "Hey! Is that the #t" + String(comb) + "# in your hand?! I knew you could do it! " + "Maybe you can take down the Big Boss. Will you be able to break into his inner sanctum? #b\r\n\r\n" + "#L0#Enter <Boss: Yakuza Boss>.#l");
  ctx.warpInstanceIn(801040100);
  ctx.setInstanceTime(20*60);
} else {
  yield ctx.sayOk("It's too dangerous for you to go any further without #b" + ctx.formatInlineItem(comb) + "#k!");
}
}

export function* con3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
if (ctx.hasItem(4000141)) {
  yield ctx.sayNext("Th-that lantern! You really defeated the boss...? You...! " + "Wow, I don't know what to say... Let's just get the heck out of here!");
  ctx.warpInstanceOut(801040101);
} else {
  let exit = yield ctx.askYesNo("What? Do you really want to leave now?");
  if (exit) {
    ctx.warpInstanceOut(801040000);
  }
}
}

export function* con4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let boss_lantern = 4000141;
let power_elixir = 2000005;
yield ctx.sayNext("Wow, you really did it. Thinking about his singular obsession with controlling Showa Town, " + "I still get the creeps. I like to think this means things in town will finally be quiet, " + "but I've got a knot in my stomach that says otherwise. Anyways, for now let's celebrate the fact that the boss is gone.");
if (ctx.hasItem(boss_lantern)) {
  yield ctx.sayNext("That's right! I'll hold onto the boss's lantern for safekeeping. " + "Now that we know who he really was, I feel like more peaceful days may be ahead. " + "I have to admit, discovering that he was a monster in disguise really caught me off guard.");
  if (ctx.canAddItem(power_elixir, 100)) {
    ctx.removeItem(boss_lantern, 1);
    ctx.addItem(power_elixir, 100);
  } else {
    yield ctx.sayOk("Make some room in your Use inventory first.");
    return;
  }
}
yield ctx.sayNext("Well, cheers.");
ctx.warp(801000000);
}

export function* go_xmas06(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
yield ctx.sayOk("May you have a warm and joyous Festival of Lights!");
}

export function* Gear_Upgrade(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let legacy = [ {"ItemID": 1132313, "Slot": "Belt"}, {"ItemID": 1113305, "Slot": "Ring"}, {"ItemID": 1122438, "Slot": "Pendant"}, {"ItemID": 1122439, "Slot": "Pendant"}, {"ItemID": 1032314, "Slot": "Earrings"}, {"ItemID": 1202281, "Slot": "Totem"}];
let shadowknight = 4310279;
yield ctx.sayNext("Do you require my services? #b\r\n" + "#L0# So you mentioned you dabble in crafting... #l\r\n");
let selString = ["You have some coins I can work with? Excellent, here are the things I can make so far... " + "what would you like me to create? #r#e\r\n" + "For production, you need #t", String(shadowknight), "# x100 and 500,000,000 mesos. #b#n\r\n"];
let items = ctx.selectionString("#L{i}##i{ItemID}# #z{ItemID}# ({Slot})#l", legacy);
selString.push(items);
let itemSelection = yield ctx.sayNext(ctx.join(selString));
let selectedItem = legacy[itemSelection]["ItemID"];
let confirmCraft = yield ctx.askYesNo(ctx.join(["Are you sure you want me to make #b ", ctx.formatInlineItem(selectedItem), "#k?"]));
if (confirmCraft) {
  if (ctx.hasItem(shadowknight, 100) && ctx.getMesos() >= 500000000) {
    yield ctx.sayNext("Good, please hand over the items I asked for. Excellent. " + "Now give me some space and I'll begin my work..");
    if (ctx.canAddItem(selectedItem, 1)) {
      ctx.removeItem(shadowknight, 100);
      ctx.deductMesos(500000000);
      ctx.addItem(selectedItem, 1);
      yield ctx.sayNext("There she is. Treat her well.");
    } else {
      yield ctx.sayOk("Hey, make some space in your Equip inventory. I don't want to see this piece of work go to waste.");
    }
  } else {
    yield ctx.sayOk("Come back when you have enough Shadowknight Coins and mesos. This isn't charity work, you know.");
  }
} else {
  yield ctx.sayOk("Talk to me again if you change your mind later.");
}
}

export function* glpqEnter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let HALL_TO_INNER_SANCTUM = 610030020;
ctx.warp(HALL_TO_INNER_SANCTUM);
}

export function* Enter_Darkportal_W(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let quest = 28179;
let mapid = 677000004;
if (ctx.hasQuestStarted(quest)) {
  if (yield ctx.askYesNo("Would you like to enter?")) {
    ctx.warp(mapid, 0);
  }
} else {
  yield ctx.sayOk("#b(A strange doorway)");
}
}

export function* Enter_Darkportal_M(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let quest = 28198;
let mapid = 677000000;
if (ctx.hasQuestStarted(quest)) {
  if (yield ctx.askYesNo("Would you like to enter?")) {
    ctx.warp(mapid, 0);
  }
} else {
  yield ctx.sayOk("#b(A strange doorway)");
}
}

export function* Enter_Darkportal_T(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let quest = 28219;
let mapid = 677000008;
if (ctx.hasQuestStarted(quest)) {
  if (yield ctx.askYesNo("Would you like to enter?")) {
    ctx.warp(mapid, 0);
  }
} else {
  yield ctx.sayOk("#b(A strange doorway)");
}
}

export function* Enter_Darkportal_H(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let quest = 28238;
let mapid = 677000002;
if (ctx.hasQuestStarted(quest)) {
  if (yield ctx.askYesNo("Would you like to enter?")) {
    ctx.warp(mapid, 0);
  }
} else {
  yield ctx.sayOk("#b(A strange doorway)");
}
}

export function* Enter_Darkportal_P(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let quest = 28256;
let mapid = 677000006;
if (ctx.hasQuestStarted(quest)) {
  if (yield ctx.askYesNo("Would you like to enter?")) {
    ctx.warp(mapid, 0);
  }
} else {
  yield ctx.sayOk("#b(A strange doorway)");
}
}

export function* captinsg01(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
let RED_ESSENCE = 4000383;
let REQ_ESSENCE = 300;
let LATANICA_HP = 1700000000;
let sel = yield ctx.askYesNo("Heyyyy, I'm Bob. Are you looking for the boss of this ship? #b\r\n" + "#L0#Summon Captain Latanica (consumes 300 #i{}##t{}#)#l\r\n" + `#L1#Leave#l`);
if (sel == 0) {
  if (ctx.hasItem(RED_ESSENCE, REQ_ESSENCE)) {
    ctx.removeItem(RED_ESSENCE, REQ_ESSENCE);
    ctx.spawnMob(9420513, -154, 225);
  } else {
    yield ctx.sayOk(`Hey friend, I don't think you have 300 #i{}##t{}#! Come back after defeating some more Mr. Anchors.`);
  }
} else if (sel == 1) {
  ctx.warpInstanceOut(541010060);
}
}
