import { GameConstants } from '../GameConstants';
import { Friend } from './Friend';

export class FriendManager {
  private readonly friends = new Map<number, Friend>();

  constructor(public capacity: number = GameConstants.FRIEND_MAX) {}

  size(): number {
    return this.friends.size;
  }

  isFull(): boolean {
    return this.friends.size >= this.capacity;
  }

  getFriends(): Friend[] {
    return [...this.friends.values()].sort((a, b) => a.characterName.localeCompare(b.characterName));
  }

  getFriend(characterId: number): Friend | null {
    return this.friends.get(characterId) ?? null;
  }

  hasFriend(characterId: number): boolean {
    return this.friends.has(characterId);
  }

  addFriend(friend: Friend): boolean {
    if (!this.friends.has(friend.characterId) && this.isFull()) return false;
    this.friends.set(friend.characterId, friend);
    return true;
  }

  removeFriend(characterId: number): boolean {
    return this.friends.delete(characterId);
  }

  changeGroup(characterId: number, groupName: string): boolean {
    const friend = this.friends.get(characterId);
    if (!friend) return false;
    this.friends.set(characterId, friend.withGroup(groupName));
    return true;
  }

  updateChannel(characterId: number, channelId: number): boolean {
    const friend = this.friends.get(characterId);
    if (!friend) return false;
    this.friends.set(characterId, friend.withChannel(channelId));
    return true;
  }
}
