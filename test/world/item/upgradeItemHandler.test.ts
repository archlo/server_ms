import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { EquipData } from '../../../src/world/item/EquipData';
import { UpgradeItemHandler } from '../../../src/world/item/UpgradeItemHandler';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { ItemInfoType } from '../../../src/provider/item/ItemInfoType';

const SCROLL_ITEM_ID = 2046000;
const HYPER_SCROLL_ID = 2049300;
const OPTION_SCROLL_ID = 2049400;
const RELEASE_ITEM_ID = 2460000;
const EQUIP_ITEM_ID = 1000000;

describe('world/item/UpgradeItemHandler.ts', () => {
  let originalGetItemInfo: typeof ItemProvider.getItemInfo;

  before(() => {
    originalGetItemInfo = ItemProvider.getItemInfo;
  });

  afterEach(() => {
    ItemProvider.getItemInfo = originalGetItemInfo;
  });

  // ------ Regular scroll tests ------

  it('should apply scroll stats and consume on success', () => {
    const scroll = new Item(ItemType.BUNDLE);
    scroll.itemId = SCROLL_ITEM_ID;
    scroll.quantity = 1;

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = EQUIP_ITEM_ID;
    equip.itemSn = 100n;
    equip.equipData = new EquipData();
    equip.equipData.ruc = 7;

    const im = new InventoryManager();
    im.consumeInventory.putItem(1, scroll);
    im.equipInventory.putItem(2, equip);

    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id === SCROLL_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.success, 100], [ItemInfoType.incSTR, 5]]), new Map());
      if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.reqLevel, 10]]), new Map());
      return undefined;
    };

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({ broadcastPacket: (): void => {} }),
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));

    expect(disposed).to.equal(0);
    expect(im.consumeInventory.getItem(1)).to.equal(undefined);
    expect(equip.equipData!.cuc).to.equal(1);
    expect(equip.equipData!.ruc).to.equal(6);
    expect(equip.equipData!.incStr).to.equal(5);
    expect(writes.length).to.equal(3);
    expect(writes[2].readInt16LE(0)).to.equal(MapleSendOpcode.USER_ITEM_UPGRADE_EFFECT.code);
  });

  it('should decrement ruc without stat change on failure', () => {
    const scroll = new Item(ItemType.BUNDLE);
    scroll.itemId = SCROLL_ITEM_ID;
    scroll.quantity = 1;

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = EQUIP_ITEM_ID;
    equip.itemSn = 100n;
    equip.equipData = new EquipData();
    equip.equipData.ruc = 7;

    const im = new InventoryManager();
    im.consumeInventory.putItem(1, scroll);
    im.equipInventory.putItem(2, equip);

    let callCount = 0;
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id === SCROLL_ITEM_ID) {
        callCount++;
        return new ItemInfo(id, new Map([[ItemInfoType.success, 0], [ItemInfoType.cursed, 0]]), new Map());
      }
      if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.reqLevel, 10]]), new Map());
      return undefined;
    };

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({ broadcastPacket: (): void => {} }),
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));

    expect(disposed).to.equal(0);
    expect(equip.equipData!.cuc).to.equal(0);
    expect(equip.equipData!.ruc).to.equal(6);
    expect(equip.equipData!.incStr).to.equal(0);
  });

  it('should set ruc to 0 on cursed failure', () => {
    const scroll = new Item(ItemType.BUNDLE);
    scroll.itemId = SCROLL_ITEM_ID;
    scroll.quantity = 1;

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = EQUIP_ITEM_ID;
    equip.itemSn = 100n;
    equip.equipData = new EquipData();
    equip.equipData.ruc = 7;

    const im = new InventoryManager();
    im.consumeInventory.putItem(1, scroll);
    im.equipInventory.putItem(2, equip);

    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id === SCROLL_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.success, 0], [ItemInfoType.cursed, 100]]), new Map());
      if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.reqLevel, 10]]), new Map());
      return undefined;
    };

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({ broadcastPacket: (): void => {} }),
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));

    expect(disposed).to.equal(0);
    expect(equip.equipData!.ruc).to.equal(0);
    expect(equip.equipData!.cuc).to.equal(0);
  });

  it('should send enchant error when no remaining upgrades', () => {
    const scroll = new Item(ItemType.BUNDLE);
    scroll.itemId = SCROLL_ITEM_ID;
    scroll.quantity = 1;

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = EQUIP_ITEM_ID;
    equip.itemSn = 100n;
    equip.equipData = new EquipData();
    equip.equipData.ruc = 0;

    const im = new InventoryManager();
    im.consumeInventory.putItem(1, scroll);
    im.equipInventory.putItem(2, equip);

    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id === SCROLL_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.success, 100]]), new Map());
      if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map(), new Map());
      return undefined;
    };

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({ broadcastPacket: (): void => {} }),
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));

    expect(disposed).to.equal(1);
    expect(writes.length).to.equal(1);
    expect(writes[0].readInt16LE(0)).to.equal(MapleSendOpcode.USER_ITEM_UPGRADE_EFFECT.code);
  });

  // ------ Hyper upgrade scroll tests ------

  it('should apply hyper upgrade stats and increment chuc on success', () => {
    const scroll = new Item(ItemType.BUNDLE);
    scroll.itemId = HYPER_SCROLL_ID;
    scroll.quantity = 1;

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = EQUIP_ITEM_ID;
    equip.itemSn = 100n;
    equip.equipData = new EquipData();
    equip.equipData.ruc = 7;
    equip.equipData.incStr = 50;

    const im = new InventoryManager();
    im.consumeInventory.putItem(1, scroll);
    im.equipInventory.putItem(2, equip);

    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map(), new Map());
      return undefined;
    };

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({ broadcastPacket: (): void => {} }),
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserHyperUpgradeItemUseRequest(user, new PacketReader(hyperScrollPacket(1, HYPER_SCROLL_ID, 2, EQUIP_ITEM_ID, false)));

    expect(disposed).to.equal(0);
    expect(im.consumeInventory.getItem(1)).to.equal(undefined);
    expect(equip.equipData!.ruc).to.equal(6);
    expect(equip.equipData!.chuc).to.equal(1);
    expect(equip.equipData!.incStr).to.be.greaterThan(50);
  });

  // ------ Potential scroll tests ------

  it('should set grade to RARE on potential scroll success', () => {
    let rare = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const scroll = new Item(ItemType.BUNDLE);
      scroll.itemId = OPTION_SCROLL_ID;
      scroll.quantity = 1;

      const equip = new Item(ItemType.EQUIP);
      equip.itemId = EQUIP_ITEM_ID;
      equip.itemSn = BigInt(100 + attempt);
      equip.equipData = new EquipData();
      equip.equipData.ruc = 7;

      const im = new InventoryManager();
      im.consumeInventory.putItem(1, scroll);
      im.equipInventory.putItem(2, equip);

      ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
        if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map(), new Map());
        return undefined;
      };

      let disposed = 0;
      const user: any = {
        getCharacterId: (): number => 7,
        getHp: (): number => 100,
        getInventoryManager: (): InventoryManager => im,
        getField: (): any => ({ broadcastPacket: (): void => {} }),
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      UpgradeItemHandler.handleUserItemOptionUpgradeItemUseRequest(user, new PacketReader(hyperScrollPacket(1, OPTION_SCROLL_ID, 2, EQUIP_ITEM_ID, false)));

      expect(disposed).to.equal(0);
      expect(im.consumeInventory.getItem(1)).to.equal(undefined);
      expect(equip.equipData!.ruc).to.equal(6);

      if ((equip.equipData!.grade & 3) === 1) {
        rare = true;
        break;
      }
    }
    expect(rare).to.be.true;
  });

  // ------ Release (magnifying glass) tests ------

  it('should set RELEASED flag on identified equip', () => {
    const glass = new Item(ItemType.BUNDLE);
    glass.itemId = RELEASE_ITEM_ID;
    glass.quantity = 1;

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = EQUIP_ITEM_ID;
    equip.itemSn = 100n;
    equip.equipData = new EquipData();
    equip.equipData.grade = 0;

    const im = new InventoryManager();
    im.consumeInventory.putItem(1, glass);
    im.equipInventory.putItem(2, equip);

    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id === EQUIP_ITEM_ID) return new ItemInfo(id, new Map([[ItemInfoType.reqLevel, 10]]), new Map());
      return undefined;
    };

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({ broadcastPacket: (): void => {} }),
      write: (p: Buffer): void => { writes.push(p); },
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserItemReleaseRequest(user, new PacketReader(releasePacket(1, RELEASE_ITEM_ID, 100n)));

    expect(disposed).to.equal(0);
    expect(im.consumeInventory.getItem(1)).to.equal(undefined);
    expect(equip.equipData!.grade & 4).to.equal(4); // RELEASED flag
  });

  // ------ Edge cases ------

  it('should dispose when hp <= 0', () => {
    let disposed = 0;
    const user: any = {
      getHp: (): number => 0,
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));
    expect(disposed).to.equal(1);
  });

  it('should dispose when scroll not in inventory', () => {
    const im = new InventoryManager();
    let disposed = 0;
    const user: any = {
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(99, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));
    expect(disposed).to.equal(1);
  });

  it('should dispose when equip not found at given position', () => {
    const scroll = new Item(ItemType.BUNDLE);
    scroll.itemId = SCROLL_ITEM_ID;
    scroll.quantity = 1;
    const im = new InventoryManager();
    im.consumeInventory.putItem(1, scroll);

    let disposed = 0;
    const user: any = {
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, SCROLL_ITEM_ID, 2, EQUIP_ITEM_ID)));
    expect(disposed).to.equal(1);
  });

  it('should dispose for non-upgrade item type', () => {
    const im = new InventoryManager();
    let disposed = 0;
    const user: any = {
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      dispose: (): void => { disposed++; },
    };

    UpgradeItemHandler.handleUserUpgradeItemUseRequest(user, new PacketReader(scrollPacket(1, 2000000, 2, EQUIP_ITEM_ID)));
    expect(disposed).to.equal(1);
  });
});

function scrollPacket(position: number, itemId: number, equipPos: number, equipItemId: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(0); // update_time
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeShort(equipPos);
  w.writeInt(equipItemId);
  return w.getPacket();
}

function hyperScrollPacket(position: number, itemId: number, equipPos: number, equipItemId: number, whiteScroll: boolean): Buffer {
  const w = new PacketWriter();
  w.writeInt(0); // update_time
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeShort(equipPos);
  w.writeInt(equipItemId);
  w.writeBoolean(whiteScroll);
  return w.getPacket();
}

function releasePacket(position: number, itemId: number, itemSn: bigint): Buffer {
  const w = new PacketWriter();
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeLong(itemSn);
  return w.getPacket();
}
