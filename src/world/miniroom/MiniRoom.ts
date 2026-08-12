import { FieldObject } from '../field/FieldObject';
import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { MiniRoomLeaveType } from './MiniRoomLeaveType';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';

export abstract class MiniRoom extends FieldObject {
  protected readonly title: string;
  protected readonly password: string | null;
  protected readonly gameSpec: number;
  protected readonly users = new Map<number, User>();          // userIndex -> User
  protected readonly leaveRequests = new Map<number, MiniRoomLeaveType>(); // characterId -> leaveType
  protected gameOn = false;
  protected ready = false;
  protected nextTurn = 0;

  constructor(title: string, password: string | null, gameSpec: number) {
    super();
    this.title = title;
    this.password = password;
    this.gameSpec = gameSpec;
  }

  abstract getType(): MiniRoomType;
  abstract getMaxUsers(): number;
  abstract handlePacket(user: User, mrp: MiniRoomProtocol, r: PacketReader): void;
  abstract leave(user: User): void;
  abstract updateBalloon(): void;

  getTitle(): string { return this.title; }
  getPassword(): string | null { return this.password; }
  getGameSpec(): number { return this.gameSpec; }

  addUser(userIndex: number, user: User): void { this.users.set(userIndex, user); }
  removeUser(userIndex: number): void { this.users.delete(userIndex); }
  getUsers(): Map<number, User> { return this.users; }
  getUser(userIndex: number): User | undefined { return this.users.get(userIndex); }

  getUserIndex(user: User): number {
    for (const [idx, u] of this.users) {
      if (u.getCharacterId() === user.getCharacterId()) return idx;
    }
    return -1;
  }

  getLeaveRequests(): Map<number, MiniRoomLeaveType> { return this.leaveRequests; }
  setLeaveRequest(user: User, leaveType: MiniRoomLeaveType): void {
    this.leaveRequests.set(user.getCharacterId(), leaveType);
  }

  isGameOn(): boolean { return this.gameOn; }
  setGameOn(on: boolean): void { this.gameOn = on; }

  isReady(): boolean { return this.ready; }
  setReady(r: boolean): void { this.ready = r; }

  getNextTurn(): number { return this.nextTurn; }
  setNextTurn(t: number): void { this.nextTurn = t; }

  // ---- helpers ----

  isOwner(user: User): boolean { return this.getUserIndex(user) === 0; }

  checkPassword(password: string | null): boolean {
    if (this.password === null || this.password.length === 0) return true;
    return this.password === password;
  }

  isPrivate(): boolean { return this.password !== null && this.password.length > 0; }

  broadcastPacket(packet: Buffer): void {
    for (const u of this.users.values()) u.write(packet);
  }
}
