import { OutPacket } from '../../../protocol/packets/packetWriter';
import { CharacterTemporaryStat, REMOTE_ENCODE_ORDER, ctsIsRemoteEncode1, ctsIsRemoteEncode4, ctsIsNotEncodeReason } from './CharacterTemporaryStat';
import { Option } from './Option';
import { Char } from '../Char';

export class TemporaryStatManager {
  private chr: Char;
  private currentStats: Map<CharacterTemporaryStat, Option[]> = new Map();

  constructor(chr: Char) {
    this.chr = chr;
  }

  getMaskByCollection(map: Map<CharacterTemporaryStat, Option[]>): number[] {
    const mask = new Array(17).fill(0);
    for (const cts of map.keys()) {
      const pos = cts as any as number;
      const idx = Math.floor(pos / 32);
      const bit = pos % 32;
      mask[idx] |= (1 << bit);
    }
    return mask;
  }

  hasStat(cts: CharacterTemporaryStat): boolean {
    return this.currentStats.has(cts);
  }

  getOption(cts: CharacterTemporaryStat): Option {
    const arr = this.currentStats.get(cts);
    if (arr && arr.length > 0) {
      return arr[0];
    }
    return new Option();
  }

  encodeForRemote(outPacket: OutPacket, collection: Map<CharacterTemporaryStat, Option[]>): void {
    const mask = this.getMaskByCollection(collection);
    for (const m of mask) {
      outPacket.writeInt(m);
    }
    const sortedKeys = [...collection.keys()]
      .filter(cts => REMOTE_ENCODE_ORDER.indexOf(cts) !== -1)
      .sort((a, b) => REMOTE_ENCODE_ORDER.indexOf(a) - REMOTE_ENCODE_ORDER.indexOf(b));
    for (const cts of sortedKeys) {
      const opt = collection.get(cts)![0];
      if (ctsIsRemoteEncode1(cts)) {
        outPacket.writeByte(opt.nOption);
      } else if (ctsIsRemoteEncode4(cts)) {
        outPacket.writeInt(opt.nOption);
      } else {
        outPacket.writeShort(opt.nOption);
      }
      if (!ctsIsNotEncodeReason(cts)) {
        outPacket.writeInt(opt.rOption);
      }
    }
  }

  getCurrentStats(): Map<CharacterTemporaryStat, Option[]> {
    return this.currentStats;
  }
}
