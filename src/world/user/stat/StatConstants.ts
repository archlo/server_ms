import { JobConstants } from '../../job/JobConstants';

export const StatConstants = {
  INC_HP_VARIANCE: 4,
  INC_MP_VARIANCE: 2,

  isAbilityUpStat(stat: string): boolean {
    return ['MHP','MMP','STR','DEX','INT','LUK'].includes(stat);
  },

  getIncAp(level: number, jobId: number): number {
    return (level <= 70 && JobConstants.isCygnusJob(jobId)) ? 6 : 5;
  },

  getIncHp(jobId: number): number {
    if (JobConstants.isBeginnerJob(jobId)) return 12;
    if (JobConstants.isEvanJob(jobId))    return 16;
    if (JobConstants.isBattleMageJob(jobId)) return 34;
    switch (JobConstants.getJobCategory(jobId)) {
      case 1: return 24;
      case 2: return 10;
      case 3: case 4: return 20;
      case 5: return 22;
      default: return 0;
    }
  },

  getIncMp(jobId: number): number {
    if (JobConstants.isBeginnerJob(jobId)) return 10;
    if (JobConstants.isEvanJob(jobId))    return 35;
    if (JobConstants.isBattleMageJob(jobId)) return 22;
    switch (JobConstants.getJobCategory(jobId)) {
      case 1: return 4;
      case 2: return 22;
      case 3: case 4: return 14;
      case 5: return 18;
      default: return 0;
    }
  },

  getIncHpByAp(jobId: number): number {
    switch (JobConstants.getJobCategory(jobId)) {
      case 0: return 8;
      case 1: return 20;
      case 2:
        if (JobConstants.isBattleMageJob(jobId)) return 20;
        return JobConstants.isEvanJob(jobId) ? 12 : 6;
      case 3: case 4: return 16;
      case 5: return 18;
      default: return 0;
    }
  },

  getIncMpByAp(jobId: number): number {
    switch (JobConstants.getJobCategory(jobId)) {
      case 0: return 6;
      case 1: return 2;
      case 2: return 18;
      case 3: case 4: return 10;
      case 5: return 14;
      default: return 0;
    }
  },

  getMinHp(level: number, jobId: number): number {
    const s = jobId % 1000;
    if (JobConstants.isEvanJob(jobId)) return 16 * level - 2;
    if (JobConstants.isMechanicJob(jobId)) {
      const jl = JobConstants.getJobLevel(jobId);
      return jl === 1 ? 22 * (level + 4) : 22 * level + 238;
    }
    if (JobConstants.isWildHunterJob(jobId)) {
      const jl = JobConstants.getJobLevel(jobId);
      return jl === 1 ? 20 * level + 108 : 20 * level + 258;
    }
    if (JobConstants.isBattleMageJob(jobId)) {
      const jl = JobConstants.getJobLevel(jobId);
      return jl === 1 ? 34 * level - 32 : 34 * level + 168;
    }
    switch (s) {
      case 100: case 120: case 121: case 122: case 130: case 131: case 132:
        return 24 * level + 118;
      case 110: case 111: case 112:
        return 24 * level + 418;
      case 200: case 210: case 211: case 212: case 220: case 221: case 222: case 230: case 231: case 232:
        return 10 * level + 54;
      case 300: case 400:
        return 20 * level + 58;
      case 310: case 311: case 312: case 320: case 321: case 322:
      case 410: case 411: case 412: case 420: case 421: case 422:
        return 20 * level + 358;
      case 430: case 431: case 432: case 433: case 434:
        return 20 * level + 808;
      case 500:
        return 22 * level + 38;
      case 510: case 511: case 512: case 520: case 521: case 522:
        return 22 * level + 338;
      case 0: case 1:
        return 12 * level + 38;
      default: return 0;
    }
  },

  getMinMp(level: number, jobId: number): number {
    const s = jobId % 1000;
    if (JobConstants.isEvanJob(jobId)) {
      let mp = 150;
      if (jobId >= 2210 && jobId <= 2214) return 100 * (jobId % 10) + 250;
      if (jobId >= 2215) mp = 650;
      return 35 * level + mp - 275;
    }
    if (JobConstants.isMechanicJob(jobId)) {
      const jl = JobConstants.getJobLevel(jobId);
      return jl === 1 ? 18 * level - 17 : 18 * level + 83;
    }
    if (JobConstants.isWildHunterJob(jobId)) {
      const jl = JobConstants.getJobLevel(jobId);
      return jl === 1 ? 14 * level + 23 : 14 * level + 123;
    }
    if (JobConstants.isBattleMageJob(jobId)) {
      const jl = JobConstants.getJobLevel(jobId);
      return jl === 1 ? 22 * level + 43 : 22 * level + 143;
    }
    switch (s) {
      case 100: case 110: case 111: case 112: return 4 * level + 55;
      case 120: case 121: case 122: case 130: case 131: case 132: return 4 * level + 155;
      case 200: return 22 * level - 1;
      case 210: case 211: case 212: case 220: case 221: case 222: case 230: case 231: case 232:
        return 22 * level + 449;
      case 300: case 400: return 14 * level - 15;
      case 310: case 311: case 312: case 320: case 321: case 322:
      case 410: case 411: case 412: case 420: case 421: case 422:
        return 14 * level + 135;
      case 430: case 431: case 432: case 433: case 434: return 14 * level + 355;
      case 500: return 18 * level - 55;
      case 510: case 511: case 512: case 520: case 521: case 522: return 18 * level + 95;
      case 0: case 1: return 10 * level - 5;
      default: return 0;
    }
  },

  getSumAp(level: number, jobId: number, subJob: number): number {
    let sumAp = 5 * (level + 4);
    if (JobConstants.isCygnusJob(jobId)) sumAp += Math.max(level, 70) - 1;
    const jobLevel = JobConstants.getJobLevel(jobId);
    if (JobConstants.isEvanJob(jobId)) {
      if (jobId >= 2214 && jobId <= 2218) {
        sumAp += (jobId % 10) - 3 + 4 * ((jobId % 10) - 3);
      }
    } else {
      if (jobLevel === 3) sumAp += 5;
      else if (jobLevel === 4) sumAp += 10;
    }
    if (!JobConstants.isCygnusJob(jobId) && subJob === 1) {
      const addAp = jobLevel === 2 ? 1 : jobLevel === 3 ? 2 : 0;
      sumAp += addAp;
    }
    return sumAp;
  },
};
