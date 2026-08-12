import { FieldObject } from '../FieldObject';
import { Rect } from '../../../util/Rect';

export abstract class Life extends FieldObject {
  private _foothold  = 0;
  private _moveAction = 0;

  getFoothold():  number { return this._foothold; }
  setFoothold(fh: number): void { this._foothold = fh; }

  getMoveAction(): number { return this._moveAction; }
  setMoveAction(a: number): void { this._moveAction = a; }

  isLeft(): boolean { return (this._moveAction & 1) !== 0; }
  setLeft(left: boolean): void {
    this._moveAction = left
      ? this._moveAction | 1
      : this._moveAction & ~1;
  }

  getRelativeRect(rect: Rect): Rect {
    if (!this.isLeft()) rect = rect.flipX();
    return rect.translate(this.getX(), this.getY());
  }
}
