export enum MiniRoomInviteType {
  Success = 0,
  NoCharacter = 1,
  CannotInvite = 2,
  Rejected = 3,
  Blocked = 4,
}

export function miniRoomInviteTypeByValue(value: number): MiniRoomInviteType | null {
  for (const k of Object.keys(MiniRoomInviteType)) {
    const v = (MiniRoomInviteType as any)[k];
    if (typeof v === 'number' && v === value) return v as MiniRoomInviteType;
  }
  return null;
}
