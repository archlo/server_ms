import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { MiniGameMessageType } from './MiniGameMessageType';
import { MiniGameResultType } from './MiniGameResultType';
import { MiniGameRoom } from './MiniGameRoom';
import { MemoryGame } from './MemoryGame';
import { MiniRoomPacket } from './MiniRoomPacket';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';

export class MemoryGameRoom extends MiniGameRoom {
  private memoryGame: MemoryGame | null = null;
  private firstCard = 0;

  constructor(title: string, password: string | null, gameSpec: number) {
    super(title, password, gameSpec);
  }

  isScorePenalty(): boolean { return this.memoryGame !== null && this.memoryGame.isScorePenalty(); }

  getType(): MiniRoomType { return MiniRoomType.MemoryGameRoom; }

  handlePacket(user: User, mrp: MiniRoomProtocol, r: PacketReader): void {
    const other = this.getOther(user);
    if (!other) {
      console.error(`[MemoryGameRoom] Received mini room action ${MiniRoomProtocol[mrp]} without another player`);
      return;
    }
    switch (mrp) {
      case MiniRoomProtocol.MGRP_Start: {
        if (this.isGameOn() || !this.isReady() || this.isOwner(user)) {
          console.error('[MemoryGameRoom] Tried to start memory game without meeting the requirements');
          return;
        }
        this.memoryGame = new MemoryGame(this.getGameSpec());
        this.setGameOn(true);
        this.updateBalloon();
        this.broadcastPacket(MiniRoomPacket.gameMessage(MiniGameMessageType.GameStart, ''));
        this.broadcastPacket(MiniRoomPacket.MiniGame.memoryGameStart(this.getNextTurn() === 0 ? 1 : 0, this.memoryGame.getShuffle()));
        break;
      }
      case MiniRoomProtocol.MGP_TurnUpCard: {
        if (!this.memoryGame) return;
        const isFirst = r.readBoolean();
        const cardIndex = r.readByte();
        if (isFirst) {
          this.firstCard = cardIndex;
          other.write(MiniRoomPacket.MiniGame.turnUpCardFirst(cardIndex));
        } else {
          const result = this.memoryGame.turnUpCard(this.firstCard, cardIndex, this.getUserIndex(user));
          this.broadcastPacket(MiniRoomPacket.MiniGame.turnUpCardSecond(this.firstCard, cardIndex, this.getUserIndex(user), result !== 'NO_MATCH'));
          switch (result) {
            case 'NO_MATCH':
              this.setNextTurn(this.getUserIndex(other));
              break;
            case 'WIN':
              this.gameSet(MiniGameResultType.NORMAL, user, other);
              break;
            case 'DRAW':
              this.gameSet(MiniGameResultType.DRAW, user, other);
              break;
            case 'LOSE':
              this.gameSet(MiniGameResultType.NORMAL, other, user);
              break;
          }
        }
        break;
      }
      default:
        super.handlePacket(user, mrp, r);
    }
  }
}
