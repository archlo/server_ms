import { FieldObjectPool } from './FieldObjectPool';
import { Rect } from '../../util/Rect';
import { MiniRoom } from '../miniroom/MiniRoom';
import { MiniRoomLeaveType } from '../miniroom/MiniRoomLeaveType';
import { MiniRoomPacket } from '../miniroom/MiniRoomPacket';
import { MiniRoomType, miniRoomTypeIsBalloon } from '../miniroom/MiniRoomType';
import { User } from '../user/User';
import { UserPacket } from '../user/UserPacket';

/**
 * Port of kinoko's MiniRoomPool. Holds the active MiniRoom instances for a
 * Field and processes pending leave requests each tick.
 */
export class MiniRoomPool extends FieldObjectPool<MiniRoom> {
  constructor(private readonly field: any) {
    super();
  }

  canAddMiniRoom(miniRoomType: MiniRoomType, x: number, y: number): boolean {
    const rect = MiniRoomPool.getRectByMiniRoomType(miniRoomType).translate(x, y);
    for (const miniRoom of this.getInsideRect(rect)) {
      if (miniRoomTypeIsBalloon(miniRoom.getType())) return false;
    }
    return true;
  }

  addMiniRoom(miniRoom: MiniRoom): void {
    miniRoom.setField(this.field);
    miniRoom.setId(this.field.nextId());
    this.addObject(miniRoom);
  }

  removeMiniRoom(miniRoom: MiniRoom): void {
    this.removeObject(miniRoom);
  }

  private static getRectByMiniRoomType(type: MiniRoomType): Rect {
    switch (type) {
      case MiniRoomType.OmokRoom:
      case MiniRoomType.MemoryGameRoom:
        return Rect.of(-90, -60, 90, 60);
      case MiniRoomType.PersonalShop:
      case MiniRoomType.EntrustedShop:
        return Rect.of(-120, -80, 80, 120);
      default:
        return Rect.of(0, 0, 0, 0);
    }
  }

  /** Port of kinoko's MiniRoomPool::updateMiniRooms - processes leave requests. */
  updateMiniRooms(): void {
    for (const miniRoom of [...this.getAll()]) {
      const leaveRequests = miniRoom.getLeaveRequests();
      if (leaveRequests.size === 0) continue;
      const owner = miniRoom.getUser(0);
      if (owner && leaveRequests.has(owner.getCharacterId())) {
        // Close room
        for (const [userIndex, user] of [...miniRoom.getUsers()]) {
          const lt = leaveRequests.get(user.getCharacterId()) ?? MiniRoomLeaveType.UserRequest;
          if (userIndex === 0) {
            user.write(MiniRoomPacket.leave(userIndex, lt));
          } else {
            user.write(MiniRoomPacket.leave(userIndex, MiniRoomLeaveType.HostOut));
          }
          user.setDialog(null);
          miniRoom.removeUser(userIndex);
        }
        this.removeMiniRoom(miniRoom);
        if (miniRoomTypeIsBalloon(miniRoom.getType()) && owner) {
          this.field.broadcastPacket(UserPacket.userMiniRoomBalloonRemove(owner));
        }
      } else {
        // Process users leaving (non-owner)
        for (const [charId, leaveType] of [...leaveRequests]) {
          const user = this.findUserById(miniRoom, charId);
          if (!user) { leaveRequests.delete(charId); continue; }
          const userIndex = miniRoom.getUserIndex(user);
          if (userIndex < 0) { leaveRequests.delete(charId); continue; }
          miniRoom.broadcastPacket(MiniRoomPacket.leave(userIndex, leaveType));
          user.setDialog(null);
          miniRoom.removeUser(userIndex);
          leaveRequests.delete(charId);
        }
      }
      miniRoom.updateBalloon();
    }
  }

  private findUserById(miniRoom: MiniRoom, charId: number): User | undefined {
    for (const u of miniRoom.getUsers().values()) {
      if (u.getCharacterId() === charId) return u;
    }
    return undefined;
  }
}
