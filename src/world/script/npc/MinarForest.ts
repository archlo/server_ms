import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const MAGIC_SEED = 4031346;
const MINI_DRACO_TRANSFORMATION = 2210016;

function itemName(itemId: number): string {
  return `#t${itemId}#`;
}

export function* job4_item(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Chief Tatamo (2081000) - Leafre : Leafre (240000000)
  let likenessString = ctx.getQRValue(7810); // QuestRecordType.TatamoLikeness
  if (!likenessString) {
    likenessString = '000000';
    ctx.setQRValue(7810, likenessString);
  }
  const likeness = parseInt(likenessString, 10);
  const answer: number = yield ctx.askMenu('...Can I help you?', new Map([
    [0, 'Buy the Magic Seed'],
    [1, 'Do something for Leafre'],
  ]));
  if (answer === 0) {
    // Buy the Magic Seed
    const buyMagicSeed = function* (count: number, price: number): Generator<ScriptMessage, void, any> {
      if (count === 0) {
        yield ctx.sayOk("I can't sell you 0.");
      } else {
        const total = count * price;
        if (yield ctx.askYesNo(`Buying #b${count} Magic Seed(s)#k will cost you #b${total.toLocaleString()} mesos#k. Are you sure you want to make the purchase?`)) {
          if (ctx.canAddItem(MAGIC_SEED, count) && ctx.addMoney(-total)) {
            ctx.addItem(MAGIC_SEED, count);
            yield ctx.sayOk('See you again~');
          } else {
            yield ctx.sayOk('Please check and see if you have enough mesos to make the purchase. Also, I suggest you check the etc. inventory and see if you have enough space available to make the purchase.');
          }
        } else {
          yield ctx.sayOk('Please think carefully. Once you have made your decision, let me know.');
        }
      }
    };
    if (likeness < 5000) {
      if ((yield ctx.askMenu("You don't seem to be from our town. How can I help you?", new Map([[0, 'I would like some Magic Seed.']]))) === 0) {
        const count: number = yield ctx.askNumber("#bMagic Seed#k is a precious item; I cannot give it to you just like that. How about doing me a little favor? Then I'll give it to you. I'll sell the #bMagic Seed#k to you for #b30,000 mesos#k each.\r\nAre you willing to make the purchase? How many would you like, then?", 0, 0, 100);
        yield* buyMagicSeed(count, 30000);
      }
    } else if (likeness < 24000) {
      if ((yield ctx.askMenu("Haven't we met before? No wonder you looked familiar. Hahaha...\r\nHow can I help you this time?", new Map([[0, 'I would like some Magic Seed.']]))) === 0) {
        yield ctx.sayNext("Ahh~ now I remember. If I'm mistaken, I gave you some #bMagic Seed#k before. How was it? I'm guessing you are more than satisfied with your previous purchase based on the look on your face.");
        const count: number = yield ctx.askNumber("#bMagic Seed#k is a precious item; I cannot give it to you just like that. How about doing me a little favor? Then I'll give it to you. I'll sell the #bMagic Seed#k to you for #b27,000 mesos#k each.\r\nAre you willing to make the purchase? How many would you like, then?", 0, 0, 100);
        yield* buyMagicSeed(count, 27000);
      }
    } else if (likeness < 50000) {
      if ((yield ctx.askMenu("It's a beautiful day again today. Days like this should be spent out in the park on a picnic with your family. I have to admit, when I first met you, I had my reservations, what with you not being from this town and all ... but now, I feel more than comfortable doing business with you.\r\nHow can I help you this time?", new Map([[0, 'I would like some Magic Seed.']]))) === 0) {
        const count: number = yield ctx.askNumber("#bMagic Seed#k is a rare, precious item indeed, but now that we have been acquainted for quite some time, I'll give you a special discount. How about #b24,000 mesos#k for a #bMagic Seed#k? It's cheaper than flying over here through the ship! How many would you like?", 0, 0, 100);
        yield* buyMagicSeed(count, 24000);
      }
    } else if (likeness < 200000) {
      if ((yield ctx.askMenu("Hmmm ... It seems like Birk is crying out loud much louder than usual today. When Birk cries, it signals the fact that the egg of the baby dragon is ready to be hatched any minute now. Now that you have become part of the family here, I would like for you to personally witness the birth of the baby dragon when that time comes. \r\nDo you need something from me today?", new Map([[0, 'I would like some Magic Seed.']]))) === 0) {
        const count: number = yield ctx.askNumber("You must have run out of the #bMagic Seed#k. We have grown very close to one another, and it doesn't sound too good for me to ask you for something in return, but please understand that the #bMagic Seed#k is very rare and hard to come by. How about #b18,000 mesos#k for #b1 Magic Seed#k? How many would you like to get?", 0, 0, 100);
        yield* buyMagicSeed(count, 18000);
      }
    } else if (likeness < 800000) {
      yield ctx.sayNext("Ohh hoh. I had a feeling that you'd be coming here right about now ...\r\nanyway, a while ago, a huge war erupted at the Dragon Shrine, where the dragons reside. Did you hear anything about it?");
      if ((yield ctx.askMenu("The sky shook, and the ground trembled as this incredibly loud thud covered every part of the forest. The baby dragons are now shivering in fear, wondering what may happen next. I wonder what actually happened... anyway, you're here for the seed, right?", new Map([[0, 'I would like some Magic Seed.']]))) === 0) {
        const count: number = yield ctx.askNumber("I knew it. I can now tell just by looking at your eyes. I know that you will always be there for us here. We both understand that the #bMagic Seed#k is a precious item, but for you, I'll sell it to you for #b12,000 mesos#k. How many would you like?", 0, 0, 100);
        yield* buyMagicSeed(count, 12000);
      }
    } else {
      if ((yield ctx.askMenu("Aren't you here for the Magic Seed? A lot of time has passed since we first met, and now I feel a sense of calmness and relief whenever I talk to you. People in this town love you, and I think the same way about you. You're a true friend.", new Map([[0, "Thank you so much for such kind words. I'd love to get some Magic Seeds right now."]]))) === 0) {
        const count: number = yield ctx.askNumber("You know I always have them ready. Just give me #b8,000 mesos#k per seed. We've been friends for a while, anyway. How many would you like?", 0, 0, 100);
        yield* buyMagicSeed(count, 8000);
      }
    }
  } else if (answer === 1) {
    // Do something for Leafre
    const donateItem = function* (itemId: number, inc: number): Generator<ScriptMessage, void, any> {
      const maxCount = ctx.getItemCount(itemId);
      if (maxCount > 0) {
        const count: number = yield ctx.askNumber(`How many #b${itemName(itemId)}#k's would you like to donate?\r\n#b< Owned : ${maxCount} >#k`, 0, 0, maxCount);
        if (count === 0) {
          yield ctx.sayOk('Think about it, and then let me know your decision.');
        } else if (count > 0 && ctx.removeItem(itemId, count)) {
          const newLikeness = Math.min(likeness + (count * inc), 800000);
          ctx.setQRValue(7810, String(newLikeness).padStart(6, '0')); // QuestRecordType.TatamoLikeness
          yield ctx.sayOk('Thank you very much.');
        } else {
          yield ctx.sayOk('Please check and see if you have enough of the item.');
        }
      } else {
        yield ctx.sayOk("I don't think you have the item.");
      }
    };
    if (likeness < 5000) {
      yield ctx.sayNext('It is the chief\'s duty to make the town more hospitable for people to live in, and carrying out the duty will require lots of items. If you have collected items around Leafre, are you interested in donating them?');
    } else if (likeness < 24000) {
      yield ctx.sayNext("You're the person that graciously donated some great items to us before. I cannot tell you how helpful that really was. By the way, if you have collected items around Leafre, are you interested in donating them to us once more?");
    } else if (likeness < 50000) {
      yield ctx.sayNext('You came to see me again today. Thanks to your immense help, the quality of life in this town has been significantly upgraded. People in this town are very thankful of your contributions. By the way, if you have collected items around Leafre, are you interested in donating them to us once more?');
    } else if (likeness < 200000) {
      yield ctx.sayNext("Hey, there! Your tremendous contribution to this town has resulted in our town thriving like no other. The town is doing really well as it is, but I'd appreciate it if you can help us out again. If you have collected items around Leafre, are you interested in donating them to us once more?");
    } else if (likeness < 800000) {
      yield ctx.sayNext("It's you, the number 1 supporter of Leafre! Good things always seem to happen when you're in town. By the way, if you have collected items around Leafre, are you interested in donating them to us once more?");
    } else {
      yield ctx.sayNext("Aren't you #b#h ##k? It's great to see you again! Thanks to your incredible work, our town is doing so well that I really don't have much to do these days. Everyone in this town seems to look up to you, and I mean that. I thoroughly appreciate your great help, but ... can you help us out once more? If you have collected items around Leafre, then would you be again interested in donating the items to us?");
    }
    const items: [number, number][] = [
      [4000226, 2], // Rash's Furball
      [4000229, 4], // Dark Rash's Furball
      [4000236, 3], // Beetle's Horn
      [4000237, 6], // Dual Beetle's Horn
      [4000260, 3], // Hov's Shorts
      [4000261, 6], // Pin Hov's Charm
      [4000231, 7], // Hankie's Pan Flute
      [4000238, 9], // Harp's Tail Feather
      [4000239, 12], // Blood Harp's Crown
      [4000241, 15], // Birk's Chewed Grass
      [4000242, 20], // Dual Birk's Tiny Tail
      [4000234, 20], // Kentaurus's Skull
      [4000232, 20], // Kentaurus's Flame
      [4000233, 20], // Kentaurus's Marrow
      [4000235, 100], // Manon's Tail
      [4000243, 100], // Griffey Horn
    ];
    const itemOptions = new Map<number, string>();
    items.forEach(([itemId], i) => itemOptions.set(i, itemName(itemId)));
    const itemAnswer: number = yield ctx.askMenu('Which item would you like to donate?', itemOptions);
    if (itemAnswer >= 0 && itemAnswer < items.length) {
      yield* donateItem(items[itemAnswer][0], items[itemAnswer][1]);
    }
  }
}

export function* minar_job4(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Valley of the Antelope (240010500) - in00 (622, -1025)
  ctx.playPortalSE();
  ctx.warp(240010501, 'out00'); // Leafre : Forest of the Priest
}

export function* gryphius(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Battlefield of Fire and Darkness (240020100) - boss00 (-50, 333)
  ctx.playPortalSE();
  ctx.warp(240020101, 'out00'); // Leafre : Griffey Forest
}

export function* mayong(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : The Area of Blue Kentaurus (240020400) - boss00 (1040, 452)
  ctx.playPortalSE();
  ctx.warp(240020401, 'out00'); // Leafre : Manon's Forest
}

export function* inNix1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Griffey Forest (240020101 / 240020102) - in00
  ctx.playPortalSE();
  ctx.warp(240020600, 'out00'); // Hidden Street : Isolated Forest
}

export function* inNix2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Manon's Forest (240020401 / 240020402) - in00
  ctx.playPortalSE();
  ctx.warp(240020600, 'out01'); // Hidden Street : Isolated Forest
}

export function* outNix1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Isolated Forest (240020600) - out00 (-775, 453)
  ctx.playPortalSE();
  ctx.warp(240020101, 'in00'); // Leafre : Griffey Forest
}

export function* outNix2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hidden Street : Isolated Forest (240020600) - out01 (866, 451)
  ctx.playPortalSE();
  ctx.warp(240020401, 'in00'); // Leafre : Manon's Forest
}

// TEMPLE OF TIME SCRIPTS ------------------------------------------------------------------------------------------

export function* flyminidraco(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Corba : Retired Dragon Trainer (2082003) - Leafre : Station (240000110)
  const answer: number = yield ctx.askMenu("If you had wings, I'm sure you could go there.  But, that alone won't be enough.  If you want to fly though the wind that's sharper than a blade, you'll need tough scales as well.  I'm the only Halfling left that knows the way back... If you want to go there, I can transform you.  No matter what you are, for this moment, you will become a #bDragon#k...", new Map([
    [0, 'I want to become a dragon.'],
  ]));
  if (answer === 0) {
    ctx.setConsumeItemEffect(MINI_DRACO_TRANSFORMATION);
    ctx.warp(200090500, 'sp'); // In Flight : Way to Temple of Time
  }
}

export function* outTemple(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Time Lane : Temple of Time (270000100) - out00 (-1780, 176)
  ctx.setConsumeItemEffect(MINI_DRACO_TRANSFORMATION);
  ctx.playPortalSE();
  ctx.warp(200090510, 'in00'); // In Flight : Way to Minar Forest
}

export function* templeenter(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // In Flight : Way to Minar Forest (200090510) - in00 (571, -227)
  ctx.setConsumeItemEffect(MINI_DRACO_TRANSFORMATION);
  ctx.playPortalSE();
  ctx.warp(270000100, 'out00'); // Time Lane : Temple of Time
}

export function* undodraco(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // In Flight : Way to Temple of Time (200090500) / Way to Minar Forest (200090510) - down00-36, minar00
  ctx.resetConsumeItemEffect(MINI_DRACO_TRANSFORMATION);
  ctx.playPortalSE();
  ctx.warp(240000110, 'arrival00'); // Leafre : Station
}

export function* undomorphdarco(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Station (240000110)
  ctx.resetConsumeItemEffect(MINI_DRACO_TRANSFORMATION);
}

export function* reundodraco(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Leafre : Station (240000110) - arrival00-03 / Time Lane : Temple of Time (270000100)
  ctx.resetConsumeItemEffect(MINI_DRACO_TRANSFORMATION);
}
