import { Field } from '../../world/field/Field';
import { MapProvider } from '../../provider/MapProvider';

export class FieldStorage {
  private readonly fieldMap = new Map<number, Field>(); // mapId -> Field

  getFieldById(mapId: number): Field | null {
    let field = this.fieldMap.get(mapId) ?? null;
    if (field) return field;
    field = this.createField(mapId);
    if (field) this.fieldMap.set(mapId, field);
    return field;
  }

  getAllFields(): Field[] { return [...this.fieldMap.values()]; }

  clear(): void {
    for (const field of this.fieldMap.values()) field.stop();
    this.fieldMap.clear();
  }

  private createField(mapId: number): Field | null {
    const mapInfo = MapProvider.getMapInfo(mapId);
    if (!mapInfo) return null;
    const field = new Field(mapInfo, this);
    field.start();
    return field;
  }
}
