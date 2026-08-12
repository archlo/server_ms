export interface OmokMove {
  x: number;
  y: number;
  type: number;
}

export class OmokGame {
  static readonly BOARD_SIZE = 15;
  private readonly board: Int8Array;
  private readonly history: OmokMove[] = [];

  constructor() {
    this.board = new Int8Array(OmokGame.BOARD_SIZE * OmokGame.BOARD_SIZE);
  }

  private idx(x: number, y: number): number { return x * OmokGame.BOARD_SIZE + y; }

  isScorePenalty(): boolean { return this.history.length < 6; }

  isValid(x: number, y: number): boolean {
    return x >= 0 && x < OmokGame.BOARD_SIZE &&
      y >= 0 && y < OmokGame.BOARD_SIZE &&
      this.board[this.idx(x, y)] === 0;
  }

  putStone(x: number, y: number, type: number): void {
    this.board[this.idx(x, y)] = type;
    this.history.push({ x, y, type });
  }

  retreat(): number {
    let count = 0;
    for (; count < 2; count++) {
      const last = this.history.pop();
      if (!last) break;
      this.board[this.idx(last.x, last.y)] = 0;
    }
    return count;
  }

  checkWin(x: number, y: number, type: number): boolean {
    return (
      this.countLine(x, y, type, -1, 0, 1, 0) ||
      this.countLine(x, y, type, 0, -1, 0, 1) ||
      this.countLine(x, y, type, -1, -1, 1, 1) ||
      this.countLine(x, y, type, -1, 1, 1, -1)
    );
  }

  private countLine(x: number, y: number, type: number, dx1: number, dy1: number, dx2: number, dy2: number): boolean {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const nx = x + dx1 * i, ny = y + dy1 * i;
      if (nx < 0 || nx >= OmokGame.BOARD_SIZE || ny < 0 || ny >= OmokGame.BOARD_SIZE) break;
      if (this.board[this.idx(nx, ny)] !== type) break;
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const nx = x + dx2 * i, ny = y + dy2 * i;
      if (nx < 0 || nx >= OmokGame.BOARD_SIZE || ny < 0 || ny >= OmokGame.BOARD_SIZE) break;
      if (this.board[this.idx(nx, ny)] !== type) break;
      count++;
    }
    return count >= 5;
  }

  /**
   * Port of kinoko OmokGame.checkThreeThree. Detects whether placing `type` at
   * (x, y) creates two or more open "three" rows (double-3), which is illegal.
   */
  checkThreeThree(x: number, y: number, type: number): boolean {
    if (this.board[this.idx(x, y)] !== 0) return false;
    this.board[this.idx(x, y)] = type;
    let threeCount = 0;
    const directions: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dx, dy] of directions) {
      if (this.isOpenThree(x, y, type, dx, dy)) threeCount++;
    }
    this.board[this.idx(x, y)] = 0;
    return threeCount >= 2;
  }

  private isOpenThree(x: number, y: number, type: number, dx: number, dy: number): boolean {
    // Count consecutive `type` stones and check for a broken-three pattern,
    // requiring the line to be open on both ends.
    let count = 1;
    let broken = false;
    // forward
    let i = 1;
    for (; i < 5; i++) {
      const nx = x + dx * i, ny = y + dy * i;
      if (nx < 0 || nx >= OmokGame.BOARD_SIZE || ny < 0 || ny >= OmokGame.BOARD_SIZE) break;
      const v = this.board[this.idx(nx, ny)];
      if (v === type) { count++; }
      else if (v === 0) {
        // check for broken pattern: empty then another same stone
        const nx2 = x + dx * (i + 1), ny2 = y + dy * (i + 1);
        if (!broken && nx2 >= 0 && nx2 < OmokGame.BOARD_SIZE && ny2 >= 0 && ny2 < OmokGame.BOARD_SIZE &&
          this.board[this.idx(nx2, ny2)] === type) {
          broken = true;
          count++;
          i++;
        } else break;
      } else break;
    }
    const forwardOpen = (() => {
      const nx = x + dx * i, ny = y + dy * i;
      return nx >= 0 && nx < OmokGame.BOARD_SIZE && ny >= 0 && ny < OmokGame.BOARD_SIZE &&
        this.board[this.idx(nx, ny)] === 0;
    })();
    // backward
    let j = 1;
    for (; j < 5; j++) {
      const nx = x - dx * j, ny = y - dy * j;
      if (nx < 0 || nx >= OmokGame.BOARD_SIZE || ny < 0 || ny >= OmokGame.BOARD_SIZE) break;
      const v = this.board[this.idx(nx, ny)];
      if (v === type) { count++; }
      else if (v === 0) {
        const nx2 = x - dx * (j + 1), ny2 = y - dy * (j + 1);
        if (!broken && nx2 >= 0 && nx2 < OmokGame.BOARD_SIZE && ny2 >= 0 && ny2 < OmokGame.BOARD_SIZE &&
          this.board[this.idx(nx2, ny2)] === type) {
          broken = true;
          count++;
          j++;
        } else break;
      } else break;
    }
    const backwardOpen = (() => {
      const nx = x - dx * j, ny = y - dy * j;
      return nx >= 0 && nx < OmokGame.BOARD_SIZE && ny >= 0 && ny < OmokGame.BOARD_SIZE &&
        this.board[this.idx(nx, ny)] === 0;
    })();
    return count === 3 && forwardOpen && backwardOpen;
  }
}
