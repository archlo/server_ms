import { PacketWriter } from '../../../protocol/packets/packetWriter';

export class ForcedMobStat {
  maxHP = 0n;
  maxMP = 0n;
  exp = 0n;
  pad = 0;
  mad = 0;
  pdr = 0;
  mdr = 0;
  acc = 0;
  eva = 0;
  pushed = 0;
  speed = 0;
  level = 0;
  userCount = 0;

  static maxInt(v: bigint | number): number {
    const n = typeof v === 'bigint' ? Number(v) : v;
    return Math.min(Math.max(n, -2147483648), 2147483647);
  }

  encode(w: PacketWriter): void {
    w.writeInt(ForcedMobStat.maxInt(this.maxHP));
    w.writeInt(ForcedMobStat.maxInt(this.maxMP));
    w.writeInt(ForcedMobStat.maxInt(this.exp));
    w.writeInt(this.pad);
    w.writeInt(this.mad);
    w.writeInt(this.pdr);
    w.writeInt(this.mdr);
    w.writeInt(this.acc);
    w.writeInt(this.eva);
    w.writeInt(this.pushed);
    w.writeInt(this.speed > 0 ? -this.speed : this.speed);
    w.writeInt(this.level);
    w.writeInt(this.userCount);
  }

  deepCopy(): ForcedMobStat {
    const copy = new ForcedMobStat();
    copy.maxHP = this.maxHP;
    copy.maxMP = this.maxMP;
    copy.exp = this.exp;
    copy.pad = this.pad;
    copy.mad = this.mad;
    copy.pdr = this.pdr;
    copy.mdr = this.mdr;
    copy.acc = this.acc;
    copy.eva = this.eva;
    copy.pushed = this.pushed;
    copy.speed = this.speed;
    copy.level = this.level;
    copy.userCount = this.userCount;
    return copy;
  }
}
