import { PacketReader } from '../../../protocol/packets/packetReader';
import { User } from '../../../world/user/User';
import { Trunk } from '../../../world/item/Trunk';
import { TrunkRequestType, getTrunkRequestType } from './TrunkRequestType';
import { TrunkResultType } from './TrunkResultType';
import * as TrunkPacket from './TrunkPacket';
import { InventoryType, inventoryTypeByValue, inventoryTypeByItemId } from '../../../world/item/InventoryType';
import { ItemProvider } from '../../../provider/ItemProvider';
import { ItemInfoType } from '../../../provider/item/ItemInfoType';
import { ItemConstants } from '../../../world/item/ItemConstants';
import { ItemType } from '../../../world/item/ItemType';
import { Item } from '../../../world/item/Item';
import { Stat } from '../../../world/user/stat/Stat';
import { statChangedPacket } from '../../../world/user/User';
import { inventoryOperation } from '../../../world/item/ItemPacket';
import { GameConstants } from '../../../world/GameConstants';

export class TrunkDialog {
  constructor(
    public readonly npcTemplateId: number,
    public readonly trunkPut: number,
    public readonly trunkGet: number,
  ) {}

  handlePacket(user: User, packet: PacketReader, trunk: Trunk): void {
    const type = packet.readByte();
    const requestType = getTrunkRequestType(type);
    if (requestType === null) return;

    switch (requestType) {
      case TrunkRequestType.GetItem:
        this.handleGetItem(user, packet, trunk);
        break;
      case TrunkRequestType.PutItem:
        this.handlePutItem(user, packet, trunk);
        break;
      case TrunkRequestType.SortItem:
        this.handleSortItem(user, trunk);
        break;
      case TrunkRequestType.Money:
        this.handleMoney(user, packet, trunk);
        break;
      case TrunkRequestType.CloseDialog:
        user.setDialog(null);
        break;
    }
  }

  private handleGetItem(user: User, packet: PacketReader, trunk: Trunk): void {
    const invTypeVal = packet.readByte();
    const position = packet.readByte();
    const inventoryType = inventoryTypeByValue(invTypeVal);
    if (inventoryType === null || inventoryType === InventoryType.EQUIPPED) {
      user.write(TrunkPacket.of(TrunkResultType.GetUnknown));
      return;
    }
    const im = user.getInventoryManager();
    if (im.money < this.trunkGet) {
      user.write(TrunkPacket.of(TrunkResultType.GetNoMoney));
      return;
    }
    const item = trunk.getItem(inventoryType, position);
    if (!item) {
      user.write(TrunkPacket.serverMsg('Due to an error, the trade did not happen.'));
      return;
    }
    if (!im.canAddItem(item)) {
      user.write(TrunkPacket.of(TrunkResultType.GetUnknown));
      return;
    }
    if (!im.addMoney(-this.trunkGet)) {
      return;
    }
    const itemIndex = trunk.getItems().indexOf(item);
    if (itemIndex === -1 || !trunk.removeItem(itemIndex)) {
      return;
    }
    const addResult = im.addItem(item);
    if (!addResult) return;

    user.write(TrunkPacket.getSuccess(trunk));
    user.write(inventoryOperation(addResult, false));
    user.write(statChangedPacket(Stat.MONEY, im.money));
  }

  private handlePutItem(user: User, packet: PacketReader, trunk: Trunk): void {
    const position = packet.readShort();
    const itemId = packet.readInt();
    const quantity = packet.readShort();

    const im = user.getInventoryManager();
    if (im.money < this.trunkPut) {
      user.write(TrunkPacket.of(TrunkResultType.PutNoMoney));
      return;
    }
    const invType = inventoryTypeByItemId(itemId);
    const item = im.getInventoryByType(invType).getItem(position);
    if (!item || item.itemId !== itemId || item.quantity < quantity) {
      user.write(TrunkPacket.serverMsg('Due to an error, the trade did not happen.'));
      return;
    }
    const ii = ItemProvider.getItemInfo(itemId);
    if (!ii) {
      user.write(TrunkPacket.serverMsg('Due to an error, the trade did not happen.'));
      return;
    }
    if (ii.getInfo(ItemInfoType.tradeBlock) !== 0) {
      user.write(TrunkPacket.serverMsg('Due to an error, the trade did not happen.'));
      return;
    }
    if (!trunk.canAddItem(item, quantity)) {
      user.write(TrunkPacket.of(TrunkResultType.PutNoSpace));
      return;
    }
    if (!im.addMoney(-this.trunkPut)) {
      return;
    }

    if (item.itemType === ItemType.BUNDLE && !ItemConstants.isRechargeableItem(item.itemId) && item.quantity > quantity) {
      item.quantity -= quantity;
      user.write(inventoryOperation(im.updateItem(position, item), false));
      const partialItem = item.copy();
      partialItem.itemSn = user.getNextItemSn();
      partialItem.quantity = quantity;
      trunk.addItem(partialItem);
    } else {
      const removeResult = im.removeItemAt(position, item);
      if (!removeResult) return;
      user.write(inventoryOperation(removeResult, false));
      trunk.addItem(item);
    }

    user.write(TrunkPacket.putSuccess(trunk));
    user.write(statChangedPacket(Stat.MONEY, im.money));
  }

  private handleSortItem(user: User, trunk: Trunk): void {
    trunk.getItems().sort((a, b) => {
      if (a.itemId !== b.itemId) return a.itemId - b.itemId;
      return b.quantity - a.quantity;
    });
    user.write(TrunkPacket.sortItem(trunk));
  }

  private handleMoney(user: User, packet: PacketReader, trunk: Trunk): void {
    const money = packet.readInt();
    const im = user.getInventoryManager();

    if (money > 0) {
      if (!trunk.canAddMoney(-money)) {
        user.write(TrunkPacket.of(TrunkResultType.GetNoMoney));
        return;
      }
      if (!im.canAddMoney(money)) {
        user.write(TrunkPacket.serverMsg('You cannot hold any more mesos.'));
        return;
      }
      if (!trunk.addMoney(-money)) return;
      if (!im.addMoney(money)) return;
      user.write(TrunkPacket.moneySuccess(trunk));
      user.write(statChangedPacket(Stat.MONEY, im.money));
    } else if (money < 0) {
      if (!im.canAddMoney(money)) {
        user.write(TrunkPacket.of(TrunkResultType.PutNoMoney));
        return;
      }
      if (!trunk.canAddMoney(-money)) {
        user.write(TrunkPacket.of(TrunkResultType.PutNoSpace));
        return;
      }
      if (!im.addMoney(money)) return;
      if (!trunk.addMoney(-money)) return;
      user.write(TrunkPacket.moneySuccess(trunk));
      user.write(statChangedPacket(Stat.MONEY, im.money));
    }
  }
}

export function openTrunkDialog(user: User, npcTemplateId: number, trunkPut: number, trunkGet: number, trunk: Trunk): void {
  user.setDialog(new TrunkDialog(npcTemplateId, trunkPut, trunkGet));
  user.write(TrunkPacket.openTrunkDlg(npcTemplateId, trunk));
}
