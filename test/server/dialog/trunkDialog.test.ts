import { expect } from 'chai';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { ItemInfoType } from '../../../src/provider/item/ItemInfoType';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { TrunkDialog } from '../../../src/server/dialog/trunk/TrunkDialog';
import { TrunkRequestType } from '../../../src/server/dialog/trunk/TrunkRequestType';
import { TrunkResultType } from '../../../src/server/dialog/trunk/TrunkResultType';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { InventoryType } from '../../../src/world/item/InventoryType';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { Trunk } from '../../../src/world/item/Trunk';

describe('server/dialog/trunk/TrunkDialog.ts', () => {
  const originalGetItemInfo = ItemProvider.getItemInfo;

  afterEach(() => {
    ItemProvider.getItemInfo = originalGetItemInfo;
  });

  it('should put a partial stack into storage and charge mesos', () => {
    const itemId = 2000000;
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id !== itemId) return undefined;
      return itemInfo(itemId, 100, 0);
    };

    const im = new InventoryManager();
    im.money = 100;
    const item = bundle(itemId, 5);
    im.consumeInventory.putItem(1, item);

    const trunk = new Trunk(4);
    const writes: Buffer[] = [];
    const dialog = new TrunkDialog(1000, 10, 0);

    dialog.handlePacket(fakeUser(im, writes) as any, new PacketReader(trunkPutPacket(1, itemId, 2)), trunk);

    expect(im.money).to.equal(90);
    expect(im.consumeInventory.getItem(1)?.quantity).to.equal(3);
    expect(trunk.getItems().length).to.equal(1);
    expect(trunk.getItems()[0].quantity).to.equal(2);
    expect(lastTrunkResult(writes)).to.equal(TrunkResultType.PutSuccess);
  });

  it('should get an item from storage and charge mesos', () => {
    const itemId = 2000000;
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id !== itemId) return undefined;
      return itemInfo(itemId, 100, 0);
    };

    const im = new InventoryManager();
    im.money = 100;
    const trunk = new Trunk(4);
    trunk.addItem(bundle(itemId, 3));
    const writes: Buffer[] = [];
    const dialog = new TrunkDialog(1000, 0, 10);

    dialog.handlePacket(fakeUser(im, writes) as any, new PacketReader(trunkGetPacket(InventoryType.CONSUME, 0)), trunk);

    expect(im.money).to.equal(90);
    expect(im.consumeInventory.getItem(1)?.itemId).to.equal(itemId);
    expect(im.consumeInventory.getItem(1)?.quantity).to.equal(3);
    expect(trunk.getItems().length).to.equal(0);
    expect(lastTrunkResult(writes)).to.equal(TrunkResultType.GetSuccess);
  });

  it('should reject trade-blocked items without moving them', () => {
    const itemId = 2000000;
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id !== itemId) return undefined;
      return itemInfo(itemId, 100, 1);
    };

    const im = new InventoryManager();
    im.money = 100;
    im.consumeInventory.putItem(1, bundle(itemId, 1));
    const trunk = new Trunk(4);
    const writes: Buffer[] = [];
    const dialog = new TrunkDialog(1000, 10, 0);

    dialog.handlePacket(fakeUser(im, writes) as any, new PacketReader(trunkPutPacket(1, itemId, 1)), trunk);

    expect(im.money).to.equal(100);
    expect(im.consumeInventory.getItem(1)?.quantity).to.equal(1);
    expect(trunk.getItems().length).to.equal(0);
    expect(lastTrunkResult(writes)).to.equal(TrunkResultType.ServerMsg);
  });
});

function fakeUser(im: InventoryManager, writes: Buffer[]): object {
  return {
    getInventoryManager: (): InventoryManager => im,
    getNextItemSn: (): bigint => 2222n,
    write: (packet: Buffer): void => { writes.push(packet); },
  };
}

function bundle(itemId: number, quantity: number): Item {
  const item = new Item(ItemType.BUNDLE);
  item.itemId = itemId;
  item.quantity = quantity;
  return item;
}

function itemInfo(itemId: number, slotMax: number, tradeBlock: number): ItemInfo {
  return new ItemInfo(itemId, new Map([
    [ItemInfoType.slotMax, slotMax],
    [ItemInfoType.tradeBlock, tradeBlock],
  ]), new Map());
}

function trunkPutPacket(position: number, itemId: number, quantity: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(TrunkRequestType.PutItem);
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeShort(quantity);
  return w.getPacket();
}

function trunkGetPacket(inventoryType: InventoryType, position: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(TrunkRequestType.GetItem);
  w.writeByte(inventoryType);
  w.writeByte(position);
  return w.getPacket();
}

function lastTrunkResult(writes: Buffer[]): TrunkResultType {
  const packet = [...writes].reverse().find(p => p.readInt16LE(0) === MapleSendOpcode.TRUNK_RESULT.code);
  expect(packet).to.not.equal(undefined);
  return packet!.readUInt8(2) as TrunkResultType;
}
