import { FieldObject } from '../FieldObject';
import { Item } from '../../item/Item';
import { DropOwnType } from './DropOwnType';
import { GameConstants } from '../../GameConstants';

export class Drop extends FieldObject {
  readonly createTime: Date;

  constructor(
    public readonly ownType:  DropOwnType,
    public readonly source:   FieldObject | null,
    public readonly item:     Item | null,
    public readonly money:    number,
    public readonly ownerId:  number,
    public readonly questId:  number,
    createTime?: Date,
  ) {
    super();
    this.createTime = createTime ?? new Date();
  }

  isMeso(): boolean { return this.item === null; }
  isMoney(): boolean { return this.item === null && this.money > 0; }
  isUserDrop(): boolean { return this.source !== null && 'getCharacterId' in this.source; }

  getExpireTime(): Date {
    return new Date(this.createTime.getTime() + GameConstants.DROP_REMAIN_ON_GROUND_TIME * 1000);
  }

  isExpired(now: Date): boolean { return now >= this.getExpireTime(); }

  isOwnershipExpired(now: Date): boolean {
    const ownershipEnd = new Date(this.createTime.getTime() + GameConstants.DROP_OWNERSHIP_EXPIRE_TIME * 1000);
    return now >= ownershipEnd;
  }

  /**
   * Port of kinoko's Drop::canPickUp (CDropPool::TryPickUpDrop/TryPickUpDropByPet).
   */
  canPickUp(user: { getCharacterId(): number; getPartyId(): number }): boolean {
    const partyId = user.getPartyId();
    if ((this.ownType === DropOwnType.USEROWN && this.ownerId !== user.getCharacterId()) ||
        (this.ownType === DropOwnType.PARTYOWN && this.ownerId !== partyId)) {
      return this.isOwnershipExpired(new Date());
    }
    return true;
  }

  // factory
  static forMob(source: FieldObject, item: Item | null, money: number, ownerId: number, questId: number): Drop {
    const ownType = ownerId > 0 ? DropOwnType.USEROWN : DropOwnType.NOOWN;
    return new Drop(ownType, source, item, money, ownerId, questId);
  }

  static item(ownType: DropOwnType, source: FieldObject, item: Item, ownerId: number, questId = 0): Drop {
    return new Drop(ownType, source, item, 0, ownerId, questId);
  }

  static money(ownType: DropOwnType, source: FieldObject, money: number, ownerId: number): Drop {
    return new Drop(ownType, source, null, money, ownerId, 0);
  }
}
