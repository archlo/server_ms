import { TradeRoom } from './TradeRoom';
import { User } from '../user/User';

class TradeManagerClass {
  private readonly trades = new Map<number, TradeRoom>(); // tradeId -> room
  private readonly pendingRequests = new Map<number, { requester: User; requestee: User }>(); // targetCharId -> request

  createRoom(userA: User, userB: User): TradeRoom {
    const room = new TradeRoom(userA, userB);
    this.trades.set(room.tradeId, room);
    return room;
  }

  getRoomByUser(user: User): TradeRoom | undefined {
    for (const room of this.trades.values()) {
      const users = room.getUsers();
      if (users[0]?.getCharacterId() === user.getCharacterId() ||
          users[1]?.getCharacterId() === user.getCharacterId()) {
        return room;
      }
    }
    return undefined;
  }

  removeRoom(tradeId: number): void {
    this.trades.delete(tradeId);
  }

  addPendingRequest(requester: User, requestee: User): void {
    this.pendingRequests.set(requestee.getCharacterId(), { requester, requestee });
  }

  getPendingRequest(targetId: number): { requester: User; requestee: User } | undefined {
    return this.pendingRequests.get(targetId);
  }

  removePendingRequest(targetId: number): void {
    this.pendingRequests.delete(targetId);
  }
}

export const tradeManager = new TradeManagerClass();
