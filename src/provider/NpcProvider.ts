import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { NpcTemplate } from './npc/NpcTemplate';
import { NpcImitateData } from './npc/NpcImitateData';

// kinoko.provider.NpcProvider ported 1:1 to TypeScript + NX

const npcTemplates = new Map<number, NpcTemplate>();
const npcImitateData = new Map<number, NpcImitateData>();

export const NpcProvider = {
  initialize(): void {
    npcTemplates.clear();
    npcImitateData.clear();
    loadNpcTemplates();
  },

  getNpcTemplate(npcId: number): NpcTemplate | undefined { return npcTemplates.get(npcId); },
  getNpcTemplates(): NpcTemplate[]                       { return [...npcTemplates.values()]; },
  getNpcImitateData(npcId: number): NpcImitateData | undefined { return npcImitateData.get(npcId); },
};

function loadNpcTemplates(): void {
  const root = NXManager.getOrThrow('Npc.wz');
  const linked = new Map<number, { link: number; infoProp: NXNode }>();

  for (const imgNode of root.nChildren) {
    if (!imgNode.nName.endsWith('.img')) continue;
    const npcId    = parseInt(imgNode.nName.replace('.img', ''));
    const infoProp = imgNode.nGet('info') as NXNode | undefined;
    if (!infoProp) throw new Error(`NpcProvider: no info for npc ${npcId}`);

    const linkVal = infoProp.nGet('link');
    if (linkVal !== undefined && linkVal !== null) {
      linked.set(npcId, { link: Number(linkVal), infoProp });
      continue;
    }
    const hasMove = imgNode.nGet('move') !== undefined;
    npcTemplates.set(npcId, NpcTemplate.from(npcId, hasMove, infoProp));

    const imitateData = NpcImitateData.from(npcId, infoProp);
    if (imitateData) {
      npcImitateData.set(npcId, imitateData);
    }
  }

  for (const [npcId, { link, infoProp }] of linked) {
    const linkTemplate = npcTemplates.get(link);
    if (!linkTemplate) throw new Error(`NpcProvider: linked npc ${npcId} -> ${link} not found`);
    npcTemplates.set(npcId, NpcTemplate.from(npcId, linkTemplate.move, infoProp));

    const imitateData = NpcImitateData.from(npcId, infoProp);
    if (imitateData) {
      npcImitateData.set(npcId, imitateData);
    }
  }
}
