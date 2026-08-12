import { Job } from '../Job';
import { Char } from '../../../user/Char';

const SKILL = {
  KNUCKLE_MASTERY: 15100000,
  CRITICAL_PUNCH: 15100001,
  HP_BOOST: 15100002,
  BACKSPIN_BLOW: 15101003,
  DOUBLE_UPPERCUT: 15101004,
  CORKSCREW_BLOW: 15101005,
  MP_RECOVERY: 15101006,
  KNUCKLE_BOOSTER: 15101007,
  OAK_BARREL: 15101008,
};

export class Brawler implements Job {
  isHandlerOfSkill(skillId: number): boolean {
    return [
      SKILL.KNUCKLE_MASTERY,
      SKILL.CRITICAL_PUNCH,
      SKILL.HP_BOOST,
      SKILL.BACKSPIN_BLOW,
      SKILL.DOUBLE_UPPERCUT,
      SKILL.CORKSCREW_BLOW,
      SKILL.MP_RECOVERY,
      SKILL.KNUCKLE_BOOSTER,
      SKILL.OAK_BARREL,
    ].includes(skillId);
  }
}
