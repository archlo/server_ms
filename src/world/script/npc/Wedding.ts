import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

const PROOF_OF_LOVE_INTRO = "Nice to meet you! I am Nana the Fairy from Amoria. I am waiting for you to prove your devotion to your loved one by obtaining a Proof of Love! To start, you'll have to venture to Amoria to find my good friend, Moony the Ringmaker. Even if you are not interested in marriage yet, Amoria is open for everyone! Go visit Thomas Swift at Henesys to head to Amoria. If you are interested in weddings, be sure to speak with Ames the Wise once you get there!";

export function* Thomas(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Thomas Swift : Amoria Ambassador (9201022)
  //   Henesys : Henesys (100000000)
  //   Amoria : Amoria (680000000)
  if (ctx.getFieldId() === 100000000) {
    // Henesys : Henesys
    if (yield ctx.askYesNo('I can take you to Amoria Village. Are you ready to go?')) {
      yield ctx.sayNext('I hope you had a great time! See you around!');
      ctx.warp(680000000); // Amoria : Amoria
    } else {
      yield ctx.sayOk("Ok, feel free to hang around until you're ready to go!");
    }
  } else if (ctx.getFieldId() === 680000000) {
    // Amoria : Amoria
    if (yield ctx.askYesNo('I can take you back to your original location. Are you ready to go?')) {
      yield ctx.sayNext('I hope you had a great time! See you around!');
      ctx.warp(100000000); // Henesys : Henesys
    } else {
      yield ctx.sayOk("Ok, feel free to hang around until you're ready to go!");
    }
  }
}

export function* ProofHene(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nana(H) : Love Fairy (9201001) - Henesys : Henesys (100000000)
  yield ctx.sayNext(PROOF_OF_LOVE_INTRO);
}

export function* ProofElli(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nana(E) : Love Fairy (9201024) - Ellinia : Ellinia (101000000)
  yield ctx.sayNext(PROOF_OF_LOVE_INTRO);
}

export function* ProofPeri(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nana(P) : Love Fairy (9201027) - Perion : Perion (102000000)
  yield ctx.sayNext(PROOF_OF_LOVE_INTRO);
}

export function* ProofKern(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nana(K) : Love Fairy (9201023)
  //   Kerning City : Kerning City (103000000)
  //   Sunset Road : Magatia (261000000)
  //   Singapore : Boat Quay Town (541000000)
  yield ctx.sayNext(PROOF_OF_LOVE_INTRO);
}

export function* ProofOrbi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Nana(O) : Love Fairy (9201025) - Orbis : Orbis (200000000)
  yield ctx.sayNext(PROOF_OF_LOVE_INTRO);
}
