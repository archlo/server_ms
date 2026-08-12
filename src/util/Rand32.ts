/** LCG-style PRNG matching kinoko's Rand32 (3-state xorshift combo). */
export class Rand32 {
  private s1 = 0;
  private s2 = 0;
  private s3 = 0;

  getS1(): number { return this.s1; }
  getS2(): number { return this.s2; }
  getS3(): number { return this.s3; }

  setSeed(s1: number, s2: number, s3: number): void {
    this.s1 = s1 | 0;
    this.s2 = s2 | 0;
    this.s3 = s3 | 0;
  }

  random(): number {
    this.s1 = (((this.s1 << 12) ^ (this.s1 >>> 19)) ^ (((toShort(this.s1 >>> 6)) ^ (toShort(this.s1 << 12))) & 0x1FFF)) | 0;
    this.s2 = (((16 * this.s2) ^ (this.s2 >>> 25)) ^ (((toByte(16 * this.s2)) ^ (toByte(this.s2 >>> 23))) & 0x7F)) | 0;
    this.s3 = (((this.s3 >>> 11) ^ (this.s3 << 17)) ^ (((this.s3 >>> 8) ^ (this.s3 << 17)) & 0x1FFFFF)) | 0;
    return (this.s1 ^ this.s2 ^ this.s3) | 0;
  }
}

function toShort(v: number): number {
  return (v << 16) >> 16;
}

function toByte(v: number): number {
  return (v << 24) >> 24;
}
