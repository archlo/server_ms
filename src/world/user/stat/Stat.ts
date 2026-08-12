export enum Stat {
  SKIN    = 0x1,
  FACE    = 0x2,
  HAIR    = 0x4,
  PETSN   = 0x8,
  LEVEL   = 0x10,
  JOB     = 0x20,
  STR     = 0x40,
  DEX     = 0x80,
  INT     = 0x100,
  LUK     = 0x200,
  HP      = 0x400,
  MHP     = 0x800,
  MP      = 0x1000,
  MMP     = 0x2000,
  AP      = 0x4000,
  SP      = 0x8000,
  EXP     = 0x10000,
  POP     = 0x20000,
  MONEY   = 0x40000,
  PETSN2  = 0x80000,
  PETSN3  = 0x100000,
  TEMPEXP = 0x200000,
}

export const STAT_ENCODE_ORDER: Stat[] = Object.values(Stat).filter(v => typeof v === 'number') as Stat[];

export function statMask(stats: Set<Stat>): number {
  let mask = 0;
  for (const s of stats) mask |= s;
  return mask;
}
