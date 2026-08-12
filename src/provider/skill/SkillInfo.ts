import { NXNode } from '../../wz-utils/NXNode';
import { Rect } from '../../util/Rect';
import { ElementAttribute, elementAttributeFromChar } from './ElementAttribute';
import { SkillStat, skillStatFromName } from './SkillStat';
import { SkillExpression } from './SkillExpression';
import { SummonedAttackInfo } from './SummonedAttackInfo';

// Summoned action types used as keys in summonedAttack map
export enum SummonedActionType {
  ATTACK1 = 'attack1', ATTACK2 = 'attack2', ATTACK3 = 'attack3',
  ATTACK4 = 'attack4', ATTACK1_RANGE = 'attack1_range',
  SKILL   = 'skill',   HIT    = 'hit',
}

const summonedActionMap = new Map<string, SummonedActionType>();
for (const v of Object.values(SummonedActionType)) summonedActionMap.set(v, v as SummonedActionType);

function summonedActionFromName(name: string): SummonedActionType | null {
  return summonedActionMap.get(name) ?? null;
}

// ActionType for skill/stat action fields
export enum ActionType {
  ATTACK = 'attack', SKILL = 'skill', NONE = 'none',
}

function actionTypeFromName(name: string): ActionType {
  switch (name) {
    case 'attack': return ActionType.ATTACK;
    case 'skill':  return ActionType.SKILL;
    default:       return ActionType.NONE;
  }
}

const SKIP_STATS = new Set([SkillStat.rb, SkillStat.hs, SkillStat.hit, SkillStat.ball, SkillStat.dateExpire]);

export class SkillInfo {
  constructor(
    public readonly skillId: number,
    public readonly maxLevel: number,
    public readonly masterLevel: number,
    public readonly invisible: boolean,
    public readonly combatOrders: boolean,
    public readonly psd: boolean,
    public readonly psdSkills: number[],
    public readonly reqSkills: Map<number, number>,
    public readonly action: ActionType[],
    public readonly statAction: ActionType | null,
    public readonly stats: Map<SkillStat, number[]>,
    public readonly rects: (Rect | null)[],
    public readonly elemAttr: ElementAttribute,
    public readonly summonedAttack: Map<SummonedActionType, SummonedAttackInfo>,
  ) {}

  getValue(stat: SkillStat, slv: number): number {
    const arr = this.stats.get(stat);
    if (!arr || slv < 0 || slv >= arr.length) return 0;
    return arr[slv];
  }

  getRect(slv: number): Rect | null {
    if (slv < 0 || slv >= this.rects.length) return null;
    return this.rects[slv];
  }

  getDuration(slv: number): number { return this.getValue(SkillStat.time, slv) * 1000; }

  static from(skillId: number, skillProp: NXNode): SkillInfo {
    const levelNode = skillProp.nGet('level') as NXNode | undefined;
    return levelNode ? fromStatic(skillId, skillProp, levelNode) : fromComputed(skillId, skillProp);
  }
}

function fromStatic(skillId: number, skillProp: NXNode, levelNode: NXNode): SkillInfo {
  const statMap  = new Map<SkillStat, Map<number, number>>();
  const rectMap  = new Map<number, Rect>();
  let statAction: ActionType | null = null;
  let maxLevel = 0;

  for (let slv = 1; slv < 999; slv++) {
    const statProp = levelNode.nGet(String(slv)) as NXNode | undefined;
    if (!statProp) { maxLevel = slv - 1; break; }

    for (const child of statProp.nChildren) {
      const stat = skillStatFromName(child.nName);
      if (stat === null) continue;
      if (stat === SkillStat.action) {
        statAction = actionTypeFromName(child.nValue as string ?? '');
        continue;
      }
      if (stat === SkillStat.lt) {
        const rb = statProp.nGet('rb') as NXNode | undefined;
        if (rb) rectMap.set(slv, Rect.of(child.nX, child.nY, rb.nX, rb.nY));
        continue;
      }
      if (SKIP_STATS.has(stat)) continue;
      if (!statMap.has(stat)) statMap.set(stat, new Map());
      statMap.get(stat)!.set(slv, child.nValue as number ?? 0);
    }
  }
  if (maxLevel === 0) throw new Error(`SkillInfo: could not resolve maxLevel for skill ${skillId}`);

  const stats = buildStats(statMap, maxLevel);
  const rects = buildRects(rectMap, maxLevel);
  return new SkillInfo(
    skillId, maxLevel,
    skillProp.nGet('masterLevel', 0) as number,
    (skillProp.nGet('invisible',    0) as number) !== 0,
    (skillProp.nGet('combatOrders', 0) as number) !== 0,
    (skillProp.nGet('psd',          0) as number) !== 0,
    resolvePsdSkills(skillProp),
    resolveReqSkills(skillProp),
    resolveAction(skillProp),
    statAction,
    stats, rects,
    resolveElemAttr(skillProp),
    resolveSummonedAttack(skillProp),
  );
}

function fromComputed(skillId: number, skillProp: NXNode): SkillInfo {
  const commonNode = skillProp.nGet('common') as NXNode | undefined;
  const expressions = new Map<SkillStat, SkillExpression>();
  let statAction: ActionType | null = null;
  let maxLevel = 0;
  let sharedRect: Rect | null = null;

  if (commonNode) {
    for (const child of commonNode.nChildren) {
      const stat = skillStatFromName(child.nName);
      if (stat === null) continue;
      if (stat === SkillStat.maxLevel) { maxLevel = child.nValue as number; continue; }
      if (stat === SkillStat.action)   { statAction = actionTypeFromName(child.nValue as string ?? ''); continue; }
      if (stat === SkillStat.lt) {
        const rb = commonNode.nGet('rb') as NXNode | undefined;
        if (rb) sharedRect = Rect.of(child.nX, child.nY, rb.nX, rb.nY);
        continue;
      }
      if (SKIP_STATS.has(stat)) continue;
      expressions.set(stat, SkillExpression.from(child.nValue as string ?? '0'));
    }
  }
  if (maxLevel === 0) throw new Error(`SkillInfo: could not resolve maxLevel for skill ${skillId}`);

  const combatOrders = (skillProp.nGet('combatOrders', 0) as number) !== 0;
  const statMaxLevel = maxLevel + (combatOrders ? 2 : 0);

  const stats = new Map<SkillStat, number[]>();
  for (const [stat, expr] of expressions) {
    const arr: number[] = [];
    for (let i = 0; i <= statMaxLevel; i++) arr.push(expr.evaluate(i));
    stats.set(stat, arr);
  }

  const rects: (Rect | null)[] = new Array(statMaxLevel + 1).fill(sharedRect);

  return new SkillInfo(
    skillId, maxLevel,
    skillProp.nGet('masterLevel', 0) as number,
    (skillProp.nGet('invisible',    0) as number) !== 0,
    combatOrders,
    (skillProp.nGet('psd',          0) as number) !== 0,
    resolvePsdSkills(skillProp),
    resolveReqSkills(skillProp),
    resolveAction(skillProp),
    statAction,
    stats, rects,
    resolveElemAttr(skillProp),
    resolveSummonedAttack(skillProp),
  );
}

function buildStats(statMap: Map<SkillStat, Map<number, number>>, maxLevel: number): Map<SkillStat, number[]> {
  const result = new Map<SkillStat, number[]>();
  for (const [stat, lvMap] of statMap) {
    const arr: number[] = [];
    for (let slv = 0; slv <= maxLevel; slv++) arr.push(lvMap.get(slv) ?? 0);
    result.set(stat, arr);
  }
  return result;
}

function buildRects(rectMap: Map<number, Rect>, maxLevel: number): (Rect | null)[] {
  const arr: (Rect | null)[] = [];
  for (let slv = 0; slv <= maxLevel; slv++) arr.push(rectMap.get(slv) ?? null);
  return arr;
}

function resolvePsdSkills(skillProp: NXNode): number[] {
  const psdNode = skillProp.nGet('psdSkill') as NXNode | undefined;
  if (!psdNode) return [];
  return psdNode.nChildren.map(c => parseInt(c.nName)).filter(n => !isNaN(n));
}

function resolveReqSkills(skillProp: NXNode): Map<number, number> {
  const reqNode = skillProp.nGet('req') as NXNode | undefined;
  if (!reqNode) return new Map();
  const m = new Map<number, number>();
  for (const c of reqNode.nChildren) m.set(parseInt(c.nName), c.nValue as number ?? 0);
  return m;
}

function resolveAction(skillProp: NXNode): ActionType[] {
  const actNode = skillProp.nGet('action') as NXNode | undefined;
  if (!actNode) return [];
  return actNode.nChildren.map(c => actionTypeFromName(c.nValue as string ?? ''));
}

function resolveElemAttr(skillProp: NXNode): ElementAttribute {
  const s = skillProp.nGet('elemAttr') as string | undefined;
  if (s && s.length === 1) return elementAttributeFromChar(s);
  return ElementAttribute.PHYSICAL;
}

function resolveSummonedAttack(skillProp: NXNode): Map<SummonedActionType, SummonedAttackInfo> {
  const summonNode = skillProp.nGet('summon') as NXNode | undefined;
  if (!summonNode) return new Map();
  const result = new Map<SummonedActionType, SummonedAttackInfo>();
  for (const child of summonNode.nChildren) {
    const actionType = summonedActionFromName(child.nName);
    if (!actionType) continue;
    const infoNode = child.nGet('info') as NXNode | undefined;
    if (!infoNode) continue;
    result.set(actionType, SummonedAttackInfo.from(infoNode));
  }
  return result;
}
