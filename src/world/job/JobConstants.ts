export const JobConstants = {
  BEGINNER: 0,
  NOBLESSE: 1000,
  LEGEND: 2000,
  EVAN: 2001,
  CITIZEN: 3000,

  getJobLevel(jobId: number): number {
    if (jobId % 100 === 0 || jobId === 2001) return 1;
    let jobLevel: number;
    if (Math.floor(jobId / 10) === 43) {
      jobLevel = (jobId - 430) / 2;
    } else {
      jobLevel = jobId % 10;
    }
    jobLevel += 2;
    if (jobLevel >= 2 && (jobLevel <= 4 || (jobLevel <= 10 && JobConstants.isEvanJob(jobId)))) return jobLevel;
    return 0;
  },

  getJobCategory(jobId: number): number { return Math.floor(jobId % 1000 / 100); },

  getExtendSpJobLevel(jobId: number, level: number): number {
    if (JobConstants.isEvanJob(jobId)) {
      if (level <= 10)  return 0;
      if (level <= 20)  return 1;
      if (level <= 30)  return 2;
      if (level <= 40)  return 3;
      if (level <= 50)  return 4;
      if (level <= 60)  return 5;
      if (level <= 80)  return 6;
      if (level <= 100) return 7;
      if (level <= 120) return 8;
      if (level <= 160) return 9;
      return 10;
    }
    if (level <= 10)  return 0;
    if (level <= 30)  return 1;
    if (level <= 70)  return 2;
    if (level <= 120) return 3;
    return 4;
  },

  isBeginnerJob(jobId: number):         boolean { return jobId % 1000 === 0 || jobId === 2001; },
  isAranJob(jobId: number):             boolean { return Math.floor(jobId / 100) === 21 || jobId === 2000; },
  isEvanJob(jobId: number):             boolean { return Math.floor(jobId / 100) === 22 || jobId === 2001; },
  isDragonJob(jobId: number):           boolean { return Math.floor(jobId / 100) === 22; },
  isCygnusJob(jobId: number):           boolean { return Math.floor(jobId / 1000) === 1; },
  isNightLordJob(jobId: number):        boolean { return Math.floor(jobId / 10) === 41; },
  isShadowerJob(jobId: number):         boolean { return Math.floor(jobId / 10) === 42; },
  isNightWalkerJob(jobId: number):      boolean { return Math.floor(jobId / 100) === 14; },
  isBuccaneerJob(jobId: number):        boolean { return Math.floor(jobId / 100) === 51; },
  isCorsairJob(jobId: number):          boolean { return Math.floor(jobId / 100) === 52; },
  isBowmasterJob(jobId: number):        boolean { return Math.floor(jobId / 10) === 31; },
  isMarksmanJob(jobId: number):         boolean { return Math.floor(jobId / 10) === 32; },
  isResistanceJob(jobId: number):       boolean { return Math.floor(jobId / 1000) === 3; },
  isBattleMageJob(jobId: number):       boolean { return Math.floor(jobId / 100) === 32; },
  isWildHunterJob(jobId: number):       boolean { return Math.floor(jobId / 100) === 33; },
  isMechanicJob(jobId: number):         boolean { return Math.floor(jobId / 100) === 35; },
  isBlazeWizardJob(jobId: number):      boolean { return Math.floor(jobId / 100) === 12; },
  isFirePoisonJob(jobId: number):       boolean { return Math.floor(jobId / 10) === 21 || Math.floor(jobId / 10) === 41; },
  isIceLightningJob(jobId: number):     boolean { return Math.floor(jobId / 10) === 22 || Math.floor(jobId / 10) === 42; },
  isBishopJob(jobId: number):           boolean { return Math.floor(jobId / 10) === 23 || Math.floor(jobId / 10) === 43; },
  isExtendSpJob(jobId: number):         boolean {
    return JobConstants.isResistanceJob(jobId)
      || (JobConstants.isThirdJob(jobId) && JobConstants.isAdventurerMage(jobId))
      || JobConstants.isEvanJr(jobId);
  },
  isThirdJob(jobId: number):            boolean { return Math.floor(jobId / 1000) === 2; },
  isAdventurerMage(jobId: number):      boolean {
    return jobId === 200 || jobId === 210 || jobId === 211 || jobId === 212
      || jobId === 220 || jobId === 221 || jobId === 222
      || jobId === 230 || jobId === 231 || jobId === 232;
  },
  isEvanJr(jobId: number):              boolean { return jobId === 2001; },
  getEvanJobLevel(jobId: number): number {
    switch (jobId) {
      case 2200: case 2210: return 1;
      case 2211: case 2212: case 2213: return 2;
      case 2214: case 2215: case 2216: return 3;
      case 2217: case 2218: return 4;
      default: return 0;
    }
  },
  isDualJob(jobId: number):             boolean { return Math.floor(jobId / 10) === 43; },
  isDualBlade(jobId: number):           boolean { return Math.floor(jobId / 10) === 43; },
  isDualJobBorn(jobId: number, subJob: number): boolean {
    return Math.floor(jobId / 1000) === 0 && subJob === 1;
  },
  isAdminJob(jobId: number):            boolean { return Math.floor(jobId % 1000 / 100) === 9; },
  isManagerJob(jobId: number):          boolean { return Math.floor(jobId % 1000 / 100) === 8; },
  canUseBareHand(jobId: number):        boolean { return JobConstants.getJobCategory(jobId) === 5; },

  getSkillRootFromJob(jobId: number): number[] {
    const jobs: number[] = [];
    const jobCategory = JobConstants.getJobCategory(jobId);
    if (jobCategory !== 0) {
      const firstJob = 100 * (jobCategory + 10 * Math.floor(jobId / 1000));
      jobs.push(firstJob);
      const secondJobType = Math.floor(jobId % 100 / 10);
      if (secondJobType !== 0) {
        const secondJob = firstJob + 10 * secondJobType;
        jobs.push(secondJob);
        for (let i = 1; i <= 8; i++) {
          if (jobId % 10 < i) break;
          jobs.push(secondJob + i);
        }
      }
    }
    if (JobConstants.isEvanJob(jobId)) {
      jobs.push(2001);
    } else {
      jobs.push(1000 * Math.floor(jobId / 1000));
    }
    return jobs;
  },

  getNoviceSkillRootFromJob(jobId: number): number {
    return JobConstants.isEvanJob(jobId) ? 2001 : 1000 * Math.floor(jobId / 1000);
  },

  isCorrectJobForSkillRoot(jobId: number, skillRoot: number): boolean {
    if (skillRoot % 100 === 0) return Math.floor(skillRoot / 100) === Math.floor(jobId / 100);
    return Math.floor(skillRoot / 10) === Math.floor(jobId / 10) && jobId % 10 >= skillRoot % 10;
  },

  getJobChangeLevel(jobId: number, subJob: number, step: number): number {
    const group = Math.floor(jobId / 1000);
    if (JobConstants.isResistanceJob(jobId) || JobConstants.isEvanJob(jobId)) {
      return group !== 1 ? 200 : 120;
    }
    switch (step) {
      case 1:
        if (group === 0 && JobConstants.getJobCategory(jobId) === 2) {
          return 8;
        }
        return 10;
      case 2:
        return JobConstants.isDualJobBorn(jobId, subJob) ? 20 : 30;
      case 3:
        return JobConstants.isDualJobBorn(jobId, subJob) ? 55 : 70;
      case 4:
        return 120;
      default:
        return group !== 1 ? 200 : 120;
    }
  },
};
