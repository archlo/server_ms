import { MessengerRoom } from './MessengerRoom';

type MessengerUser = {
  getCharacterId(): number;
  getCharacterName(): string;
  write?(packet: Buffer): void;
};

export class MessengerManager {
  private readonly rooms = new Map<number, MessengerRoom>();
  private readonly roomByCharacterId = new Map<number, number>();
  private nextMessengerId = 1;

  createRoom(user: MessengerUser): MessengerRoom {
    const room = new MessengerRoom(this.nextMessengerId++);
    this.rooms.set(room.messengerId, room);
    this.joinRoom(user, room.messengerId);
    return room;
  }

  getRoom(messengerId: number): MessengerRoom | null {
    return this.rooms.get(messengerId) ?? null;
  }

  getRoomByUser(user: MessengerUser): MessengerRoom | null {
    const roomId = this.roomByCharacterId.get(user.getCharacterId());
    return roomId === undefined ? null : this.getRoom(roomId);
  }

  joinRoom(user: MessengerUser, messengerId: number): MessengerRoom | null {
    const room = this.rooms.get(messengerId);
    if (!room || room.isFull()) return null;
    if (this.getRoomByUser(user)) this.leaveRoom(user);
    const member = room.addMember(
      user.getCharacterId(),
      user.getCharacterName(),
      0,
      typeof user.write === 'function' ? user as { write(packet: Buffer): void } : null,
    );
    if (!member) return null;
    this.roomByCharacterId.set(user.getCharacterId(), messengerId);
    return room;
  }

  leaveRoom(user: MessengerUser): MessengerRoom | null {
    const characterId = user.getCharacterId();
    const roomId = this.roomByCharacterId.get(characterId);
    if (roomId === undefined) return null;
    const room = this.rooms.get(roomId) ?? null;
    this.roomByCharacterId.delete(characterId);
    if (!room) return null;
    room.removeMember(characterId);
    if (room.getMembers().length === 0) {
      this.rooms.delete(roomId);
    }
    return room;
  }

  clear(): void {
    this.rooms.clear();
    this.roomByCharacterId.clear();
    this.nextMessengerId = 1;
  }
}

export const messengerManager = new MessengerManager();
