import { expect } from 'chai';
import { PacketReader } from '../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../src/protocol/packets/packetWriter';
import { MapleTvHandler } from '../../src/world/MapleTvHandler';
import { InventoryManager } from '../../src/world/item/InventoryManager';
import { Item } from '../../src/world/item/Item';
import { ItemType } from '../../src/world/item/ItemType';
import { MapleSendOpcode } from '../../src/protocol/opcodes/maple/send';

describe('world/MapleTvHandler.ts', () => {
  // 5075000 = MAPLETV (type 0, flag read from packet)
  const TV_ITEM_ID = 5075000;

  function tvPacket(itemId: number, flag: number, lines: string[]): Buffer {
    const w = new PacketWriter();
    w.writeInt(itemId);
    w.writeByte(flag);
    for (const line of lines) w.writeMapleAsciiString(line);
    return w.getPacket();
  }

  function fakeAvatarLook(): any {
    return { encode(wr: PacketWriter): void { wr.writeByte(0); wr.writeByte(0); wr.writeInt(0); } };
  }

  function makeUser(im: InventoryManager, field: any): any {
    return {
      getHp: (): number => 100,
      getCharacterName: (): string => 'Sender',
      getAvatarLook: (): any => fakeAvatarLook(),
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => field,
      write: (): void => {},
      dispose: (): void => {},
    };
  }

  it('should enqueue a MapleTV message and broadcast updateMessage', () => {
    const item = new Item(ItemType.BUNDLE);
    item.itemId = TV_ITEM_ID;
    item.quantity = 1;
    const im = new InventoryManager();
    im.cashInventory.putItem(1, item);

    const broadcasts: Buffer[] = [];
    const field: any = {
      broadcastPacket: (p: Buffer): void => { broadcasts.push(p); },
      getMapleTvQueue: (): any[] => queue,
      getUserPool: (): any => ({ getUserByCharacterName: (): undefined => undefined }),
    };
    const queue: any[] = [];

    MapleTvHandler.handleMapleTvSendMessageRequest(makeUser(im, field), new PacketReader(tvPacket(TV_ITEM_ID, 0, ['Hello', '', '', '', ''])));

    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(queue.length).to.equal(1);
    expect(broadcasts.length).to.equal(1);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.MAPLE_TV_UPDATE_MESSAGE.code);
  });

  it('should queue subsequent messages without rebroadcasting', () => {
    const item1 = new Item(ItemType.BUNDLE);
    item1.itemId = TV_ITEM_ID;
    item1.quantity = 1;
    const item2 = new Item(ItemType.BUNDLE);
    item2.itemId = TV_ITEM_ID;
    item2.quantity = 1;
    const im = new InventoryManager();
    im.cashInventory.putItem(1, item1);
    im.cashInventory.putItem(2, item2);

    const broadcasts: Buffer[] = [];
    const queue: any[] = [];
    const field: any = {
      broadcastPacket: (p: Buffer): void => { broadcasts.push(p); },
      getMapleTvQueue: (): any[] => queue,
      getUserPool: (): any => ({ getUserByCharacterName: (): undefined => undefined }),
    };
    const user = makeUser(im, field);

    MapleTvHandler.handleMapleTvSendMessageRequest(user, new PacketReader(tvPacket(TV_ITEM_ID, 0, ['A', '', '', '', ''])));
    MapleTvHandler.handleMapleTvSendMessageRequest(user, new PacketReader(tvPacket(TV_ITEM_ID, 0, ['B', '', '', '', ''])));

    expect(queue.length).to.equal(2);
    // Only the first (empty-queue) message triggers a broadcast
    expect(broadcasts.length).to.equal(1);
  });

  it('should send useRes when receiver not found', () => {
    const item = new Item(ItemType.BUNDLE);
    item.itemId = 5075002; // MAPLELOVETV -> type 2 -> flag 3 (has receiver)
    item.quantity = 1;
    const im = new InventoryManager();
    im.cashInventory.putItem(1, item);

    const writes: Buffer[] = [];
    const queue: any[] = [];
    const field: any = {
      broadcastPacket: (): void => {},
      getMapleTvQueue: (): any[] => queue,
      getUserPool: (): any => ({ getUserByCharacterName: (): undefined => undefined }),
    };
    const user: any = {
      getHp: (): number => 100,
      getCharacterName: (): string => 'Sender',
      getAvatarLook: (): any => fakeAvatarLook(),
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => field,
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => {},
    };

    const w = new PacketWriter();
    w.writeInt(5075002);
    // type 2 -> flag implicit (3), no flag byte; isMega false; flag&2 -> receiverName
    w.writeMapleAsciiString('Ghost');
    w.writeMapleAsciiString('s1');
    w.writeMapleAsciiString('s2');
    w.writeMapleAsciiString('s3');
    w.writeMapleAsciiString('s4');
    w.writeMapleAsciiString('s5');

    MapleTvHandler.handleMapleTvSendMessageRequest(user, new PacketReader(w.getPacket()));

    expect(writes.length).to.equal(1);
    expect(writes[0].readInt16LE(0)).to.equal(MapleSendOpcode.MAPLE_TV_USE_RES.code);
    expect(queue.length).to.equal(0);
  });

  it('should dispose when item not in inventory', () => {
    const im = new InventoryManager();
    let disposed = 0;
    const field: any = {
      broadcastPacket: (): void => {},
      getMapleTvQueue: (): any[] => [],
      getUserPool: (): any => ({ getUserByCharacterName: (): undefined => undefined }),
    };
    const user: any = {
      getHp: (): number => 100,
      getCharacterName: (): string => 'Sender',
      getAvatarLook: (): any => fakeAvatarLook(),
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => field,
      write: (): void => {},
      dispose: (): void => { disposed++; },
    };

    MapleTvHandler.handleMapleTvSendMessageRequest(user, new PacketReader(tvPacket(TV_ITEM_ID, 0, ['msg', '', '', '', ''])));
    expect(disposed).to.equal(1);
  });

  it('should dispose when hp <= 0', () => {
    let disposed = 0;
    const user: any = {
      getHp: (): number => 0,
      dispose: (): void => { disposed++; },
    };

    MapleTvHandler.handleMapleTvSendMessageRequest(user, new PacketReader(tvPacket(TV_ITEM_ID, 0, ['msg', '', '', '', ''])));
    expect(disposed).to.equal(1);
  });
});
