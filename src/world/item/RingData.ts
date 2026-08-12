export class RingData {
  pairCharacterId = 0;
  pairItemId      = 0;
  ringItemSn      = 0n; // bigint (64-bit serial)

  constructor(src?: RingData) {
    if (src) Object.assign(this, src);
  }
}
