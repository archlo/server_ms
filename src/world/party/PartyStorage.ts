import { Party } from './Party';

export class PartyStorage {
  private readonly partyMap = new Map<number, Party>();

  addParty(party: Party): void {
    this.partyMap.set(party.partyId, party);
  }

  removeParty(party: Party): boolean {
    return this.partyMap.delete(party.partyId);
  }

  getPartyById(partyId: number): Party | undefined {
    return this.partyMap.get(partyId);
  }
}

export const partyStorage = new PartyStorage();
