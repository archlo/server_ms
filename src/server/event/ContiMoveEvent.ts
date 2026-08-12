import { Event, ContiMovePacket } from './Event';
import { EventState } from './EventState';
import { FieldStorage } from '../field/FieldStorage';

/** Port of kinoko's ContiMoveEvent - abstract base for the 4 airship/genie routes. */
export abstract class ContiMoveEvent extends Event {
  constructor(
    fieldStorage: FieldStorage,
    protected readonly boardingField1: number,
    protected readonly boardingField2: number,
    protected readonly waitingField1: number,
    protected readonly waitingField2: number,
    protected readonly insideField1: number,
    protected readonly insideField2: number,
    protected readonly arriveField1: number,
    protected readonly arriveField2: number,
  ) {
    super(fieldStorage);
  }

  /** Port of ContiMoveEvent::initialize - aligns to UTC minute%10 cycle. */
  initialize(): void {
    const minute = new Date().getUTCMinutes() % 10;
    if (minute >= 5 && minute < 9) {
      this.currentState = EventState.CONTIMOVE_BOARDING;
    } else if (minute === 9) {
      this.currentState = EventState.CONTIMOVE_WAITING;
    } else {
      this.currentState = EventState.CONTIMOVE_INSIDE;
    }
    this.scheduleMinuteTick();
  }

  /** Port of ContiMoveEvent::nextState. */
  nextState(): void {
    const minute = this.getNearestMinute() % 10;
    if (minute === 5) {
      this.handleBoarding();
    } else if (minute === 9) {
      this.handleWaiting();
    } else if (minute === 0) {
      this.handleInside();
    }
  }

  protected handleBoarding(): void {
    this.warp(this.insideField1, this.arriveField1, 'sp');
    this.warp(this.insideField2, this.arriveField2, 'sp');
    this.reset(this.insideField1);
    this.reset(this.insideField2);
    this.broadcastPacket(this.boardingField1, ContiMovePacket.enterShipMove());
    this.broadcastPacket(this.boardingField2, ContiMovePacket.enterShipMove());
    this.currentState = EventState.CONTIMOVE_BOARDING;
  }

  protected handleWaiting(): void {
    this.currentState = EventState.CONTIMOVE_WAITING;
  }

  protected handleInside(): void {
    this.warp(this.waitingField1, this.insideField1, 'sp');
    this.warp(this.waitingField2, this.insideField2, 'sp');
    this.reset(this.waitingField1);
    this.reset(this.waitingField2);
    this.broadcastPacket(this.boardingField1, ContiMovePacket.leaveShipMove());
    this.broadcastPacket(this.boardingField2, ContiMovePacket.leaveShipMove());
    this.currentState = EventState.CONTIMOVE_INSIDE;
  }
}
