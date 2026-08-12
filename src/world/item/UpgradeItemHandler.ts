import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { UserPacket } from '../user/UserPacket';
import { ItemProvider } from '../../provider/ItemProvider';
import { ItemConstants } from './ItemConstants';
import { InventoryOperation } from './InventoryOperation';
import { InventoryType, inventoryTypeByPosition } from './InventoryType';
import { inventoryOperation } from './ItemPacket';
import { ItemInfoType } from '../../provider/item/ItemInfoType';
import { ItemGrade } from './ItemGrade';
import { Util } from '../../util/Util';
import { MessagePacket } from '../user/MessagePacket';

export class UpgradeItemHandler {
  static handleUserUpgradeItemUseRequest(user: User, r: PacketReader): void {
    r.readInt();
    const position = r.readShort();
    const itemId = r.readInt();
    const equipPosition = r.readShort();
    const equipItemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (!ItemConstants.isNewUpgradeItem(itemId)) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const scroll = im.consumeInventory.getItem(position);
    if (!scroll || scroll.itemId !== itemId) { user.dispose(); return; }

    const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
    const equip = im.getInventoryByType(equipType).getItem(equipPosition);
    if (!equip || equip.itemId !== equipItemId || !equip.equipData) { user.dispose(); return; }

    const scrollInfo = ItemProvider.getItemInfo(itemId);
    if (!scrollInfo) { user.dispose(); return; }

    const eq = equip.equipData;
    if (eq.ruc <= 0) {
      user.write(UserPacket.userItemUpgradeEffectEnchantError(user));
      user.dispose();
      return;
    }

    const successProb = scrollInfo.getInfo(ItemInfoType.success, 100);
    const cursedProb = scrollInfo.getInfo(ItemInfoType.cursed, 0);
    const success = successProb >= 100 || Util.succeedProp(successProb);
    let cursed = false;

    if (success) {
      eq.applyScrollStats(scrollInfo.itemInfos);
      eq.cuc += 1;
      eq.ruc -= 1;
      if (scrollInfo.getInfo(ItemInfoType.recover, 0) > 0) {
        eq.ruc += 1;
      }
    } else if (cursedProb > 0 && Util.succeedProp(cursedProb)) {
      cursed = true;
      eq.ruc = 0;
    } else {
      eq.ruc -= 1;
    }

    const consumeOp = im.removeItemAt(position, scroll, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    const updateOp = InventoryOperation.newItem(equipType, equipPosition, equip);
    user.write(inventoryOperation(updateOp, true));

    const effect = UserPacket.userItemUpgradeEffect(user, success, cursed, false, false);
    user.write(effect);
    user.getField()?.broadcastPacket(effect, user);
  }

  static handleUserHyperUpgradeItemUseRequest(user: User, r: PacketReader): void {
    r.readInt();
    const position = r.readShort();
    const itemId = r.readInt();
    const equipPosition = r.readShort();
    const equipItemId = r.readInt();
    const whiteScroll = r.readBoolean();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (!ItemConstants.isHyperUpgradeItem(itemId)) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const scroll = im.consumeInventory.getItem(position);
    if (!scroll || scroll.itemId !== itemId) { user.dispose(); return; }

    const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
    const equip = im.getInventoryByType(equipType).getItem(equipPosition);
    if (!equip || equip.itemId !== equipItemId || !equip.equipData) { user.dispose(); return; }

    const eq = equip.equipData;
    if (eq.ruc <= 0) { user.dispose(); return; }

    const successProb = ItemConstants.getHyperUpgradeSuccessProp(itemId, eq.chuc);
    const success = Util.succeedProp(successProb);
    let cursed = false;

    let whiteScrollUsed = false;
    if (whiteScroll && !ItemConstants.isUpgradeScrollNoConsumeWhiteScroll(itemId)) {
      for (const [wsPos, wsItem] of im.consumeInventory.getItems()) {
        if (wsItem.itemId === ItemConstants.WHITE_SCROLL) {
          const wsOp = im.removeItemAt(wsPos, wsItem, 1);
          if (wsOp) {
            user.write(inventoryOperation(wsOp, true));
            whiteScrollUsed = true;
          }
          break;
        }
      }
    }

    if (success) {
      eq.applyHyperUpgradeStats();
      eq.ruc -= 1;
      eq.chuc += 1;
    } else if (!whiteScrollUsed) {
      cursed = Math.random() < 0.5;
      if (cursed) {
        const destroyOp = im.removeItemAt(equipPosition, equip, 1);
        if (destroyOp) {
          user.write(inventoryOperation(destroyOp, true));
          const effect = UserPacket.userItemHyperUpgradeEffect(user, false, true, false);
          user.write(effect);
          user.getField()?.broadcastPacket(effect, user);
          return;
        }
      } else {
        eq.ruc -= 1;
      }
    }

    const consumeOp = im.removeItemAt(position, scroll, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    const updateOp = InventoryOperation.newItem(equipType, equipPosition, equip);
    user.write(inventoryOperation(updateOp, true));

    const effect = UserPacket.userItemHyperUpgradeEffect(user, success, cursed, false);
    user.write(effect);
    user.getField()?.broadcastPacket(effect, user);
  }

  static handleUserItemOptionUpgradeItemUseRequest(user: User, r: PacketReader): void {
    r.readInt();
    const position = r.readShort();
    const itemId = r.readInt();
    const equipPosition = r.readShort();
    const equipItemId = r.readInt();
    const whiteScroll = r.readBoolean();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (!ItemConstants.isItemOptionUpgradeItem(itemId)) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const scroll = im.consumeInventory.getItem(position);
    if (!scroll || scroll.itemId !== itemId) { user.dispose(); return; }

    const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
    const equip = im.getInventoryByType(equipType).getItem(equipPosition);
    if (!equip || equip.itemId !== equipItemId || !equip.equipData) { user.dispose(); return; }

    const eq = equip.equipData;
    if (eq.ruc <= 0) { user.dispose(); return; }

    const successProb = ItemConstants.getItemOptionUpgradeSuccessProp(itemId);
    const success = Util.succeedProp(successProb);
    let cursed = false;

    let whiteScrollUsed = false;
    if (whiteScroll && !ItemConstants.isUpgradeScrollNoConsumeWhiteScroll(itemId)) {
      for (const [wsPos, wsItem] of im.consumeInventory.getItems()) {
        if (wsItem.itemId === ItemConstants.WHITE_SCROLL) {
          const wsOp = im.removeItemAt(wsPos, wsItem, 1);
          if (wsOp) {
            user.write(inventoryOperation(wsOp, true));
            whiteScrollUsed = true;
          }
          break;
        }
      }
    }

    if (success) {
      eq.ruc -= 1;
      eq.grade = (eq.grade & ~3) | 1; // RARE
    } else if (!whiteScrollUsed) {
      eq.ruc -= 1;
    }

    const consumeOp = im.removeItemAt(position, scroll, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    const updateOp = InventoryOperation.newItem(equipType, equipPosition, equip);
    user.write(inventoryOperation(updateOp, true));

    const effect = UserPacket.userItemOptionUpgradeEffect(user, success, cursed, false);
    user.write(effect);
    user.getField()?.broadcastPacket(effect, user);
  }

  static handleUserItemReleaseRequest(user: User, r: PacketReader): void {
    const position = r.readShort();
    const itemId = r.readInt();
    const itemSn = r.readLong();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (!ItemConstants.isReleaseItem(itemId)) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const glass = im.consumeInventory.getItem(position);
    if (!glass || glass.itemId !== itemId) { user.dispose(); return; }

    const equipResult = im.getItemBySn(InventoryType.EQUIP, itemSn) ?? im.getItemBySn(InventoryType.EQUIPPED, itemSn);
    if (!equipResult || !equipResult[1].equipData) { user.dispose(); return; }

    const [equipPos, equip] = equipResult;
    const eq = equip.equipData;
    if (eq.isReleased()) { user.dispose(); return; }

    const equipInfo = ItemProvider.getItemInfo(equip.itemId);
    if (!equipInfo) { user.dispose(); return; }

    const reqLevel = equipInfo.getInfo(ItemInfoType.reqLevel, 200);
    const maxLevel = ItemConstants.getReleaseItemLevelLimit(itemId);
    if (reqLevel > maxLevel) {
      user.write(MessagePacket.system('This magnifying glass cannot identify items of this level.'));
      user.dispose();
      return;
    }

    const consumeOp = im.removeItemAt(position, glass, 1);
    if (!consumeOp) { user.dispose(); return; }
    user.write(inventoryOperation(consumeOp, true));

    eq.grade |= ItemGrade.RELEASED;

    const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPos);
    const updateOp = InventoryOperation.newItem(equipType, equipPos, equip);
    user.write(inventoryOperation(updateOp, true));

    const effect = UserPacket.userItemReleaseEffect(user, equipPos);
    user.write(effect);
    user.getField()?.broadcastPacket(effect, user);
  }
}
