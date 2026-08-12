export abstract class FieldObject {
  protected _field: any = null; // Field (forward ref)
  private _id = 0;
  private _x  = 0;
  private _y  = 0;

  getField(): any  { return this._field; }
  setField(f: any): void { this._field = f; }

  getId(): number  { return this._id; }
  setId(id: number): void { this._id = id; }

  getX(): number  { return this._x; }
  setX(x: number): void { this._x = x; }

  getY(): number  { return this._y; }
  setY(y: number): void { this._y = y; }

  getNearestObject<T extends FieldObject>(objects: T[]): T | null {
    let nearestDist = Infinity;
    let nearest: T | null = null;
    for (const obj of objects) {
      const dx = this._x - obj.getX();
      const dy = this._y - obj.getY();
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < nearestDist) { nearestDist = d; nearest = obj; }
    }
    return nearest;
  }
}
