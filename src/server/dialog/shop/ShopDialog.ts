import { PacketReader } from '../../../protocol/packets/packetReader';
import { User } from '../../../world/user/User';
import { ShopItem } from './ShopItem';
import { ShopRequestType, getShopRequestType } from './ShopRequestType';
import { ShopResultType } from './ShopResultType';
import { openShopDlg, shopResult } from './ShopPacket';
import { ItemProvider } from '../../../provider/ItemProvider';
import { ItemInfoType } from '../../../provider/item/ItemInfoType';
import { GameConstants } from '../../../world/GameConstants';
import { Stat } from '../../../world/user/stat/Stat';
import { statChangedPacket } from '../../../world/user/User';
import { inventoryOperation } from '../../../world/item/ItemPacket';
import { ItemConstants } from '../../../world/item/ItemConstants';
import { InventoryType } from '../../../world/item/InventoryType';

export class ShopDialog {
  constructor(
    public readonly npcTemplateId: number,
    public readonly items: ShopItem[],
  ) {}

  handlePacket(user: User, packet: PacketReader): void {
    const type = packet.readByte();
    const requestType = getShopRequestType(type);
    if (requestType === null) {
      return;
    }
    switch (requestType) {
      case ShopRequestType.Buy:
        this.handleBuy(user, packet);
        break;
      case ShopRequestType.Sell:
        this.handleSell(user, packet);
        break;
      case ShopRequestType.Recharge:
        this.handleRecharge(user, packet);
        break;
      case ShopRequestType.Close:
        user.setDialog(null);
        break;
    }
  }

  private handleBuy(user: User, inPacket: PacketReader): void {
    const index = inPacket.readShort();
    const itemId = inPacket.readInt();
    const count = inPacket.readShort();
    const price = inPacket.readInt();

    if (index >= this.items.length) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const shopItem = this.items[index];
    if (shopItem.itemId !== itemId || shopItem.maxPerSlot < count || shopItem.price !== price) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const totalPrice = price * count;
    if (totalPrice > GameConstants.MONEY_MAX) {
      user.write(shopResult(ShopResultType.BuyNoMoney));
      return;
    }
    const im = user.getInventoryManager();
    if (!im.canAddMoney(-totalPrice)) {
      user.write(shopResult(ShopResultType.BuyNoMoney));
      return;
    }
    const totalQuantity = shopItem.quantity * count;
    if (!im.canAddItemsByIdQty([[itemId, totalQuantity]])) {
      user.write(shopResult(ShopResultType.BuyUnknown));
      return;
    }
    const ii = ItemProvider.getItemInfo(itemId);
    if (!ii) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const boughtItem = ii.createItem(user.getNextItemSn(), totalQuantity);
    if (!im.addMoney(-totalPrice)) {
      return;
    }
    const addResult = im.addItem(boughtItem);
    if (!addResult) {
      return;
    }
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(inventoryOperation(addResult, true));
    user.write(shopResult(ShopResultType.BuySuccess));
  }

  private handleSell(user: User, inPacket: PacketReader): void {
    const position = inPacket.readShort();
    const itemId = inPacket.readInt();
    const count = inPacket.readShort();
    const rechargeable = ItemConstants.isRechargeableItem(itemId);

    const im = user.getInventoryManager();
    const inventory = im.getInventoryByItemId(itemId);
    const sellItem = inventory.getItem(position);
    if (!sellItem || sellItem.itemId !== itemId || (rechargeable && count !== 1) || (!rechargeable && sellItem.quantity < count)) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const ii = ItemProvider.getItemInfo(itemId);
    if (!ii) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const salePrice = ii.getPrice();
    const totalPrice = salePrice * count + (rechargeable ? Math.ceil(sellItem.quantity * ii.getInfo(ItemInfoType.unitPrice)) : 0);
    if (!im.canAddMoney(totalPrice)) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const removeResult = im.removeItemAt(position, sellItem, rechargeable ? sellItem.quantity : count);
    if (!removeResult) {
      return;
    }
    if (!im.addMoney(totalPrice)) {
      return;
    }
    user.write(inventoryOperation(removeResult, false));
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(shopResult(ShopResultType.SellSuccess));
  }

  private handleRecharge(user: User, inPacket: PacketReader): void {
    const position = inPacket.readShort();
    const im = user.getInventoryManager();
    const consumeInv = im.getInventoryByType(InventoryType.CONSUME);
    const item = consumeInv.getItem(position);
    if (!item || !ItemConstants.isRechargeableItem(item.itemId)) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const shopItem = this.items.find(si => si.itemId === item.itemId && si.unitPrice > 0);
    if (!shopItem) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const ii = ItemProvider.getItemInfo(item.itemId);
    if (!ii) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const slotMax = ii.getInfo(ItemInfoType.slotMax);
    if (item.quantity >= slotMax) {
      user.write(shopResult(ShopResultType.ServerMsg));
      return;
    }
    const delta = slotMax - item.quantity;
    const totalPrice = Math.ceil(delta * shopItem.unitPrice);
    if (totalPrice > GameConstants.MONEY_MAX) {
      user.write(shopResult(ShopResultType.RechargeNoMoney));
      return;
    }
    if (!im.canAddMoney(-totalPrice)) {
      user.write(shopResult(ShopResultType.RechargeNoMoney));
      return;
    }
    if (!im.addMoney(-totalPrice)) {
      return;
    }
    item.quantity = slotMax;
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(inventoryOperation(im.updateItem(position, item), true));
    user.write(shopResult(ShopResultType.RechargeSuccess));
  }
}

export function openShopDialog(user: User, npcTemplateId: number, items: ShopItem[]): void {
  user.setDialog(new ShopDialog(npcTemplateId, items));
  user.write(openShopDlg(user, npcTemplateId, items));
}
