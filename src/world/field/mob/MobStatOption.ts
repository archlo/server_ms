import { PacketWriter } from '../../../protocol/packets/packetWriter';

/** Port of kinoko's MobStatOption. */
export class MobStatOption {
  static readonly EMPTY = new MobStatOption(0, 0, 0);

  readonly nOption: number;
  readonly rOption: number;
  readonly tOption: number;
  readonly expireTime: Date;

  constructor(nOption: number, rOption: number, tOption: number) {
    this.nOption = nOption;
    this.rOption = rOption;
    this.tOption = tOption;
    this.expireTime = tOption === 0
      ? new Date(8640000000000000)
      : new Date(Date.now() + tOption);
  }

  encode(w: PacketWriter): void {
    w.writeShort(this.nOption);
    w.writeInt(this.rOption);
    w.writeShort(Math.floor(this.tOption / 500));
  }

  static of(nOption: number, rOption: number, tOption: number): MobStatOption {
    return new MobStatOption(nOption, rOption, tOption);
  }

  static ofMobSkill(nOption: number, skillId: number, slv: number, tOption: number): MobStatOption {
    return new MobStatOption(nOption, skillId | (slv << 16), tOption);
  }
}
