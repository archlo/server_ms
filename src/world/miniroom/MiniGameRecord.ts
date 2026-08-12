import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MiniRoomType } from './MiniRoomType';

export class MiniGameRecord {
  omokWins = 0;
  omokTies = 0;
  omokLosses = 0;
  omokScore = 2000.0;

  memoryWins = 0;
  memoryTies = 0;
  memoryLosses = 0;
  memoryScore = 2000.0;

  getOmokTotal(): number { return this.omokWins + this.omokTies + this.omokLosses; }
  getMemoryTotal(): number { return this.memoryWins + this.memoryTies + this.memoryLosses; }

  encode(type: MiniRoomType, w: PacketWriter): void {
    w.writeInt(type);
    switch (type) {
      case MiniRoomType.OmokRoom:
        w.writeInt(this.omokWins);
        w.writeInt(this.omokTies);
        w.writeInt(this.omokLosses);
        w.writeInt(Math.round(this.omokScore));
        break;
      case MiniRoomType.MemoryGameRoom:
        w.writeInt(this.memoryWins);
        w.writeInt(this.memoryTies);
        w.writeInt(this.memoryLosses);
        w.writeInt(Math.round(this.memoryScore));
        break;
      default:
        w.writeInt(0);
        w.writeInt(0);
        w.writeInt(0);
        w.writeInt(0);
        break;
    }
  }

  static processResult(
    type: MiniRoomType,
    winner: MiniGameRecord,
    loser: MiniGameRecord,
    isDraw: boolean,
    scorePenalty: boolean,
  ): void {
    const multiplier = scorePenalty ? 0.1 : 1.0;
    switch (type) {
      case MiniRoomType.OmokRoom: {
        if (isDraw) { winner.omokTies++; loser.omokTies++; }
        else { winner.omokWins++; loser.omokLosses++; }
        const k1 = winner.omokScore > 3000 ? 20 : (winner.getOmokTotal() > 50 ? 50 : 30);
        const k2 = loser.omokScore > 3000 ? 20 : (loser.getOmokTotal() > 50 ? 30 : 20);
        const r1 = MiniGameRecord.computeScoreGain(winner.omokScore, loser.omokScore, isDraw ? 0.5 : 1.0, k1);
        const r2 = MiniGameRecord.computeScoreGain(loser.omokScore, winner.omokScore, isDraw ? 0.5 : 0.0, k2);
        winner.omokScore += r1 * multiplier;
        loser.omokScore += r2 * multiplier;
        break;
      }
      case MiniRoomType.MemoryGameRoom: {
        if (isDraw) { winner.memoryTies++; loser.memoryTies++; }
        else { winner.memoryWins++; loser.memoryLosses++; }
        const k1 = winner.memoryScore > 3000 ? 20 : (winner.getMemoryTotal() > 50 ? 50 : 30);
        const k2 = loser.memoryScore > 3000 ? 20 : (loser.getMemoryTotal() > 50 ? 30 : 20);
        const r1 = MiniGameRecord.computeScoreGain(winner.memoryScore, loser.memoryScore, isDraw ? 0.5 : 1.0, k1);
        const r2 = MiniGameRecord.computeScoreGain(loser.memoryScore, winner.memoryScore, isDraw ? 0.5 : 0.0, k2);
        winner.memoryScore += r1 * multiplier;
        loser.memoryScore += r2 * multiplier;
        break;
      }
    }
  }

  private static computeScoreGain(r1: number, r2: number, score: number, k: number): number {
    const expected = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
    return k * (score - expected);
  }
}
