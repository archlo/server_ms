import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { SkillInfo } from '../../../provider/skill/SkillInfo';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { GameConstants } from '../../GameConstants';
import { CalcDamage } from '../../user/stat/CalcDamage';
import { CalcDamagePAD } from '../../user/stat/CalcDamagePAD';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { User } from '../../user/User';
import { Mob } from './Mob';

/** Port of kinoko's BurnedInfo (poison/DoT tracking on a Mob). */
export class BurnedInfo {
  dotCount: number;
  lastUpdate: Date;

  constructor(
    readonly characterId: number,
    readonly skillId: number,
    readonly damage: number,
    readonly interval: number,
    dotCount: number,
  ) {
    this.dotCount = dotCount;
    this.lastUpdate = new Date();
  }

  getNextUpdate(): Date {
    return new Date(this.lastUpdate.getTime() + this.interval);
  }

  encode(w: PacketWriter): void {
    w.writeInt(this.characterId);
    w.writeInt(this.skillId);
    w.writeInt(this.damage);
    w.writeInt(this.interval);
    w.writeInt(this.lastUpdate.getTime() + this.dotCount * this.interval);
    w.writeInt(this.dotCount);
  }

  /**
   * Port of kinoko's BurnedInfo::from. Only the
   * `getDamageAdjustedByElemAttrRaw` overload is available (the public
   * skill-id-dispatching `getDamageAdjustedByElemAttr` is not ported - see
   * PORT_GAPS.md), so elemental adjustment uses the mob's raw
   * DamagedAttribute for the skill's element directly.
   */
  static from(user: User, si: SkillInfo, slv: number, mob: Mob, skillDamage = si.getValue(SkillStat.dot, slv)): BurnedInfo {
    const adjust = 1.0 - user.getSecondaryStat().getOption(CharacterTemporaryStat.ElementalReset).nOption / 100.0;

    let damage = CalcDamagePAD.calcDamageMax(user);
    const damagedAttr = mob.getDamagedElemAttr().get(si.elemAttr);
    if (damagedAttr !== undefined) {
      damage = CalcDamage.getDamageAdjustedByElemAttrRaw(damage, damagedAttr, adjust, 0.0);
    }
    if (skillDamage > 0) {
      damage = (skillDamage / 100.0) * damage;
    }

    const interval = si.getValue(SkillStat.dotInterval, slv) * 1000;
    const duration = si.getValue(SkillStat.dotTime, slv) * 1000;
    return new BurnedInfo(
      user.getCharacterId(),
      si.skillId,
      Math.min(Math.max(Math.floor(damage), 1), GameConstants.DAMAGE_MAX),
      interval,
      Math.floor(duration / interval),
    );
  }
}
