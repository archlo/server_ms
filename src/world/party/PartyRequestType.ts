export enum PartyRequestType {
  LoadParty = 0,
  CreateNewParty = 1,
  WithdrawParty = 2,
  JoinParty = 3,
  InviteParty = 4,
  KickParty = 5,
  ChangePartyBoss = 6,
}

export function getPartyRequestType(value: number): PartyRequestType | null {
  for (const [key, val] of Object.entries(PartyRequestType)) {
    if (typeof val === 'number' && val === value) {
      return val as PartyRequestType;
    }
  }
  return null;
}
