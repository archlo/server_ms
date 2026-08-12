import { FieldObject } from '../FieldObject';
import { PortalInfo } from '../../../provider/map/PortalInfo';
import { GameConstants } from '../../GameConstants';

/**
 * Port of kinoko's TownPortal (world/field/TownPortal.java).
 *
 * A Mystic Door portal entity. A single cast creates one TownPortal object
 * that is added to two pools (keyed by the owner's character id): the field
 * pool of the field the priest cast from (the "field portal", at the cast
 * position) and the pool of the priest's town/return map (the "town portal",
 * positioned at a town portal point). Either can be entered by the priest or a
 * party member to warp to the other side. The portal expires after the skill
 * duration elapses.
 */
export class TownPortal extends FieldObject {
  constructor(
    private readonly _owner: { getCharacterId: () => number; getTownPortalIndex: () => number },
    public readonly skillId: number,
    public readonly townField: any, // Field
    public readonly waitTime: Date,
    public readonly expireTime: Date,
  ) {
    super();
  }

  getOwner(): { getCharacterId: () => number; getTownPortalIndex: () => number } {
    return this._owner;
  }

  /** Port of kinoko's TownPortal::getTownPortalPoint. */
  getTownPortalPoint(): PortalInfo {
    const townPortalPoints = this.townField.getMapInfo().getTownPortalPoints() as PortalInfo[];
    if (townPortalPoints.length === 0) {
      return this.townField.getPortalByName(GameConstants.DEFAULT_PORTAL_NAME) ?? PortalInfo.EMPTY;
    }
    return townPortalPoints[this._owner.getTownPortalIndex() % townPortalPoints.length];
  }

  /** Port of kinoko's TownPortal::destroy - removes the portal from both fields. */
  destroy(): void {
    this.getField()?.getTownPortalPool()?.removeTownPortal(this);
    this.townField?.getTownPortalPool()?.removeTownPortal(this);
  }

  getId(): number {
    return this._owner.getCharacterId();
  }

  /** Port of kinoko's TownPortal::from. */
  static from(
    owner: { getCharacterId: () => number; getTownPortalIndex: () => number },
    skillId: number,
    townField: any,
    targetField: any,
    targetX: number,
    targetY: number,
    expireTime: Date,
  ): TownPortal {
    const townPortal = new TownPortal(owner, skillId, townField, new Date(Date.now() + 5_000), expireTime);
    townPortal.setField(targetField);
    townPortal.setX(targetX);
    townPortal.setY(targetY);
    return townPortal;
  }
}
