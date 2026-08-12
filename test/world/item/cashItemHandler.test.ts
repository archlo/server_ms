import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { CashItemHandler } from '../../../src/world/item/CashItemHandler';
import { CashItemPacket } from '../../../src/world/item/CashItemPacket';
import { ItemType } from '../../../src/world/item/ItemType';
import { ItemAttribute } from '../../../src/world/item/ItemAttribute';
import { EquipData } from '../../../src/world/item/EquipData';
import { PetData } from '../../../src/world/item/PetData';
import { CharacterStat } from '../../../src/world/user/stat/CharacterStat';

describe('world/item/CashItemHandler.ts', () => {
  it('should consume a weather effect item and broadcast blowWeather', () => {
    const itemId = 5160000;
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.cashInventory.putItem(1, item);

    const writes: Buffer[] = [];
    const broadcasts: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getCharacterName: (): string => 'Tester',
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({
        broadcastPacket: (packet: Buffer, except?: any): void => { broadcasts.push(packet); },
        blowWeather: (iid: number, msg?: string, duration?: number): void => {
          broadcasts.push(CashItemPacket.blowWeather(iid, msg));
        },
      }),
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacketWithString(1, itemId, 'It is raining')));

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(writes.length).to.equal(1);
    expect(broadcasts.length).to.equal(1);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.BLOW_WEATHER.code);
  });

  it('should change pet name when using pet name change item', () => {
    const itemId = 5040000;
    const im = new InventoryManager();
    const cashItem = new Item(ItemType.BUNDLE);
    cashItem.itemId = itemId;
    cashItem.quantity = 1;
    im.cashInventory.putItem(1, cashItem);

    const petItem = new Item(ItemType.PET);
    petItem.itemId = 5000000;
    petItem.itemSn = 1234n;
    petItem.petData = PetData.from({} as any, 'OldName');
    im.cashInventory.putItem(2, petItem);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithString(1, itemId, 'NewName'));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(petItem.petData!.petName).to.equal('NewName');
    expect(writes.length).to.equal(2);
  });

  it('should dispose when pet name is too short', () => {
    const itemId = 5040000;
    const im = new InventoryManager();
    const cashItem = new Item(ItemType.BUNDLE);
    cashItem.itemId = itemId;
    cashItem.quantity = 1;
    im.cashInventory.putItem(1, cashItem);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithString(1, itemId, 'AB'));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);
    expect(disposed).to.equal(1);
    expect(im.cashInventory.getItem(1)).to.not.equal(undefined);
  });

  it('should change face with color lens', () => {
    const itemId = 5150000;
    const initialFace = 10000;
    const newFace = 20000;
    const cs = new CharacterStat();
    cs.face = initialFace;
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.cashInventory.putItem(1, item);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getCharacterStat: (): CharacterStat => cs,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithInt(1, itemId, newFace));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(cs.face).to.equal(newFace);
    expect(writes.length).to.equal(2);
  });

  it('should give 1 AP when using AP reset item', () => {
    const itemId = 5080000;
    const cs = new CharacterStat();
    cs.ap = 0;
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.cashInventory.putItem(1, item);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getCharacterStat: (): CharacterStat => cs,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacket(1, itemId)));

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(cs.ap).to.equal(1);
  });

  it('should give 1 SP when using SP reset item', () => {
    const itemId = 5080001;
    const cs = new CharacterStat();
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.cashInventory.putItem(1, item);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getCharacterStat: (): CharacterStat => cs,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacket(1, itemId)));

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(cs.sp.getNonExtendSp()).to.equal(1);
  });

  it('should broadcast setActiveEffectItem for effect items', () => {
    const itemId = 5010000;
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.cashInventory.putItem(1, item);

    const writes: Buffer[] = [];
    const broadcasts: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({
        broadcastPacket: (packet: Buffer, except?: any): void => { broadcasts.push(packet); },
      }),
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacket(1, itemId)));

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(broadcasts.length).to.equal(1);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.USER_SET_ACTIVE_EFFECT_ITEM.code);
  });

  it('should dispose for unrecognized cash item type', () => {
    const itemId = 5999999;
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.cashInventory.putItem(1, item);

    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (): void => {},
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacket(1, itemId)));
    expect(disposed).to.equal(1);
  });

  it('should dispose when item not in inventory at given position', () => {
    const im = new InventoryManager();
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (): void => {},
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacket(99, 5160000)));
    expect(disposed).to.equal(1);
  });

  it('should dispose when user hp <= 0', () => {
    let disposed = 0;
    const user: any = {
      getHp: (): number => 0,
      dispose: (): void => { disposed++; },
    };

    CashItemHandler.handleUserConsumeCashItemUseRequest(user, new PacketReader(cashItemPacket(1, 5160000)));
    expect(disposed).to.equal(1);
  });

  it('should set KARMA flag on target equip when using karma scissors', () => {
    const scissorsId = 5110000;
    const equipPos = -1;
    const im = new InventoryManager();
    const scissors = new Item(ItemType.BUNDLE);
    scissors.itemId = scissorsId;
    scissors.quantity = 1;
    im.cashInventory.putItem(1, scissors);

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = 1000000;
    equip.equipData = new EquipData();
    equip.attribute = 0;
    im.equipped.putItem(equipPos, equip);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithShort(1, scissorsId, equipPos));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(equip.hasAttribute(ItemAttribute.KARMA)).to.equal(true);
    expect(writes.length).to.equal(2);
  });

  it('should increment iuc and ruc on target equip when using vicious hammer', () => {
    const hammerId = 5100000;
    const equipPos = 5;
    const im = new InventoryManager();
    const hammer = new Item(ItemType.BUNDLE);
    hammer.itemId = hammerId;
    hammer.quantity = 1;
    im.cashInventory.putItem(1, hammer);

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = 1000000;
    const ed = new EquipData();
    ed.iuc = 0;
    ed.cuc = 0;
    ed.ruc = 2;
    equip.equipData = ed;
    im.equipInventory.putItem(equipPos, equip);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithShort(1, hammerId, equipPos));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);

    expect(disposed).to.equal(0);
    expect(im.cashInventory.getItem(1)).to.equal(undefined);
    expect(ed.iuc).to.equal(1);
    expect(ed.ruc).to.equal(3);
    expect(writes.length).to.equal(2);
  });

  it('should dispose for vicious hammer when cuc + iuc >= 10', () => {
    const hammerId = 5100000;
    const equipPos = 5;
    const im = new InventoryManager();
    const hammer = new Item(ItemType.BUNDLE);
    hammer.itemId = hammerId;
    hammer.quantity = 1;
    im.cashInventory.putItem(1, hammer);

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = 1000000;
    const ed = new EquipData();
    ed.iuc = 5;
    ed.cuc = 5;
    equip.equipData = ed;
    im.equipInventory.putItem(equipPos, equip);

    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (): void => {},
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithShort(1, hammerId, equipPos));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);

    expect(disposed).to.equal(1);
    expect(im.cashInventory.getItem(1)).to.not.equal(undefined);
  });

  it('should dispose for karma scissors when equip has no equipData', () => {
    const scissorsId = 5110000;
    const im = new InventoryManager();
    const scissors = new Item(ItemType.BUNDLE);
    scissors.itemId = scissorsId;
    scissors.quantity = 1;
    im.cashInventory.putItem(1, scissors);

    const equip = new Item(ItemType.EQUIP);
    equip.itemId = 1000000;
    equip.equipData = null;
    im.equipInventory.putItem(5, equip);

    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => null,
      write: (): void => {},
      dispose: (): void => { disposed++; },
    };

    const packet = new PacketReader(cashItemPacketWithShort(1, scissorsId, 5));
    CashItemHandler.handleUserConsumeCashItemUseRequest(user, packet);

    expect(disposed).to.equal(1);
  });
});

function cashItemPacket(position: number, itemId: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(position);
  w.writeInt(itemId);
  return w.getPacket();
}

function cashItemPacketWithString(position: number, itemId: number, str: string): Buffer {
  const w = new PacketWriter();
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeMapleAsciiString(str);
  return w.getPacket();
}

function cashItemPacketWithInt(position: number, itemId: number, value: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeInt(value);
  return w.getPacket();
}

function cashItemPacketWithShort(position: number, itemId: number, value: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(position);
  w.writeInt(itemId);
  w.writeShort(value);
  return w.getPacket();
}
