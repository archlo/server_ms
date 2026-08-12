import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { User } from '../../user/User';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../../user/stat/TemporaryStatOption';
import { Attack } from '../Attack';
import { Effect } from '../../user/effect/Effect';
import { UserLocal } from '../../user/UserLocal';
import { UserRemote } from '../../user/UserRemote';

/** Skill IDs referenced by Warrior (kinoko Warrior.java). */
const SKILL = {
  MONSTER_MAGNET_HERO: 1121001,
  MONSTER_MAGNET_DRK: 1321001,
  SHOUT: 1111008,
  CHARGED_BLOW: 1211002,
  BLAST: 1221009,
  PANIC: 1111003,
  COMA: 1111005,
  BERSERK: 1320006,
};

/** Port of kinoko's Warrior (job/explorer/Warrior.java). */
export class Warrior {
  static readonly HP_BOOST = 1100000;
  static readonly IRON_BODY = 1101001;
  static readonly POWER_STRIKE = 1101002;
  static readonly SLASH_BLAST = 1101003;

  static isHandlerOfSkill(skillId: number): boolean {
    return skillId === Warrior.IRON_BODY;
  }

  /** Port of Warrior.handleBerserkEffect. */
  static handleBerserkEffect(user: User): void {
    const slv = user.getSkillLevel(SKILL.BERSERK);
    if (slv === 0) return;
    const effect = Effect.skillUseEnable(SKILL.BERSERK, slv, user.getLevel(), Warrior.isBerserkEffect(user));
    user.write(UserLocal.effect(effect));
    user.getField()?.broadcastPacket(UserRemote.effect(user, effect), user);
  }

  /** Port of Warrior.isBerserkEffect. */
  static isBerserkEffect(user: User): boolean {
    const slv = user.getSkillLevel(SKILL.BERSERK);
    if (slv === 0) return false;
    const si = SkillProvider.getSkillInfoById(SKILL.BERSERK);
    if (!si) return false;
    const threshold = si.getValue(SkillStat.x, slv);
    const percentage = Math.floor((user.getHp() / user.getMaxHp()) * 100);
    return percentage > threshold;
  }
  /** Port of Warrior.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.MONSTER_MAGNET_HERO:
      case SKILL.MONSTER_MAGNET_DRK:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.SHOUT:
      case SKILL.CHARGED_BLOW:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.BLAST:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.damage(user.getCharacterId(), mob.getHp());
        }
        return;
    }
  }

  /** Port of Warrior.resetComboCounter. */
  static resetComboCounter(user: User): void {
    const option = user.getSecondaryStat().getOption(CharacterTemporaryStat.ComboCounter);
    if (option.nOption > 1) {
      user.setTemporaryStat(CharacterTemporaryStat.ComboCounter, option.update(1));
    }
  }
}
