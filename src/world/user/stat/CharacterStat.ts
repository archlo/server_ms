import { GameConstants } from '../../GameConstants';
import { JobConstants } from '../../job/JobConstants';
import { Stat } from './Stat';
import { ExtendSp } from './ExtendSp';
import { StatConstants } from './StatConstants';
import { PacketWriter } from '../../../protocol/packets/packetWriter';

function randInt(max: number): number { return Math.floor(Math.random() * (max + 1)); }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class CharacterStat {
  id       = 0;
  name     = '';
  gender   = 0;
  skin     = 0;
  face     = 0;
  hair     = 0;
  level    = 1;
  job      = 0;
  subJob   = 0;
  baseStr  = 4;
  baseDex  = 4;
  baseInt  = 4;
  baseLuk  = 4;
  hp       = 50;
  maxHp    = 50;
  mp       = 5;
  maxMp    = 5;
  ap       = 0;
  sp: ExtendSp = ExtendSp.empty();
  exp      = 0;
  pop      = 0;
  posMap   = 0;
  portal   = 0;
  petSn1   = 0n;
  petSn2   = 0n;
  petSn3   = 0n;

  // ---- helpers -------------------------------------------------------

  isValidAp(stat: Stat, delta: number): boolean {
    switch (stat) {
      case Stat.STR: { const v = this.baseStr + delta; return v >= GameConstants.STAT_MIN && v <= GameConstants.STAT_MAX; }
      case Stat.DEX: { const v = this.baseDex + delta; return v >= GameConstants.STAT_MIN && v <= GameConstants.STAT_MAX; }
      case Stat.INT: { const v = this.baseInt + delta; return v >= GameConstants.STAT_MIN && v <= GameConstants.STAT_MAX; }
      case Stat.LUK: { const v = this.baseLuk + delta; return v >= GameConstants.STAT_MIN && v <= GameConstants.STAT_MAX; }
      case Stat.MHP: {
        const v = this.maxHp + delta * StatConstants.getIncHpByAp(this.job);
        return v >= StatConstants.getMinHp(this.level, this.job) && v <= GameConstants.HP_MAX;
      }
      case Stat.MMP: {
        const v = this.maxMp + delta * StatConstants.getIncMpByAp(this.job);
        return v >= StatConstants.getMinMp(this.level, this.job) && v <= GameConstants.MP_MAX;
      }
    }
    return false;
  }

  addAp(stat: Stat, totalInt: number): Map<Stat, any> {
    const m = new Map<Stat, any>();
    switch (stat) {
      case Stat.STR: this.baseStr = clamp(this.baseStr + 1, 0, GameConstants.STAT_MAX); m.set(Stat.STR, this.baseStr); break;
      case Stat.DEX: this.baseDex = clamp(this.baseDex + 1, 0, GameConstants.STAT_MAX); m.set(Stat.DEX, this.baseDex); break;
      case Stat.INT: this.baseInt = clamp(this.baseInt + 1, 0, GameConstants.STAT_MAX); m.set(Stat.INT, this.baseInt); break;
      case Stat.LUK: this.baseLuk = clamp(this.baseLuk + 1, 0, GameConstants.STAT_MAX); m.set(Stat.LUK, this.baseLuk); break;
      case Stat.MHP: {
        const inc = StatConstants.getIncHpByAp(this.job) + randInt(StatConstants.INC_HP_VARIANCE);
        this.maxHp = clamp(this.maxHp + inc, 0, GameConstants.HP_MAX);
        m.set(Stat.MHP, this.maxHp); break;
      }
      case Stat.MMP: {
        const inc = StatConstants.getIncMpByAp(this.job) + randInt(StatConstants.INC_MP_VARIANCE) + Math.floor(totalInt / 10);
        this.maxMp = clamp(this.maxMp + inc, 0, GameConstants.MP_MAX);
        m.set(Stat.MMP, this.maxMp); break;
      }
    }
    return m;
  }

  removeAp(stat: Stat): Map<Stat, any> {
    const m = new Map<Stat, any>();
    switch (stat) {
      case Stat.STR: this.baseStr = clamp(this.baseStr - 1, GameConstants.STAT_MIN, 32767); m.set(Stat.STR, this.baseStr); break;
      case Stat.DEX: this.baseDex = clamp(this.baseDex - 1, GameConstants.STAT_MIN, 32767); m.set(Stat.DEX, this.baseDex); break;
      case Stat.INT: this.baseInt = clamp(this.baseInt - 1, GameConstants.STAT_MIN, 32767); m.set(Stat.INT, this.baseInt); break;
      case Stat.LUK: this.baseLuk = clamp(this.baseLuk - 1, GameConstants.STAT_MIN, 32767); m.set(Stat.LUK, this.baseLuk); break;
      case Stat.MHP: this.maxHp = Math.max(this.maxHp - StatConstants.getIncHpByAp(this.job), StatConstants.getMinHp(this.level, this.job)); m.set(Stat.MHP, this.maxHp); break;
      case Stat.MMP: this.maxMp = Math.max(this.maxMp - StatConstants.getIncMpByAp(this.job), StatConstants.getMinMp(this.level, this.job)); m.set(Stat.MMP, this.maxMp); break;
    }
    return m;
  }

  addExp(delta: number, totalInt: number): Map<Stat, any> {
    const m = new Map<Stat, any>();
    const levelMax = GameConstants.getLevelMax(this.job);
    if (this.level >= levelMax) return m;
    let newExp = this.exp + delta;
    while (this.level < levelMax && newExp >= GameConstants.getNextLevelExp(this.level)) {
      newExp -= GameConstants.getNextLevelExp(this.level);
      for (const [k,v] of this.levelUp(totalInt)) m.set(k, v);
    }
    this.exp = newExp;
    m.set(Stat.EXP, newExp);
    return m;
  }

  levelUp(totalInt: number): Map<Stat, any> {
    const m = new Map<Stat, any>();
    const levelMax = GameConstants.getLevelMax(this.job);
    if (this.level >= levelMax) return m;
    this.level++;
    m.set(Stat.LEVEL, this.level);

    const incHp = StatConstants.getIncHp(this.job) + randInt(StatConstants.INC_HP_VARIANCE);
    this.maxHp = clamp(this.maxHp + incHp, 0, GameConstants.HP_MAX);
    m.set(Stat.MHP, this.maxHp);

    const incMp = StatConstants.getIncMp(this.job) + randInt(StatConstants.INC_MP_VARIANCE) + Math.floor(totalInt / 10);
    this.maxMp = clamp(this.maxMp + incMp, 0, GameConstants.MP_MAX);
    m.set(Stat.MMP, this.maxMp);

    if (JobConstants.isBeginnerJob(this.job) && this.level <= 11) {
      if (this.level <= 6) { this.baseStr += 5; m.set(Stat.STR, this.baseStr); }
      else { this.baseStr += 4; m.set(Stat.STR, this.baseStr); this.baseDex += 4; m.set(Stat.DEX, this.baseDex); }
    } else {
      this.ap += StatConstants.getIncAp(this.level, this.job);
      m.set(Stat.AP, this.ap);
    }

    if (!JobConstants.isBeginnerJob(this.job)) {
      if (JobConstants.isExtendSpJob(this.job)) {
        const jl = JobConstants.getExtendSpJobLevel(this.job, this.level);
        this.sp.addSp(jl, 3);
        m.set(Stat.SP, this.sp);
      } else {
        this.sp.addNonExtendSp(3);
        m.set(Stat.SP, this.sp.getNonExtendSp());
      }
    }
    return m;
  }

  getCumulativeExp(): number {
    let acc = 0;
    for (let lvl = 1; lvl < this.level; lvl++) acc += GameConstants.getNextLevelExp(lvl);
    return acc + this.exp;
  }

  encode(w: PacketWriter): void {
    w.writeInt(this.id);
    w.writeFixedString(this.name, 13);
    w.writeByte(this.gender);
    w.writeByte(this.skin);
    w.writeInt(this.face);
    w.writeInt(this.hair);

    w.writeLong(this.petSn1);
    w.writeLong(this.petSn2);
    w.writeLong(this.petSn3);

    w.writeUByte(this.level);
    w.writeShort(this.job);
    w.writeShort(this.baseStr);
    w.writeShort(this.baseDex);
    w.writeShort(this.baseInt);
    w.writeShort(this.baseLuk);
    w.writeInt(this.hp);
    w.writeInt(this.maxHp);
    w.writeInt(this.mp);
    w.writeInt(this.maxMp);
    w.writeShort(this.ap);
    if (JobConstants.isExtendSpJob(this.job)) {
      this.sp.encode(w);
    } else {
      w.writeShort(this.sp.getNonExtendSp());
    }

    w.writeInt(this.exp);
    w.writeShort(this.pop);
    w.writeInt(0); // nTempEXP
    w.writeInt(this.posMap);
    w.writeUByte(this.portal);
    w.writeInt(0); // nPlayTime
    w.writeShort(this.subJob);
  }
}
