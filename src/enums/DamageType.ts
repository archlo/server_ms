export enum DamageType {
  Magic    = 0x00,
  Physical = -0x01,
  Counter  = -0x02,
  Obstacle = -0x03,
  Stat     = -0x04,
  None     = 999,
}

export function damageTypeByVal(type: number): DamageType {
  for (const [k, v] of Object.entries(DamageType)) {
    if (typeof k === 'string' && v === type) return v as DamageType;
  }
  return DamageType.None;
}
