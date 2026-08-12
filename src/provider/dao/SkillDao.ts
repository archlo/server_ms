export class SkillDao {
  getSkillsByCharId(charId: number): any[] {
    return [];
  }

  saveSkill(skill: any): void {
    console.log('[SkillDao] saveSkill');
  }

  removeSkill(skillId: number): void {
    console.log('[SkillDao] removeSkill');
  }
}
