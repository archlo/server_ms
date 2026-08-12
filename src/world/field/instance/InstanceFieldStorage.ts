import { Field } from '../Field';
import { MapInfo } from '../../../provider/map/MapInfo';
import { Instance } from './Instance';

/** Port of kinoko's InstanceFieldStorage - holds only the fields belonging to one Instance. */
export class InstanceFieldStorage {
  private readonly fieldMap = new Map<number, Field>();

  constructor(public readonly instance: Instance) {}

  getFieldById(mapId: number): Field | null {
    return this.fieldMap.get(mapId) ?? null;
  }

  getAllFields(): Field[] { return [...this.fieldMap.values()]; }

  clear(): void {
    for (const field of this.fieldMap.values()) field.stop();
    this.fieldMap.clear();
  }

  static from(instance: Instance, mapInfos: MapInfo[]): InstanceFieldStorage {
    const storage = new InstanceFieldStorage(instance);
    for (const mapInfo of mapInfos) {
      const field = new Field(mapInfo, storage);
      field.start();
      storage.fieldMap.set(mapInfo.mapId, field);
    }
    return storage;
  }
}
