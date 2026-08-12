import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';
import { QuestItemData } from '../QuestItemData';
import { InventoryManager } from '../../../world/item/InventoryManager';
import { Inventory } from '../../../world/item/Inventory';
import { Item } from '../../../world/item/Item';

export class QuestItemCheck implements QuestCheck {
  constructor(private readonly items: QuestItemData[]) {}

  getItems(): QuestItemData[] { return this.items; }

  check(user: User): boolean {
    const im = user.getInventoryManager();
    const filtered = this.getFilteredItems(user.getGender(), user.getJob());
    for (const itemData of filtered) {
      const itemCount = im.getItemCount(itemData.itemId) + this.getEquippedItemCount(im.equipped, itemData.itemId);
      if (itemData.count > 0 && itemCount < itemData.count) return false;
      if (itemData.count <= 0 && itemCount > 0) return false;
    }
    return true;
  }

  private getFilteredItems(gender: number, job: number): QuestItemData[] {
    return this.items.filter(d => d.checkGender(gender) && d.checkJob(job));
  }

  private getEquippedItemCount(equipped: Inventory, itemId: number): number {
    let count = 0;
    for (const item of equipped.getItems().values()) {
      if (item.itemId === itemId) count += item.quantity;
    }
    return count;
  }

  static from(itemList: NXNode): QuestItemCheck {
    return new QuestItemCheck(QuestItemData.resolveItemData(itemList));
  }
}
