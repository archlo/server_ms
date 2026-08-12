import { CharacterStat } from './CharacterStat';
import { SecondaryStat } from './SecondaryStat';
import { CharacterTemporaryStat } from './CharacterTemporaryStat';
import { PassiveSkillData } from './PassiveSkillData';

export class BasicStat {
  constructor(
    private readonly cs: CharacterStat,
    private readonly ss?: SecondaryStat | null,
    private readonly psd?: PassiveSkillData | null,
  ) {}

  getStr(): number {
    let v = this.cs.baseStr;
    if (this.ss) {
      const bsu = this.ss.getOption(CharacterTemporaryStat.BasicStatUp);
      if (bsu.nOption > 0) v += (bsu.nOption & 0xFFFF);
    }
    return v;
  }

  getDex(): number {
    let v = this.cs.baseDex;
    if (this.ss) {
      const bsu = this.ss.getOption(CharacterTemporaryStat.BasicStatUp);
      if (bsu.nOption > 0) v += ((bsu.nOption >>> 16) & 0xFFFF);
    }
    return v;
  }

  getInt(): number {
    let v = this.cs.baseInt;
    if (this.ss) {
      const bsu = this.ss.getOption(CharacterTemporaryStat.BasicStatUp);
      if (bsu.rOption > 0) v += (bsu.rOption & 0xFFFF);
    }
    return v;
  }

  getLuk(): number {
    let v = this.cs.baseLuk;
    if (this.ss) {
      const bsu = this.ss.getOption(CharacterTemporaryStat.BasicStatUp);
      if (bsu.rOption > 0) v += ((bsu.rOption >>> 16) & 0xFFFF);
    }
    return v;
  }

  getJob(): number { return this.cs.job; }
  getLevel(): number { return this.cs.level; }

  // Port of kinoko BasicStat::SetFrom maxHp aggregation — applies psd.mhpR rate (line 187).
  getMaxHp(): number {
    let maxHp = this.cs.maxHp;
    if (this.ss) {
      maxHp += this.ss.getOption(CharacterTemporaryStat.MaxHP).nOption;
    }
    if (this.psd) {
      maxHp += Math.floor((maxHp * this.psd.getMhpR()) / 100);
    }
    return maxHp;
  }

  // Port of kinoko BasicStat::SetFrom maxMp aggregation — applies psd.mmpR rate (line 188).
  getMaxMp(): number {
    let maxMp = this.cs.maxMp;
    if (this.ss) {
      maxMp += this.ss.getOption(CharacterTemporaryStat.MaxMP).nOption;
    }
    if (this.psd) {
      maxMp += Math.floor((maxMp * this.psd.getMmpR()) / 100);
    }
    return maxMp;
  }
}
