import { Rect } from './Rect';

export class Position {
  private x: number = 0;
  private y: number = 0;

  constructor(x?: number, y?: number) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
  }

  toString(): string {
    return `x: ${this.x}, y: ${this.y}`;
  }

  deepCopy(): Position {
    return new Position(this.x, this.y);
  }

  getX(): number { return this.x; }
  setX(x: number): void { this.x = x; }
  getY(): number { return this.y; }
  setY(y: number): void { this.y = y; }

  getRectAround(rectOrOffset: Rect | number): Rect {
    if (rectOrOffset instanceof Rect) {
      return new Rect(
        this.x + rectOrOffset.left,
        this.y + rectOrOffset.top,
        this.x + rectOrOffset.right,
        this.y + rectOrOffset.bottom,
      );
    }
    const offset = rectOrOffset;
    return new Rect(
      this.x - offset,
      this.y - offset,
      this.x + offset,
      this.y + offset,
    );
  }

  equals(other: Position): boolean {
    return this.x === other.x && this.y === other.y;
  }

  hashCode(): number {
    return 31 * this.x + this.y;
  }
}
