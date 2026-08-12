import { FieldObjectPool } from '../FieldObjectPool';
import { Drop } from './Drop';
import { DropEnterType } from './DropEnterType';
import { DropLeaveType } from './DropLeaveType';
import { DropPacket } from './DropPacket';
import { GameConstants } from '../../GameConstants';
import { User, statChangedPacket } from '../../user/User';
import { Stat } from '../../user/stat/Stat';
import { inventoryOperation } from '../../item/ItemPacket';
import { MessagePacket } from '../../user/MessagePacket';

export class DropPool extends FieldObjectPool<Drop> {
  private idCounter = 1;

  constructor(private readonly field: any) { super(); }

  addDrop(drop: Drop): void;
  addDrop(drop: Drop, enterType: DropEnterType, x: number, y: number, delay: number): void;
  addDrop(drop: Drop, enterType?: DropEnterType, x?: number, y?: number, delay = 0): void {
    if (enterType !== undefined) {
      this.placeDrop(drop, x ?? drop.getX(), y ?? drop.getY());
    }
    drop.setField(this.field);
    if (drop.getId() === 0) {
      drop.setId(typeof this.field.nextId === 'function' ? this.field.nextId() : this.idCounter++);
    }
    this.addObject(drop);
    if (enterType !== undefined) {
      this.field.broadcastPacket(DropPacket.dropEnterField(drop, enterType, delay));
    }
  }

  addDrops(drops: Drop[], enterType: DropEnterType, centerX: number, centerY: number, initialDelay: number, addDelay: number): void {
    const ordered = [...drops];
    const questDrops = ordered.filter(drop => drop.questId !== 0);
    const normalDrops = ordered.filter(drop => drop.questId === 0);
    shuffle(normalDrops);
    for (let i = 0; i < questDrops.length; i++) {
      if (i % 2 === 0) normalDrops.unshift(questDrops[i]);
      else normalDrops.push(questDrops[i]);
    }

    let dropX = centerX - Math.floor(normalDrops.length * GameConstants.DROP_SPREAD / 2);
    let delay = initialDelay;
    for (const drop of normalDrops) {
      this.addDrop(drop, enterType, dropX, centerY, delay);
      dropX += GameConstants.DROP_SPREAD;
      delay += addDelay;
    }
  }

  /** Port of kinoko's DropPool::removeDrop - removes the drop and broadcasts dropLeaveField. */
  removeDrop(drop: Drop, leaveType: DropLeaveType, pickUpId = 0, petIndex = 0, delay = 0): boolean {
    if (!this.removeObject(drop)) return false;
    this.field.broadcastPacket(DropPacket.dropLeaveField(drop, leaveType, pickUpId, petIndex, delay));
    return true;
  }

  /**
   * Port of kinoko's DropPool::pickUpDrop.
   * Quest-item validation (quest drop visibility filtering) remains cut
   * until per-user quest drop filtering is wired in enter-field broadcasts.
   * PARTYOWN money-split across party members is now functional (Batch 9).
   */
  pickUpDrop(user: User, drop: Drop, leaveType: DropLeaveType, petIndex: number): void {
    if (!drop.canPickUp(user)) {
      user.write(MessagePacket.unavailableForPickUp());
      return;
    }

    if (drop.questId !== 0 && !user.getQuestManager().hasQuestStarted(drop.questId)) {
      user.write(MessagePacket.unavailableForPickUp());
      return;
    }

    const im = user.getInventoryManager();
    if (drop.isMoney()) {
      const newMoney = im.money + drop.money;
      if (newMoney > GameConstants.MONEY_MAX) {
        return;
      }
    } else {
      if (!drop.item || !im.canAddItem(drop.item)) {
        user.write(MessagePacket.cannotGetAnymoreItems());
        return;
      }
    }

    if (!this.removeDrop(drop, leaveType, user.getCharacterId(), petIndex, 0)) {
      return;
    }

    if (drop.isMoney()) {
      if (drop.money > 0) {
        im.addMoney(drop.money);
      }
      user.write(statChangedPacket(Stat.MONEY, im.money));
      user.write(MessagePacket.pickUpMoney(drop.money, false));
    } else if (drop.item) {
      const ops = im.addItem(drop.item);
      if (ops) {
        user.write(inventoryOperation(ops, false));
      }
      user.write(MessagePacket.pickUpItem(drop.item.itemId, drop.item.quantity));
    }
  }

  expireDrops(now: Date): Drop[] {
    const expired: Drop[] = [];
    for (const drop of this.getAll()) {
      if (drop.isExpired(now)) {
        this.removeDrop(drop, DropLeaveType.TIMEOUT);
        expired.push(drop);
      }
    }
    return expired;
  }

  private placeDrop(drop: Drop, x: number, y: number): void {
    const mapInfo = this.field.getMapInfo?.();
    const foothold = mapInfo?.getFootholdBelow?.(x, y);
    drop.setX(x);
    drop.setY(foothold ? foothold.getYFromX(x) : y);
  }
}

function shuffle<T>(values: T[]): void {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
}
