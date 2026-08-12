import { PacketWriter } from '../../protocol/packets/packetWriter';
import { GameConstants } from '../GameConstants';

export interface PartyMember {
  characterId: number;
  characterName: string;
  job: number;
  level: number;
  channelId: number;
  fieldId: number;
  townPortal: { fieldId: number; portalId: number; hp: number };
}

const EMPTY_MEMBER: PartyMember = {
  characterId: 0,
  characterName: '',
  job: 0,
  level: 0,
  channelId: GameConstants.CHANNEL_OFFLINE,
  fieldId: GameConstants.UNDEFINED_FIELD_ID,
  townPortal: { fieldId: 0, portalId: 0, hp: 0 },
};

export class Party {
  readonly partyId: number;
  readonly partyMembers: PartyMember[] = [];
  readonly partyInvites: Map<number, number> = new Map();
  partyBossId: number;

  constructor(partyId: number, member: PartyMember) {
    this.partyId = partyId;
    this.partyMembers.push(member);
    this.partyBossId = member.characterId;
  }

  canAddMember(characterId: number): boolean {
    if (this.partyMembers.length >= GameConstants.PARTY_MAX) return false;
    return !this.partyMembers.some((m) => m.characterId === characterId);
  }

  addMember(member: PartyMember): boolean {
    if (!this.canAddMember(member.characterId)) return false;
    this.partyMembers.push(member);
    return true;
  }

  removeMember(characterId: number): boolean {
    const idx = this.partyMembers.findIndex((m) => m.characterId === characterId);
    if (idx === -1) return false;
    this.partyMembers.splice(idx, 1);
    return true;
  }

  registerInvite(inviterId: number, targetId: number): void {
    this.partyInvites.set(targetId, inviterId);
  }

  unregisterInvite(inviterId: number, targetId: number): boolean {
    return this.partyInvites.get(targetId) === inviterId && this.partyInvites.delete(targetId);
  }

  setPartyBossId(currentBossId: number, newBossId: number): boolean {
    if (this.partyBossId !== 0 && this.partyBossId !== currentBossId) return false;
    if (!this.hasMember(newBossId)) return false;
    this.partyBossId = newBossId;
    return true;
  }

  getMember(characterId: number): PartyMember | undefined {
    return this.partyMembers.find((m) => m.characterId === characterId);
  }

  getMemberIndex(characterId: number): number {
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      if (i >= this.partyMembers.length) break;
      if (this.partyMembers[i].characterId === characterId) return i + 1;
    }
    return 0;
  }

  hasMember(characterId: number): boolean {
    return this.getMember(characterId) !== undefined;
  }

  updateMember(member: PartyMember): void {
    for (let i = 0; i < this.partyMembers.length; i++) {
      if (this.partyMembers[i].characterId === member.characterId) {
        this.partyMembers[i] = member;
        break;
      }
    }
  }

  createInfo(characterId: number): { partyId: number; memberIndex: number; boss: boolean } {
    return {
      partyId: this.partyId,
      memberIndex: this.getMemberIndex(characterId),
      boss: this.partyBossId === characterId,
    };
  }

  encode(w: PacketWriter): void {
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeInt(m.characterId);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeMapleAsciiString(m.characterName);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeInt(m.job);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeInt(m.level);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeInt(m.channelId);
    }
    w.writeInt(this.partyBossId);
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeInt(m.fieldId);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      const m = i < this.partyMembers.length ? this.partyMembers[i] : EMPTY_MEMBER;
      w.writeInt(m.townPortal.fieldId);
      w.writeInt(m.townPortal.portalId);
      w.writeInt(m.townPortal.hp);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      w.writeInt(0);
    }
    for (let i = 0; i < GameConstants.PARTY_MAX; i++) {
      w.writeInt(0);
    }
    w.writeInt(0);
    w.writeInt(0);
  }
}
