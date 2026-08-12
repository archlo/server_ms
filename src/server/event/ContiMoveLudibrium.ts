import { ContiMoveEvent } from './ContiMoveEvent';
import { EventType } from './EventType';
import { FieldStorage } from '../field/FieldStorage';

/** Port of kinoko's ContiMoveLudibrium - Orbis <-> Ludibrium airship. */
export class ContiMoveLudibrium extends ContiMoveEvent {
  // Orbis -> Ludibrium
  static readonly ORBIS_STATION_LUDIBRIUM = 200000121;
  static readonly BEFORE_THE_DEPARTURE_TO_LUDIBRIUM = 200000122;
  static readonly ON_A_VOYAGE_TO_LUDIBRIUM = 200090100;
  static readonly LUDIBRIUM_TICKETING_PLACE = 220000100;
  // Ludibrium -> Orbis
  static readonly LUDIBRIUM_STATION_ORBIS = 220000110;
  static readonly BEFORE_THE_DEPARTURE_TO_ORBIS = 220000111;
  static readonly ON_A_VOYAGE_TO_ORBIS = 200090110;
  static readonly ORBIS_STATION_ENTRANCE = 200000100;

  constructor(fieldStorage: FieldStorage) {
    super(
      fieldStorage,
      ContiMoveLudibrium.ORBIS_STATION_LUDIBRIUM,
      ContiMoveLudibrium.LUDIBRIUM_STATION_ORBIS,
      ContiMoveLudibrium.BEFORE_THE_DEPARTURE_TO_LUDIBRIUM,
      ContiMoveLudibrium.BEFORE_THE_DEPARTURE_TO_ORBIS,
      ContiMoveLudibrium.ON_A_VOYAGE_TO_LUDIBRIUM,
      ContiMoveLudibrium.ON_A_VOYAGE_TO_ORBIS,
      ContiMoveLudibrium.LUDIBRIUM_TICKETING_PLACE,
      ContiMoveLudibrium.ORBIS_STATION_ENTRANCE,
    );
  }

  getType(): EventType { return EventType.CM_LUDIBRIUM; }
}
