import { NXNode } from '../../wz-utils/NXNode';

export class QuestSkillData {
  constructor(
    public readonly skillId: number,
    public readonly skillLevel: number,
    public readonly masterLevel: number,
    public readonly onlyMasterLevel: boolean,
    public readonly jobs: Set<number>,
  ) {}

  static resolveSkillData(skillList: NXNode): QuestSkillData[] {
    const skills: QuestSkillData[] = [];
    for (const skillProp of skillList.nChildren) {
      const jobList = skillProp.nGet('job') as NXNode | undefined;
      if (!jobList) continue;
      const jobs = new Set<number>();
      for (const jobEntry of jobList.nChildren) {
        jobs.add(Number(jobEntry.nValue));
      }
      skills.push(new QuestSkillData(
        skillProp.nGet('id', 0) as number,
        skillProp.nGet('skillLevel', 0) as number,
        skillProp.nGet('masterLevel', 0) as number,
        (skillProp.nGet('onlyMasterLevel', 0) as number) !== 0,
        jobs,
      ));
    }
    return skills;
  }
}
