export enum RequiredJob {
  Warrior = 1,
  Magician = 2,
  Bowman = 4,
  Thief = 8,
  Pirate = 16,
}

export function getVal(job: RequiredJob): number {
  return job;
}
