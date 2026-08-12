export enum UserType {
  Player    = 0,
  Tester    = 1,
  Intern    = 2,
  GameMaster = 3,
  Admin     = 5,
}

export const UserTypeSubGrade: Record<UserType, number> = {
  [UserType.Player]:    0,
  [UserType.Tester]:    0x100,
  [UserType.Intern]:    0,
  [UserType.GameMaster]: 0x40,
  [UserType.Admin]:     0x80,
};

export function userTypeByLevel(lvl: number): UserType {
  for (const [k, v] of Object.entries(UserType)) {
    if (typeof k === 'string' && v === lvl) return v as UserType;
  }
  return UserType.Player;
}
