import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { MobPacket } from '../../field/mob/MobPacket';
import { BurnedInfo } from '../../field/mob/BurnedInfo';
import { User, skillCooltimePacket } from '../../user/User';
import { Attack } from '../Attack';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../../user/stat/TemporaryStatOption';
import { SkillConstants } from '../SkillConstants';

/** Skill IDs referenced by Pirate.handleAttack (kinoko Pirate.java). */
const SKILL = {
  BACKSPIN_BLOW: 5101002,
  DOUBLE_UPPERCUT: 5101003,
  ENERGY_BLAST: 5111002,
  SNATCH: 5121005,
  GRENADE: 5201002,
  BLANK_SHOT: 5201004,
  GAVIOTA: 5211002,
  FLAMETHROWER: 5211004,
  ICE_SPLITTER: 5211005,
  HOMING_BEACON: 5211006,
  ELEMENTAL_BOOST: 5220001,
  BULLSEYE: 5220011,
  HYPNOTIZE: 5221009,
  BATTLESHIP: 5221006,
};

/** Port of kinoko's Pirate (job/explorer/Pirate.java). */
export class Pirate {
  static readonly GUN_MASTERY = 5200000;
  static readonly BULLET_TIME = 5000000;
  static readonly FLASH_FIST = 5001001;
  static readonly SOMMERSAULT_KICK = 5001002;
  static readonly DOUBLE_SHOT = 5001003;
  static readonly DASH = 5001005;

  /** Port of Pirate.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.BACKSPIN_BLOW:
      case SKILL.DOUBLE_UPPERCUT:
      case SKILL.SNATCH:
      case SKILL.BLANK_SHOT:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.ENERGY_BLAST:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.GRENADE:
        mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob), delay);
        return;
      case SKILL.GAVIOTA:
        user.removeSummoned((s) => s.skillId === skillId);
        return;
      case SKILL.FLAMETHROWER: {
        const dot = si.getValue(SkillStat.dot, slv) + user.getSkillStatValue(SKILL.ELEMENTAL_BOOST, SkillStat.x);
        mob.setBurnedInfo(BurnedInfo.from(user, si, slv, mob, dot), delay);
        return;
      }
      case SKILL.ICE_SPLITTER: {
        const time = si.getValue(SkillStat.time, slv) + user.getSkillStatValue(SKILL.ELEMENTAL_BOOST, SkillStat.y);
        mob.setTemporaryStat(MobTemporaryStat.Freeze, MobStatOption.of(1, skillId, time * 1000), delay);
        return;
      }
      case SKILL.HOMING_BEACON:
      case SKILL.BULLSEYE:
        user.setTemporaryStat(CharacterTemporaryStat.GuidedBullet, TemporaryStatOption.ofTwoState(1, skillId, si.getDuration(slv), mob.getId()));
        return;
      case SKILL.HYPNOTIZE:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Dazzle, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
          if (mob.getController() !== user) {
            mob.setController(user);
            user.write(MobPacket.mobChangeController(mob, true));
            user.getField()?.broadcastPacket(MobPacket.mobChangeController(mob, false), user);
          }
        }
        return;
    }
  }

  /** Port of Pirate::getBattleshipDurability. */
  static getBattleshipDurability(user: User): number {
    const cooltime = user.getSkillManager().getSkillCooltimes().get(SkillConstants.BATTLESHIP_DURABILITY);
    if (cooltime) {
      return Math.floor(cooltime.getTime() / 1000);
    }
    const slv = user.getSkillLevel(SKILL.BATTLESHIP);
    return 300 * user.getLevel() + 500 * (slv - 72);
  }

  /** Port of Pirate::setBattleshipDurability. */
  static setBattleshipDurability(user: User, durability: number): void {
    user.getSkillManager().getSkillCooltimes().set(SkillConstants.BATTLESHIP_DURABILITY, new Date(durability * 1000));
    user.write(skillCooltimePacket(SkillConstants.BATTLESHIP_DURABILITY, durability));
  }
}
