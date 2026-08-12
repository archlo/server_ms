import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { UserPacket } from '../user/UserPacket';
import { MiniGameMessageType } from './MiniGameMessageType';
import { MiniGameRecord } from './MiniGameRecord';
import { MiniGameResultType } from './MiniGameResultType';
import { MiniRoom } from './MiniRoom';
import { MiniRoomLeaveType } from './MiniRoomLeaveType';
import { MiniRoomPacket } from './MiniRoomPacket';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';

export abstract class MiniGameRoom extends MiniRoom {
  protected readonly leaveBooked = new Set<number>(); // characterId

  abstract isScorePenalty(): boolean;

  getOther(user: User): User | undefined {
    return this.getUserIndex(user) === 0 ? this.getUser(1) : this.getUser(0);
  }

  getMaxUsers(): number { return 2; }

  handlePacket(user: User, mrp: MiniRoomProtocol, r: PacketReader): void {
    const other = this.getOther(user);
    if (!other) {
      console.error(`[MiniGameRoom] Received mini room action ${MiniRoomProtocol[mrp]} without another player`);
      return;
    }
    switch (mrp) {
      case MiniRoomProtocol.MGRP_TieRequest: {
        if (this.isGameOn()) other.write(MiniRoomPacket.MiniGame.tieRequest());
        break;
      }
      case MiniRoomProtocol.MGRP_TieResult: {
        if (this.isGameOn()) {
          if (r.readBoolean()) {
            this.gameSet(MiniGameResultType.DRAW, user, other);
          } else {
            other.write(MiniRoomPacket.MiniGame.tieResult());
          }
        }
        break;
      }
      case MiniRoomProtocol.MGRP_GiveUpRequest: {
        if (this.isGameOn()) {
          this.setNextTurn(this.getUserIndex(user));
          this.broadcastPacket(MiniRoomPacket.gameMessage(MiniGameMessageType.UserGiveUp, user.getCharacterName()));
          this.gameSet(MiniGameResultType.GIVEUP, other, user);
        }
        break;
      }
      case MiniRoomProtocol.MGRP_LeaveEngage: {
        if (this.isGameOn()) {
          this.leaveBooked.add(user.getCharacterId());
          this.broadcastPacket(MiniRoomPacket.gameMessage(MiniGameMessageType.UserLeaveEngage, user.getCharacterName()));
        }
        break;
      }
      case MiniRoomProtocol.MGRP_LeaveEngageCancel: {
        if (this.isGameOn()) {
          this.leaveBooked.delete(user.getCharacterId());
          this.broadcastPacket(MiniRoomPacket.gameMessage(MiniGameMessageType.UserLeaveEngageCancel, user.getCharacterName()));
        }
        break;
      }
      case MiniRoomProtocol.MGRP_Ready:
      case MiniRoomProtocol.MGRP_CancelReady: {
        if (this.isOwner(user)) {
          console.error('[MiniGameRoom] Tried to ready as owner of the mini game room');
          return;
        }
        this.setReady(mrp === MiniRoomProtocol.MGRP_Ready);
        this.broadcastPacket(MiniRoomPacket.MiniGame.ready(this.isReady()));
        break;
      }
      case MiniRoomProtocol.MGRP_Ban: {
        if (!this.isOwner(user)) {
          console.error('[MiniGameRoom] Tried to ban user as guest of the mini game room');
          return;
        }
        if (this.isGameOn()) {
          console.error('[MiniGameRoom] Tried to ban user during game');
          return;
        }
        this.setLeaveRequest(other, MiniRoomLeaveType.Kicked);
        break;
      }
      case MiniRoomProtocol.MGRP_TimeOver: {
        this.setNextTurn(this.getUserIndex(other));
        this.broadcastPacket(MiniRoomPacket.MiniGame.timeOver(this.getNextTurn()));
        break;
      }
      default:
        console.error(`[MiniGameRoom] Unhandled mini game room action ${MiniRoomProtocol[mrp]}`);
    }
  }

  leave(user: User): void {
    const other = this.getOther(user);
    if (other && this.isGameOn()) {
      MiniGameRecord.processResult(this.getType(), other.getMiniGameRecord(), user.getMiniGameRecord(), false, this.isScorePenalty());
      this.broadcastPacket(MiniRoomPacket.MiniGame.gameResult(MiniGameResultType.GIVEUP, this, this.getUserIndex(other)));
      this.setGameOn(false);
      this.setReady(false);
    }
    this.setLeaveRequest(user, MiniRoomLeaveType.UserRequest);
    this.leaveBooked.clear();
  }

  updateBalloon(): void {
    const owner = this.getUser(0);
    if (owner && this.getField()) {
      this.getField().broadcastPacket(UserPacket.userMiniRoomBalloon(owner, this));
    }
  }

  protected gameSet(resultType: MiniGameResultType, winner: User, loser: User): void {
    const isDraw = resultType === MiniGameResultType.DRAW;
    const scorePenalty = resultType === MiniGameResultType.GIVEUP && this.isScorePenalty();
    MiniGameRecord.processResult(this.getType(), winner.getMiniGameRecord(), loser.getMiniGameRecord(), isDraw, scorePenalty);
    this.broadcastPacket(MiniRoomPacket.MiniGame.gameResult(resultType, this, this.getUserIndex(winner)));
    this.setGameOn(false);
    this.setReady(false);
    for (const charId of this.leaveBooked) {
      const leaver = this.getUser(0)?.getCharacterId() === charId ? this.getUser(0) :
        this.getUser(1)?.getCharacterId() === charId ? this.getUser(1) : undefined;
      if (leaver) this.setLeaveRequest(leaver, MiniRoomLeaveType.UserRequest);
    }
    this.leaveBooked.clear();
  }
}
