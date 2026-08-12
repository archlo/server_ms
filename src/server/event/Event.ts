import { FieldStorage } from '../field/FieldStorage';
import { ContiMovePacket } from '../../world/field/ContiMovePacket';
import { ReactorPacket } from '../../world/field/reactor/ReactorPacket';
import { MobProvider } from '../../provider/MobProvider';
import { Mob } from '../../world/field/mob/Mob';
import { EventType } from './EventType';
import { EventState } from './EventState';

/** Port of kinoko's Event - abstract base for ContiMove/Elevator/Subway/Airport. */
export abstract class Event {
  protected currentState!: EventState;
  private tickHandle: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null = null;

  constructor(protected readonly fieldStorage: FieldStorage) {}

  abstract getType(): EventType;
  abstract initialize(): void;
  abstract nextState(): void;

  getState(): EventState { return this.currentState; }

  shutdown(): void {
    if (this.tickHandle) {
      clearTimeout(this.tickHandle as ReturnType<typeof setTimeout>);
      clearInterval(this.tickHandle as ReturnType<typeof setInterval>);
      this.tickHandle = null;
    }
  }

  // ---- HELPER METHODS ----------------------------------------------------

  /** Port of Event::getNearestMinute. */
  protected getNearestMinute(): number {
    const seconds = Math.floor(Date.now() / 1000) % 3600;
    return Math.round(seconds / 60.0) % 60;
  }

  /** Schedules nextState() to run every minute, aligned to the wall-clock minute boundary (UTC). */
  protected scheduleMinuteTick(): void {
    const now = new Date();
    const msToNextMinute = 60000 - (now.getUTCSeconds() * 1000 + now.getUTCMilliseconds());
    this.tickHandle = setTimeout(() => {
      this.nextState();
      this.tickHandle = setInterval(() => this.nextState(), 60000);
    }, msToNextMinute);
  }

  /** Port of Event::warp - warps all users in sourceFieldId to destFieldId's named portal. */
  protected warp(sourceFieldId: number, destFieldId: number, portalName: string): void {
    const destField = this.fieldStorage.getFieldById(destFieldId);
    if (!destField) {
      console.error(`[Event] Could not resolve destination field ID : ${destFieldId}`);
      return;
    }
    const destPortal = destField.getPortalByName(portalName);
    if (!destPortal) {
      console.error(`[Event] Could not resolve portal ${portalName} for field ID : ${destFieldId}`);
      return;
    }
    const sourceField = this.fieldStorage.getFieldById(sourceFieldId);
    if (!sourceField) {
      console.error(`[Event] Could not resolve source field ID : ${sourceFieldId}`);
      return;
    }
    for (const user of sourceField.getUserPool().getAll()) {
      user.warp(destField, destPortal, false, false);
    }
  }

  /** Port of Event::spawnMob. */
  protected spawnMob(fieldId: number, mobTemplateId: number, x: number, y: number): void {
    const field = this.fieldStorage.getFieldById(fieldId);
    if (!field) {
      console.error(`[Event] Could not resolve field ID : ${fieldId}`);
      return;
    }
    const template = MobProvider.getMobTemplate(mobTemplateId);
    if (!template) {
      console.error(`[Event] Could not resolve mob template ID : ${mobTemplateId}`);
      return;
    }
    const mob = new Mob(template, null, x, y, 0);
    field.getMobPool().addMob(mob);
  }

  /** Port of Event::setReactorState. */
  protected setReactorState(fieldId: number, reactorTemplateId: number, newState: number): void {
    const field = this.fieldStorage.getFieldById(fieldId);
    if (!field) {
      console.error(`[Event] Could not resolve field ID : ${fieldId}`);
      return;
    }
    for (const reactor of field.getReactorPool().getAll()) {
      if (reactor.getTemplateId() === reactorTemplateId) {
        reactor.setState(newState);
        field.broadcastPacket(ReactorPacket.reactorChangeState(reactor, 0, 0, 0));
      }
    }
  }

  /** Port of Event::broadcastPacket. */
  protected broadcastPacket(fieldId: number, packet: Buffer): void {
    const field = this.fieldStorage.getFieldById(fieldId);
    if (!field) {
      console.error(`[Event] Could not resolve broadcast field ID : ${fieldId}`);
      return;
    }
    field.broadcastPacket(packet);
  }

  /** Port of Event::reset. */
  protected reset(fieldId: number): void {
    const field = this.fieldStorage.getFieldById(fieldId);
    if (!field) {
      console.error(`[Event] Could not resolve field ID : ${fieldId}`);
      return;
    }
    field.reset();
  }
}

// Re-exported for ContiMove subclasses that need the ship-move packet helper.
export { ContiMovePacket };
