import { Mob } from './Mob';
import { MobProvider } from '../../../provider/MobProvider';
import { Rect } from '../../../util/Rect';
import { GameConstants } from '../../GameConstants';

export class MobSpawnPoint {
  private nextMobRespawn: Date = new Date(0); // ready immediately
  private readonly checkArea: Rect;

  constructor(
    public readonly field: any, // Field (forward ref)
    public readonly templateId: number,
    public readonly x: number,
    public readonly y: number,
    public readonly fh: number,
    public readonly mobTime: number,
  ) {
    this.checkArea = Rect.of(x - 100, y - 100, x + 100, y + 100);
  }

  setNextMobRespawn(): void {
    if (this.mobTime > 0) {
      this.nextMobRespawn = new Date(Date.now() + this.mobTime * 1000);
    }
  }

  trySpawnMob(now: Date): Mob | null {
    if (now < this.nextMobRespawn) return null;
    return this.doSpawn();
  }

  /** Force-spawns a mob from this spawn point, bypassing the time and area gates. */
  forceSpawn(): Mob | null {
    const mob = this.doSpawn();
    if (mob && this.mobTime !== 0) this.nextMobRespawn = new Date(8640000000000000);
    return mob;
  }

  private doSpawn(): Mob | null {
    // Check if mobs already in spawn area
    const inArea = this.field.getMobPool().getInsideRect(this.checkArea);
    if (inArea.length > 0) return null;

    const template = MobProvider.getMobTemplate(this.templateId);
    if (!template) return null;

    const mob = new Mob(template, this, this.x, this.y, this.fh);
    if (this.mobTime !== 0) this.nextMobRespawn = new Date(8640000000000000);
    return mob;
  }
}
