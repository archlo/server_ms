import { QuestAct } from './QuestAct';
import { User } from '../../../world/user/User';
import { NXNode } from '../../../wz-utils/NXNode';
import { QuestSkillData } from '../QuestSkillData';
import { SkillProvider } from '../../SkillProvider';
import { SkillConstants } from '../../../world/skill/SkillConstants';
import { SkillRecord } from '../../../world/skill/SkillRecord';
import { changeSkillRecordResultPacket } from '../../../world/item/ItemPacket';

export class QuestSkillAct implements QuestAct {
  constructor(private readonly skills: QuestSkillData[]) {}

  canAct(user: User, _rewardIndex: number): boolean {
    for (const qsd of this.skills) {
      if (!qsd.jobs.has(user.getJob())) continue;
      if (!SkillProvider.getSkillInfoById(qsd.skillId)) return false;
    }
    return true;
  }

  doAct(user: User, _rewardIndex: number): boolean {
    for (const qsd of this.skills) {
      if (!qsd.jobs.has(user.getJob())) continue;
      const info = SkillProvider.getSkillInfoById(qsd.skillId);
      if (!info) return false;
      const sr = new SkillRecord(qsd.skillId);
      sr.skillLevel = qsd.onlyMasterLevel ? user.getSkillLevel(qsd.skillId) : qsd.skillLevel;
      sr.masterLevel = SkillConstants.isSkillNeedMasterLevel(qsd.skillId) ? qsd.masterLevel : 0;
      user.getSkillManager().addSkill(sr);
      user.updatePassiveSkillData();
      user.validateStat();
      user.write(changeSkillRecordResultPacket(sr, false));
    }
    return true;
  }

  static from(skillList: NXNode): QuestSkillAct {
    return new QuestSkillAct(QuestSkillData.resolveSkillData(skillList));
  }
}
