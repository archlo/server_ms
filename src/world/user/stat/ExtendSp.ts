import { PacketWriter } from '../../../protocol/packets/packetWriter';

export const DEFAULT_JOB_LEVEL = 0;

export class ExtendSp {
  private readonly map: Map<number, number>;

  constructor(map?: Map<number, number>) {
    this.map = map ?? new Map();
  }

  getMap(): Map<number, number> { return this.map; }

  getNonExtendSp(): number { return this.map.get(DEFAULT_JOB_LEVEL) ?? 0; }
  setNonExtendSp(sp: number): void  { this.map.set(DEFAULT_JOB_LEVEL, sp); }
  addNonExtendSp(sp: number): void  { this.addSp(DEFAULT_JOB_LEVEL, sp); }
  removeNonExtendSp(sp: number): boolean { return this.removeSp(DEFAULT_JOB_LEVEL, sp); }

  setSp(jobLevel: number, sp: number): void { this.map.set(jobLevel, sp); }
  addSp(jobLevel: number, sp: number): void { this.map.set(jobLevel, (this.map.get(jobLevel) ?? 0) + sp); }
  removeSp(jobLevel: number, sp: number): boolean {
    const cur = this.map.get(jobLevel) ?? 0;
    if (cur < sp) return false;
    this.map.set(jobLevel, cur - sp);
    return true;
  }

  static empty(): ExtendSp { return new ExtendSp(); }
  static from(map: Map<number, number>): ExtendSp { return new ExtendSp(new Map(map)); }

  encode(w: PacketWriter): void {
    w.writeByte(this.map.size);
    for (const [jobLevel, sp] of this.map) {
      w.writeByte(jobLevel);
      w.writeByte(sp);
    }
  }
}
