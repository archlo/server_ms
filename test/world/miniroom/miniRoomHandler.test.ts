import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { MiniRoomHandler } from '../../../src/world/miniroom/MiniRoomHandler';
import { MiniRoomPacket, TradeAction } from '../../../src/world/miniroom/MiniRoomPacket';
import { tradeManager } from '../../../src/world/miniroom/TradeManager';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';

function mockUser(id: number, name: string, inventory: InventoryManager) {
  const packets: Buffer[] = [];
  return {
    characterId: id,
    characterName: name,
    getCharacterId: () => id,
    getCharacterName: () => name,
    getCharacterData: () => ({ inventoryManager: inventory }),
    write: (buf: Buffer) => { packets.push(buf); },
    packets,
  };
}

function requestPacket(extra: (w: PacketWriter) => void = () => {}) {
  const w = new PacketWriter();
  w.writeByte(TradeAction.Request);
  w.writeByte(0x01); // miniroom type
  w.writeByte(0);    // sub-type consumed by requestTrade
  extra(w);
  return new PacketReader(w.getPacket());
}

function tradePacket(action: TradeAction, extra: (w: PacketWriter) => void = () => {}) {
  const w = new PacketWriter();
  w.writeByte(action);
  w.writeByte(0x01);
  extra(w);
  return new PacketReader(w.getPacket());
}

describe('world/miniroom/MiniRoomHandler.ts', () => {
  let originalGetItemInfo: typeof ItemProvider.getItemInfo;

  before(() => {
    originalGetItemInfo = ItemProvider.getItemInfo;
  });

  beforeEach(() => {
    MiniRoomHandler.channelServerOverride = null;
    tradeManager['trades'].clear();
    tradeManager['pendingRequests'].clear();
    ItemProvider.getItemInfo = (id: number) => new ItemInfo(id, new Map(), new Map());
  });

  afterEach(() => {
    ItemProvider.getItemInfo = originalGetItemInfo;
    MiniRoomHandler.channelServerOverride = null;
  });

  it('should request and open a trade between two users', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);

    MiniRoomHandler.channelServerOverride = {
      getUserByCharacterName: (name: string) => {
        if (name === 'Alice') return userA;
        if (name === 'Bob') return userB;
        return null;
      },
    };

    MiniRoomHandler.handleMiniRoom(userA, requestPacket(w => w.writeMapleAsciiString('Bob')));
    expect(userB.packets.length).to.be.greaterThan(0);

    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.Invite, w => w.writeMapleAsciiString('Alice')));
    expect(userA.packets.some((p: Buffer) => p.readUInt16LE(0) === MapleSendOpcode.MINI_ROOM.getValue())).to.be.true;
    expect(userB.packets.some((p: Buffer) => p.readUInt16LE(0) === MapleSendOpcode.MINI_ROOM.getValue())).to.be.true;
  });

  it('should place an item in the trade and remove it from inventory', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = 2000000;
    item.quantity = 5;
    invA.consumeInventory.putItem(2, item);

    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);
    tradeManager.createRoom(userA, userB);

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.SetItem, w => {
      w.writeByte(0); // tradeSlot
      w.writeByte(ItemType.BUNDLE);
      w.writeInt(2000000);
      w.writeShort(3); // quantity
      w.writeShort(2); // invPos
    }));

    expect(invA.consumeInventory.getItem(2)?.quantity).to.equal(2);
    expect(userA.packets.some((p: Buffer) => p.readUInt16LE(0) === MapleSendOpcode.INVENTORY_OPERATION.getValue())).to.be.true;
    expect(userB.packets.some((p: Buffer) => p.readUInt16LE(0) === MapleSendOpcode.MINI_ROOM.getValue())).to.be.true;
  });

  it('should return items when a user exits the trade', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = 2000000;
    item.quantity = 5;
    invA.consumeInventory.putItem(2, item);

    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);
    tradeManager.createRoom(userA, userB);

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.SetItem, w => {
      w.writeByte(0);
      w.writeByte(ItemType.BUNDLE);
      w.writeInt(2000000);
      w.writeShort(5);
      w.writeShort(2);
    }));

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.Exit));

    expect(invA.getItemCount(2000000)).to.equal(5);
    expect(tradeManager.getRoomByUser(userA)).to.be.undefined;
  });

  it('should execute a trade, transferring items and mesos', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    invA.addMoney(5000);
    invB.addMoney(1000);

    const itemA = new Item(ItemType.BUNDLE);
    itemA.itemId = 2000000;
    itemA.quantity = 5;
    invA.consumeInventory.putItem(2, itemA);

    const itemB = new Item(ItemType.BUNDLE);
    itemB.itemId = 4000001;
    itemB.quantity = 10;
    invB.etcInventory.putItem(1, itemB);

    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);
    tradeManager.createRoom(userA, userB);

    // Alice offers 3 items and 2000 mesos
    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.SetItem, w => {
      w.writeByte(0);
      w.writeByte(ItemType.BUNDLE);
      w.writeInt(2000000);
      w.writeShort(3);
      w.writeShort(2);
    }));
    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.SetMesos, w => w.writeLong(BigInt(2000))));

    // Bob offers 5 items and 500 mesos
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.SetItem, w => {
      w.writeByte(0);
      w.writeByte(ItemType.BUNDLE);
      w.writeInt(4000001);
      w.writeShort(5);
      w.writeShort(1);
    }));
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.SetMesos, w => w.writeLong(BigInt(500))));

    // Both confirm
    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.Confirm));
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.Confirm));

    expect(invA.money).to.equal(3500); // -2000 + 500
    expect(invB.money).to.equal(2500); // -500 + 2000
    expect(invA.getItemCount(4000001)).to.equal(5);
    expect(invB.getItemCount(2000000)).to.equal(3);
    expect(tradeManager.getRoomByUser(userA)).to.be.undefined;
  });

  it('should fail a trade when a user no longer has enough mesos', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    invA.addMoney(100);
    invB.addMoney(100);

    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);
    tradeManager.createRoom(userA, userB);

    // Both offer valid amounts at the time they are set.
    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.SetMesos, w => w.writeLong(BigInt(100))));
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.SetMesos, w => w.writeLong(BigInt(50))));

    // Alice spends her mesos before confirming (e.g. another shop action).
    invA.money = 0;

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.Confirm));
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.Confirm));

    expect(invA.money).to.equal(0);
    expect(invB.money).to.equal(100);
    expect(tradeManager.getRoomByUser(userA)).to.be.undefined;
  });

  it('should fail a trade when there is not enough inventory space', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    invA.addMoney(1000);
    invB.addMoney(1000);

    // Fill every slot in Bob's etc inventory so he cannot receive Alice's item.
    for (let i = 1; i <= invB.etcInventory.getSize(); i++) {
      const filler = new Item(ItemType.BUNDLE);
      filler.itemId = 4000000 + i;
      filler.quantity = 1;
      invB.etcInventory.putItem(i, filler);
    }

    const itemA = new Item(ItemType.BUNDLE);
    itemA.itemId = 4000000;
    itemA.quantity = 1;
    invA.etcInventory.putItem(1, itemA);

    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);
    tradeManager.createRoom(userA, userB);

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.SetItem, w => {
      w.writeByte(0);
      w.writeByte(ItemType.BUNDLE);
      w.writeInt(4000000);
      w.writeShort(1);
      w.writeShort(1);
    }));

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.Confirm));
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.Confirm));

    expect(invA.getItemCount(4000000)).to.equal(1);
    expect(tradeManager.getRoomByUser(userA)).to.be.undefined;
  });

  it('should decline a trade request', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);

    MiniRoomHandler.channelServerOverride = {
      getUserByCharacterName: (name: string) => {
        if (name === 'Alice') return userA;
        if (name === 'Bob') return userB;
        return null;
      },
    };

    MiniRoomHandler.handleMiniRoom(userA, requestPacket(w => w.writeMapleAsciiString('Bob')));
    MiniRoomHandler.handleMiniRoom(userB, tradePacket(TradeAction.Decline, w => w.writeMapleAsciiString('Alice')));

    expect(tradeManager.getPendingRequest(userB.characterId)).to.be.undefined;
  });

  it('should send chat messages to the trade partner', () => {
    const invA = new InventoryManager();
    const invB = new InventoryManager();
    const userA: any = mockUser(1, 'Alice', invA);
    const userB: any = mockUser(2, 'Bob', invB);
    tradeManager.createRoom(userA, userB);

    MiniRoomHandler.handleMiniRoom(userA, tradePacket(TradeAction.Chat, w => w.writeMapleAsciiString('hello')));

    expect(userB.packets.some((p: Buffer) => p.readUInt16LE(0) === MapleSendOpcode.MINI_ROOM.getValue())).to.be.true;
  });
});
