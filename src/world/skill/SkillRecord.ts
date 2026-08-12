export class SkillRecord {
  skillLevel  = 0;
  masterLevel = 0;

  constructor(public readonly skillId: number) {}

  getSkillId(): number    { return this.skillId; }
  getSkillLevel(): number { return this.skillLevel; }
  getMasterLevel(): number { return this.masterLevel; }
  setSkillLevel(level: number): void { this.skillLevel = level; }
  setMasterLevel(level: number): void { this.masterLevel = level; }
}
