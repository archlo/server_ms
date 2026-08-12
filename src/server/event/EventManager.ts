import { FieldStorage } from '../field/FieldStorage';
import { Event } from './Event';
import { EventType } from './EventType';
import { EventState } from './EventState';
import { ContiMoveVictoria } from './ContiMoveVictoria';
import { ContiMoveLudibrium } from './ContiMoveLudibrium';
import { ContiMoveLeafre } from './ContiMoveLeafre';
import { ContiMoveAriant } from './ContiMoveAriant';
import { Elevator } from './Elevator';
import { Subway } from './Subway';
import { Airport } from './Airport';

/** Port of kinoko's EventManager - per-channel registry of recurring continent/transport events. */
export class EventManager {
  private readonly eventMap = new Map<EventType, Event>();

  getEventState(eventType: EventType): EventState | undefined {
    return this.eventMap.get(eventType)?.getState();
  }

  initialize(fieldStorage: FieldStorage): void {
    this.initializeEvent(new ContiMoveVictoria(fieldStorage));
    this.initializeEvent(new ContiMoveLudibrium(fieldStorage));
    this.initializeEvent(new ContiMoveLeafre(fieldStorage));
    this.initializeEvent(new ContiMoveAriant(fieldStorage));
    this.initializeEvent(new Elevator(fieldStorage));
    this.initializeEvent(new Subway(fieldStorage));
    this.initializeEvent(new Airport(fieldStorage));
  }

  shutdown(): void {
    for (const event of this.eventMap.values()) event.shutdown();
    this.eventMap.clear();
  }

  private initializeEvent(event: Event): void {
    if (this.eventMap.has(event.getType())) {
      throw new Error(`Tried to register duplicate event type : ${event.getType()}`);
    }
    event.initialize();
    this.eventMap.set(event.getType(), event);
  }
}
