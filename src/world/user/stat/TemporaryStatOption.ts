import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { DiceInfo } from './DiceInfo';

export class TemporaryStatOption {
  static readonly EMPTY = new TemporaryStatOption(0, 0, 0);

  readonly nOption: number;
  readonly rOption: number;
  readonly tOption: number;
  readonly secondValue: number;
  readonly expireTime: Date;
  readonly diceInfo: DiceInfo;

  constructor(nOption: number, rOption: number, tOption: number, expireMs?: number, secondValue = 0, diceInfo: DiceInfo = DiceInfo.DEFAULT) {
    this.nOption  = nOption;
    this.rOption  = rOption;
    this.tOption  = tOption;
    this.secondValue = secondValue;
    this.diceInfo = diceInfo;
    this.expireTime = tOption === 0
      ? new Date(8640000000000000) // MAX
      : new Date(Date.now() + (expireMs ?? tOption));
  }

  getRemainingMillis(): number { return this.expireTime.getTime() - Date.now(); }

  isExpired(): boolean { return this.tOption !== 0 && Date.now() > this.expireTime.getTime(); }

  encode(w: PacketWriter): void {
    w.writeShort(this.nOption);
    w.writeInt(this.rOption);
    w.writeInt(this.tOption !== 0 ? this.tOption : 0x7FFFFFFF);
  }

  update(newNOption: number): TemporaryStatOption {
    const remaining = this.tOption !== 0 ? Math.max(0, this.getRemainingMillis()) : 0;
    return new TemporaryStatOption(newNOption, this.rOption, remaining > 0 ? Math.floor(remaining) : 0, undefined, this.secondValue, this.diceInfo);
  }

  static of(nOption: number, rOption: number, tOption: number): TemporaryStatOption {
    return new TemporaryStatOption(nOption, rOption, tOption);
  }

  static ofTwoState(nOption: number, rOption: number, tOption: number, secondValue: number): TemporaryStatOption {
    return new TemporaryStatOption(nOption, rOption, tOption, undefined, secondValue);
  }

  static ofMobSkill(nOption: number, skillId: number, slv: number, tOption: number): TemporaryStatOption {
    return new TemporaryStatOption(nOption, skillId | (slv << 16), tOption);
  }

  /** Port of kinoko's TemporaryStatOption::ofDice. Used by Roll of the Dice. */
  static ofDice(nOption: number, rOption: number, tOption: number, diceInfo: DiceInfo): TemporaryStatOption {
    return new TemporaryStatOption(nOption, rOption, tOption, undefined, 0, diceInfo);
  }
}
