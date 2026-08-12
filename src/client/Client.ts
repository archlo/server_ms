import { Char } from '../world/user/Char';
import { Account } from '../world/user/Account';
import { User } from '../world/user/User';
import { Channel } from '../world/Channel';
import { OutPacket } from '../protocol/packets/packetWriter';

export class Client {
  private lock: boolean = false;
  private chr: Char | null = null;
  private account: Account | null = null;
  private user: User | null = null;
  private channel: number = 0;
  private worldId: number = 0;
  private authorized: boolean = false;
  private channelInstance: Channel | null = null;
  private machineID: number[] = [];
  private oldChannel: number = 0;

  getLock(): boolean { return this.lock; }

  write(data: OutPacket | number[]): void {
  }

  getAccount(): Account | null { return this.account; }
  setAccount(account: Account): void { this.account = account; }

  getChannel(): number { return this.channel; }
  setChannel(channel: number): void { this.channel = channel; }

  getWorldId(): number { return this.worldId; }
  setWorldId(worldId: number): void { this.worldId = worldId; }

  getChr(): Char | null { return this.chr; }
  setChr(chr: Char | null): void { this.chr = chr; }

  isAuthorized(): boolean { return this.authorized; }
  setAuthorized(authorized: boolean): void { this.authorized = authorized; }

  getChannelInstance(): Channel | null { return this.channelInstance; }
  setChannelInstance(channelInstance: Channel): void { this.channelInstance = channelInstance; }

  getMachineID(): number[] { return this.machineID; }
  setMachineID(machineID: number[]): void { this.machineID = machineID; }

  hasCorrectMachineID(machineID: number[]): boolean {
    if (this.machineID.length !== machineID.length) return false;
    return this.machineID.every((v, i) => v === machineID[i]);
  }

  getOldChannel(): number { return this.oldChannel; }
  setOldChannel(oldChannel: number): void { this.oldChannel = oldChannel; }

  getUser(): User | null { return this.user; }
  setUser(user: User): void { this.user = user; }
}
