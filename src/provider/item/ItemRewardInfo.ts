import { NXNode } from '../../wz-utils/NXNode';
import { ItemRewardEntry } from './ItemRewardEntry';
import { InventoryManager } from '../../world/item/InventoryManager';

export class ItemRewardInfo {
  constructor(
    public readonly itemId: number,
    public readonly entries: ItemRewardEntry[],
  ) {}

  canAddReward(im: InventoryManager): boolean {
    for (const entry of this.entries) {
      if (!im.canAddItemsByIdQty([[entry.itemId, entry.count]])) return false;
    }
    return true;
  }

  static from(itemId: number, rewardListNode: NXNode): ItemRewardInfo {
    const entries: ItemRewardEntry[] = [];
    for (const child of rewardListNode.nChildren) {
      entries.push(new ItemRewardEntry(
        child.nGet('item',   0) as number,
        child.nGet('count',  1) as number,
        child.nGet('prob',   0) as number,
        child.nGet('period', 0) as number,
        child.nGet('Effect', null) as string | null,
      ));
    }
    return new ItemRewardInfo(itemId, entries);
  }
}
