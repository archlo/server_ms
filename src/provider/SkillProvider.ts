import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { SkillInfo } from './skill/SkillInfo';
import { MorphInfo } from './skill/MorphInfo';
import { SummonInfo } from './skill/SummonInfo';

// kinoko.provider.SkillProvider ported 1:1 to TypeScript + NX

const SUMMON_SKILL_ID = 200; // MobSkillType.SUMMON

const skillInfos  = new Map<number, SkillInfo>();
const mobSkills   = new Map<number, SkillInfo>();
const mobSummons  = new Map<number, SummonInfo>(); // skillLevel -> SummonInfo
const morphInfos  = new Map<number, MorphInfo>();

export const SkillProvider = {
  initialize(): void {
    skillInfos.clear();
    mobSkills.clear();
    mobSummons.clear();
    morphInfos.clear();
    loadSkillInfos();
    loadMobSkills();
    loadMorphInfos();
  },

  getSkillInfoById(skillId: number): SkillInfo | undefined   { return skillInfos.get(skillId); },
  getMobSkillInfoById(skillId: number): SkillInfo | undefined { return mobSkills.get(skillId); },
  getMobSummonInfoByLevel(slv: number): SummonInfo | undefined { return mobSummons.get(slv); },
  getMorphInfoById(morphId: number): MorphInfo | undefined   { return morphInfos.get(morphId); },
  getAllSkillInfos(): IterableIterator<SkillInfo>             { return skillInfos.values(); },
};

function loadSkillInfos(): void {
  const root = NXManager.getOrThrow('Skill.wz');
  for (const imgNode of root.nChildren) {
    const imageName = imgNode.nName.replace('.img', '');
    if (!/^\d+$/.test(imageName)) continue;

    const skillListNode = imgNode.nGet('skill') as NXNode | undefined;
    if (!skillListNode) continue;

    for (const child of skillListNode.nChildren) {
      const skillId = parseInt(child.nName);
      if (isNaN(skillId)) continue;
      try {
        const info = SkillInfo.from(skillId, child);
        skillInfos.set(skillId, info);
      } catch {
        // skip malformed entries
      }
    }
  }
}

function loadMobSkills(): void {
  const mobSkillImg = NXManager.get('Skill.wz/MobSkill.img') as NXNode | undefined;
  if (!mobSkillImg) return;

  for (const child of mobSkillImg.nChildren) {
    const skillId = parseInt(child.nName);
    if (isNaN(skillId)) continue;
    try {
      const info = SkillInfo.from(skillId, child);
      mobSkills.set(skillId, info);

      if (skillId !== SUMMON_SKILL_ID) continue;

      // resolve mob summons
      const levelNode = child.nGet('level') as NXNode | undefined;
      if (!levelNode) continue;
      for (let slv = 1; slv <= info.maxLevel; slv++) {
        const summonProp = levelNode.nGet(String(slv)) as NXNode | undefined;
        if (!summonProp) break;
        const summons: number[] = [];
        for (let i = 0; ; i++) {
          const entry = summonProp.nGet(String(i));
          if (entry === undefined || entry === null) break;
          summons.push(entry as number);
        }
        mobSummons.set(slv, new SummonInfo(summons));
      }
    } catch {
      // skip
    }
  }
}

function loadMorphInfos(): void {
  const root = NXManager.getOrThrow('Morph.wz');
  for (const imgNode of root.nChildren) {
    const imageName = imgNode.nName.replace('.img', '');
    if (!/^\d+$/.test(imageName)) continue;
    const infoNode = imgNode.nGet('info') as NXNode | undefined;
    if (!infoNode) continue;
    morphInfos.set(parseInt(imageName), MorphInfo.from(parseInt(imageName), infoNode));
  }
}
