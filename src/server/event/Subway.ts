import { Event } from './Event';
import { EventType } from './EventType';
import { EventState } from './EventState';

/** Port of kinoko's Subway - Kerning City <-> NLC subway (mod-10 cycle). */
export class Subway extends Event {
  // Kerning City -> NLC
  static readonly SUBWAY_TICKETING_BOOTH = 103020000;
  static readonly WAITING_ROOM_FROM_KC_TO_NLC = 600010004;
  static readonly INSIDE_SUBWAY_FROM_KC_TO_NLC = 600010005;
  // NLC -> Kerning City
  static readonly NLC_SUBWAY_STATION = 600010001;
  static readonly WAITING_ROOM_FROM_NLC_TO_KC = 600010002;
  static readonly INSIDE_SUBWAY_FROM_NLC_TO_KC = 600010003;

  getType(): EventType { return EventType.CM_SUBWAY; }

  /** Port of Subway::initialize - aligns to UTC minute%10 cycle. */
  initialize(): void {
    const minute = new Date().getUTCMinutes() % 10;
    if (minute >= 5 && minute < 9) {
      this.currentState = EventState.SUBWAY_BOARDING;
    } else if (minute === 9) {
      this.currentState = EventState.SUBWAY_WAITING;
    } else {
      this.currentState = EventState.SUBWAY_INSIDE;
    }
    this.scheduleMinuteTick();
  }

  /** Port of Subway::nextState. */
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

  private handleBoarding(): void {
    this.warp(Subway.INSIDE_SUBWAY_FROM_KC_TO_NLC, Subway.NLC_SUBWAY_STATION, 'sp');
    this.warp(Subway.INSIDE_SUBWAY_FROM_NLC_TO_KC, Subway.SUBWAY_TICKETING_BOOTH, 'sp');
    this.reset(Subway.INSIDE_SUBWAY_FROM_KC_TO_NLC);
    this.reset(Subway.INSIDE_SUBWAY_FROM_NLC_TO_KC);
    this.currentState = EventState.SUBWAY_BOARDING;
  }

  private handleWaiting(): void {
    this.currentState = EventState.SUBWAY_WAITING;
  }

  private handleInside(): void {
    this.warp(Subway.WAITING_ROOM_FROM_KC_TO_NLC, Subway.INSIDE_SUBWAY_FROM_KC_TO_NLC, 'st00');
    this.warp(Subway.WAITING_ROOM_FROM_NLC_TO_KC, Subway.INSIDE_SUBWAY_FROM_NLC_TO_KC, 'st00');
    this.reset(Subway.WAITING_ROOM_FROM_KC_TO_NLC);
    this.reset(Subway.WAITING_ROOM_FROM_NLC_TO_KC);
    this.currentState = EventState.SUBWAY_INSIDE;
  }
}
