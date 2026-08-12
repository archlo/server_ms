import { ContiMoveEvent } from './ContiMoveEvent';
import { ContiMovePacket } from './Event';
import { EventType } from './EventType';
import { EventState } from './EventState';
import { FieldStorage } from '../field/FieldStorage';
import { Util } from '../../util/Util';

/** Port of kinoko's ContiMoveVictoria - Orbis <-> Victoria Island airship + Crimson Balrog spawns. */
export class ContiMoveVictoria extends ContiMoveEvent {
  // Orbis -> Victoria
  static readonly ORBIS_STATION_VICTORIA_BOUND = 200000111;
  static readonly PRE_DEPARTURE_VICTORIA_BOUND = 200000112;
  static readonly DURING_THE_RIDE_VICTORIA_BOUND = 200090000;
  static readonly DURING_THE_RIDE_CABIN_VICTORIA_BOUND = 200090001;
  // Victoria -> Orbis
  static readonly STATION_TO_ORBIS = 104020110;
  static readonly PRE_DEPARTURE_TO_ORBIS = 104020111;
  static readonly DURING_THE_RIDE_TO_ORBIS = 200090010;
  static readonly DURING_THE_RIDE_CABIN_TO_ORBIS = 200090011;
  static readonly ORBIS_STATION_ENTRANCE = 200000100;

  static readonly CRIMSON_BALROG = 8150000;

  constructor(fieldStorage: FieldStorage) {
    super(
      fieldStorage,
      ContiMoveVictoria.ORBIS_STATION_VICTORIA_BOUND,
      ContiMoveVictoria.STATION_TO_ORBIS,
      ContiMoveVictoria.PRE_DEPARTURE_VICTORIA_BOUND,
      ContiMoveVictoria.PRE_DEPARTURE_TO_ORBIS,
      ContiMoveVictoria.DURING_THE_RIDE_VICTORIA_BOUND,
      ContiMoveVictoria.DURING_THE_RIDE_TO_ORBIS,
      ContiMoveVictoria.STATION_TO_ORBIS,
      ContiMoveVictoria.ORBIS_STATION_ENTRANCE,
    );
  }

  getType(): EventType { return EventType.CM_VICTORIA; }

  /** Port of ContiMoveVictoria::initialize - aligns to UTC minute%15 cycle. */
  initialize(): void {
    const minute = new Date().getUTCMinutes() % 15;
    if (minute >= 10 && minute < 14) {
      this.currentState = EventState.CONTIMOVE_BOARDING;
    } else if (minute === 14) {
      this.currentState = EventState.CONTIMOVE_WAITING;
    } else {
      this.currentState = EventState.CONTIMOVE_INSIDE;
    }
    this.scheduleMinuteTick();
  }

  /** Port of ContiMoveVictoria::nextState. */
  nextState(): void {
    const minute = this.getNearestMinute() % 15;
    if (minute === 10) {
      this.handleBoarding();
    } else if (minute === 14) {
      this.handleWaiting();
    } else if (minute === 0) {
      this.handleInside();
    } else if (minute >= 3 && minute <= 5) {
      // chance = 1 - (1 - x)^3
      if (this.currentState === EventState.CONTIMOVE_INSIDE && Util.succeedProp(30)) {
        this.handleMobGen();
      }
    }
  }

  protected handleBoarding(): void {
    this.warp(ContiMoveVictoria.DURING_THE_RIDE_CABIN_VICTORIA_BOUND, ContiMoveVictoria.STATION_TO_ORBIS, 'sp');
    this.warp(ContiMoveVictoria.DURING_THE_RIDE_CABIN_TO_ORBIS, ContiMoveVictoria.ORBIS_STATION_ENTRANCE, 'sp');
    this.reset(ContiMoveVictoria.DURING_THE_RIDE_CABIN_VICTORIA_BOUND);
    this.reset(ContiMoveVictoria.DURING_THE_RIDE_CABIN_TO_ORBIS);
    super.handleBoarding();
  }

  private handleMobGen(): void {
    this.broadcastPacket(ContiMoveVictoria.DURING_THE_RIDE_VICTORIA_BOUND, ContiMovePacket.mobGen());
    this.broadcastPacket(ContiMoveVictoria.DURING_THE_RIDE_TO_ORBIS, ContiMovePacket.mobGen());
    for (let i = 0; i < 2; i++) {
      this.spawnMob(ContiMoveVictoria.DURING_THE_RIDE_VICTORIA_BOUND, ContiMoveVictoria.CRIMSON_BALROG, -590, -221);
      this.spawnMob(ContiMoveVictoria.DURING_THE_RIDE_TO_ORBIS, ContiMoveVictoria.CRIMSON_BALROG, 485, -221);
    }
    // should send ContiMovePacket.mobDestroy() when all mobs are dead
    this.currentState = EventState.CONTIMOVE_MOBGEN;
  }
}
