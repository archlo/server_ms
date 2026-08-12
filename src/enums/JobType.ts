import { JobConstants } from '../world/job/JobConstants';

export enum JobType {
  Resistance = 0,
  Adventurer = 1,
  Cygnus     = 2,
  Aran       = 3,
  Evan       = 4,
}

export function jobTypeByVal(val: number): JobType {
  for (const [k, v] of Object.entries(JobType)) {
    if (typeof k === 'string' && v === val) return v as JobType;
  }
  return JobType.Adventurer;
}

export function jobTypeGetStartJob(jt: JobType): number {
  switch (jt) {
    case JobType.Resistance: return 3000;
    case JobType.Cygnus:     return 1000;
    case JobType.Aran:       return 2000;
    case JobType.Evan:       return 2001;
    default:                 return 0;
  }
}
