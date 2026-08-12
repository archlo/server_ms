import { expect } from 'chai';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { ItemInfoType } from '../../../src/provider/item/ItemInfoType';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { ShopDialog } from '../../../src/server/dialog/shop/ShopDialog';
import { ShopItem } from '../../../src/server/dialog/shop/ShopItem';
import { ShopRequestType } from '../../../src/server/dialog/shop/ShopRequestType';
import { ShopResultType } from '../../../src/server/dialog/shop/ShopResultType';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';

describe('server/dialog/shop/ShopDialog.ts', () => {
  const originalGetItemInfo = ItemProvider.getItemInfo;

  afterEach(() => {
    ItemProvider.getItemInfo = originalGetItemInfo;
  });

  it('should buy items into inventory and charge mesos', () => {
    const itemId = 2000000;
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id !== itemId) return undefined;
      return itemInfo(itemId, 50, 100);
    };

    const im = new InventoryManager();
    im.money = 1000;
    const writes: Buffer[] = [];
    const user = fakeUser(im, writes);
    const dialog = new ShopDialog(1000, [ShopItem.from(itemId, 100, 1, 10)]);

    dialog.handlePacket(user as any, new PacketReader(shopBuyPacket(0, itemId, 2, 100)));

    expect(im.money).to.equal(800);
    expect(im.consumeInventory.getItem(1)?.itemId).to.equal(itemId);
    expect(im.consumeInventory.getItem(1)?.quantity).to.equal(2);
    expect(lastShopResult(writes)).to.equal(ShopResultType.BuySuccess);
  });

  it('should sell items from inventory and pay mesos', () => {
    const itemId = 2000000;
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id !== itemId) return undefined;
      return itemInfo(itemId, 25, 100);
    };

    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 4;
    im.consumeInventory.putItem(1, item);

    const writes: Buffer[] = [];
    const dialog = new ShopDialog(1000, []);

    dialog.handlePacket(fakeUser(im, writes) as any, new PacketReader(shopSellPacket(1, itemId, 2)));

    expect(im.money).to.equal(50);
    expect(im.consumeInventory.getItem(1)?.quantity).to.equal(2);
    expect(lastShopResult(writes)).to.equal(ShopResultType.SellSuccess);
  });

  it('should reject invalid buy requests without charging mesos', () => {
    const itemId = 2000000;
    ItemProvider.getItemInfo = (): ItemInfo | undefined => itemInfo(itemId, 50, 100);

    const im = new InventoryManager();
    im.money = 1000;
    const writes: Buffer[] = [];
    const dialog = new ShopDialog(1000, [ShopItem.from(itemId, 100, 1, 10)]);

    dialog.handlePacket(fakeUser(im, writes) as any, new PacketReader(shopBuyPacket(0, itemId, 11, 100)));

    expect(im.money).to.equal(1000);
    expect(im.consumeInventory.getItem(1)).to.equal(undefined);
    expect(lastShopResult(writes)).to.equal(ShopResultType.ServerMsg);
  });
});

function fakeUser(im: InventoryManager, writes: Buffer[]): object {
  return {
    getInventoryManager: (): InventoryManager => im,
    getNextItemSn: (): bigint => 1234n,
    getSkillLevel: (): number => 0,
    getSkillStatValue: (): number => 0,
    write: (packet: Buffer): void => { writes.push(packet); },
  };
}

function itemInfo(itemId: number, price: number, slotMax: number): ItemInfo {
  return new ItemInfo(itemId, new Map([
    [ItemInfoType.price, price],
    [ItemInfoType.slotMax, slotMax],
  ]), new Map());
}

function shopBuyPacket(index: number, itemId: number, count: number, price: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(ShopRequestType.Buy);
  w.writeShort(index);
  w.writeInt(itemId);
  w.writeShort(count);
  w.writeInt(price);
  return w.getPacket();
}

function shopSellPacket(position: number, itemId: number, count: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(ShopRequestType.Sell);
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeShort(count);
  return w.getPacket();
}

function lastShopResult(writes: Buffer[]): ShopResultType {
  const packet = [...writes].reverse().find(p => p.readInt16LE(0) === MapleSendOpcode.SHOP_RESULT.code);
  expect(packet).to.not.equal(undefined);
  return packet!.readUInt8(2) as ShopResultType;
}
