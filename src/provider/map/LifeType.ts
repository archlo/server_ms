export enum LifeType {
  NPC = 'n',
  MOB = 'm',
}

export function lifeTypeFromString(id: string): LifeType {
  for (const v of Object.values(LifeType)) {
    if (v === id) return v as LifeType;
  }
  throw new Error(`Unknown LifeType: ${id}`);
}
