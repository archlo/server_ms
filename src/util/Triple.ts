export class Triple<L, M, R> {
  left: L;
  middle: M;
  right: R;

  constructor(left: L, middle: M, right: R) {
    this.left = left;
    this.middle = middle;
    this.right = right;
  }
}
