import { PacketWriter } from '../../protocol/packets/packetWriter';

export class AvatarData {
  static EMPTY = new AvatarData(0, 0, 0, 0);

  constructor(
    public readonly gender: number,
    public readonly skin: number,
    public readonly face: number,
    public readonly hair: number,
    public readonly weaponId = 0,
    public readonly subWeaponId = 0,
    public readonly cashWeaponId = 0,
  ) {}

  encode(w: PacketWriter): void {
    w.writeByte(this.gender);
    w.writeByte(this.skin);
    w.writeInt(this.face);
    w.writeInt(this.hair);
    w.writeInt(this.weaponId);
    w.writeInt(this.subWeaponId);
    w.writeInt(this.cashWeaponId);
  }
}
