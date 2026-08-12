import { FieldObjectPool } from '../FieldObjectPool';
import { TownPortal } from './TownPortal';
import { TownPortalPacket } from './TownPortalPacket';
import { InstanceFieldStorage } from '../instance/InstanceFieldStorage';
import { FieldOption } from '../../../provider/map/FieldOption';
import type { User } from '../../user/User';

/**
 * Port of kinoko's TownPortalPool (world/field/TownPortalPool.java).
 *
 * One pool per Field. A Mystic Door cast creates a pair of TownPortal objects
 * (same id = owner character id): the "field portal" lives in the pool of the
 * field the priest cast from, and the "town portal" lives in the pool of the
 * priest's return/town field. Both are added via createFieldPortal below.
 */
export class TownPortalPool extends FieldObjectPool<TownPortal> {
  constructor(private readonly field: any) {
    super();
  }

  /** Port of kinoko's TownPortalPool::addTownPortal. */
  addTownPortal(townPortal: TownPortal): void {
    // Destroy existing portal owned by the same character
    const existing = this.getById(townPortal.getId());
    existing?.destroy();
    // Add portal and update clients
    this.addObject(townPortal);
    // The town-side portal does not require a create packet (it is rendered by
    // the client from the TownPortal packet sent to the caster).
    if (townPortal.townField === this.field) {
      return;
    }
    const ownerInField = this.field.getUserPool().getById(townPortal.getOwner().getCharacterId());
    const outPacket = TownPortalPacket.townPortalCreated(townPortal, true);
    ownerInField?.write(outPacket);
    this.field.getUserPool().forEachPartyMemberOf(townPortal.getOwner() as any, (member: User) => {
      member.write(outPacket);
    });
  }

  /** Port of kinoko's TownPortalPool::removeTownPortal. */
  removeTownPortal(townPortal: TownPortal): void {
    if (!this.removeObject(townPortal)) return;
    const outPacket = TownPortalPacket.townPortalRemoved(townPortal, true);
    const ownerInField = this.field.getUserPool().getById(townPortal.getOwner().getCharacterId());
    ownerInField?.write(outPacket);
    this.field.getUserPool().forEachPartyMemberOf(townPortal.getOwner() as any, (member: User) => {
      member.write(outPacket);
    });
  }

  /**
   * Port of kinoko's TownPortalPool::createFieldPortal.
   * Called on the field the priest is standing in. Creates the town-side portal
   * in the return map, then adds the field-side portal here.
   * Returns the created TownPortal, or undefined if a portal cannot be created.
   */
  createFieldPortal(
    user: any,
    skillId: number,
    x: number,
    y: number,
    expireTime: Date,
  ): TownPortal | undefined {
    const field = this.field;
    // Check if portal can be created
    if (field.hasFieldOption(FieldOption.MYSTICDOORLIMIT) || field.getFieldStorage() instanceof InstanceFieldStorage) {
      return undefined;
    }
    // Resolve town (return) field
    const fieldStorage = field.getFieldStorage();
    const returnMap = field.getReturnMap();
    const returnField = fieldStorage?.getFieldById?.(returnMap) ?? null;
    if (!returnField || returnField === field) {
      return undefined;
    }
    // Create portal in the town field
    const townPortal = returnField.getTownPortalPool().createTownPortal(user, skillId, field, x, y, expireTime);
    if (!townPortal) {
      return undefined;
    }
    // Add the field-side portal in this field
    this.addTownPortal(townPortal);
    return townPortal;
  }

  /** Port of kinoko's private TownPortalPool::createTownPortal (town side). */
  private createTownPortal(
    user: any,
    skillId: number,
    targetField: any,
    x: number,
    y: number,
    expireTime: Date,
  ): TownPortal | undefined {
    const townPortal = TownPortal.from(user, skillId, this.field, targetField, x, y, expireTime);
    this.addTownPortal(townPortal);
    return townPortal;
  }

  /** Expire any town portals whose expireTime has passed. Returns the expired portals. */
  expireTownPortals(now: Date): TownPortal[] {
    const expired: TownPortal[] = [];
    for (const townPortal of this.getAll()) {
      if (townPortal.expireTime > now) continue;
      townPortal.destroy();
      expired.push(townPortal);
    }
    return expired;
  }
}
