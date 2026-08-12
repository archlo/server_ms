import { Job } from './Job';

export const RaceSelect = {
  RESISTANCE: { race: 0, job: Job.CITIZEN },
  NORMAL:     { race: 1, job: Job.BEGINNER },
  CYGNUS:     { race: 2, job: Job.NOBLESSE },
  ARAN:       { race: 3, job: Job.ARAN_BEGINNER },
  EVAN:       { race: 4, job: Job.EVAN_BEGINNER },
} as const;

export function getJobByRace(race: number): number | undefined {
  for (const entry of Object.values(RaceSelect)) {
    if (entry.race === race) return entry.job;
  }
  return undefined;
}
