import { ContiMoveEvent } from './ContiMoveEvent';
import { EventType } from './EventType';
import { FieldStorage } from '../field/FieldStorage';

/** Port of kinoko's ContiMoveLeafre - Orbis <-> Leafre wyvern. */
export class ContiMoveLeafre extends ContiMoveEvent {
  // Orbis -> Leafre
  static readonly ORBIS_STATION_TO_LEAFRE = 200000131;
  static readonly ORBIS_CABIN_TO_LEAFRE = 200000132;
  static readonly DURING_THE_RIDE_TO_LEAFRE = 200090200;
  static readonly LEAFRE_STATION_ENTRANCE = 240000100;
  // Leafre -> Orbis
  static readonly LEAFRE_STATION = 240000110;
  static readonly BEFORE_TAKEOFF_TO_ORBIS = 240000111;
  static readonly DURING_THE_RIDE_TO_ORBIS = 200090210;
  static readonly ORBIS_STATION_ENTRANCE = 200000100;

  constructor(fieldStorage: FieldStorage) {
    super(
      fieldStorage,
      ContiMoveLeafre.ORBIS_STATION_TO_LEAFRE,
      ContiMoveLeafre.LEAFRE_STATION,
      ContiMoveLeafre.ORBIS_CABIN_TO_LEAFRE,
      ContiMoveLeafre.BEFORE_TAKEOFF_TO_ORBIS,
      ContiMoveLeafre.DURING_THE_RIDE_TO_LEAFRE,
      ContiMoveLeafre.DURING_THE_RIDE_TO_ORBIS,
      ContiMoveLeafre.LEAFRE_STATION_ENTRANCE,
      ContiMoveLeafre.ORBIS_STATION_ENTRANCE,
    );
  }

  getType(): EventType { return EventType.CM_LEAFRE; }
}
