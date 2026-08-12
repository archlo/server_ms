import { Foothold } from './Foothold';
import { Rect } from '../../util/Rect';

const MAX_SIZE = 5;

export class FootholdNode {
  private data: Foothold[] = [];
  private left: FootholdNode | null = null;
  private right: FootholdNode | null = null;
  private bounds: Rect | null = null;
  private _rootBounds: Rect | null = null;

  constructor(private readonly parent: FootholdNode | null = null) {}

  get rootBounds(): Rect | null { return this._rootBounds; }

  searchDown(check: (fh: Foothold) => void, x: number, y: number): void {
    if (this.left?._rootBounds && canSearchDown(this.left._rootBounds, x, y))
      this.left.searchDown(check, x, y);
    if (this.right?._rootBounds && canSearchDown(this.right._rootBounds, x, y))
      this.right.searchDown(check, x, y);
    this.data.forEach(check);
  }

  insert(fh: Foothold): void {
    if (this.data.length === 0) {
      this.data.push(fh);
      this.resize(fh);
    } else if (this.canInsert(fh)) {
      this.data.push(fh);
      this.resize(fh);
    } else {
      this.delegateInsert(fh);
    }
  }

  private resize(fh: Foothold): void {
    const slopeDown = fh.y1 < fh.y2;
    const rect = Rect.of(fh.x1, slopeDown ? fh.y1 : fh.y2, fh.x2, slopeDown ? fh.y2 : fh.y1);
    this.resizeWithRect(rect);
  }

  private resizeWithRect(rect: Rect): void {
    this.bounds = this.bounds ? this.bounds.union(rect) : rect;
    this._rootBounds = this._rootBounds ? this._rootBounds.union(rect) : rect;
    this.resizeRoot(rect);
  }

  private resizeRoot(rect: Rect): void {
    this._rootBounds = this._rootBounds ? this._rootBounds.union(rect) : rect;
    this.parent?.resizeRoot(rect);
  }

  private canInsert(fh: Foothold): boolean {
    if (this.data.length < MAX_SIZE) return true;
    if (!this.bounds) return false;
    if (this.bounds.isInsideRect(fh.x1, fh.y1) && this.bounds.isInsideRect(fh.x2, fh.y2)) {
      const cx = this.bounds.centerX;
      const cy = this.bounds.centerY;
      let maxFh = this.data[0];
      for (const f of this.data) {
        if (dist(f, cx, cy) > dist(maxFh, cx, cy)) maxFh = f;
      }
      if (dist(fh, cx, cy) > dist(maxFh, cx, cy)) return false;
      const idx = this.data.indexOf(maxFh);
      if (idx !== -1) {
        this.data.splice(idx, 1);
        this.delegateInsert(maxFh);
        return true;
      }
    }
    return false;
  }

  private delegateInsert(fh: Foothold): void {
    if (!this.bounds) return;
    const cx = (this.bounds.left + this.bounds.right) >> 1;
    const fx = (fh.x1 + fh.x2) >> 1;
    if (fx <= cx) {
      if (!this.left) this.left = new FootholdNode(this);
      this.left.insert(fh);
    } else {
      if (!this.right) this.right = new FootholdNode(this);
      this.right.insert(fh);
    }
  }
}

function canSearchDown(r: Rect, x: number, y: number): boolean {
  return x >= r.left && x <= r.right && r.bottom >= y;
}

function dist(fh: Foothold, x: number, y: number): number {
  const fx = (fh.x1 + fh.x2) >> 1;
  const fy = fh.getYFromX(fx);
  const dx = x - fx; const dy = y - fy;
  return Math.sqrt(dx * dx + dy * dy);
}
