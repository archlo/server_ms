import { SkillProvider } from '../../../provider/SkillProvider';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { SkillConstants } from '../SkillConstants';
import { Util } from '../../../util/Util';
import { Mob } from '../../field/mob/Mob';
import { MobStatOption } from '../../field/mob/MobStatOption';
import { MobTemporaryStat } from '../../field/mob/MobTemporaryStat';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { User } from '../../user/User';
import { Attack } from '../Attack';
import { Job } from './Job';
import { Char } from '../../user/Char';

const SKILL = {
  DARK_CHAIN: 32101001,
  ADVANCED_DARK_CHAIN: 32111011,
  DARK_GENESIS: 32121004,
};

const AURA = {
  DARK_AURA: 32001003,
  BLUE_AURA: 32101002,
  YELLOW_AURA: 32101003,
  ADVANCED_DARK_AURA: 32120000,
  ADVANCED_BLUE_AURA: 32110000,
  ADVANCED_YELLOW_AURA: 32120001,
};

export class BattleMage implements Job {
  static getAdvancedAuraSkill(user: User, skillId: number): number {
    let advanced: number;
    switch (skillId) {
      case AURA.DARK_AURA:
        advanced = AURA.ADVANCED_DARK_AURA;
        break;
      case AURA.BLUE_AURA:
        advanced = AURA.ADVANCED_BLUE_AURA;
        break;
      case AURA.YELLOW_AURA:
        advanced = AURA.ADVANCED_YELLOW_AURA;
        break;
      default:
        return skillId;
    }
    if (user.getSkillLevel(advanced) > 0) {
      return advanced;
    }
    return skillId;
  }

  /** Port of BattleMage.cancelPartyAura. */
  static cancelPartyAura(user: User, skillId: number): void {
    const cts = SkillConstants.getStatByAuraSkill(skillId);
    if (cts === null) return;
    user.getField()?.getUserPool().forEachPartyMember(user, (member: User) => {
      if (member.getSecondaryStat().hasOption(cts)) {
        member.resetTemporaryStat((target: CharacterTemporaryStat) => target === cts);
      }
    });
  }

  /** Port of BattleMage.handleAttack. */
  static handleAttack(user: User, mob: Mob, attack: Attack, delay: number): void {
    const si = SkillProvider.getSkillInfoById(attack.skillId);
    if (!si) return;
    const skillId = attack.skillId;
    const slv = attack.slv;

    switch (skillId) {
      case SKILL.DARK_CHAIN:
      case SKILL.ADVANCED_DARK_CHAIN:
        if (!mob.isBoss()) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
      case SKILL.DARK_GENESIS:
        if (!mob.isBoss() && Util.succeedProp(si.getValue(SkillStat.prop, slv))) {
          mob.setTemporaryStat(MobTemporaryStat.Stun, MobStatOption.of(1, skillId, si.getDuration(slv)), delay);
        }
        return;
    }
  }

  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.DARK_CHAIN,
      SKILL.ADVANCED_DARK_CHAIN,
      SKILL.DARK_GENESIS,
      AURA.DARK_AURA,
      AURA.BLUE_AURA,
      AURA.YELLOW_AURA,
      AURA.ADVANCED_DARK_AURA,
      AURA.ADVANCED_BLUE_AURA,
      AURA.ADVANCED_YELLOW_AURA,
    ].includes(skillId);
  }
}
