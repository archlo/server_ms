import { FieldObject } from './FieldObject';
import { Rect } from '../../util/Rect';

export abstract class FieldObjectPool<T extends FieldObject> {
  protected readonly objects = new Map<number, T>(); // id -> obj

  getCount():   number { return this.objects.size; }
  isEmpty():    boolean { return this.objects.size === 0; }
  clear():      void   { this.objects.clear(); }

  getById(id: number): T | undefined { return this.objects.get(id); }

  getBy(pred: (obj: T) => boolean): T | undefined {
    for (const obj of this.objects.values()) if (pred(obj)) return obj;
    return undefined;
  }

  getInsideRect(rect: Rect): T[] {
    const result: T[] = [];
    for (const obj of this.objects.values()) {
      if (rect.isInsideRect(obj.getX(), obj.getY())) result.push(obj);
    }
    return result;
  }

  getAll(): T[] { return [...this.objects.values()]; }

  forEach(fn: (obj: T) => void): void { this.objects.forEach((v) => fn(v)); }

  protected addObject(obj: T): void    { this.objects.set(obj.getId(), obj); }
  protected removeObject(obj: T): boolean {
    if (this.objects.get(obj.getId()) !== obj) return false;
    this.objects.delete(obj.getId());
    return true;
  }
}
