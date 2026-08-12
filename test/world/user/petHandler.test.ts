import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { PetData } from '../../../src/world/item/PetData';
import { DropLeaveType } from '../../../src/world/field/drop/DropLeaveType';
import { Pet } from '../../../src/world/user/Pet';
import { PetHandler } from '../../../src/world/user/PetHandler';

describe('world/user/PetHandler.ts', () => {
  it('should activate and deactivate pet items', () => {
    const item = new Item(ItemType.PET);
    item.itemId = 5000000;
    item.itemSn = 9876n;
    item.petData = PetData.from({ itemId: item.itemId } as any, 'Bean');
    item.petData.exceptionList = [4000000, 4000001];

    let activeSn = 0n;
    const writes: Buffer[] = [];
    const broadcasts: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 8,
      getX: (): number => 20,
      getY: (): number => 30,
      getPetIndex: (sn: bigint): number | null => activeSn === sn ? 0 : null,
      getInventoryManager: (): any => ({
        cashInventory: {
          getItem: (position: number): Item | undefined => position === 2 ? item : undefined,
          getItems: (): Map<number, Item> => new Map(),
        },
      }),
      getPets: (): Pet[] => [],
      getField: (): any => ({
        getMapInfo: (): any => ({ getFootholdBelow: (): any => ({ sn: 3 }) }),
        broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      }),
      setPet: (pet: Pet, index: number): boolean => {
        activeSn = pet.getItemSn();
        expect(index).to.equal(0);
        return true;
      },
      removePet: (index: number): boolean => {
        expect(index).to.equal(0);
        activeSn = 0n;
        return true;
      },
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    PetHandler.handleUserActivatePetRequest(user, new PacketReader(activatePetPacket(2)));

    expect(activeSn).to.equal(9876n);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.PET_ACTIVATED.code);
    expect(writes[0].readInt16LE(0)).to.equal(MapleSendOpcode.PET_LOAD_EXCEPTION_LIST.code);
    expect(writes[0].readUInt8(15)).to.equal(2);
    expect(writes[0].readInt32LE(16)).to.equal(4000000);
    expect(writes[0].readInt32LE(20)).to.equal(4000001);
    expect(disposed).to.equal(1);

    PetHandler.handleUserActivatePetRequest(user, new PacketReader(activatePetPacket(2)));

    expect(activeSn).to.equal(0n);
    expect(broadcasts[1].readInt16LE(0)).to.equal(MapleSendOpcode.PET_ACTIVATED.code);
    expect(disposed).to.equal(2);
  });

  it('should apply pet movement and broadcast it', () => {
    const item = new Item(ItemType.PET);
    item.itemId = 5000000;
    item.itemSn = 1234n;
    item.petData = PetData.from({ itemId: item.itemId } as any, 'Bean');

    const broadcasts: Buffer[] = [];
    const user: any = {
      getCharacterId: (): number => 7,
      getPetIndex: (sn: bigint): number | null => sn === 1234n ? 0 : null,
      getField: (): any => ({
        broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      }),
    };
    const pet = Pet.from(user, item);
    user.getPet = (index: number): Pet | null => index === 0 ? pet : null;

    PetHandler.handlePetMove(user, new PacketReader(petMovePacket(1234n)));

    expect(pet.getX()).to.equal(300);
    expect(pet.getY()).to.equal(400);
    expect(pet.getFoothold()).to.equal(12);
    expect(pet.getMoveAction()).to.equal(3);
    expect(broadcasts.length).to.equal(1);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.PET_MOVE.code);
  });

  it('should pick up drops by pet index', () => {
    const drop = { id: 99 };
    let pickedUp: [any, any, DropLeaveType, number] | undefined;
    const user: any = {
      getPetIndex: (sn: bigint): number | null => sn === 1234n ? 1 : null,
      getFieldKey: (): number => 7,
      getField: (): any => ({
        getDropPool: (): any => ({
          getById: (id: number): any => id === 99 ? drop : undefined,
          pickUpDrop: (u: any, d: any, leaveType: DropLeaveType, petIndex: number): void => {
            pickedUp = [u, d, leaveType, petIndex];
          },
        }),
      }),
    };

    PetHandler.handlePetDropPickUpRequest(user, new PacketReader(petDropPickUpPacket(1234n, 7, 99)));

    expect(pickedUp?.[0]).to.equal(user);
    expect(pickedUp?.[1]).to.equal(drop);
    expect(pickedUp?.[2]).to.equal(DropLeaveType.PICKED_UP_BY_PET);
    expect(pickedUp?.[3]).to.equal(1);
  });

  it('should update a pet pickup exception list', () => {
    const im = new InventoryManager();
    const item = new Item(ItemType.PET);
    item.itemId = 5000000;
    item.itemSn = 5555n;
    item.petData = PetData.from({ itemId: item.itemId } as any, 'Bean');
    im.cashInventory.putItem(4, item);

    const writes: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 12,
      getPetIndex: (sn: bigint): number | null => sn === 5555n ? 0 : null,
      getInventoryManager: (): InventoryManager => im,
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    PetHandler.handlePetUpdateExceptionListRequest(user, new PacketReader(updateExceptionListPacket(5555n, [4001000, 4001001])));

    expect(disposed).to.equal(0);
    expect(item.petData.exceptionList).to.deep.equal([4001000, 4001001]);
    expect(writes.length).to.equal(1);
    expect(writes[0].readInt16LE(0)).to.equal(MapleSendOpcode.PET_LOAD_EXCEPTION_LIST.code);
    expect(writes[0].readUInt8(15)).to.equal(2);
    expect(writes[0].readInt32LE(16)).to.equal(4001000);
    expect(writes[0].readInt32LE(20)).to.equal(4001001);
  });
});

function activatePetPacket(position: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(0); // update_time
  w.writeShort(position);
  w.writeBoolean(false); // bBossPet
  return w.getPacket();
}

function petMovePacket(petSn: bigint): Buffer {
  const w = new PacketWriter();
  w.writeLong(petSn);
  w.writeShort(0); // start x
  w.writeShort(0); // start y
  w.writeShort(0); // vx
  w.writeShort(0); // vy
  w.writeByte(1);  // one move elem
  w.writeByte(3);  // TELEPORT
  w.writeShort(300);
  w.writeShort(400);
  w.writeShort(12);
  w.writeByte(3);  // move action
  w.writeShort(120);
  return w.getPacket();
}

function petDropPickUpPacket(petSn: bigint, fieldKey: number, objectId: number): Buffer {
  const w = new PacketWriter();
  w.writeLong(petSn);
  w.writeByte(fieldKey);
  w.writeInt(0); // update_time
  w.writeShort(100);
  w.writeShort(200);
  w.writeInt(objectId);
  w.writeInt(0); // crc
  w.writeByte(0); // pickup others
  w.writeByte(0); // sweep for drop
  w.writeByte(0); // long range
  return w.getPacket();
}

function updateExceptionListPacket(petSn: bigint, itemIds: number[]): Buffer {
  const w = new PacketWriter();
  w.writeLong(petSn);
  w.writeByte(itemIds.length);
  for (const itemId of itemIds) w.writeInt(itemId);
  return w.getPacket();
}
