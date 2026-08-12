import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { Item } from '../item/Item';
import { User } from '../user/User';
import { MiniRoom } from './MiniRoom';
import { MiniRoomInviteType } from './MiniRoomInviteType';
import { MiniRoomLeaveType } from './MiniRoomLeaveType';
import { MiniGameMessageType } from './MiniGameMessageType';
import { MiniGameResultType } from './MiniGameResultType';
import { MiniGameRecord } from './MiniGameRecord';
import { MiniRoomProtocol } from './MiniRoomProtocol';
import { MiniRoomType } from './MiniRoomType';
import { EnterResultType } from './EnterResultType';
import { PlayerShopBuyResult } from './PlayerShopBuyResult';
import { PlayerShopItem } from './PlayerShopItem';
import { PlayerShopWithdrawResult } from './PlayerShopWithdrawResult';
import { GameConstants } from '../GameConstants';

export enum MiniRoomTypeLegacy {
  Trade = 0x01,
}

export enum TradeAction {
  Request = 0x02,
  Invite = 0x03,
  Decline = 0x04,
  Exit = 0x05,
  Chat = 0x06,
  SetItem = 0x07,
  SetMesos = 0x08,
  Confirm = 0x09,
  CancelConfirm = 0x0A,
}

function encodeAvatarLookForRoom(w: PacketWriter, user: User): void {
  user.getAvatarLook().encode(w);
}

function encodeMiniGameRecord(w: PacketWriter, type: MiniRoomType, user: User | undefined): void {
  const record = user ? user.getMiniGameRecord() : new MiniGameRecord();
  record.encode(type, w);
}

export class MiniRoomPacket {

  // ===========================================================================
  // Legacy / simplified Trade protocol (kept for the existing TradingRoom path)
  // ===========================================================================

  static tradeRequest(targetName: string): Buffer {
    const w = new PacketWriter(10 + targetName.length);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(TradeAction.Invite);
    w.writeByte(MiniRoomTypeLegacy.Trade);
    w.writeMapleAsciiString(targetName);
    return w.getPacket();
  }

  static tradeInviteResult(name: string, accepted: boolean): Buffer {
    const w = new PacketWriter(8 + name.length);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(0x0B);
    w.writeMapleAsciiString(name);
    w.writeBoolean(accepted);
    return w.getPacket();
  }

  static openTrade(ownName: string, partnerName: string): Buffer {
    const w = new PacketWriter(12 + ownName.length + partnerName.length);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(0x00);
    w.writeByte(MiniRoomTypeLegacy.Trade);
    w.writeMapleAsciiString(ownName);
    w.writeMapleAsciiString(partnerName);
    w.writeUByte(0xFF);
    return w.getPacket();
  }

  static setItem(tradeIdx: number, tradeSlot: number, item: Item): Buffer {
    const w = new PacketWriter(14);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(TradeAction.SetItem);
    w.writeByte(tradeIdx);
    w.writeByte(tradeSlot);
    item.encode(w);
    return w.getPacket();
  }

  static removeItem(tradeIdx: number, tradeSlot: number): Buffer {
    const w = new PacketWriter(5);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(0x0C);
    w.writeByte(tradeIdx);
    w.writeByte(tradeSlot);
    return w.getPacket();
  }

  static setMesos(tradeIdx: number, mesos: number): Buffer {
    const w = new PacketWriter(12);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(TradeAction.SetMesos);
    w.writeByte(tradeIdx);
    w.writeLong(BigInt(mesos));
    return w.getPacket();
  }

  static confirm(tradeIdx: number): Buffer {
    const w = new PacketWriter(4);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(0x0D);
    w.writeByte(tradeIdx);
    return w.getPacket();
  }

  static cancelConfirm(tradeIdx: number): Buffer {
    const w = new PacketWriter(4);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(0x0E);
    w.writeByte(tradeIdx);
    return w.getPacket();
  }

  static chat(msg: string): Buffer {
    const w = new PacketWriter(6 + msg.length);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(TradeAction.Chat);
    w.writeMapleAsciiString(msg);
    return w.getPacket();
  }

  static exit(tradeIdx: number): Buffer {
    const w = new PacketWriter(4);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(TradeAction.Exit);
    w.writeByte(tradeIdx);
    return w.getPacket();
  }

  static success(): Buffer {
    const w = new PacketWriter(4);
    w.writeShort(MapleSendOpcode.MINI_ROOM.getValue());
    w.writeByte(0x0F);
    w.writeByte(0);
    return w.getPacket();
  }

  // ===========================================================================
  // Kinoko-style MiniRoom protocol (Omok / Memory / PersonalShop / EntrustedShop)
  // ===========================================================================

  private static of(protocol: MiniRoomProtocol): PacketWriter {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MINI_ROOM.code);
    w.writeByte(protocol);
    return w;
  }

  // ---- Common MiniRoom ----

  static inviteStatic(miniRoomType: MiniRoomType, inviterName: string, miniRoomId: number): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_Invite);
    w.writeByte(miniRoomType);
    w.writeMapleAsciiString(inviterName);
    w.writeInt(miniRoomId);
    return w.getPacket();
  }

  static inviteResult(inviteType: MiniRoomInviteType, targetName: string | null): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_InviteResult);
    w.writeByte(inviteType);
    if (inviteType !== MiniRoomInviteType.NoCharacter && targetName !== null) {
      w.writeMapleAsciiString(targetName);
    }
    return w.getPacket();
  }

  static enterBase(userIndex: number, user: User): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_Enter);
    w.writeByte(userIndex);
    encodeAvatarLookForRoom(w, user);
    w.writeMapleAsciiString(user.getCharacterName());
    w.writeShort(user.getJob());
    return w.getPacket();
  }

  static enterResultRoom(miniRoom: MiniRoom, me: User): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_EnterResult);
    w.writeByte(miniRoom.getType());
    w.writeByte(miniRoom.getMaxUsers());
    w.writeByte(miniRoom.getUserIndex(me));
    for (const [i, user] of miniRoom.getUsers()) {
      w.writeByte(i);
      encodeAvatarLookForRoom(w, user);
      w.writeMapleAsciiString(user.getCharacterName());
      w.writeShort(user.getJob());
    }
    w.writeUByte(0xFF);
    return w.getPacket();
  }

  static enterResultFail(resultType: EnterResultType): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_EnterResult);
    w.writeByte(0);
    w.writeByte(resultType);
    return w.getPacket();
  }

  static chatMsg(userIndex: number, text: string): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_Chat);
    w.writeByte(MiniRoomProtocol.MRP_UserChat);
    w.writeByte(userIndex);
    w.writeMapleAsciiString(text);
    return w.getPacket();
  }

  static chatFromUser(userIndex: number, characterName: string, message: string): Buffer {
    return MiniRoomPacket.chatMsg(userIndex, `${characterName} : ${message}`);
  }

  static gameMessage(messageType: MiniGameMessageType, characterName: string): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_Chat);
    w.writeByte(MiniRoomProtocol.MRP_GameMessage);
    w.writeByte(messageType);
    w.writeMapleAsciiString(characterName);
    return w.getPacket();
  }

  static leave(userIndex: number, leaveType: MiniRoomLeaveType): Buffer {
    const w = MiniRoomPacket.of(MiniRoomProtocol.MRP_Leave);
    w.writeByte(userIndex);
    w.writeByte(leaveType);
    return w.getPacket();
  }

  // ---- MiniGame ----

  static MiniGame = {
    enter(userIndex: number, user: User, miniGameType: MiniRoomType): Buffer {
      const w = new PacketWriter();
      w.writeShort(MapleSendOpcode.MINI_ROOM.code);
      w.writeByte(MiniRoomProtocol.MRP_Enter);
      w.writeByte(userIndex);
      encodeAvatarLookForRoom(w, user);
      w.writeMapleAsciiString(user.getCharacterName());
      w.writeShort(user.getJob());
      encodeMiniGameRecord(w, miniGameType, user);
      return w.getPacket();
    },

    enterResult(miniGameRoom: MiniRoom, me: User): Buffer {
      const w = new PacketWriter();
      w.writeShort(MapleSendOpcode.MINI_ROOM.code);
      w.writeByte(MiniRoomProtocol.MRP_EnterResult);
      w.writeByte(miniGameRoom.getType());
      w.writeByte(miniGameRoom.getMaxUsers());
      w.writeByte(miniGameRoom.getUserIndex(me));
      for (const [i, user] of miniGameRoom.getUsers()) {
        w.writeByte(i);
        encodeAvatarLookForRoom(w, user);
        w.writeMapleAsciiString(user.getCharacterName());
        w.writeShort(user.getJob());
      }
      w.writeUByte(0xFF);
      for (const [i, user] of miniGameRoom.getUsers()) {
        w.writeByte(i);
        encodeMiniGameRecord(w, miniGameRoom.getType(), user);
      }
      w.writeUByte(0xFF);
      w.writeMapleAsciiString(miniGameRoom.getTitle());
      w.writeByte(miniGameRoom.getGameSpec());
      w.writeBoolean(false); // bTournament
      return w.getPacket();
    },

    tieRequest(): Buffer { return MiniRoomPacket.of(MiniRoomProtocol.MGRP_TieRequest).getPacket(); },
    tieResult(): Buffer { return MiniRoomPacket.of(MiniRoomProtocol.MGRP_TieResult).getPacket(); },
    retreatRequest(): Buffer { return MiniRoomPacket.of(MiniRoomProtocol.MGRP_RetreatRequest).getPacket(); },

    retreatResult(accepted: boolean, count: number, nextTurn: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGRP_RetreatResult);
      w.writeBoolean(accepted);
      if (accepted) {
        w.writeByte(count);
        w.writeByte(nextTurn);
      }
      return w.getPacket();
    },

    ready(isReady: boolean): Buffer {
      return MiniRoomPacket.of(isReady ? MiniRoomProtocol.MGRP_Ready : MiniRoomProtocol.MGRP_CancelReady).getPacket();
    },

    omokStart(nextTurn: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGRP_Start);
      w.writeByte(nextTurn);
      return w.getPacket();
    },

    memoryGameStart(nextTurn: number, shuffle: number[]): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGRP_Start);
      w.writeByte(nextTurn);
      w.writeByte(shuffle.length);
      for (const card of shuffle) w.writeInt(card);
      return w.getPacket();
    },

    gameResult(resultType: MiniGameResultType, miniGameRoom: MiniRoom, winnerIndex: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGRP_GameResult);
      w.writeByte(resultType);
      if (resultType !== MiniGameResultType.DRAW) {
        w.writeByte(winnerIndex);
      }
      encodeMiniGameRecord(w, miniGameRoom.getType(), miniGameRoom.getUser(0));
      encodeMiniGameRecord(w, miniGameRoom.getType(), miniGameRoom.getUser(1));
      return w.getPacket();
    },

    timeOver(nextTurn: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGRP_TimeOver);
      w.writeByte(nextTurn);
      return w.getPacket();
    },

    putStoneChecker(x: number, y: number, type: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.ORP_PutStoneChecker);
      w.writeInt(x);
      w.writeInt(y);
      w.writeByte(type);
      return w.getPacket();
    },

    invalidStonePosition(errorType: MiniRoomProtocol): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.ORP_InvalidStonePosition);
      w.writeByte(errorType);
      return w.getPacket();
    },

    turnUpCardFirst(cardIndex: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGP_TurnUpCard);
      w.writeBoolean(true);
      w.writeByte(cardIndex);
      return w.getPacket();
    },

    turnUpCardSecond(firstCard: number, cardIndex: number, userIndex: number, isMatch: boolean): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.MGP_TurnUpCard);
      w.writeBoolean(false);
      w.writeByte(cardIndex);
      w.writeByte(firstCard);
      w.writeByte(userIndex + (isMatch ? 2 : 0));
      return w.getPacket();
    },
  };

  // ---- PlayerShop (PersonalShop / EntrustedShop) ----

  static PlayerShop = {
    enterResult(personalShop: MiniRoom, me: User, items: PlayerShopItem[]): Buffer {
      const w = new PacketWriter();
      w.writeShort(MapleSendOpcode.MINI_ROOM.code);
      w.writeByte(MiniRoomProtocol.MRP_EnterResult);
      w.writeByte(personalShop.getType());
      w.writeByte(personalShop.getMaxUsers());
      w.writeByte(personalShop.getUserIndex(me));
      for (const [i, user] of personalShop.getUsers()) {
        w.writeByte(i);
        encodeAvatarLookForRoom(w, user);
        w.writeMapleAsciiString(user.getCharacterName());
        w.writeShort(user.getJob());
      }
      w.writeUByte(0xFF);
      w.writeMapleAsciiString(personalShop.getTitle());
      w.writeByte(GameConstants.PLAYER_SHOP_SLOT_MAX);
      w.writeByte(items.length);
      for (const item of items) {
        w.writeShort(item.getSetCount());
        w.writeShort(item.setSize);
        w.writeInt(item.price);
        item.item.encode(w);
      }
      return w.getPacket();
    },

    buyResult(buyResult: PlayerShopBuyResult): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.PSP_BuyResult);
      w.writeByte(buyResult);
      return w.getPacket();
    },

    refresh(items: PlayerShopItem[]): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.PSP_Refresh);
      w.writeByte(items.length);
      for (const item of items) {
        w.writeShort(item.getSetCount());
        w.writeShort(item.setSize);
        w.writeInt(item.price);
        item.item.encode(w);
      }
      return w.getPacket();
    },

    addSoldItem(itemIndex: number, quantity: number, buyerName: string): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.PSP_AddSoldItem);
      w.writeByte(itemIndex);
      w.writeShort(quantity);
      w.writeMapleAsciiString(buyerName);
      return w.getPacket();
    },

    moveItemToInventory(newSize: number, itemIndex: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.PSP_MoveItemToInventory);
      w.writeByte(newSize);
      w.writeShort(itemIndex);
      return w.getPacket();
    },

    arrangeItem(money: number): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.ESP_ArrangeItem);
      w.writeInt(money);
      return w.getPacket();
    },

    withdrawAllResult(result: PlayerShopWithdrawResult): Buffer {
      const w = MiniRoomPacket.of(MiniRoomProtocol.ESP_WithdrawAllResult);
      w.writeByte(result);
      return w.getPacket();
    },

    withdrawMoneyResult(): Buffer {
      return MiniRoomPacket.of(MiniRoomProtocol.ESP_WithdrawMoneyResult).getPacket();
    },
  };
}
