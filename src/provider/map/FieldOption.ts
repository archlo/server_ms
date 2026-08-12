export enum FieldOption {
  MOVELIMIT                  = 0x1,
  SKILLLIMIT                 = 0x2,
  SUMMONLIMIT                = 0x4,
  MYSTICDOORLIMIT            = 0x8,
  MIGRATELIMIT               = 0x10,
  PORTALSCROLLLIMIT          = 0x20,
  TELEPORTITEMLIMIT          = 0x40,
  MINIGAMELIMIT              = 0x80,
  SPECIFICPORTALSCROLLLIMIT  = 0x100,
  TAMINGMOBLIMIT             = 0x200,
  STATCHANGEITEMCONSUMELIMIT = 0x400,
  PARTYBOSSCHANGELIMIT       = 0x800,
  NOMOBCAPACITYLIMIT         = 0x1000,
  WEDDINGINVITATIONLIMIT     = 0x2000,
  CASHWEATHERCONSUMELIMIT    = 0x4000,
  NOPET                      = 0x8000,
  ANTIMACROLIMIT             = 0x10000,
  FALLDOWNLIMIT              = 0x20000,
  SUMMONNPCLIMIT             = 0x40000,
  NOEXPDECREASE              = 0x80000,
  NODAMAGEONFALLING          = 0x100000,
  PARCELOPENLIMIT            = 0x200000,
  DROPLIMIT                  = 0x400000,
  ROCKETBOOSTERLIMIT         = 0x800000,
}

export function fieldOptionsFromLimit(fieldLimit: number): Set<FieldOption> {
  const result = new Set<FieldOption>();
  for (const v of Object.values(FieldOption)) {
    const n = v as number;
    if ((fieldLimit & n) !== 0) result.add(n as FieldOption);
  }
  return result;
}
