import { FieldObjectPool } from '../FieldObjectPool';
import { Mob } from './Mob';
import { MobSpawnPoint } from './MobSpawnPoint';
import { MobLeaveType } from './MobLeaveType';
import { MobPacket } from './MobPacket';
import { GameConstants } from '../../GameConstants';

export class MobPool extends FieldObjectPool<Mob> {
  private readonly spawnPoints: MobSpawnPoint[] = [];
  private idCounter = 1;

  constructor(private readonly field: any) { super(); }

  getSpawnPoints(): MobSpawnPoint[] { return this.spawnPoints; }
  addSpawnPoint(sp: MobSpawnPoint): void { this.spawnPoints.push(sp); }
  clearSpawnPoints(): void { this.spawnPoints.length = 0; }

  addMob(mob: Mob): void {
    mob.setField(this.field);
    mob.setId(this.idCounter++);
    this.addObject(mob);
  }

  /**
   * Port of kinoko's MobPool::removeMob (#17). KerningPQ stage-clear special
   * cases not ported (party-quest scripts out of scope).
   */
  removeMob(mob: Mob, leaveType: MobLeaveType): boolean {
    if (!this.removeObject(mob)) return false;
    setTimeout(() => {
      this.field.broadcastPacket(MobPacket.mobLeaveField(mob, leaveType));
    }, 0);
    return true;
  }

  tryRespawn(now: Date): Mob[] {
    if (this.getCount() >= GameConstants.MOB_CAPACITY_MAX) return [];
    const spawned: Mob[] = [];
    for (const sp of this.spawnPoints) {
      const mob = sp.trySpawnMob(now);
      if (mob) { this.addMob(mob); spawned.push(mob); }
    }
    return spawned;
  }

  /** Port of kinoko's MobPool::respawnMobs. Force-respawns mobs from all spawn
   *  points immediately, bypassing the time gate. Used by KerningPQ stage entry. */
  respawnMobs(): Mob[] {
    if (this.getCount() >= GameConstants.MOB_CAPACITY_MAX) return [];
    const spawned: Mob[] = [];
    for (const sp of this.spawnPoints) {
      const mob = sp.forceSpawn();
      if (mob) { this.addMob(mob); spawned.push(mob); }
    }
    return spawned;
  }
}
