import { PacketWriter } from '../protocol/packets/packetWriter';

/**
 * Encodes a set of integer bit-indices into an N-bit flag (N/8 bytes).
 * Matches kinoko's BitFlag<CharacterTemporaryStat>.
 */
export class BitFlag {
  private readonly bytes: Uint8Array;

  constructor(sizeInBits: number) {
    this.bytes = new Uint8Array(Math.ceil(sizeInBits / 8));
  }

  set(index: number): void {
    if (index < 0 || index >= this.bytes.length * 8) return;
    this.bytes[Math.floor(index / 8)] |= (1 << (index % 8));
  }

  has(index: number): boolean {
    if (index < 0 || index >= this.bytes.length * 8) return false;
    return (this.bytes[Math.floor(index / 8)] & (1 << (index % 8))) !== 0;
  }

  isEmpty(): boolean { return this.bytes.every(b => b === 0); }

  encode(w: PacketWriter): void { w.write(Buffer.from(this.bytes)); }

  static from(indices: Iterable<number>, sizeInBits: number): BitFlag {
    const f = new BitFlag(sizeInBits);
    for (const i of indices) f.set(i);
    return f;
  }
}
