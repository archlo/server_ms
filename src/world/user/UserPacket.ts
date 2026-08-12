import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User } from './User';
import { ChatType } from './ChatType';
import type { MiniRoom } from '../miniroom/MiniRoom';
import { CoupleRecord } from './data/CoupleRecord';

/**
 * Port of kinoko's UserPacket (CUserPool::OnPacket / OnUserCommonPacket).
 * Pet, CoupleRecord, MiniRoom and FieldType-specific data are encoded
 * as empty/default values (no active miniroom, no couple, no field-specific data).
 */
export class UserPacket {
  static userEnterField(user: User): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ENTER_FIELD.code);
    w.writeInt(user.getCharacterId());

    // CUserRemote::Init
    w.writeByte(user.getLevel());
    w.writeMapleAsciiString(user.getCharacterName());

    // GuildInfo (sGuildName + nGuildMarkBg/BgColor/Mark/MarkColor)
    const guildInfo = user.getGuildInfo();
    w.writeMapleAsciiString(guildInfo.guildName);
    w.writeShort(guildInfo.markBg);
    w.writeByte(guildInfo.markBgColor);
    w.writeShort(guildInfo.mark);
    w.writeByte(guildInfo.markColor);

    user.getSecondaryStat().encodeForRemote(w);
    w.writeShort(user.getJob());
    user.getAvatarLook().encode(w);

    w.writeInt(0); // dwDriverID
    w.writeInt(0); // dwPassengerID
    w.writeInt(0); // nChocoCount
    w.writeInt(user.getEffectItemId());
    w.writeInt(0); // nCompletedSetItemID
    w.writeInt(user.getPortableChairId());

    w.writeShort(user.getX());
    w.writeShort(user.getY());
    w.writeByte(user.getMoveAction());
    w.writeShort(user.getFoothold());

    w.writeBoolean(false); // bShowAdminEffect

    // Pets
    for (const pet of user.getPets()) {
      w.writeBoolean(true);
      pet.encode(w);
    }
    w.writeByte(0);

    w.writeInt(0); // nTamingMobLevel
    w.writeInt(0); // nTamingMobExp
    w.writeInt(0); // nTamingMobFatigue

    // MiniRoom
    const userMiniRoom = user.getDialog();
    if (userMiniRoom && typeof userMiniRoom.getType === 'function') {
      w.writeByte(userMiniRoom.getType());
      w.writeInt(userMiniRoom.getId());
      w.writeMapleAsciiString(userMiniRoom.getTitle());
      w.writeBoolean(userMiniRoom.isPrivate());
      w.writeByte(userMiniRoom.getGameSpec());
      w.writeByte(userMiniRoom.getUsers().size);
      w.writeByte(userMiniRoom.getMaxUsers());
      w.writeBoolean(userMiniRoom.isGameOn());
    } else {
      w.writeByte(0);
    }

    const adBoard = user.getAdBoard();
    w.writeBoolean(adBoard !== null);
    if (adBoard !== null) {
      w.writeMapleAsciiString(adBoard);
    }

    // CoupleRecord
    const coupleRecord = user.getCoupleRecord();
    w.writeBoolean(coupleRecord.coupleId !== 0);
    if (coupleRecord.coupleId !== 0) {
      coupleRecord.encodeForLocal(w, false);
    }

    // DarkForceEffect / DragonFury / Swallow_Mob effect flag (none active)
    w.writeByte(0);

    // NewYearCard
    const newYearCards = user.getNewYearCards();
    w.writeBoolean(newYearCards.length > 0);
    if (newYearCards.length > 0) {
      for (const card of newYearCards) {
        card.encode(w);
      }
    }
    w.writeInt(0); // nPhase
    // ~CUserRemote::Init

    // field->DecodeFieldSpecificData (no field-specific data)

    return w.getPacket();
  }

  static userLeaveField(user: User): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_LEAVE_FIELD.code);
    w.writeInt(user.getCharacterId());
    return w.getPacket();
  }

  // ---- CUserPool::OnUserCommonPacket -----------------------------------

  static userChat(user: User, type: ChatType, text: string, onlyBalloon: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_CHAT.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(type);
    w.writeMapleAsciiString(text);
    w.writeBoolean(onlyBalloon);
    return w.getPacket();
  }

  static userChatRemote(user: User, characterName: string, type: ChatType, text: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_CHAT_NLCPQ.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(type);
    w.writeMapleAsciiString(text);
    w.writeBoolean(false); // bOnlyBalloon
    w.writeMapleAsciiString(characterName);
    return w.getPacket();
  }

  static userAdBoard(user: User, message: string | null): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_AD_BOARD.code);
    w.writeInt(user.getCharacterId());
    w.writeBoolean(message !== null);
    if (message !== null) {
      w.writeMapleAsciiString(message);
    }
    return w.getPacket();
  }

  static userMiniRoomBalloonRemove(user: User): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_MINI_ROOM_BALLOON.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(0); // CChatBalloon::DestroyMiniRoomBalloon
    return w.getPacket();
  }

  static userMiniRoomBalloon(user: User, miniRoom: MiniRoom): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_MINI_ROOM_BALLOON.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(miniRoom.getType());            // nMiniRoomType
    w.writeInt(miniRoom.getId());               // dwMiniRoomSN
    w.writeMapleAsciiString(miniRoom.getTitle()); // sMiniRoomTitle
    w.writeBoolean(miniRoom.isPrivate());       // bPrivate
    w.writeByte(miniRoom.getGameSpec());        // nGameKind
    w.writeByte(miniRoom.getUsers().size);      // nCurUsers
    w.writeByte(miniRoom.getMaxUsers());        // nMaxUsers
    w.writeBoolean(miniRoom.isGameOn());        // bGameOn
    return w.getPacket();
  }

  static userConsumeItemEffect(user: User, itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_CONSUME_ITEM_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeInt(itemId);
    return w.getPacket();
  }

  static userItemUpgradeEffect(user: User, success: boolean, cursed: boolean, enchantSkill: boolean, whiteScroll: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ITEM_UPGRADE_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeBoolean(success);
    w.writeBoolean(cursed);
    w.writeBoolean(enchantSkill);
    w.writeInt(0); // nEnchantCategory
    w.writeBoolean(whiteScroll);
    w.writeBoolean(false); // bRecoverable -> CWvsContext::AskWhetherUsePamsSong
    return w.getPacket();
  }

  static userItemUpgradeEffectEnchantError(user: User): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ITEM_UPGRADE_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(-1); // -1 -> CUtilDlg::Notice("You cannot use a Scroll with this item.")
    w.writeBoolean(false); // bCursed
    w.writeBoolean(true);  // bEnchantSkill
    w.writeInt(0); // nEnchantCategory
    w.writeBoolean(false); // bWhiteScroll
    w.writeBoolean(false); // bRecoverable
    return w.getPacket();
  }

  static userItemHyperUpgradeEffect(user: User, success: boolean, cursed: boolean, enchantSkill: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ITEM_HYPER_UPGRADE_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeBoolean(success);
    w.writeBoolean(cursed);
    w.writeBoolean(enchantSkill);
    w.writeInt(0); // nEnchantCategory
    return w.getPacket();
  }

  static userItemOptionUpgradeEffect(user: User, success: boolean, cursed: boolean, enchantSkill: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ITEM_OPTION_UPGRADE_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeBoolean(success);
    w.writeBoolean(cursed);
    w.writeBoolean(enchantSkill);
    w.writeInt(0); // nEnchantCategory
    return w.getPacket();
  }

  static userItemReleaseEffect(user: User, position: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ITEM_RELEASE_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeShort(position);
    return w.getPacket();
  }

  static userItemUnreleaseEffect(user: User, success: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_ITEM_UNRELEASE_EFFECT.code);
    w.writeInt(user.getCharacterId());
    w.writeBoolean(success);
    return w.getPacket();
  }

  static userTeslaTriangle(user: User, summonedIds: number[]): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_TESLA_TRIANGLE.code);
    w.writeInt(user.getCharacterId());
    for (const id of summonedIds) {
      w.writeInt(id);
    }
    return w.getPacket();
  }
}
