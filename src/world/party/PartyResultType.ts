export enum PartyResultType {
  InviteParty = 4,
  LoadParty_Done = 7,
  CreateNewParty_Done = 8,
  CreateNewParty_AlreadyJoined = 9,
  CreateNewParty_Beginner = 10,
  CreateNewParty_Unknown = 11,
  WithdrawParty_Done = 12,
  WithdrawParty_NotJoined = 13,
  WithdrawParty_Unknown = 14,
  JoinParty_Done = 15,
  JoinParty_Done2 = 16,
  JoinParty_AlreadyJoined = 17,
  JoinParty_AlreadyFull = 18,
  JoinParty_OverDesiredSize = 19,
  JoinParty_UnknownUser = 20,
  JoinParty_Unknown = 21,
  InviteParty_Sent = 22,
  InviteParty_BlockedUser = 23,
  InviteParty_AlreadyInvited = 24,
  InviteParty_AlreadyInvitedByInviter = 25,
  InviteParty_Rejected = 26,
  InviteParty_Accepted = 27,
  KickParty_Done = 28,
  KickParty_FieldLimit = 29,
  KickParty_Unknown = 30,
  ChangePartyBoss_Done = 31,
  ChangePartyBoss_NotSameField = 32,
  ChangePartyBoss_NoMemberInSameField = 33,
  ChangePartyBoss_NotSameChannel = 34,
  ChangePartyBoss_Unknown = 35,
  AdminCannotCreate = 36,
  AdminCannotInvite = 37,
  UserMigration = 38,
  ChangeLevelOrJob = 39,
  SuccessToSelectPQReward = 40,
  FailToSelectPQReward = 41,
  ReceivePQReward = 42,
  FailToRequestPQReward = 43,
  CanNotInThisField = 44,
  ServerMsg = 45,
  TownPortalChanged = 46,
  OpenGate = 47,
}

export function getPartyResultType(value: number): PartyResultType | null {
  for (const [key, val] of Object.entries(PartyResultType)) {
    if (typeof val === 'number' && val === value) {
      return val as PartyResultType;
    }
  }
  return null;
}
