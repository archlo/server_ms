import { GameConstants } from '../GameConstants';
import { MessengerMember } from './MessengerMember';

export class MessengerRoom {
  private readonly members = new Map<number, MessengerMember>();

  constructor(readonly messengerId: number) {}

  getMembers(): MessengerMember[] {
    return [...this.members.values()].sort((a, b) => a.position - b.position);
  }

  getMember(characterId: number): MessengerMember | null {
    return this.members.get(characterId) ?? null;
  }

  hasMember(characterId: number): boolean {
    return this.members.has(characterId);
  }

  isFull(): boolean {
    return this.members.size >= GameConstants.MESSENGER_MAX;
  }

  addMember(
    characterId: number,
    characterName: string,
    channelId = 0,
    user: { write(packet: Buffer): void } | null = null,
  ): MessengerMember | null {
    const existing = this.members.get(characterId);
    if (existing) return existing;
    const position = this.nextPosition();
    if (position === null) return null;
    const member = new MessengerMember(characterId, characterName, position, channelId, user);
    this.members.set(characterId, member);
    return member;
  }

  removeMember(characterId: number): MessengerMember | null {
    const member = this.members.get(characterId) ?? null;
    this.members.delete(characterId);
    return member;
  }

  private nextPosition(): number | null {
    const used = new Set(this.members.values()).values();
    const positions = new Set<number>();
    for (const member of used) positions.add(member.position);
    for (let position = 0; position < GameConstants.MESSENGER_MAX; position++) {
      if (!positions.has(position)) return position;
    }
    return null;
  }
}
