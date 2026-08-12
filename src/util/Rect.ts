export class Rect {
  constructor(
    public readonly left: number,
    public readonly top: number,
    public readonly right: number,
    public readonly bottom: number,
  ) {}

  get width()   { return this.right  - this.left; }
  get height()  { return this.bottom - this.top;  }
  get centerX() { return (this.left + this.right)  >> 1; }
  get centerY() { return (this.top  + this.bottom) >> 1; }

  isInsideRect(x: number, y: number): boolean {
    return x >= this.left && y >= this.top && x <= this.right && y <= this.bottom;
  }

  union(r: Rect): Rect {
    return new Rect(
      Math.min(this.left, r.left),
      Math.min(this.top,  r.top),
      Math.max(this.right,  r.right),
      Math.max(this.bottom, r.bottom),
    );
  }

  flipX(): Rect { return new Rect(-this.right, this.top, -this.left, this.bottom); }

  translate(x: number, y: number): Rect {
    return new Rect(this.left + x, this.top + y, this.right + x, this.bottom + y);
  }

  static of(left: number, top: number, right: number, bottom: number): Rect {
    return new Rect(left, top, right, bottom);
  }
}
