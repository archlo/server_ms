import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';

// kinoko.provider.StringProvider ported 1:1 to TypeScript + NX

const EQUIP_TYPES = ['Accessory','Cap','Cape','Coat','Dragon','Face','Glove','Hair',
  'Longcoat','Mechanic','Pants','PetEquip','Ring','Shield','Shoes','Taming','Weapon'];

const itemNames  = new Map<number, string>();
const mapNames   = new Map<number, string>();
const mobNames   = new Map<number, string>();
const npcNames   = new Map<number, string>();

export const StringProvider = {
  initialize(): void {
    itemNames.clear(); mapNames.clear(); mobNames.clear(); npcNames.clear();
    loadItemNames();
    loadMapNames();
    loadMobNames();
    loadNpcNames();
  },

  getItemName(itemId: number): string | undefined  { return itemNames.get(itemId); },
  getMapName(mapId: number):   string | undefined  { return mapNames.get(mapId); },
  getMobName(mobId: number):   string | undefined  { return mobNames.get(mobId); },
  getNpcName(npcId: number):   string | undefined  { return npcNames.get(npcId); },
};

function loadItemNames(): void {
  // Eqp.img/Eqp/<type>
  const eqpNode = NXManager.get('String.wz/Eqp.img/Eqp') as NXNode | undefined;
  if (eqpNode) {
    for (const type of EQUIP_TYPES) {
      const typeNode = eqpNode.nGet(type) as NXNode | undefined;
      if (!typeNode) continue;
      for (const child of typeNode.nChildren) {
        const itemId = parseInt(child.nName);
        const name   = child.nGet('name') as string | undefined;
        if (!isNaN(itemId) && name) itemNames.set(itemId, name);
      }
    }
  }
  // Etc.img/Etc
  const etcNode = NXManager.get('String.wz/Etc.img/Etc') as NXNode | undefined;
  if (etcNode) {
    for (const child of etcNode.nChildren) {
      const itemId = parseInt(child.nName);
      const name   = child.nGet('name') as string | undefined;
      if (!isNaN(itemId) && name) itemNames.set(itemId, name);
    }
  }
  // Consume.img, Ins.img, Cash.img, Pet.img
  for (const imgName of ['Consume.img', 'Ins.img', 'Cash.img', 'Pet.img']) {
    const img = NXManager.get(`String.wz/${imgName}`) as NXNode | undefined;
    if (!img) continue;
    for (const child of img.nChildren) {
      const itemId = parseInt(child.nName);
      const name   = child.nGet('name') as string | undefined;
      if (!isNaN(itemId) && name) itemNames.set(itemId, name);
    }
  }
}

function loadMapNames(): void {
  const mapImg = NXManager.get('String.wz/Map.img') as NXNode | undefined;
  if (!mapImg) return;
  for (const typeNode of mapImg.nChildren) {
    for (const mapChild of typeNode.nChildren) {
      const mapId      = parseInt(mapChild.nName);
      const street     = mapChild.nGet('streetName', '') as string;
      const mapName    = mapChild.nGet('mapName',    '') as string;
      if (!isNaN(mapId)) mapNames.set(mapId, `${street} : ${mapName}`);
    }
  }
}

function loadMobNames(): void {
  const mobImg = NXManager.get('String.wz/Mob.img') as NXNode | undefined;
  if (!mobImg) return;
  for (const child of mobImg.nChildren) {
    const mobId = parseInt(child.nName);
    const name  = child.nGet('name') as string | undefined;
    if (!isNaN(mobId) && name) mobNames.set(mobId, name);
  }
}

function loadNpcNames(): void {
  const npcImg = NXManager.get('String.wz/Npc.img') as NXNode | undefined;
  if (!npcImg) return;
  for (const child of npcImg.nChildren) {
    const npcId = parseInt(child.nName);
    const name  = child.nGet('name', '') as string;
    const func  = child.nGet('func')    as string | undefined;
    if (!isNaN(npcId)) {
      npcNames.set(npcId, func ? `${name} : ${func}` : name);
    }
  }
}
