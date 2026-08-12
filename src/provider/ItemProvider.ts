import NXManager from '../wz-utils/NXManager';
import { NXNode } from '../wz-utils/NXNode';
import { ItemInfo } from './item/ItemInfo';
import { ItemOptionInfo } from './item/ItemOptionInfo';
import { ItemRewardInfo } from './item/ItemRewardInfo';
import { MobSummonItemInfo } from './item/MobSummonItemInfo';
import { PetInteraction } from './item/PetInteraction';

// kinoko.provider.ItemProvider ported 1:1 to TypeScript + NX

const EQUIP_TYPES = ['Accessory','Cap','Cape','Coat','Dragon','Face','Glove','Hair',
  'Longcoat','Mechanic','Pants','PetEquip','Ring','Shield','Shoes','TamingMob','Weapon'];
const ITEM_TYPES  = ['Consume','Install','Etc','Cash'];

const itemInfos      = new Map<number, ItemInfo>();
const itemOptionInfos= new Map<number, ItemOptionInfo>();
const itemRewardInfos= new Map<number, ItemRewardInfo>();
const mobSummonInfos = new Map<number, MobSummonItemInfo>();
const petEquips      = new Map<number, Set<number>>(); // petEquipId -> set<petTemplateId>
const petActions     = new Map<number, Map<number, PetInteraction>>(); // petTemplateId -> (action -> PetInteraction)
const specialItemNames = new Map<number, string>();

export const ItemProvider = {
  initialize(): void {
    itemInfos.clear(); itemOptionInfos.clear(); itemRewardInfos.clear();
    mobSummonInfos.clear(); petEquips.clear(); petActions.clear(); specialItemNames.clear();
    loadEquipInfos();
    loadItemInfos();
    loadItemOptionInfos();
    loadItemNames();
  },

  getItemInfo(itemId: number):       ItemInfo       | undefined { return itemInfos.get(itemId); },
  getItemOptionInfo(id: number):     ItemOptionInfo | undefined { return itemOptionInfos.get(id); },
  getItemRewardInfo(itemId: number): ItemRewardInfo | undefined { return itemRewardInfos.get(itemId); },
  getMobSummonInfo(itemId: number):  MobSummonItemInfo | undefined { return mobSummonInfos.get(itemId); },
  getSpecialItemName(itemId: number): string | undefined { return specialItemNames.get(itemId); },
  getAllItemInfos(): IterableIterator<ItemInfo> { return itemInfos.values(); },

  isPetEquipSuitable(itemId: number, templateId: number): boolean {
    return petEquips.get(itemId)?.has(templateId) ?? false;
  },

  getPetInteraction(templateId: number, action: number): PetInteraction | undefined {
    return petActions.get(templateId)?.get(action);
  },
};

function loadEquipInfos(): void {
  const charRoot = NXManager.getOrThrow('Character.wz');
  for (const dirName of EQUIP_TYPES) {
    const dirNode = charRoot.nGet(dirName) as NXNode | undefined;
    if (!dirNode) continue;
    for (const imgNode of dirNode.nChildren) {
      if (!imgNode.nName.endsWith('.img')) continue;
      const itemId = parseInt(imgNode.nName.replace('.img', ''));
      itemInfos.set(itemId, ItemInfo.from(itemId, imgNode));

      // pet equips
      const suits = new Set<number>();
      for (const child of imgNode.nChildren) {
        const n = parseInt(child.nName);
        if (!isNaN(n)) suits.add(n);
      }
      if (suits.size > 0) petEquips.set(itemId, suits);
    }
  }
}

function loadItemInfos(): void {
  const itemRoot = NXManager.getOrThrow('Item.wz');
  for (const dirName of ITEM_TYPES) {
    const dirNode = itemRoot.nGet(dirName) as NXNode | undefined;
    if (!dirNode) continue;
    for (const imgNode of dirNode.nChildren) {
      for (const child of imgNode.nChildren) {
        const itemId = parseInt(child.nName);
        if (isNaN(itemId)) continue;
        const info = ItemInfo.from(itemId, child);
        itemInfos.set(itemId, info);
        // reward
        const rewardNode = child.nGet('reward') as NXNode | undefined;
        if (rewardNode) itemRewardInfos.set(itemId, ItemRewardInfo.from(itemId, rewardNode));
        // mob summon
        const mobNode = child.nGet('mob') as NXNode | undefined;
        if (mobNode) mobSummonInfos.set(itemId, MobSummonItemInfo.from(itemId, mobNode));
      }
    }
  }
  // Pet items
  const petDir = itemRoot.nGet('Pet') as NXNode | undefined;
  if (!petDir) return;
  for (const imgNode of petDir.nChildren) {
    if (!imgNode.nName.endsWith('.img')) continue;
    const itemId = parseInt(imgNode.nName.replace('.img', ''));
    itemInfos.set(itemId, ItemInfo.from(itemId, imgNode));
    // pet interactions
    const interactNode = imgNode.nGet('interact') as NXNode | undefined;
    if (!interactNode) continue;
    const actions = new Map<number, PetInteraction>();
    for (const child of interactNode.nChildren) {
      const action = parseInt(child.nName);
      if (!isNaN(action)) actions.set(action, PetInteraction.from(child));
    }
    if (actions.size > 0) petActions.set(itemId, actions);
  }
}

function loadItemOptionInfos(): void {
  const optionImg = NXManager.get('Item.wz/ItemOption.img') as NXNode | undefined;
  if (!optionImg) return;
  for (const child of optionImg.nChildren) {
    const id = parseInt(child.nName);
    if (!isNaN(id)) itemOptionInfos.set(id, ItemOptionInfo.from(id, child));
  }
}

function loadItemNames(): void {
  // Special item names from Item.wz/Special/0910.img + 0911.img
  const specialDir = NXManager.get('Item.wz/Special') as NXNode | undefined;
  if (!specialDir) return;
  for (const imgName of ['0910.img', '0911.img']) {
    const img = specialDir.nGet(imgName) as NXNode | undefined;
    if (!img) continue;
    for (const child of img.nChildren) {
      const itemId = parseInt(child.nName);
      const name   = child.nGet('name') as string | undefined;
      if (!isNaN(itemId) && name) specialItemNames.set(itemId, name);
    }
  }
}
