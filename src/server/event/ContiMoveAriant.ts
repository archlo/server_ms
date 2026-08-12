import { ContiMoveEvent } from './ContiMoveEvent';
import { EventType } from './EventType';
import { FieldStorage } from '../field/FieldStorage';

/** Port of kinoko's ContiMoveAriant - Orbis <-> Ariant genie. */
export class ContiMoveAriant extends ContiMoveEvent {
  // Orbis -> Ariant
  static readonly ORBIS_STATION_TO_ARIANT = 200000151;
  static readonly BEFORE_TAKEOFF_TO_ARIANT = 200000152;
  static readonly CRUISING_TO_ARIANT = 200090400;
  // Ariant -> Orbis
  static readonly ARIANT_STATION_PLATFORM = 260000100;
  static readonly BEFORE_TAKEOFF_TO_ORBIS = 260000110;
  static readonly CRUISING_TO_ORBIS = 200090410;
  static readonly ORBIS_STATION_ENTRANCE = 200000100;

  constructor(fieldStorage: FieldStorage) {
    super(
      fieldStorage,
      ContiMoveAriant.ORBIS_STATION_TO_ARIANT,
      ContiMoveAriant.ARIANT_STATION_PLATFORM,
      ContiMoveAriant.BEFORE_TAKEOFF_TO_ARIANT,
      ContiMoveAriant.BEFORE_TAKEOFF_TO_ORBIS,
      ContiMoveAriant.CRUISING_TO_ARIANT,
      ContiMoveAriant.CRUISING_TO_ORBIS,
      ContiMoveAriant.ARIANT_STATION_PLATFORM,
      ContiMoveAriant.ORBIS_STATION_ENTRANCE,
    );
  }

  getType(): EventType { return EventType.CM_ARIANT; }
}
