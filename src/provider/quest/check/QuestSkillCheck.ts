import { QuestCheck } from './QuestCheck';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';

export class QuestSkillCheck implements QuestCheck {
  constructor(private readonly skills: Map<number, boolean>) {}

  check(user: User): boolean {
    for (const [skillId, acquire] of this.skills) {
      const has = user.getSkillManager().getSkill(skillId) !== undefined;
      if (has !== acquire) return false;
    }
    return true;
  }

  static from(skillList: NXNode): QuestSkillCheck {
    const skills = new Map<number, boolean>();
    for (const skillProp of skillList.nChildren) {
      const skillId = skillProp.nGet('id', 0) as number;
      const acquire = (skillProp.nGet('acquire', 0) as number) !== 0;
      skills.set(skillId, acquire);
    }
    return new QuestSkillCheck(skills);
  }
}
