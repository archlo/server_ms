import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';

export function* explorationPoint(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Henesys / Ellinia / Perion / Kerning City / Lith Harbor / Sleepywood / Nautilus / Orbis /
  // El Nath / Ludibrium / Omega Sector / Korean Folk Town / Aquarium / Leafre / Mu Lung /
  // Herb Town / The Burning Road / Sunset Road / various sub-maps
  if (ctx.getFieldId() === 104000000) {
    ctx.screenEffect('maplemap/enter/104000000');
  }
}

export function* highposition(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Chimney Tree : Chimney Tree Top (101020300)
  //   highposition (-1113, 319)
  // Perion : Perion (102000000)
  //   highposition1 (1996, 166)
  // Kerning City : Kerning City (103000000)
  //   highposition1 (238, -1197)
  //   highposition2 (-1618, -1137)
  // Nautilus : Nautilus Harbor (120000000)
  //   highposition (4561, -985)
  // Orbis : Entrance to Orbis Tower (200080100)
  //   highposition (94, -487)
}

export function* q29900s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Beginner Adventurer (29900 - start)
  ctx.forceStartQuest(29900);
}

export function* q29901s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Junior Adventurer (29901 - start)
  ctx.forceStartQuest(29901);
}

export function* q29902s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Veteran Adventurer (29902 - start)
  ctx.forceStartQuest(29902);
}

export function* q29903s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Master Adventurer (29903 - start)
  ctx.forceStartQuest(29903);
}

export function* q29905s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Noblesse (29905 - start)
  ctx.forceStartQuest(29905);
}

export function* q29906s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Knight-in-Training (29906 - start)
  ctx.forceStartQuest(29906);
}

export function* q29907s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Official Knight (29907 - start)
  ctx.forceStartQuest(29907);
}

export function* q29908s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Advanced Knight (29908 - start)
  ctx.forceStartQuest(29908);
}

export function* q29909s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Chief Knight (29909 - start)
  ctx.forceStartQuest(29909);
}

export function* q29934s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Well Behaved Child (29934 - start)
  ctx.forceCompleteQuest(29934);
}

export function* q29935s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Perion Guard (29935 - start)
  ctx.forceCompleteQuest(29935);
}

export function* q29936s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Kerning City Honorary Citizen (29936 - start)
  ctx.forceCompleteQuest(29936);
}

export function* q29937s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Secret Organization Temporary Member (29937 - start)
  ctx.forceCompleteQuest(29937);
}

export function* q29938s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dragon Master (29938 - start)
  ctx.forceCompleteQuest(29938);
}

export function* q29939s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Dragon Master (29939 - start)
  ctx.forceCompleteQuest(29939);
}

export function* q29940s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Hero's Successor (29940 - start)
  ctx.forceCompleteQuest(29940);
}

export function* q29941s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Special Training Beginner (29941 - start)
  ctx.forceCompleteQuest(29941);
}

export function* q29942s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Special Training Intermediate (29942 - start)
  ctx.forceCompleteQuest(29942);
}

export function* q29943s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Special Training Graduate (29943 - start)
  ctx.forceCompleteQuest(29943);
}

export function* q29944s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Special Training Superior (29944 - start)
  ctx.forceCompleteQuest(29944);
}

export function* q29945s(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Special Training Master (29945 - start)
  ctx.forceCompleteQuest(29945);
}
