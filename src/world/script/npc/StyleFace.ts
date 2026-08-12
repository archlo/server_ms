import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { Util } from '../../../util/Util';

const ROYAL_FACE_COUPON = 5152053;
const FACE_COUPON_VIP = 5152057;
const FACE_COUPON_REG = 5152056;
const SKIN_COUPON = 5153015;

function getFaceOptions(ctx: ScriptContext, maleOptions: number[], femaleOptions: number[]): number[] {
  const face = ctx.user.getCharacterStat().face;
  const color = (face % 1000) - (face % 100);
  return (ctx.getGender() === 0 ? maleOptions : femaleOptions).map((option) => option + color);
}

function* handleSkinCare(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const options = [0, 1, 2, 3, 4, 5, 9, 10, 11];
  const answer: number = yield ctx.askAvatar("We have the latest in beauty equipment. With our technology, you can preview what your skin will look like in advance! Which treatment would you like?", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(SKIN_COUPON, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Here's the mirror, check it out! Doesn't your skin look beautiful and glowing like mine? Hehe, it's wonderful. Please come again!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't give you a treatment without it. I'm sorry...");
    }
  }
}

// Nurse Pretty : Traveling Plastic Surgeon (9201148)
//   Henesys : Henesys Plastic Surgery (100000103)
export function* face_royalGL(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const royalFaceM = [
    20036, // Male Aran Face
    20037, // Male Evan Face
  ];
  const royalFaceF = [
    21034, // Female Aran Face
    21035, // Female Evan Face
  ];
  if ((yield ctx.askMenu("Hello, my name is #p9201148# and I'm a plastic surgery specialist. You can undergo my special plastic surgery if you have a #bRoyal Face Coupon#k", new Map([[0, "I'd love some special plastic surgery."]]))) !== 0) {
    return;
  }
  if (yield ctx.askYesNo("If you use a #bRoyal Face Coupon#k, I'll perform a special Royal plastic surgery on you, but no one knows what the results of the plastic surgery will be. It all depends on my mood. Hehehe. Shall we begin?")) {
    if (ctx.removeItem(ROYAL_FACE_COUPON, 1)) {
      const options = getFaceOptions(ctx, royalFaceM, royalFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext(`#b#t${face}##k Do you like it? I think it looks fabulous! Come back and see me again soon!`);
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Vard : Plastic Surgery Director (2100008)
//   The Burning Road : Ariant (260000000)
export function* face_ariant1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20013, // Insomniac Daze
    20000, // Motivated Look
    20002, // Leisure Look
    20004, // Rebel's Fire
    20005, // Alert Face
    20012, // Curious Dog
  ];
  const vipFaceF = [
    21009, // Look of Death
    21000, // Motivated Look
    21002, // Leisure Look
    21003, // Strong Stare
    21006, // Pucker Up Face
    21012, // Soul's Window
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Your face may be covered to combat the heat here in the desert, but truly beautiful faces seem to glow regardless. If you have #b#t5152057##k, I can assist you in uncovering your radiant potential. What do you say, shall we begin?", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Aldin : Plastic Surgery Doctor (2100009)
//   The Burning Road : Ariant (260000000)
export function* face_ariant2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20013, // Insomniac Daze
    20000, // Motivated Look
    20002, // Leisure Look
    20004, // Rebel's Fire
    20005, // Alert Face
    20012, // Curious Dog
  ];
  const regFaceF = [
    21009, // Look of Death
    21000, // Motivated Look
    21002, // Leisure Look
    21003, // Strong Stare
    21006, // Pucker Up Face
    21012, // Soul's Window
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Botoxie : Plastic Surgeon (2150005)
//   Black Wing Territory : Edelstein (310000000)
export function* face_edel1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20000, // Motivated Look
    20001, // Perplexed Stare
    20002, // Leisure Look
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20008, // Worrisome Glare
    20012, // Curious Dog
    20014, // Look of Wonder
    20016, // Ghostface Stare
    20020, // Fierce Edge
    20017, // Demure Poise
    20013, // Insomniac Daze
    20022, // Child's Play
    20025, // Edge of Emotion
    20027, // Pensive Look
    20028, // Sarcastic Face
    20029, // Shade of Cool
    20031, // Fearful Glance
  ];
  const vipFaceF = [
    21000, // Motivated Look
    21001, // Fearful Stare
    21002, // Leisure Look
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21007, // Dollface Look
    21008, // Hopeless Gaze
    21012, // Soul's Window
    21016, // Beauty Stare
    21020, // Gentle Glow
    21017, // Demure Poise Eyes
    21013, // Wide-eyed Girl
    21021, // Compassion Look
    21023, // Innocent Look
    21026, // Tender Love
    21027, // Glamorous Edge
    21029, // Kitty Cat
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("You can change your face to have a completely new look. Feel free to try it out! All you need is a #b#t5152057##k to receive your makeover. Ready for a stunning transformation?", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Wendelline : Plastic Surgery Assistant (2150006)
//   Black Wing Territory : Edelstein (310000000)
export function* face_edel2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20000, 20001, 20002, 20003, 20004, 20005, 20006, 20008, 20012, 20014,
    20016, 20020, 20017, 20013, 20022, 20025, 20027, 20028, 20029, 20031,
  ];
  const regFaceF = [
    21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21012,
    21016, 21020, 21017, 21013, 21021, 21023, 21026, 21027, 21029,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Denma the Owner : Plastic Surgeon (1052004)
//   Henesys : Henesys Plastic Surgery (100000103)
export function* face_henesys1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20000, // Motivated Look
    20001, // Perplexed Stare
    20002, // Leisure Look
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20007, // Sad Innocence
    20008, // Worrisome Glare
    20012, // Curious Dog
    20014, // Look of Wonder
    20015, // Eye of the Lion
    20022, // Child's Play
    20028, // Sarcastic Face
  ];
  const vipFaceF = [
    21000, // Motivated Look
    21001, // Fearful Stare
    21002, // Leisure Look
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21007, // Dollface Look
    21008, // Hopeless Gaze
    21012, // Soul's Window
    21013, // Wide-eyed Girl
    21023, // Innocent Look
    21026, // Tender Love
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Let's see... for #b#t5152057##k, you can get a new face. That's right. I can completely transform your face! Wanna give it a shot? Please consider your choice carefully.", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Dr. Feeble : Doctor w/o License (1052005)
//   Henesys : Henesys Plastic Surgery (100000103)
export function* face_henesys2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20000, 20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20012,
    20014, 20015, 20022, 20028,
  ];
  const regFaceF = [
    21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21012,
    21013, 21023, 21026,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Ellie : Plastic Surgeon (2041010)
//   Ludibrium : Ludibrium Plastic Surgery (220000003)
export function* face_ludi1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20000, // Motivated Look
    20001, // Perplexed Stare
    20002, // Leisure Look
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20008, // Worrisome Glare
    20012, // Curious Dog
    20014, // Look of Wonder
    20011, // Cool Guy Gaze
  ];
  const vipFaceF = [
    21000, // Motivated Look
    21001, // Fearful Stare
    21002, // Leisure Look
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21007, // Dollface Look
    21008, // Hopeless Gaze
    21012, // Soul's Window
    21010, // Wisdom Glance
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Let's see... for #b#t5152057##k, you can get a new face. That's right. I can completely transform your face! Wanna give it a shot? Please consider your choice carefully.", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Everton : Doctor Assistant (2040019)
//   Ludibrium : Ludibrium Plastic Surgery (220000003)
export function* face_ludi2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20000, 20001, 20002, 20003, 20004, 20005, 20006, 20008, 20012, 20014, 20011,
  ];
  const regFaceF = [
    21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21012, 21010,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Pata : Plastic Surgeon (2090103)
//   Mu Lung : Mu Lung (250000000)
export function* face_mureung1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20010, // Anger's Blaze
    20000, // Motivated Look
    20002, // Leisure Look
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20012, // Curious Dog
    20009, // Smart Aleck
    20022, // Child's Play
    20028, // Sarcastic Face
  ];
  const vipFaceF = [
    21011, // Hypnotized Look
    21000, // Motivated Look
    21002, // Leisure Look
    21003, // Strong Stare
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21008, // Hopeless Gaze
    21012, // Soul's Window
    21009, // Look of Death
    21023, // Innocent Look
    21026, // Tender Love
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("With our specialized machine, you can see the results of your potential treatment in advance. What kind of face would you like to have? ", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Noma : Assistant Plastic Surgeon (2090104)
//   Mu Lung : Mu Lung (250000000)
export function* face_mureung2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20010, 20000, 20002, 20004, 20005, 20006, 20012, 20009, 20022, 20028,
  ];
  const regFaceF = [
    21011, 21000, 21002, 21003, 21005, 21006, 21008, 21012, 21009, 21023, 21026,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Franz the Owner : Plastic Surgeon (2010002)
//   Orbis Park : Orbis Plastic Surgery (200000201)
export function* face_orbis1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20000, // Motivated Look
    20001, // Perplexed Stare
    20002, // Leisure Look
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20008, // Worrisome Glare
    20012, // Curious Dog
    20014, // Look of Wonder
    20022, // Child's Play
    20028, // Sarcastic Face
  ];
  const vipFaceF = [
    21000, // Motivated Look
    21001, // Fearful Stare
    21002, // Leisure Look
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21007, // Dollface Look
    21008, // Hopeless Gaze
    21012, // Soul's Window
    21023, // Innocent Look
    21026, // Tender Love
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Welcome, welcome! Not happy with your look? Neither am I. But for #b#t5152057##k, I can transform your face and get you the look you've always wanted.", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Riza the Assistant : Doctor Assistant (2012009)
//   Orbis Park : Orbis Plastic Surgery (200000201)
export function* face_orbis2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20000, 20001, 20002, 20003, 20004, 20005, 20006, 20008, 20012, 20014, 20022, 20028,
  ];
  const regFaceF = [
    21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21012, 21023, 21026,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Kelvin : Plastic Surgery (9270024)
//   Singapore : CBD (540000000)
export function* face_sg1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20020, // Fierce Edge
    20013, // Insomniac Daze
    20021, // Overjoyed Smile
    20026, // Shuteye
    20005, // Alert Face
    20012, // Curious Dog
  ];
  const vipFaceF = [
    21021, // Compassion Look
    21011, // Hypnotized Look
    21009, // Look of Death
    21025, // Shuteye
    21006, // Pucker Up Face
    21012, // Soul's Window
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Let's see... for #b#t5152057##k, you can get a new face. That's right. I can completely transform your face! Wanna give it a shot? Please consider your choice carefully.", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Noel : Plastic Surgery Assistant (9270023)
//   Singapore : CBD (540000000)
export function* face_sg2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20020, 20013, 20021, 20026, 20005, 20012,
  ];
  const regFaceF = [
    21021, 21011, 21009, 21025, 21006, 21012,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Hikekuro : Plastic Surgeon (9120102)
//   Zipangu : Plastic Surgery (801000002)
export function* face_shouwa1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20020, // Fierce Edge
    20000, // Motivated Look
    20002, // Leisure Look
    20004, // Rebel's Fire
    20005, // Alert Face
    20012, // Curious Dog
  ];
  const vipFaceF = [
    21021, // Compassion Look
    21000, // Motivated Look
    21002, // Leisure Look
    21003, // Strong Stare
    21006, // Pucker Up Face
    21008, // Hopeless Gaze
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("You can change your face to have a completely new look. Feel free to try it out! All you need is a #b#t5152057##k to receive your makeover. Ready for a stunning transformation?", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Saeko : Assistant (9120103)
//   Zipangu : Plastic Surgery (801000002)
export function* face_shouwa2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20020, 20000, 20002, 20004, 20005, 20012,
  ];
  const regFaceF = [
    21021, 21000, 21002, 21003, 21006, 21008,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Dr. 90212 : Makeover Magician (9201018)
//   Amoria : Amoria Plastic Surgery (680000003)
export function* face_wedding1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20018, // Champion Focus
    20019, // Irritable Face
    20000, // Motivated Look
    20001, // Perplexed Stare
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20008, // Worrisome Glare
  ];
  const vipFaceF = [
    21018, // Athena's Grace
    21019, // Hera's Radiance
    21001, // Fearful Stare
    21002, // Leisure Look
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21007, // Dollface Look
    21012, // Soul's Window
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Ready to look like a million mesos? For #b#t5152057##k I can guarantee you'll look like a new person!.", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Intern Shakihands : Visage Nurse (9201019)
//   Amoria : Amoria Plastic Surgery (680000003)
export function* face_wedding2(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20018, 20019, 20000, 20001, 20003, 20004, 20005, 20006, 20008,
  ];
  const regFaceF = [
    21018, 21019, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21012,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// V. Isage : Plastic Surgeon (9201069)
//   New Leaf City : NLC Mall (600000001)
export function* NLC_FaceVip(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const vipFaceM = [
    20012, // Curious Dog
    20000, // Motivated Look
    20001, // Perplexed Stare
    20002, // Leisure Look
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20008, // Worrisome Glare
  ];
  const vipFaceF = [
    21016, // Beauty Stare
    21001, // Fearful Stare
    21002, // Leisure Look
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21008, // Hopeless Gaze
    21012, // Soul's Window
  ];
  const options = getFaceOptions(ctx, vipFaceM, vipFaceF);
  const answer: number = yield ctx.askAvatar("Let's see... for #b#t5152057##k, you can get a new face. That's right. I can completely transform your face! Wanna give it a shot? Please consider your choice carefully.", options);
  if (answer >= 0 && answer < options.length) {
    if (ctx.removeItem(FACE_COUPON_VIP, 1)) {
      ctx.setAvatar(options[answer]);
      yield ctx.sayNext("Ok, the surgery's over. See for it yourself.. What do you think? Quite fantastic, if I should say so myself. Please come again when you want another look, okay?");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// Nerbit : Doctor w/o License (9201070)
//   New Leaf City : NLC Mall (600000001)
export function* NLC_FaceExp(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  const regFaceM = [
    20012, 20000, 20001, 20002, 20003, 20004, 20005, 20006, 20008,
  ];
  const regFaceF = [
    21016, 21001, 21002, 21003, 21004, 21005, 21006, 21008, 21012,
  ];
  if (yield ctx.askYesNo("If you use the regular coupon, you may end up with a random new look for your face...do you still want to do it using #b#t5152056##k?")) {
    if (ctx.removeItem(FACE_COUPON_REG, 1)) {
      const options = getFaceOptions(ctx, regFaceM, regFaceF);
      const face = Util.getRandomFromCollection(options)!;
      ctx.setAvatar(face);
      yield ctx.sayNext("The surgery's complete. Don't you like it? I think it came out great!");
    } else {
      yield ctx.sayNext("Hmmm...it looks like you don't have our designated coupon...I'm afraid I can't perform plastic surgery for you without it. I'm sorry...");
    }
  }
}

// SKIN SCRIPTS ----------------------------------------------------------------------------------------------------

// Lila : Skin Care Expert (2100007)
//   The Burning Road : Ariant (260000000)
export function* skin_ariant1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// Mel Nomie : Skin Care Expert (2150004)
//   Black Wing Territory : Edelstein (310000000)
export function* skin_edel1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// Ms. Tan : Dermatologist (1012105)
//   Henesys : Henesys Skin-Care (100000105)
export function* skin_henesys1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield ctx.sayNext("Welcome to Henesys Skin-Care! For just one teeny-weeny #b#t5153015##k, I can make your skin supple and glow-y, like mine! Trust me, you don't want to miss my facials.");
  yield* handleSkinCare(ctx);
}

// Gina : Dermatologist (2041013)
//   Ludibrium : Ludibrium Skin Care (220000005)
export function* skin_ludi1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// Naran : Dermatologist (2090102)
//   Mu Lung : Mu Lung (250000000)
export function* skin_mureung1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// Romi : Dermatologist (2012008)
//   Orbis Park : Orbis Skin-Care (200000203)
export function* skin_orbis1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// Xan : Skin Care Master (9270025)
//   Singapore : CBD (540000000)
export function* skin_sg1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// Miranda : Dermatologist (9201065)
//   New Leaf City : NLC Mall (600000001)
export function* NLC_Skin(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  yield* handleSkinCare(ctx);
}

// LENS SCRIPTS ----------------------------------------------------------------------------------------------------

export function* lens_henesys1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
export function* lens_ludi1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
export function* lens_orbis1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
export function* lens_sg1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
export function* lens_wedding1(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
export function* NLC_LensVip(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
export function* NLC_LensExp(ctx: ScriptContext): Generator<ScriptMessage, void, any> {}
