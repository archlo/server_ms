import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { BitFlag } from '../../../util/BitFlag';
import {
  CharacterTemporaryStat, FLAG_SIZE,
  LOCAL_ENCODE_ORDER, REMOTE_ENCODE_ORDER,
  TWO_STATE_ORDER, SWALLOW_BUFF_STAT,
} from './CharacterTemporaryStat';
import { TemporaryStatOption } from './TemporaryStatOption';
import { DiceInfo } from './DiceInfo';

export class SecondaryStat {
  private readonly temporaryStats = new Map<CharacterTemporaryStat, TemporaryStatOption>();

  // Computed stats from equips + skills (populated by validateStat)
  pad = 0; pdd = 0; mad = 0; mdd = 0;
  acc = 0; eva = 0;
  craft = 0; speed = 100; jump = 100;
  itemPadR = 0; itemPddR = 0; itemMadR = 0; itemMddR = 0;
  itemAccR = 0; itemEvaR = 0; itemCriR = 0;

  getTemporaryStats(): Map<CharacterTemporaryStat, TemporaryStatOption> { return this.temporaryStats; }

  getOption(cts: CharacterTemporaryStat): TemporaryStatOption {
    return this.temporaryStats.get(cts) ?? TemporaryStatOption.EMPTY;
  }

  hasOption(cts: CharacterTemporaryStat): boolean { return (this.getOption(cts).nOption) > 0; }

  getRidingVehicle(): number { return this.getOption(CharacterTemporaryStat.RideVehicle).nOption; }

  /** Port of kinoko's SecondaryStat::getDiceInfo. Returns the active Dice info-array. */
  getDiceInfo(): DiceInfo {
    return this.getOption(CharacterTemporaryStat.Dice).diceInfo;
  }

  setOption(cts: CharacterTemporaryStat, opt: TemporaryStatOption): void {
    this.temporaryStats.set(cts, opt);
  }

  /** Returns removed CTS set */
  resetTemporaryStat(predicate: (cts: CharacterTemporaryStat, opt: TemporaryStatOption) => boolean): Set<CharacterTemporaryStat> {
    const removed = new Set<CharacterTemporaryStat>();
    for (const [cts, opt] of this.temporaryStats) {
      if (predicate(cts, opt)) { this.temporaryStats.delete(cts); removed.add(cts); }
    }
    return removed;
  }

  clear(): void { this.temporaryStats.clear(); }

  // ---- encode -------------------------------------------------------

  encodeForLocal(flag: BitFlag, w: PacketWriter): void {
    flag.encode(w);

    for (const cts of LOCAL_ENCODE_ORDER) {
      if (flag.has(cts)) this.getOption(cts).encode(w);
    }

    w.writeByte(this.getOption(CharacterTemporaryStat.DefenseAtt_Elem).nOption);
    w.writeByte(this.getOption(CharacterTemporaryStat.DefenseState_Stat).nOption);

    for (const cts of SWALLOW_BUFF_STAT) {
      if (flag.has(cts)) {
        w.writeByte(Math.floor(this.getOption(cts).tOption / 1000));
        break;
      }
    }

    if (flag.has(CharacterTemporaryStat.Dice)) {
      // aDiceInfo - 22 ints, port of SecondaryStat::encodeForLocal Dice branch
      this.getOption(CharacterTemporaryStat.Dice).diceInfo.encode(w);
    }

    if (flag.has(CharacterTemporaryStat.BlessingArmor)) {
      w.writeInt(this.getOption(CharacterTemporaryStat.BlessingArmorIncPAD).nOption);
    }

    for (const cts of TWO_STATE_ORDER) {
      if (flag.has(cts)) {
        const opt = this.temporaryStats.get(cts) ?? TemporaryStatOption.EMPTY;
        w.writeByte(1); // EXPIRE_BASED_ON_LAST_UPDATED_TIME
        w.writeInt(opt.nOption);
        w.writeInt(opt.rOption);
        w.writeInt(opt.tOption !== 0 ? opt.tOption : 0x7FFFFFFF);
        w.writeShort(opt.secondValue);
      }
    }
  }

  encodeForRemote(w: PacketWriter): void {
    const flag = BitFlag.from(this.temporaryStats.keys(), FLAG_SIZE);
    this.encodeForRemoteWithFlag(flag, w);
  }

  encodeForRemoteWithFlag(flag: BitFlag, w: PacketWriter): void {
    flag.encode(w);

    for (const cts of REMOTE_ENCODE_ORDER) {
      if (!flag.has(cts)) continue;
      const opt = this.getOption(cts);
      switch (cts) {
        case CharacterTemporaryStat.Speed:
        case CharacterTemporaryStat.ComboCounter:
        case CharacterTemporaryStat.Cyclone:
          w.writeByte(opt.nOption); break;
        case CharacterTemporaryStat.Morph:
        case CharacterTemporaryStat.Ghost:
          w.writeShort(opt.nOption); break;
        case CharacterTemporaryStat.SpiritJavelin:
        case CharacterTemporaryStat.RespectPImmune:
        case CharacterTemporaryStat.RespectMImmune:
        case CharacterTemporaryStat.DefenseAtt:
        case CharacterTemporaryStat.DefenseState:
        case CharacterTemporaryStat.MagicShield:
          w.writeInt(opt.nOption); break;
        case CharacterTemporaryStat.WeaponCharge:
        case CharacterTemporaryStat.Stun:
        case CharacterTemporaryStat.Darkness:
        case CharacterTemporaryStat.Seal:
        case CharacterTemporaryStat.Weakness:
        case CharacterTemporaryStat.Curse:
        case CharacterTemporaryStat.ShadowPartner:
        case CharacterTemporaryStat.Attract:
        case CharacterTemporaryStat.BanMap:
        case CharacterTemporaryStat.Barrier:
        case CharacterTemporaryStat.DojangShield:
        case CharacterTemporaryStat.ReverseInput:
        case CharacterTemporaryStat.RepeatEffect:
        case CharacterTemporaryStat.StopPortion:
        case CharacterTemporaryStat.StopMotion:
        case CharacterTemporaryStat.Fear:
        case CharacterTemporaryStat.Frozen:
        case CharacterTemporaryStat.SuddenDeath:
        case CharacterTemporaryStat.FinalCut:
        case CharacterTemporaryStat.Mechanic:
        case CharacterTemporaryStat.DarkAura:
        case CharacterTemporaryStat.BlueAura:
        case CharacterTemporaryStat.YellowAura:
          w.writeInt(opt.rOption); break;
        case CharacterTemporaryStat.Poison:
          w.writeShort(opt.nOption);
          w.writeInt(opt.rOption); break;
      }
    }

    w.writeByte(this.getOption(CharacterTemporaryStat.DefenseAtt_Elem).nOption);
    w.writeByte(this.getOption(CharacterTemporaryStat.DefenseState_Stat).nOption);

    for (const cts of TWO_STATE_ORDER) {
      if (flag.has(cts)) {
        const opt = this.temporaryStats.get(cts) ?? TemporaryStatOption.EMPTY;
        w.writeByte(1);
        w.writeInt(opt.nOption);
        w.writeInt(opt.rOption);
        w.writeInt(opt.tOption !== 0 ? opt.tOption : 0x7FFFFFFF);
        w.writeShort(opt.secondValue);
      }
    }
  }

  /** Simplified setFrom — adds equip stats only (no passive skills for now) */
  setFrom(realEquip: Map<number, import('../../item/Item').Item>): void {
    this.pad = 0; this.pdd = 0; this.mad = 0; this.mdd = 0;
    this.acc = 0; this.eva = 0;
    this.craft = 0; this.speed = 100; this.jump = 100;
    this.itemPadR = 0; this.itemPddR = 0; this.itemMadR = 0; this.itemMddR = 0;
    this.itemAccR = 0; this.itemEvaR = 0; this.itemCriR = 0;

    for (const item of realEquip.values()) {
      const e = item.equipData;
      if (!e) continue;
      this.pad   += e.incPad;
      this.pdd   += e.incPdd;
      this.mad   += e.incMad;
      this.mdd   += e.incMdd;
      this.acc   += e.incAcc;
      this.eva   += e.incEva;
      this.craft += e.incCraft;
      this.speed += e.incSpeed;
      this.jump  += e.incJump;
    }
  }
}
