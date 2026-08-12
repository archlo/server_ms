import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { InventoryType } from '../../item/InventoryType';

const DAWN_WARRIOR_1 = 1100; // Job.DAWN_WARRIOR_1
const BLAZE_WIZARD_1 = 1200; // Job.BLAZE_WIZARD_1
const WIND_ARCHER_1 = 1300; // Job.WIND_ARCHER_1
const NIGHT_WALKER_1 = 1400; // Job.NIGHT_WALKER_1
const THUNDER_BREAKER_1 = 1500; // Job.THUNDER_BREAKER_1

export function* enterDisguise0(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Crossroads of Ereve (130000200) - west00 (-675, 92)
  ctx.playPortalSE();
  ctx.warp(130010000, 'east00'); // Empress' Road : Training Forest I
}

export function* enterDisguise1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Training Forest I (130010000) - in00 (-724, -754)
  ctx.playPortalSE();
  ctx.warp(130010010, 'out00'); // Empress' Road : Training Forest I
}

export function* enterDisguise2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Training Forest I (130010000) - in01 (-1439, -755)
  ctx.playPortalSE();
  ctx.warp(130010020, 'out00'); // Empress' Road : Tiv's Forest
}

export function* enterDisguise3(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Training Forest II (130010100) - in00 (-1402, -338)
  ctx.playPortalSE();
  ctx.warp(130010110, 'out00'); // Empress' Road : Timu's Forest
}

export function* enterDisguise4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Training Forest II (130010100) - in01 (-2887, -747)
  ctx.playPortalSE();
  ctx.warp(130010120, 'out00'); // Empress' Road : Tiru's Forest
}

export function* enterDisguise5(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Training Forest III (130010200) - west00 (-4097, 90)
  ctx.playPortalSE();
  ctx.warp(130020000, 'east00'); // Empress' Road : Entrance to the Drill Hall
}

export function* enterFirstDH(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Empress' Road : Entrance to the Drill Hall (130020000) - in00 (539, 91)
  if (ctx.hasQuestStarted(20701)) {
    ctx.playPortalSE();
    ctx.warp(913000000, 'out00');
  } else if (ctx.hasQuestStarted(20702)) {
    ctx.playPortalSE();
    ctx.warp(913000100, 'out00');
  } else if (ctx.hasQuestStarted(20703)) {
    ctx.playPortalSE();
    ctx.warp(913000200, 'out00');
  } else {
    ctx.message("Hall #1 can only be entered if you're engaged in Kiku's Acclimation Training.");
  }
}

export function* q20101e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of a Dawn Warrior (20101 - end)
  if (!(yield ctx.askYesNo('Have you made your decision? The decision will be final, so think carefully before deciding what to do. Are you sure you want to become a Dawn Warrior?'))) {
    yield ctx.sayNext('This is an important decision to make.');
    return;
  }
  if (!ctx.addItems([
    [1302077, 1],
    [1142066, 1],
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
  ctx.setJob(DAWN_WARRIOR_1);
  ctx.forceCompleteQuest(20101);
  yield ctx.sayNext('I have just molded your body to make it perfect for a Dawn Warrior. If you wish to become more powerful, use Stat Window (S) to raise the appropriate stats. If you aren\'t sure what to raise, just click on #bAuto#k.');
  yield ctx.sayBoth('I have also expanded your inventory slot counts for your equipment and etc. inventory. Use those slots wisely and fill them up with items required for Knights to carry.');
  yield ctx.sayBoth("I have also given you a hint of #bSP#k, so open the #bSkill Menu#k to acquire new skills. Of course, you can't raise them at all once, and there are some skills out there where you won't be able to acquire them unless you master the basic skills first.");
  yield ctx.sayBoth('Unlike your time as a Noblesse, once you become the Dawn Warrior, you will lost a portion of your EXP when you run out of HP, okay?');
  yield ctx.sayBoth('Now... I want you to go out there and show the world how the Knights of Cygnus operate.');
}

export function* q20102e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of a Blaze Wizard (20102 - end)
  if (!(yield ctx.askYesNo('Have you made your decision? The decision will be final, so think carefully before deciding what to do. Are you sure you want to become a Blaze Wizard?'))) {
    yield ctx.sayNext('This is an important decision to make.');
    return;
  }
  if (!ctx.addItems([
    [1372043, 1],
    [1142066, 1],
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
  ctx.setJob(BLAZE_WIZARD_1);
  ctx.forceCompleteQuest(20102);
  yield ctx.sayNext('I have just molded your body to make it perfect for a Blaze Wizard. If you wish to become more powerful, use Stat Window (S) to raise the appropriate stats. If you aren\'t sure what to raise, just click on #bAuto#k.');
  yield ctx.sayBoth('I have also expanded your inventory slot counts for your equipment and etc. inventory. Use those slots wisely and fill them up with items required for Knights to carry.');
  yield ctx.sayBoth("I have also given you a hint of #bSP#k, so open the #bSkill Menu#k to acquire new skills. Of course, you can't raise them at all once, and there are some skills out there where you won't be able to acquire them unless you master the basic skills first.");
  yield ctx.sayBoth('Unlike your time as a Noblesse, once you become the Blaze Wizard, you will lost a portion of your EXP when you run out of HP, okay?');
  yield ctx.sayBoth('Now... I want you to go out there and show the world how the Knights of Cygnus operate.');
}

export function* q20103e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of a Wind Archer (20103 - end)
  if (!(yield ctx.askYesNo('Have you made your decision? The decision will be final, so think carefully before deciding what to do. Are you sure you want to become a Wind Archer?'))) {
    yield ctx.sayNext('This is an important decision to make.');
    return;
  }
  if (!ctx.addItems([
    [2060000, 2000],
    [1452051, 1],
    [1142066, 1],
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
  ctx.setJob(WIND_ARCHER_1);
  ctx.forceCompleteQuest(20103);
  yield ctx.sayNext('I have just molded your body to make it perfect for a Wind Archer. If you wish to become more powerful, use Stat Window (S) to raise the appropriate stats. If you aren\'t sure what to raise, just click on #bAuto#k.');
  yield ctx.sayBoth('I have also expanded your inventory slot counts for your equipment and etc. inventory. Use those slots wisely and fill them up with items required for Knights to carry.');
  yield ctx.sayBoth("I have also given you a hint of #bSP#k, so open the #bSkill Menu#k to acquire new skills. Of course, you can't raise them at all once, and there are some skills out there where you won't be able to acquire them unless you master the basic skills first.");
  yield ctx.sayBoth('Unlike your time as a Noblesse, once you become the Wind Archer, you will lost a portion of your EXP when you run out of HP, okay?');
  yield ctx.sayBoth('Now... I want you to go out there and show the world how the Knights of Cygnus operate.');
}

export function* q20104e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of a Night Walker (20104 - end)
  if (!(yield ctx.askYesNo('Have you made your decision? The decision will be final, so think carefully before deciding what to do. Are you sure you want to become a Night Walker?'))) {
    yield ctx.sayNext('This is an important decision to make.');
    return;
  }
  if (!ctx.addItems([
    [2070000, 500],
    [1472061, 1],
    [1142066, 1],
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
  ctx.setJob(NIGHT_WALKER_1);
  ctx.forceCompleteQuest(20104);
  yield ctx.sayNext('I have just molded your body to make it perfect for a Night Walker. If you wish to become more powerful, use Stat Window (S) to raise the appropriate stats. If you aren\'t sure what to raise, just click on #bAuto#k.');
  yield ctx.sayBoth('I have also expanded your inventory slot counts for your equipment and etc. inventory. Use those slots wisely and fill them up with items required for Knights to carry.');
  yield ctx.sayBoth("I have also given you a hint of #bSP#k, so open the #bSkill Menu#k to acquire new skills. Of course, you can't raise them at all once, and there are some skills out there where you won't be able to acquire them unless you master the basic skills first.");
  yield ctx.sayBoth('Unlike your time as a Noblesse, once you become the Night Walker, you will lost a portion of your EXP when you run out of HP, okay?');
  yield ctx.sayBoth('Now... I want you to go out there and show the world how the Knights of Cygnus operate.');
}

export function* q20105e(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Path of a Thunder Breaker (20105 - end)
  if (!(yield ctx.askYesNo('Have you made your decision? The decision will be final, so think carefully before deciding what to do. Are you sure you want to become a Thunder Breaker?'))) {
    yield ctx.sayNext('This is an important decision to make.');
    return;
  }
  if (!ctx.addItems([
    [1482014, 1],
    [1142066, 1],
  ])) {
    yield ctx.sayNext('Please check if your inventory is full or not.');
    return;
  }
  ctx.addInventorySlots(InventoryType.EQUIP, 4);
  ctx.addInventorySlots(InventoryType.ETC, 4);
  ctx.setJob(THUNDER_BREAKER_1);
  ctx.forceCompleteQuest(20105);
  yield ctx.sayNext('I have just molded your body to make it perfect for a Thunder Breaker. If you wish to become more powerful, use Stat Window (S) to raise the appropriate stats. If you aren\'t sure what to raise, just click on #bAuto#k.');
  yield ctx.sayBoth('I have also expanded your inventory slot counts for your equipment and etc. inventory. Use those slots wisely and fill them up with items required for Knights to carry.');
  yield ctx.sayBoth("I have also given you a hint of #bSP#k, so open the #bSkill Menu#k to acquire new skills. Of course, you can't raise them at all once, and there are some skills out there where you won't be able to acquire them unless you master the basic skills first.");
  yield ctx.sayBoth('Unlike your time as a Noblesse, once you become the Thunder Breaker, you will lost a portion of your EXP when you run out of HP, okay?');
  yield ctx.sayBoth('Now... I want you to go out there and show the world how the Knights of Cygnus operate.');
}

export function* q20700s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Are You Sure You Can Leave? (20700 - start)
  yield ctx.sayNext("You have finally become a Knight-in-Training. I'd like to give you a mission right away, but you still look miles away from even being able to handle a task on your own. Are you sure you can even go to Victoria Island like this?");
  if (!(yield ctx.askAccept("It's up to you to head over to Victoria Island, but a Knight-in-Training that can't take care of one's self in battles is likely to cause harm to the Empress's impeccable reputation. As the Head Tactician of this island, I can't let that happen, period. I want you to keep training until the right time comes."))) {
    yield ctx.sayNext("When will you realize how weak you are... When you get yourself in trouble in Victoria Island?");
    return;
  }
  ctx.forceCompleteQuest(20700);
  yield ctx.sayNext("#p1102000#, the Training Instructor, will help you train into a serviceable knight. Once you reach Level 13, I'll assign you a mission or two. So until then, keep training.");
  yield ctx.sayPrev("Oh, and are you aware that if you strike a conversation with #p1101001#, she'll give you a blessing? The blessing will definitely help you on your journey.");
}
