import { NXNode } from '../../wz-utils/NXNode';
import { ElementAttribute, elementAttributeFromChar } from '../skill/ElementAttribute';
import { DamagedAttribute, damagedAttributeFromChar } from './DamagedAttribute';
import { MobAttack } from './MobAttack';
import { MobSkill } from './MobSkill';
import { MobSkillType, mobSkillTypeFromValue } from './MobSkillType';

export class MobTemplate {
  constructor(
    public readonly id: number,
    public readonly level: number,
    public readonly exp: number,
    public readonly maxHp: number,
    public readonly maxMp: number,
    public readonly pad: number,
    public readonly pdr: number,
    public readonly mad: number,
    public readonly mdr: number,
    public readonly acc: number,
    public readonly eva: number,
    public readonly hpRecovery: number,
    public readonly mpRecovery: number,
    public readonly fixedDamage: number,
    public readonly removeAfter: number,
    public readonly dropItemPeriod: number,
    public readonly hpTagColor: number,
    public readonly hpTagBgColor: number,
    public readonly boss: boolean,
    public readonly noFlip: boolean,
    public readonly pickUpDrop: boolean,
    public readonly firstAttack: boolean,
    public readonly damagedByMob: boolean,
    public readonly onlyNormalAttack: boolean,
    public readonly attacks: Map<number, MobAttack>,
    public readonly skills: Map<number, MobSkill>,
    public readonly damagedElemAttr: Map<ElementAttribute, DamagedAttribute>,
    public readonly damagedBySkill: Set<number>,
    public readonly revives: number[],
    public readonly reviveDelay: number,
  ) {}

  isVulnerableTo(skillId: number): boolean {
    if (this.onlyNormalAttack && skillId !== 0) return false;
    if (this.damagedBySkill.size === 0) return true;
    return this.damagedBySkill.has(skillId);
  }

  getAttack(index: number): MobAttack | undefined { return this.attacks.get(index); }
  getSkill(skillId: number): MobSkill | undefined  { return this.skills.get(skillId); }

  static from(mobId: number, mobProp: NXNode, infoProp: NXNode): MobTemplate {
    const attacks      = new Map<number, MobAttack>();
    const skills       = new Map<number, MobSkill>();
    const damagedElem  = new Map<ElementAttribute, DamagedAttribute>();
    const damagedBySkill = new Set<number>();
    const revives: number[] = [];

    // attacks
    for (const child of mobProp.nChildren) {
      if (!child.nName.startsWith('attack')) continue;
      const attackIndex = parseInt(child.nName.replace('attack', '')) - 1;
      const infoNode = child.nGet('info') as NXNode | undefined;
      if (!infoNode) continue;
      attacks.set(attackIndex, new MobAttack(
        infoNode.nGet('disease', 0) as number,
        infoNode.nGet('level',   0) as number,
        infoNode.nGet('conMP',   0) as number,
        infoNode.nGet('mpBurn',  0) as number,
        (infoNode.nGet('magic',        0) as number) !== 0,
        (infoNode.nGet('deadlyAttack', 0) as number) !== 0,
      ));
    }

    let level = 0, exp = 0, maxHp = 0, maxMp = 0;
    let pad = 0, pdr = 0, mad = 0, mdr = 0, acc = 0, eva = 0;
    let hpRecovery = 0, mpRecovery = 0, fixedDamage = 0;
    let removeAfter = 0, dropItemPeriod = 0, hpTagColor = 0, hpTagBgColor = 0;
    let boss = false, noFlip = false, pickUpDrop = false;
    let firstAttack = false, damagedByMob = false, onlyNormalAttack = false;

    for (const child of infoProp.nChildren) {
      const v = child.nValue;
      switch (child.nName) {
        case 'level':           level          = v as number; break;
        case 'exp':             exp            = v as number; break;
        case 'maxHP':           maxHp          = v as number; break;
        case 'maxMP':           maxMp          = v as number; break;
        case 'PADamage':        pad            = v as number; break;
        case 'PDRate':          pdr            = v as number; break;
        case 'MADamage':        mad            = v as number; break;
        case 'MDRate':          mdr            = v as number; break;
        case 'acc':             acc            = v as number; break;
        case 'eva':             eva            = v as number; break;
        case 'hpRecovery':      hpRecovery     = v as number; break;
        case 'mpRecovery':      mpRecovery     = v as number; break;
        case 'fixedDamage':     fixedDamage    = v as number; break;
        case 'removeAfter':     removeAfter    = v as number; break;
        case 'dropItemPeriod':  dropItemPeriod = v as number; break;
        case 'hpTagColor':      hpTagColor     = v as number; break;
        case 'hpTagBgcolor':    hpTagBgColor   = v as number; break;
        case 'boss':            boss           = (v as number) !== 0; break;
        case 'noFlip':          noFlip         = (v as number) !== 0; break;
        case 'pickUp':          pickUpDrop     = (v as number) !== 0; break;
        case 'firstAttack':     firstAttack    = (v as number) !== 0; break;
        case 'damagedByMob':    damagedByMob   = (v as number) !== 0; break;
        case 'onlyNormalAttack':onlyNormalAttack = (v as number) !== 0; break;
        case 'skill': {
          for (const skillEntry of (child as NXNode).nChildren) {
            const skillId  = skillEntry.nGet('skill', 0) as number;
            const skillLv  = skillEntry.nGet('level', 0) as number;
            const skillType = mobSkillTypeFromValue(skillId);
            if (skillType !== null) skills.set(skillId, new MobSkill(skillType, skillId, skillLv));
          }
          break;
        }
        case 'elemAttr': {
          const s = v as string;
          for (let i = 0; i + 1 < s.length; i += 2) {
            damagedElem.set(elementAttributeFromChar(s[i]), damagedAttributeFromChar(s[i + 1]));
          }
          break;
        }
        case 'damagedBySelectedSkill': {
          for (const skillEntry of (child as NXNode).nChildren) {
            if (skillEntry.nValue !== null) damagedBySkill.add(Number(skillEntry.nValue));
          }
          break;
        }
        case 'revive': {
          for (const revEntry of (child as NXNode).nChildren) {
            if (revEntry.nValue !== null) revives.push(Number(revEntry.nValue));
          }
          break;
        }
      }
    }

    // revive delay — kinoko special-cases mob 9400584
    let reviveDelay = 0;
    if (mobId === 9400584) {
      reviveDelay = 1440;
    } else if (revives.length > 0) {
      const die1 = mobProp.nGet('die1') as NXNode | undefined;
      if (die1) reviveDelay = getAnimationDelay(die1);
    }

    return new MobTemplate(
      mobId, level, exp, maxHp, maxMp,
      pad, pdr, mad, mdr, acc, eva,
      hpRecovery, mpRecovery, fixedDamage,
      removeAfter, dropItemPeriod, hpTagColor, hpTagBgColor,
      boss, noFlip, pickUpDrop, firstAttack, damagedByMob, onlyNormalAttack,
      attacks, skills, damagedElem, damagedBySkill, revives, reviveDelay,
    );
  }
}

function getAnimationDelay(animProp: NXNode): number {
  let total = 0;
  const frameDelays = new Map<string, number>();
  const uols: string[] = [];

  for (const frame of animProp.nChildren) {
    if (!/^\d+$/.test(frame.nName)) continue;
    // UOL nodes store their value as a string path
    if (frame.nTagName === 'string' && /^\d+$/.test(frame.nValue as string)) {
      uols.push(frame.nValue as string);
      continue;
    }
    // canvas node — look for delay child
    const delay = (frame.nGet('delay', 0) as number);
    frameDelays.set(frame.nName, delay);
    total += delay;
  }
  for (const uol of uols) {
    total += frameDelays.get(uol) ?? 0;
  }
  return total;
}
