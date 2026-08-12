import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Item } from '../item/Item';
import { ItemType } from '../item/ItemType';
import { Life } from '../field/life/Life';
import { User } from './User';

export class Pet extends Life {
  constructor(
    private readonly owner: User,
    private readonly item: Item,
  ) {
    super();
    if (item.itemType !== ItemType.PET || !item.petData) {
      throw new Error('Pet requires a pet item with PetData');
    }
  }

  getOwner(): User { return this.owner; }
  getItem(): Item { return this.item; }
  getItemSn(): bigint { return this.item.itemSn; }
  getTemplateId(): number { return this.item.itemId; }
  getName(): string { return this.item.petData?.petName ?? ''; }
  getLevel(): number { return this.item.petData?.level ?? 0; }
  getTameness(): number { return this.item.petData?.tameness ?? 0; }
  getFullness(): number { return this.item.petData?.fullness ?? 0; }
  getPetSkill(): number { return this.item.petData?.petSkill ?? 0; }
  getExceptionList(): number[] { return this.item.petData?.exceptionList ?? []; }
  getPetIndex(): number { return this.owner.getPetIndex(this.getItemSn()) ?? 0; }

  getPetWear(): number {
    for (const [, cashItem] of this.owner.getInventoryManager().cashInventory.getItems()) {
      if (Math.floor(cashItem.itemId / 10000) === 181 && cashItem.petData?.petName === this.getName()) {
        return cashItem.itemId;
      }
    }
    return 0;
  }
  getNameTag(): boolean { return this.getPetWear() !== 0; }
  getChatBalloon(): boolean { return false; }

  setPosition(field: any, x: number, y: number): void {
    this.setField(field);
    this.setX(x);
    this.setY(y);
    const foothold = field?.getMapInfo?.().getFootholdBelow?.(x, y);
    this.setFoothold(foothold?.sn ?? 0);
  }

  encode(w: PacketWriter): void {
    w.writeInt(this.getTemplateId());
    w.writeMapleAsciiString(this.getName());
    w.writeLong(this.getItemSn());
    w.writeShort(this.getX());
    w.writeShort(this.getY());
    w.writeByte(this.getMoveAction());
    w.writeShort(this.getFoothold());
    w.writeBoolean(this.getNameTag());
    w.writeBoolean(this.getChatBalloon());
  }

  static from(user: User, item: Item): Pet {
    return new Pet(user, item);
  }
}
