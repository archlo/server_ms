import { PacketReader } from '../../protocol/packets/packetReader';
import { MovePath } from '../field/life/MovePath';
import { DropLeaveType } from '../field/drop/DropLeaveType';
import { InventoryType } from '../item/InventoryType';
import { InventoryOperation } from '../item/InventoryOperation';
import { inventoryOperation } from '../item/ItemPacket';
import { ItemType } from '../item/ItemType';
import { User } from './User';
import { Pet } from './Pet';
import { PetPacket } from './PetPacket';
import { PetInteraction } from '../../provider/item/PetInteraction';

export class PetHandler {
  static handleUserActivatePetRequest(user: User, r: PacketReader): void {
    r.readInt();
    const position = r.readShort();
    r.readBoolean();

    const item = user.getInventoryManager().cashInventory.getItem(position);
    if (!item || item.itemType !== ItemType.PET || !item.petData) {
      user.dispose();
      return;
    }

    const petIndex = user.getPetIndex(item.itemSn);
    if (petIndex === null) {
      const pet = Pet.from(user, item);
      pet.setPosition(user.getField(), user.getX(), user.getY());
      const freeSlot = user.getPets().length;
      user.setPet(pet, freeSlot);
      user.getField()?.broadcastPacket(PetPacket.petActivated(user, pet));
      user.write(PetPacket.petLoadExceptionList(user, pet.getPetIndex(), pet.getItemSn(), pet.getExceptionList()));
    } else {
      if (!user.removePet(petIndex)) {
        user.dispose();
        return;
      }
      user.getField()?.broadcastPacket(PetPacket.petDeactivated(user, petIndex, 0));
    }

    user.dispose();
  }

  static handleUserDestroyPetItemRequest(user: User, r: PacketReader): void {
    r.readInt();
    const petSn = r.readLong();
    const im = user.getInventoryManager();
    const itemEntry = im.getItemBySn(InventoryType.CASH, petSn);
    if (!itemEntry) {
      user.dispose();
      return;
    }
    const [position, petItem] = itemEntry;
    const removeOp = im.removeItemAt(position, petItem);
    if (!removeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(removeOp, true));
  }

  static handlePetMove(user: User, r: PacketReader): void {
    const petSn = r.readLong();
    const petIndex = user.getPetIndex(petSn);
    if (petIndex === null) return;

    const pet = user.getPet(petIndex);
    if (!pet) return;

    const movePath = MovePath.decode(r);
    movePath.applyTo(pet);
    user.getField()?.broadcastPacket(PetPacket.petMove(user, petIndex, movePath), user);
  }

  static handlePetAction(user: User, r: PacketReader): void {
    const petSn = r.readLong();
    r.readInt();
    const type = r.readByte();
    const action = r.readByte();
    const chat = r.readMapleAsciiString();

    const petIndex = user.getPetIndex(petSn);
    if (petIndex === null) return;

    const pet = user.getPet(petIndex);
    if (!pet) return;

    user.getField()?.broadcastPacket(PetPacket.petAction(user, petIndex, type, action, chat, pet.getChatBalloon()), user);
  }

  static handlePetInteractionRequest(user: User, r: PacketReader): void {
    const petSn = r.readLong();
    r.readInt();
    const position = r.readShort();
    const itemId = r.readInt();

    const petIndex = user.getPetIndex(petSn);
    if (petIndex === null) return;

    const im = user.getInventoryManager();
    const item = im.cashInventory.getItem(position);
    if (!item || item.itemId !== itemId) {
      user.dispose();
      return;
    }

    const petEntry = im.getItemBySn(InventoryType.CASH, petSn);
    const petData = petEntry?.[1].petData;
    if (!petData) return;

    const interaction = PetInteraction.fromItemId(itemId);
    if (!interaction) return;

    if (petData.level < interaction.levelMin || petData.level > interaction.levelMax) return;
    if (Math.random() >= interaction.prop) return;

    petData.tameness = Math.min(30000, petData.tameness + interaction.incTameness);

    const consumeOp = im.removeItemAt(position, item, 1);
    if (!consumeOp) return;
    user.write(inventoryOperation(consumeOp, true));
  }

  static handlePetDropPickUpRequest(user: User, r: PacketReader): void {
    const petSn = r.readLong();
    const petIndex = user.getPetIndex(petSn);
    if (petIndex === null) return;

    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) return;

    r.readInt();
    r.readShort();
    r.readShort();
    const objectId = r.readInt();
    r.readInt();
    r.readByte();
    const bSweepForDrop = r.readByte();
    const bLongRange = r.readByte();

    const field = user.getField();
    if (!field) return;

    const dropPool = field.getDropPool();

    if (bSweepForDrop) {
      const drops = dropPool.getAll();
      for (let i = drops.length - 1; i >= 0; i--) {
        dropPool.pickUpDrop(user, drops[i], DropLeaveType.PICKED_UP_BY_PET, petIndex);
      }
      return;
    }

    const drop = dropPool.getById(objectId);
    if (!drop) return;

    dropPool.pickUpDrop(user, drop, DropLeaveType.PICKED_UP_BY_PET, petIndex);
  }

  static handlePetUpdateExceptionListRequest(user: User, r: PacketReader): void {
    const petSn = r.readLong();
    const petIndex = user.getPetIndex(petSn);
    if (petIndex === null) {
      user.dispose();
      return;
    }

    const petEntry = user.getInventoryManager().getItemBySn(InventoryType.CASH, petSn);
    const petData = petEntry?.[1].petData;
    if (!petData) {
      user.dispose();
      return;
    }

    const count = Math.min(r.readUByte(), 100);
    const exceptionList: number[] = [];
    for (let i = 0; i < count; i++) {
      exceptionList.push(r.readInt());
    }
    petData.exceptionList = exceptionList;

    user.write(PetPacket.petLoadExceptionList(user, petIndex, petSn, exceptionList));
  }
}
