import { expect } from 'chai';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { ItemSpecType } from '../../../src/provider/item/ItemSpecType';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemHandler } from '../../../src/world/item/ItemHandler';
import { ItemType } from '../../../src/world/item/ItemType';
import { PetData } from '../../../src/world/item/PetData';
import { Pet } from '../../../src/world/user/Pet';

describe('world/item/ItemHandler.ts pet food', () => {
  const originalGetItemInfo = ItemProvider.getItemInfo;

  afterEach(() => {
    ItemProvider.getItemInfo = originalGetItemInfo;
  });

  it('should consume pet food and update the hungriest active pet', () => {
    const foodItemId = 2120000;
    ItemProvider.getItemInfo = (itemId: number): ItemInfo | undefined => {
      if (itemId !== foodItemId) return undefined;
      return new ItemInfo(itemId, new Map(), new Map([[ItemSpecType.inc, 30]]));
    };

    const im = new InventoryManager();
    const food = new Item(ItemType.BUNDLE);
    food.itemId = foodItemId;
    food.quantity = 1;
    im.consumeInventory.putItem(1, food);

    const petItem = new Item(ItemType.PET);
    petItem.itemId = 5000000;
    petItem.itemSn = 1234n;
    petItem.petData = PetData.from({ itemId: petItem.itemId } as any, 'Bean');
    petItem.petData.fullness = 50;
    petItem.petData.tameness = 0;
    im.cashInventory.putItem(2, petItem);

    const writes: Buffer[] = [];
    const broadcasts: Buffer[] = [];
    let disposed = 0;
    const user: any = {
      getCharacterId: (): number => 7,
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getPetIndex: (sn: bigint): number | null => sn === 1234n ? 0 : null,
      getField: (): any => ({
        broadcastPacket: (packet: Buffer): void => { broadcasts.push(packet); },
      }),
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };
    const pet = Pet.from(user, petItem);
    user.getPets = (): Pet[] => [pet];

    ItemHandler.handleUserPetFoodItemUseRequest(user, new PacketReader(petFoodPacket(1, foodItemId)));

    expect(disposed).to.equal(0);
    expect(im.consumeInventory.getItem(1)).to.equal(undefined);
    expect(petItem.petData.fullness).to.equal(80);
    expect(petItem.petData.tameness).to.equal(1);
    expect(writes.length).to.equal(2);
    expect(broadcasts.length).to.equal(1);
    expect(broadcasts[0].readInt16LE(0)).to.equal(MapleSendOpcode.PET_ACTION_COMMAND.code);
  });
});

function petFoodPacket(position: number, itemId: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(0); // update_time
  w.writeShort(position);
  w.writeInt(itemId);
  return w.getPacket();
}
