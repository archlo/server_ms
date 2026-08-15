import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { MobTemplate } from './mob/MobTemplate';

// kinoko.provider.MobProvider ported 1:1 to TypeScript + NX

const mobTemplates    = new Map<number, MobTemplate>();
const questCountGroups = new Map<number, Set<number>>();
const resolvedMobIds   = new Map<number, number>();

export const MobProvider = {
  initialize(): void {
    mobTemplates.clear();
    questCountGroups.clear();
    resolvedMobIds.clear();
    loadMobTemplates();
    loadQuestCountGroups();
  },

  getMobTemplate(mobId: number): MobTemplate | undefined {
    return mobTemplates.get(mobId);
  },

  /** The mob id whose img actually carries this mob's data (resolves info/link chains). */
  getResolvedTemplateId(mobId: number): number {
    return resolvedMobIds.get(mobId) ?? mobId;
  },

  getQuestCountGroup(mobId: number): Set<number> {
    return questCountGroups.get(mobId) ?? new Set();
  },
};

function loadMobTemplates(): void {
  const root = NXManager.getOrThrow('Mob.wz');
  const mobProps  = new Map<number, NXNode>();
  const linked    = new Map<number, { link: number; infoProp: NXNode }>();

  for (const imgNode of root.nChildren) {
    if (!imgNode.nName.endsWith('.img')) continue;
    const mobId   = parseInt(imgNode.nName.replace('.img', ''));
    const infoProp = imgNode.nGet('info') as NXNode | undefined;
    if (!infoProp) throw new Error(`MobProvider: no info for mob ${mobId}`);

    const linkVal = infoProp.nGet('link');
    if (linkVal !== undefined && linkVal !== null) {
      linked.set(mobId, { link: Number(linkVal), infoProp });
      continue;
    }
    mobProps.set(mobId, imgNode);
    mobTemplates.set(mobId, MobTemplate.from(mobId, imgNode, infoProp));
    resolvedMobIds.set(mobId, mobId);
  }

  // resolve linked mobs (kinoko supports recursive links)
  for (const [mobId, { link: rawLink, infoProp }] of linked) {
    let link = rawLink;
    while (!mobProps.has(link)) {
      const next = linked.get(link);
      if (!next) throw new Error(`MobProvider: cannot resolve link chain for mob ${mobId}`);
      link = next.link;
    }
    const linkProp = mobProps.get(link)!;
    mobTemplates.set(mobId, MobTemplate.from(mobId, linkProp, infoProp));
    resolvedMobIds.set(mobId, link);
  }

  // validate revives
  for (const [mobId, tmpl] of mobTemplates) {
    for (const reviveId of tmpl.revives) {
      if (!mobTemplates.has(reviveId)) {
        throw new Error(`MobProvider: revive ${reviveId} for mob ${mobId} not found`);
      }
    }
  }
}

function loadQuestCountGroups(): void {
  const groupDir = NXManager.get('Mob.wz/QuestCountGroup');
  if (!groupDir) return; // not all NX files include this

  for (const imgNode of groupDir.nChildren) {
    if (!imgNode.nName.endsWith('.img')) continue;
    const mobId   = parseInt(imgNode.nName.replace('.img', ''));
    const infoProp = imgNode.nGet('info') as NXNode | undefined;
    if (!infoProp) continue;
    const group = new Set<number>();
    for (const child of infoProp.nChildren) {
      if (child.nValue !== null) group.add(child.nValue as number);
    }
    questCountGroups.set(mobId, group);
  }
}
