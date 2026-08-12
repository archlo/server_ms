export class Life {
  objectId: number = 0;
  x: number = 0;
  y: number = 0;
  moveAction: number = 0;
  foothold: number = 0;

  setX(x: number): void { this.x = x; }
  setY(y: number): void { this.y = y; }
  getX(): number { return this.x; }
  getY(): number { return this.y; }
  setMoveAction(ma: number): void { this.moveAction = ma; }
  getMoveAction(): number { return this.moveAction; }
  setFoothold(fh: number): void { this.foothold = fh; }
  getFoothold(): number { return this.foothold; }
}
