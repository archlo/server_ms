import { Event } from './Event';
import { EventType } from './EventType';
import { EventState } from './EventState';

/** Port of kinoko's Airport - Kerning City <-> CBD airport (mod-5 cycle). */
export class Airport extends Event {
  // Kerning City -> CBD
  static readonly KERNING_CITY = 103000000;
  static readonly KERNING_AIRPORT = 540010100;
  static readonly ON_THE_WAY_TO_CBD = 540010101;
  // CBD -> Kerning City
  static readonly CHANGI_AIRPORT = 540010000;
  static readonly BEFORE_DEPARTURE_TO_KERNING_CITY = 540010001;
  static readonly ON_THE_WAY_TO_KERNING_CITY = 540010002;

  getType(): EventType { return EventType.CM_AIRPORT; }

  /** Port of Airport::initialize - aligns to UTC minute%5 cycle. */
  initialize(): void {
    const minute = new Date().getUTCMinutes() % 5;
    if (minute >= 1 && minute < 4) {
      this.currentState = EventState.AIRPORT_BOARDING;
    } else if (minute === 4) {
      this.currentState = EventState.AIRPORT_WAITING;
    } else {
      this.currentState = EventState.AIRPORT_INSIDE;
    }
    this.scheduleMinuteTick();
  }

  /** Port of Airport::nextState. */
  nextState(): void {
    const minute = this.getNearestMinute() % 5;
    if (minute === 1) {
      this.handleBoarding();
    } else if (minute === 4) {
      this.handleWaiting();
    } else if (minute === 0) {
      this.handleInside();
    }
  }

  private handleBoarding(): void {
    this.warp(Airport.ON_THE_WAY_TO_CBD, Airport.CHANGI_AIRPORT, 'sp');
    this.warp(Airport.ON_THE_WAY_TO_KERNING_CITY, Airport.KERNING_CITY, 'sp');
    this.reset(Airport.ON_THE_WAY_TO_CBD);
    this.reset(Airport.ON_THE_WAY_TO_KERNING_CITY);
    this.currentState = EventState.AIRPORT_BOARDING;
  }

  private handleWaiting(): void {
    this.currentState = EventState.AIRPORT_WAITING;
  }

  private handleInside(): void {
    this.warp(Airport.KERNING_AIRPORT, Airport.ON_THE_WAY_TO_CBD, 'sp');
    this.warp(Airport.BEFORE_DEPARTURE_TO_KERNING_CITY, Airport.ON_THE_WAY_TO_KERNING_CITY, 'sp');
    this.reset(Airport.KERNING_AIRPORT);
    this.reset(Airport.BEFORE_DEPARTURE_TO_KERNING_CITY);
    this.currentState = EventState.AIRPORT_INSIDE;
  }
}
