import { InstanceFieldStorage } from './InstanceFieldStorage';
import { User } from '../../user/User';

/** Port of kinoko's Instance - a temporary field-clone with TTL, variables and a return map. */
export class Instance {
  fieldStorage!: InstanceFieldStorage;
  private readonly variables = new Map<string, string>();
  private readonly users = new Set<User>();

  constructor(
    public readonly instanceId: number,
    public readonly returnMap: number,
    public expireTime: Date,
  ) {}

  /** Extends the instance expiry by `seconds` (used by ScriptContext::setInstanceTime). */
  extendTime(seconds: number): void {
    this.expireTime = new Date(Date.now() + seconds * 1000);
  }

  addUser(user: User): void { this.users.add(user); }
  removeUser(user: User): void { this.users.delete(user); }
  getUsers(): Set<User> { return this.users; }

  getVariable(key: string): string | undefined { return this.variables.get(key); }
  setVariable(key: string, value: string): void { this.variables.set(key, value); }
}
