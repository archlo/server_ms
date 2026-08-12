import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';
import { QuestItemData } from '../QuestItemData';
import { ItemProvider } from '../../ItemProvider';
import { InventoryType, inventoryTypeByItemId } from '../../../world/item/InventoryType';
import { inventoryOperation } from '../../../world/item/ItemPacket';
import { UserLocal } from '../../../world/user/UserLocal';
import { Effect } from '../../../world/user/effect/Effect';
import { Util } from '../../../util/Util';
import { questFailedUnknown, questFailedInventory } from '../../../world/quest/QuestPacket';

export class QuestItemAct implements QuestAct {
  constructor(
    private readonly questId: number,
    private readonly items: QuestItemData[],
    private readonly choices: QuestItemData[],
  ) {}

  getItems(): QuestItemData[] { return this.items; }

  restoreLostItems(user: User, lostItems: number[]): void {
    const im = user.getInventoryManager();
    const filteredItems = this.getFilteredItems(user.getGender(), user.getJob())
      .filter(d => lostItems.includes(d.itemId));
    const requiredSlots = new Map<InventoryType, number>();

    for (const itemData of filteredItems) {
      if (!itemData.isStatic() || itemData.count <= 0) continue;
      const info = ItemProvider.getItemInfo(itemData.itemId);
      if (!info || !info.isQuest()) {
        user.write(questFailedUnknown());
        return;
      }
      const invType = inventoryTypeByItemId(itemData.itemId);
      requiredSlots.set(invType, (requiredSlots.get(invType) ?? 0) + 1);
    }
    for (const [invType, needed] of requiredSlots) {
      if (im.getInventoryByType(invType).getRemaining() < needed) {
        user.write(questFailedInventory(this.questId));
        return;
      }
    }
    for (const itemData of filteredItems) {
      if (!itemData.isStatic() || itemData.count <= 0) continue;
      const info = ItemProvider.getItemInfo(itemData.itemId);
      if (!info) { user.write(questFailedUnknown()); return; }
      const count = itemData.count - im.getItemCount(itemData.itemId);
      if (count <= 0) { user.write(questFailedUnknown()); return; }
      const item = info.createItem(user.getNextItemSn(), count);
      const addResult = im.addItem(item);
      if (!addResult) { user.write(questFailedUnknown()); return; }
      user.write(inventoryOperation(addResult, true));
      user.write(UserLocal.effect(Effect.gainItem(item.itemId, item.quantity)));
    }
  }

  removeQuestItems(user: User): void {
    const im = user.getInventoryManager();
    for (const itemData of this.items) {
      const info = ItemProvider.getItemInfo(itemData.itemId);
      if (!info || !info.isQuest()) continue;
      const count = im.getItemCount(itemData.itemId);
      if (count <= 0) continue;
      const removeResult = im.removeItemById(itemData.itemId, count);
      if (!removeResult) { user.write(questFailedUnknown()); return; }
      user.write(inventoryOperation(removeResult, true));
      user.write(UserLocal.effect(Effect.gainItem(itemData.itemId, -count)));
    }
  }

  canAct(user: User, rewardIndex: number): boolean {
    const im = user.getInventoryManager();
    const filteredItems = this.getFilteredItems(user.getGender(), user.getJob());
    const requiredSlots = new Map<InventoryType, number>();

    for (const itemData of filteredItems) {
      if (!itemData.isRandom()) continue;
      requiredSlots.set(inventoryTypeByItemId(itemData.itemId), 1);
    }
    if (rewardIndex >= 0) {
      const filteredChoices = this.getFilteredChoices(user.getGender(), user.getJob());
      if (filteredChoices.length < rewardIndex) {
        user.write(questFailedUnknown());
        return false;
      }
      const choice = filteredChoices[rewardIndex];
      const invType = inventoryTypeByItemId(choice.itemId);
      requiredSlots.set(invType, (requiredSlots.get(invType) ?? 0) + 1);
    }
    for (const itemData of filteredItems) {
      if (!itemData.isStatic()) continue;
      if (itemData.count > 0) {
        const invType = inventoryTypeByItemId(itemData.itemId);
        requiredSlots.set(invType, (requiredSlots.get(invType) ?? 0) + 1);
      } else {
        if (!im.hasItem(itemData.itemId, -itemData.count)) {
          user.write(questFailedUnknown());
          return false;
        }
      }
    }
    for (const [invType, needed] of requiredSlots) {
      if (im.getInventoryByType(invType).getRemaining() < needed) {
        user.write(questFailedInventory(this.questId));
        return false;
      }
    }
    return true;
  }

  doAct(user: User, rewardIndex: number): boolean {
    const im = user.getInventoryManager();
    const filteredItems = this.getFilteredItems(user.getGender(), user.getJob());

    // Take required items
    for (const itemData of filteredItems) {
      if (!itemData.isStatic() || itemData.count > 0) continue;
      const quantity = itemData.count !== 0 ? -itemData.count : im.getItemCount(itemData.itemId);
      const removeResult = im.removeItemById(itemData.itemId, quantity);
      if (!removeResult) return false;
      user.write(inventoryOperation(removeResult, true));
      user.write(UserLocal.effect(Effect.gainItem(itemData.itemId, -quantity)));
    }

    // Give choice item
    if (rewardIndex >= 0) {
      const filteredChoices = this.getFilteredChoices(user.getGender(), user.getJob());
      if (filteredChoices.length < rewardIndex) return false;
      const choice = filteredChoices[rewardIndex];
      const info = ItemProvider.getItemInfo(choice.itemId);
      if (!info) return false;
      const item = info.createItem(user.getNextItemSn(), choice.count);
      const addResult = im.addItem(item);
      if (!addResult) return false;
      user.write(inventoryOperation(addResult, true));
      user.write(UserLocal.effect(Effect.gainItem(item.itemId, item.quantity)));
    }

    // Give static items
    for (const itemData of filteredItems) {
      if (!itemData.isStatic() || itemData.count <= 0) continue;
      const info = ItemProvider.getItemInfo(itemData.itemId);
      if (!info) return false;
      const item = info.createItem(user.getNextItemSn(), itemData.count);
      const addResult = im.addItem(item);
      if (!addResult) return false;
      user.write(inventoryOperation(addResult, true));
      user.write(UserLocal.effect(Effect.gainItem(item.itemId, item.quantity)));
    }

    // Give random item
    const randomItems = filteredItems.filter(d => d.isRandom());
    const randomResult = Util.getRandomFromCollection(randomItems, d => d.prop);
    if (randomResult) {
      const info = ItemProvider.getItemInfo(randomResult.itemId);
      if (!info) return false;
      const item = info.createItem(user.getNextItemSn(), randomResult.count);
      const addResult = im.addItem(item);
      if (!addResult) return false;
      user.write(inventoryOperation(addResult, true));
      user.write(UserLocal.effect(Effect.gainItem(item.itemId, item.quantity)));
    }
    return true;
  }

  private getFilteredItems(gender: number, job: number): QuestItemData[] {
    return this.items.filter(d => d.checkGender(gender) && d.checkJob(job));
  }

  private getFilteredChoices(gender: number, job: number): QuestItemData[] {
    return this.choices.filter(d => d.checkGender(gender) && d.checkJob(job));
  }

  static from(questId: number, itemList: NXNode): QuestItemAct {
    return new QuestItemAct(
      questId,
      QuestItemData.resolveItemData(itemList),
      QuestItemData.resolveChoiceItemData(itemList),
    );
  }
}
