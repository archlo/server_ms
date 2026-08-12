export class BitTools {
  static multiplyBytes(b: number[], size: number, mult: number): number[] {
    const res: number[] = [];
    for (let x = 0; x < mult; x++) {
      for (let y = 0; y < size; y++) {
        const pos = x + y * mult;
        if (pos < b.length) {
          res.push(b[pos]);
        }
      }
    }
    return res;
  }

  static rollLeft(b: number, count: number): number {
    let tmp = b & 0xFF;
    tmp = (tmp << (count % 8)) & 0xFF | (tmp >> (8 - (count % 8)));
    return tmp & 0xFF;
  }

  static rollRight(b: number, count: number): number {
    let tmp = b & 0xFF;
    tmp = (tmp << (8 - (count % 8))) & 0xFF | (tmp >> (count % 8));
    return tmp & 0xFF;
  }
}
