import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { PacketReader } from '../../../protocol/packets/packetReader';
import { SkillInfo } from '../../../provider/skill/SkillInfo';
import { SkillStat } from '../../../provider/skill/SkillStat';

/**
 * Port of kinoko's DiceInfo (world/user/stat/DiceInfo.java).
 *
 * Encoded as `aDiceInfo` - a fixed-length array of 22 ints whose indices map
 * to specific passive-skill stat bonuses (see PassiveSkillData.setFrom dice
 * section). Only the indices corresponding to the rolled face are populated
 * by `DiceInfo.from`.
 */
export class DiceInfo {
  static readonly DEFAULT = new DiceInfo();
  static readonly LENGTH = 22;

  readonly infoArray: number[] = new Array<number>(DiceInfo.LENGTH).fill(0);

  getInfoArray(): number[] {
    return this.infoArray;
  }

  encode(w: PacketWriter): void {
    // aDiceInfo
    for (let i = 0; i < DiceInfo.LENGTH; i++) {
      w.writeInt(this.infoArray[i]);
    }
  }

  static decode(r: PacketReader): DiceInfo {
    const diceInfo = new DiceInfo();
    for (let i = 0; i < DiceInfo.LENGTH; i++) {
      diceInfo.infoArray[i] = r.readInt();
    }
    return diceInfo;
  }

  /**
   * Port of kinoko's DiceInfo.from(int roll, SkillInfo, int slv). Populates
   * the info-array indices corresponding to the rolled dice face:
   *   2 -> pddR (idx 8)
   *   3 -> mhpR/mmpR (idx 0/1)
   *   4 -> cr (idx 2)
   *   5 -> damR (idx 12)
   *   6 -> expR (idx 17)
   * A roll of 1 is a "no bonus" result and leaves the array zeroed.
   */
  static from(roll: number, si: SkillInfo, slv: number): DiceInfo {
    const diceInfo = new DiceInfo();
    switch (roll) {
      case 2:
        // weapon defense
        diceInfo.infoArray[8] = si.getValue(SkillStat.pddR, slv);
        break;
      case 3:
        // max hp/mp
        diceInfo.infoArray[0] = si.getValue(SkillStat.mhpR, slv);
        diceInfo.infoArray[1] = si.getValue(SkillStat.mmpR, slv);
        break;
      case 4:
        // critical rate
        diceInfo.infoArray[2] = si.getValue(SkillStat.cr, slv);
        break;
      case 5:
        // damage
        diceInfo.infoArray[12] = si.getValue(SkillStat.damR, slv);
        break;
      case 6:
        // exp
        diceInfo.infoArray[17] = si.getValue(SkillStat.expR, slv);
        break;
    }
    return diceInfo;
  }
}
