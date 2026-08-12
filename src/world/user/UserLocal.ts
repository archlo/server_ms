import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { Effect } from './effect/Effect';
import { Memo } from '../memo/Memo';
import { MemoPacket } from '../memo/MemoPacket';

/**
 * Port of kinoko's UserLocal (CUserPool::OnUserLocalPacket).
 * Only the subset needed by the UserHandler port (todo #7) is included here:
 * sitResult, emotion, effect. teleport/balloonMsg/openUI/etc deferred until
 * their owning systems (portals, UI dialogs) are ported.
 */
export class UserLocal {
  static sitResult(sit: boolean, fieldSeatId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_SIT_RESULT.code);
    w.writeBoolean(sit);
    if (sit) {
      w.writeShort(fieldSeatId);
    }
    return w.getPacket();
  }

  static emotion(emotion: number, duration: number, isByItemOption: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_EMOTION_LOCAL.code);
    w.writeInt(emotion);
    w.writeInt(duration);
    w.writeBoolean(isByItemOption);
    return w.getPacket();
  }

  static effect(effect: Effect): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_EFFECT_LOCAL.code);
    effect.encode(w);
    return w.getPacket();
  }

  static balloonMsg(text: string, width: number, duration: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_BALLOON_MSG.code);
    w.writeMapleAsciiString(text);
    w.writeShort(width);
    w.writeShort(duration);
    w.writeBoolean(true); // avatar oriented
    return w.getPacket();
  }

  static setDirectionMode(set: boolean, delay: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SET_DIRECTION_MODE.code);
    w.writeBoolean(set);
    w.writeInt(delay);
    return w.getPacket();
  }

  static hireTutor(hire: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_HIRE_TUTOR.code);
    w.writeBoolean(hire);
    return w.getPacket();
  }

  static tutorMsgIndex(index: number, duration: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_TUTOR_MSG.code);
    w.writeBoolean(true);
    w.writeInt(index);
    w.writeInt(duration);
    return w.getPacket();
  }

  static openSkillGuide(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_OPEN_SKILL_GUIDE.code);
    return w.getPacket();
  }

  static tutorMsgText(message: string, width: number, duration: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.USER_TUTOR_MSG.code);
    w.writeBoolean(false);
    w.writeMapleAsciiString(message);
    w.writeInt(width);
    w.writeInt(duration);
    return w.getPacket();
  }

  static incCombo(combo: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.INC_COMBO.code);
    w.writeInt(combo);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::mapTransferResult. */
  static mapTransferResult(mapTransfers: number[]): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MAP_TRANSFER_RESULT.code);
    w.writeByte(mapTransfers.length);
    for (const fieldId of mapTransfers) {
      w.writeInt(fieldId);
    }
    return w.getPacket();
  }

  /**
   * Port of kinoko's UserLocal::memoResult / MemoPacket.load.
   * Emits the MemoRes::Load packet with the receiver's full memo list.
   */
  static memoResult(memos: Memo[]): Buffer {
    return MemoPacket.load(memos);
  }

  /** Port of kinoko's UserLocal::rpsGame. action: 0=end, 1=win, 2=tie, 3=start, 4=next. */
  static rpsGame(action: number, wins: number, losses: number, playerThrow?: number, serverThrow?: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.RPS_GAME.code);
    w.writeByte(action);
    if (action === 3) {
      // Start: send win/loss record
      w.writeByte(wins);
      w.writeByte(losses);
    } else if (action === 4 || action === 0) {
      // Throw result or quit: send both throws and result (0=lose, 1=win, 2=tie)
      w.writeByte(playerThrow ?? 0);
      w.writeByte(serverThrow ?? 0);
    }
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::antiMacroResult. bPassed: 1 = correct/passed, 0 = wrong/failed. */
  static antiMacroResult(bPassed: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.ANTI_MACRO_RESULT.code);
    w.writeByte(bPassed ? 1 : 0);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::gachaponBoxResult. */
  static gachaponBoxResult(characterId: number, rewardItemId: number, rewardCount: number, gachaponMedalItemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUCCESS_IN_USE_GACHAPON_BOX.code);
    w.writeInt(characterId);
    w.writeInt(rewardItemId);
    w.writeInt(rewardCount);
    w.writeInt(gachaponMedalItemId);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::findFriendResult. name: '' = not found. */
  static findFriendResult(characterId: number, name: string, level: number, job: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FIND_FIREND.code);
    w.writeInt(characterId);
    w.writeMapleAsciiString(name);
    w.writeByte(level);
    w.writeShort(job);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::sessionValueResult. */
  static sessionValueResult(key: string, value: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SESSION_VALUE.code);
    w.writeMapleAsciiString(key);
    w.writeMapleAsciiString(value);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::accountMoreInfoResult. */
  static accountMoreInfoResult(accountFlags: number, unused: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.ACCOUNT_MORE_INFO.code);
    w.writeByte(accountFlags);
    w.writeByte(unused);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::newYearCardResult. action: 0=fail, 1=success. */
  static newYearCardResult(action: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.NEW_YEAR_CARD_RES.code);
    w.writeByte(action);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal:: SueCharacterResult. bSuccess: 1=filed, 0=failed. */
  static sueCharacterResult(bSuccess: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SUE_CHARACTER_RESULT.code);
    w.writeByte(bSuccess ? 1 : 0);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::changeMaplePointResult. */
  static changeMaplePointResult(newMaplePoints: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CHANGE_MAPLE_POINT_RESULT.code);
    w.writeByte(0); // bSuccess
    w.writeInt(newMaplePoints);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::battleRecordRequestResult. */
  static battleRecordRequestResult(self: boolean, party: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.BATTLE_RECORD_REQUEST_RESULT.code);
    w.writeBoolean(self);
    w.writeBoolean(party);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::shopScannerResult. */
  static shopScannerResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SHOP_SCANNER_RESULT.code);
    w.writeByte(0); // nItemCount = 0 (empty)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::shopLinkResult. */
  static shopLinkResult(npcTemplateId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SHOP_LINK_RESULT.code);
    w.writeInt(npcTemplateId);
    w.writeByte(0); // bOpen = 0 (fail)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::destroyShopResult. */
  static destroyShopResult(bSuccess: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.DESTROY_SHOP_RESULT.code);
    w.writeByte(bSuccess ? 1 : 0);
    return w.getPacket();
  }

  /** OG CField::OnCoupleMessage — client expects byte(5) + str(senderName) + str(text) */
  static coupleMessage(senderName: string, text: string, _ringId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.COUPLE_MESSAGE.code);
    // OG: byte1=5 → pair variant: DecodeStr(sender), Decode1(skip), DecodeStr(text)
    w.writeByte(5);
    w.writeMapleAsciiString(senderName);
    w.writeMapleAsciiString(text);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::premiumResult. */
  static premiumResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PREMIUM.code);
    w.writeByte(0); // bResult = 0 (failure)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::cashGachaponOpenResult. */
  static cashGachaponOpenResult(itemId: number, count: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CASH_SHOP_CASH_GACHAPON_OPEN_RESULT.code);
    w.writeByte(0); // bSuccess = 0 (failure)
    w.writeInt(itemId);
    w.writeInt(count);
    w.writeByte(0);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::setPassengerResult. */
  static setPassengerResult(characterId: number, result: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SET_PASSENSER_REQUEST.code);
    w.writeInt(characterId);
    w.writeByte(result);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::itcResult. */
  static itcResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SET_ITC.code);
    w.writeByte(0); // bResult = 0 (fail)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::marriageResult. */
  static marriageResult(bSuccess: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MARRIAGE_RESULT.code);
    w.writeByte(bSuccess ? 1 : 0);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::weddingProgress. */
  static weddingProgress(step: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.WEDDING_PROGRESS.code);
    w.writeByte(step);
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::claimResult. */
  static claimResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.CLAIM_RESULT.code);
    w.writeByte(0); // bResult = 0 (fail)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::entrustShopCheckResult. */
  static entrustShopCheckResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.ENTRUSTED_SHOP_CHECK_RESULT.code);
    w.writeByte(0); // bResult = 0 (fail)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::storeBankResult. */
  static storeBankResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.STORE_BANK_RESULT.code);
    w.writeByte(0); // bResult = 0 (fail)
    return w.getPacket();
  }

  /** Port of kinoko's UserLocal::parcelResult. */
  static parcelResult(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PARCEL.code);
    w.writeByte(0); // bResult = 0 (not found)
    return w.getPacket();
  }
}

