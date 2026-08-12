import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { MiniGameMessageType } from './MiniGameMessageType';
import { MiniGameResultType } from './MiniGameResultType';
import { MiniGameRoom } from './MiniGameRoom';
import { MiniRoomPacket } from './MiniRoomPacket';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';
import { OmokGame } from './OmokGame';

export class OmokRoom extends MiniGameRoom {
  private omokGame: OmokGame | null = null;

  constructor(title: string, password: string | null, gameSpec: number) {
    super(title, password, gameSpec);
  }

  isScorePenalty(): boolean { return this.omokGame !== null && this.omokGame.isScorePenalty(); }

  getType(): MiniRoomType { return MiniRoomType.OmokRoom; }

  handlePacket(user: User, mrp: MiniRoomProtocol, r: PacketReader): void {
    const other = this.getOther(user);
    if (!other) {
      console.error(`[OmokRoom] Received mini room action ${MiniRoomProtocol[mrp]} without another player`);
      return;
    }
    switch (mrp) {
      case MiniRoomProtocol.MGRP_RetreatRequest: {
        if (this.isGameOn()) other.write(MiniRoomPacket.MiniGame.retreatRequest());
        break;
      }
      case MiniRoomProtocol.MGRP_RetreatResult: {
        if (this.isGameOn()) {
          if (r.readBoolean()) {
            const count = this.omokGame!.retreat();
            if (count % 2 !== 0) {
              this.setNextTurn(this.getNextTurn() === 0 ? 1 : 0);
            }
            this.broadcastPacket(MiniRoomPacket.gameMessage(MiniGameMessageType.UserRetreatSuccess, user.getCharacterName()));
            this.broadcastPacket(MiniRoomPacket.MiniGame.retreatResult(true, count, this.getNextTurn()));
          } else {
            other.write(MiniRoomPacket.MiniGame.retreatResult(false, -1, -1));
          }
        }
        break;
      }
      case MiniRoomProtocol.MGRP_Start: {
        if (this.isGameOn() || !this.isReady() || !this.isOwner(user)) {
          console.error('[OmokRoom] Tried to start omok game without meeting the requirements');
          return;
        }
        this.omokGame = new OmokGame();
        this.setGameOn(true);
        this.updateBalloon();
        this.broadcastPacket(MiniRoomPacket.gameMessage(MiniGameMessageType.GameStart, ''));
        this.broadcastPacket(MiniRoomPacket.MiniGame.omokStart(this.getNextTurn() === 0 ? 1 : 0));
        break;
      }
      case MiniRoomProtocol.ORP_PutStoneChecker: {
        if (!this.omokGame) return;
        const x = r.readInt();
        const y = r.readInt();
        const type = r.readByte();
        if (!this.omokGame.isValid(x, y)) {
          user.write(MiniRoomPacket.MiniGame.invalidStonePosition(MiniRoomProtocol.ORP_InvalidStonePosition_Normal));
          return;
        }
        if (this.omokGame.checkThreeThree(x, y, type) && !this.omokGame.checkWin(x, y, type === 1 ? 2 : 1)) {
          user.write(MiniRoomPacket.MiniGame.invalidStonePosition(MiniRoomProtocol.ORP_InvalidStonePosition_By33));
          return;
        }
        this.omokGame.putStone(x, y, type);
        this.setNextTurn(this.getUserIndex(other));
        this.broadcastPacket(MiniRoomPacket.MiniGame.putStoneChecker(x, y, type));
        if (this.omokGame.checkWin(x, y, type)) {
          this.gameSet(MiniGameResultType.NORMAL, user, other);
        }
        break;
      }
      default:
        super.handlePacket(user, mrp, r);
    }
  }
}
