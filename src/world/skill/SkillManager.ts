import { SkillRecord } from './SkillRecord';
import { SkillProvider } from '../../provider/SkillProvider';
import { SkillStat } from '../../provider/skill/SkillStat';
import { SecondaryStat } from '../user/stat/SecondaryStat';

export class SkillManager {
  private readonly skillRecords  = new Map<number, SkillRecord>();
  private readonly skillCooltimes = new Map<number, Date>(); // skillId -> expiry
  private readonly skillSchedules = new Map<number, Date>();

  getSkillRecords(): SkillRecord[]  { return [...this.skillRecords.values()]; }
  getSkillCooltimes(): Map<number, Date> { return this.skillCooltimes; }

  getSkill(skillId: number): SkillRecord | undefined  { return this.skillRecords.get(skillId); }
  addSkill(sr: SkillRecord): void                     { this.skillRecords.set(sr.skillId, sr); }
  removeSkill(skillId: number): void                  { this.skillRecords.delete(skillId); }

  hasSkillCooltime(skillId: number): boolean {
    const exp = this.skillCooltimes.get(skillId);
    return exp !== undefined && exp > new Date();
  }

  setSkillCooltime(skillId: number, expiry: Date): void {
    this.skillCooltimes.set(skillId, expiry);
  }

  getSkillLevel(skillId: number): number {
    return this.skillRecords.get(skillId)?.skillLevel ?? 0;
  }

  static getSkillLevel(ss: SecondaryStat, sm: SkillManager, skillId: number): number {
    const sr = sm.skillRecords.get(skillId);
    if (!sr || sr.skillLevel === 0) return 0;
    return sr.skillLevel;
  }

  /** Port of kinoko's User::getSkillStatValue - SkillInfo.getValue at the user's current skill level. */
  getSkillStatValue(skillId: number, stat: SkillStat): number {
    if (skillId === 0) return 0;
    const slv = this.getSkillLevel(skillId);
    if (slv === 0) return 0;
    const si = SkillProvider.getSkillInfoById(skillId);
    if (!si) return 0;
    return si.getValue(stat, slv);
  }
}
