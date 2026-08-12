import { PacketWriter } from '../../protocol/packets/packetWriter';
import { PacketReader } from '../../protocol/packets/packetReader';
import { CharacterStat } from './stat/CharacterStat';
import { Inventory } from '../item/Inventory';
import { BodyPart } from '../item/BodyPart';

export class AvatarLook {
  constructor(
    public readonly gender: number,
    public readonly skin: number,
    public readonly hair: number,
    public readonly face: number,
    public readonly hairEquip: Map<number, number>,   // bodyPart -> itemId
    public readonly unseenEquip: Map<number, number>, // bodyPart -> itemId
    public readonly weaponStickerId: number,
    public readonly petIds: [number, number, number],
  ) {}

  encode(w: PacketWriter): void {
    w.writeByte(this.gender);
    w.writeByte(this.skin);
    w.writeInt(this.face);
    w.writeByte(0); // anHairEquip sentinel start
    w.writeInt(this.hair);
    for (const [part, itemId] of this.hairEquip) {
      w.writeByte(part);
      w.writeInt(itemId);
    }
    w.writeByte(-1);
    for (const [part, itemId] of this.unseenEquip) {
      w.writeByte(part);
      w.writeInt(itemId);
    }
    w.writeByte(-1);
    w.writeInt(this.weaponStickerId);
    for (const petId of this.petIds) w.writeInt(petId);
  }

  static decode(r: PacketReader): AvatarLook {
    const gender = r.readByte();
    const skin   = r.readByte();
    const face   = r.readInt();
    r.readByte(); // 0
    const hair   = r.readInt();
    const hairEquip = new Map<number, number>();
    let bodyPart = r.readByte();
    while (bodyPart !== -1) {
      hairEquip.set(bodyPart, r.readInt());
      bodyPart = r.readByte();
    }
    const unseenEquip = new Map<number, number>();
    let unseenPart = r.readByte();
    while (unseenPart !== -1) {
      unseenEquip.set(unseenPart, r.readInt());
      unseenPart = r.readByte();
    }
    const weaponStickerId = r.readInt();
    const petIds: [number, number, number] = [r.readInt(), r.readInt(), r.readInt()];
    return new AvatarLook(gender, skin, hair, face, hairEquip, unseenEquip, weaponStickerId, petIds);
  }

  static from(cs: CharacterStat, equipped: Inventory, cashInventory: Inventory): AvatarLook {
    const HAIR_VAL  = BodyPart.HAIR as number;
    const END_VAL   = BodyPart.EQUIPPED_END as number;
    const CASH_BASE = BodyPart.CASH_BASE as number;
    const CASH_END  = BodyPart.CASH_END as number;
    const CASH_WPN  = BodyPart.CASH_WEAPON as number;

    const hairEquip = new Map<number, number>();
    for (const [bp, item] of equipped.getItems()) {
      if (bp > HAIR_VAL && bp < END_VAL) {
        hairEquip.set(bp, item.itemId);
      } else if (bp >= CASH_BASE && bp < CASH_END && bp !== CASH_WPN) {
        hairEquip.set(bp - CASH_BASE, item.itemId);
      }
    }
    const unseenEquip = new Map<number, number>();
    for (const [bp, item] of equipped.getItems()) {
      if (bp > HAIR_VAL && bp < END_VAL) {
        const existing = hairEquip.get(bp);
        if (existing !== undefined && existing !== item.itemId) {
          unseenEquip.set(bp, item.itemId);
        }
      }
    }
    const cashWeapon = equipped.getItem(CASH_WPN);
    const weaponStickerId = cashWeapon ? cashWeapon.itemId : 0;
    const getPetId = (sn: bigint): number => {
      if (sn === 0n) return 0;
      for (const item of cashInventory.getItems().values()) {
        if (item.itemSn === sn) return item.itemId;
      }
      return 0;
    };
    return new AvatarLook(
      cs.gender, cs.skin, cs.hair, cs.face,
      hairEquip, unseenEquip, weaponStickerId,
      [getPetId(cs.petSn1), getPetId(cs.petSn2), getPetId(cs.petSn3)],
    );
  }
}
