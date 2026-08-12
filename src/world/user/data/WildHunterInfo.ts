import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { SkillConstants } from '../../skill/SkillConstants';

/**
 * Port of kinoko's WildHunterInfo (world/user/data/WildHunterInfo.java).
 *
 * Tracks a Wild Hunter's captured mobs (up to 5) and the active jaguar
 * riding type. Encoded as `GW_WildHunterInfo` - a single byte packing
 * (ridingType * 10) followed by 5 ints of captured mob template IDs.
 */
export class WildHunterInfo {
  static readonly MAX_CAPTURED = 5;

  private readonly capturedMobs: number[] = [];
  private ridingType = 0;

  getCapturedMobs(): number[] {
    return this.capturedMobs;
  }

  getRidingType(): number {
    return this.ridingType;
  }

  setRidingType(ridingType: number): void {
    this.ridingType = ridingType;
  }

  /**
   * Port of kinoko's WildHunterInfo::getRidingItem. Resolves the jaguar
   * mount item id from the active riding type. Mirrors kinoko's
   * `WILD_HUNTER_JAGUARS.get(clamp(ridingType - 1, 0, size))` against the
   * ordered jaguar list.
   */
  getRidingItem(): number {
    const jaguars = Array.from(SkillConstants.WILD_HUNTER_JAGUARS);
    const idx = Math.max(0, Math.min(this.ridingType - 1, jaguars.length - 1));
    return jaguars[idx] ?? 0;
  }

  encode(w: PacketWriter): void {
    // nRidingType = byte / 10, nIdx = byte % 10
    w.writeByte(this.getRidingType() * 10);
    for (let i = 0; i < WildHunterInfo.MAX_CAPTURED; i++) {
      if (i < this.capturedMobs.length) {
        w.writeInt(this.capturedMobs[i]);
      } else {
        w.writeInt(0);
      }
    }
  }
}
