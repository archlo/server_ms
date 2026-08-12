import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { QuestRecord } from '../quest/QuestRecord';
import { QuestState } from '../quest/QuestState';

enum MessageType {
  DropPickUp = 0,
  QuestRecord = 1,
  CashItemExpire = 2,
  IncEXP = 3,
  IncSP = 4,
  IncPOP = 5,
  IncMoney = 6,
  IncGP = 7,
  GiveBuff = 8,
  GeneralItemExpire = 9,
  System = 10,
  QuestRecordEx = 11,
  ItemProtectExpire = 12,
  ItemExpireReplace = 13,
  SkillExpire = 14,
}

enum DropPickUpMessageType {
  CANNOT_ACQUIRE_ANY_ITEMS = -3,
  UNAVAILABLE_FOR_PICK_UP = -2,
  CANNOT_GET_ANYMORE_ITEMS = -1,
  ITEM_BUNDLE = 0,
  MONEY = 1,
  ITEM_SINGLE = 2,
}

export class MessagePacket {
  // ---- Drop PickUp feedback -------------------------------------------------

  static cannotAcquireAnyItems(): Buffer {
    return dropPickUpPacket(DropPickUpMessageType.CANNOT_ACQUIRE_ANY_ITEMS);
  }

  static unavailableForPickUp(): Buffer {
    return dropPickUpPacket(DropPickUpMessageType.UNAVAILABLE_FOR_PICK_UP);
  }

  static cannotGetAnymoreItems(): Buffer {
    return dropPickUpPacket(DropPickUpMessageType.CANNOT_GET_ANYMORE_ITEMS);
  }

  static pickUpItem(itemId: number, quantity: number): Buffer {
    const w = beginDropPickUp(DropPickUpMessageType.ITEM_BUNDLE);
    w.writeInt(itemId);
    w.writeInt(quantity);
    return w.getPacket();
  }

  static pickUpMoney(money: number, portionNotFound: boolean): Buffer {
    const w = beginDropPickUp(DropPickUpMessageType.MONEY);
    w.writeByte(portionNotFound ? 1 : 0);
    w.writeInt(money);
    w.writeShort(0); // Internet Cafe Meso Bonus
    return w.getPacket();
  }

  // ---- Quest Record ----------------------------------------------------------

  static questRecord(questRecord: QuestRecord): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.QuestRecord);
    w.writeShort(questRecord.questId);
    w.writeByte(questRecord.state);
    switch (questRecord.state) {
      case QuestState.NONE:
        w.writeByte(1); // delete quest
        break;
      case QuestState.PERFORM:
        w.writeMapleAsciiString(questRecord.value);
        break;
      case QuestState.COMPLETE:
        w.writeFT(questRecord.completedTime);
        break;
    }
    return w.getPacket();
  }

  static questRecordEx(questId: number, value: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.QuestRecordEx);
    w.writeShort(questId);
    w.writeMapleAsciiString(value);
    return w.getPacket();
  }

  // ---- Item / Skill Expiry ---------------------------------------------------

  static cashItemExpire(itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.CashItemExpire);
    w.writeInt(itemId);
    return w.getPacket();
  }

  static generalItemExpire(itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.GeneralItemExpire);
    w.writeByte(1); // count
    w.writeInt(itemId);
    return w.getPacket();
  }

  static skillExpire(skillId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.SkillExpire);
    w.writeByte(1); // count
    w.writeInt(skillId);
    return w.getPacket();
  }

  // ---- EXP / Money / SP / POP ------------------------------------------------

  static incExp(exp: number, partyBonus: number, white: boolean, quest: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.IncEXP);
    w.writeByte(white ? 1 : 0);
    w.writeInt(exp);
    w.writeByte(quest ? 1 : 0);
    w.writeInt(0); // bonus event exp
    w.writeByte(0); // nMobEventBonusPercentage
    w.writeByte(0); // ignored
    w.writeInt(0); // nWeddingBonusEXP
    if (quest) {
      w.writeByte(0); // nSpiritWeekEventEXP
    }
    w.writeByte(0); // nPartyBonusEventRate
    w.writeInt(partyBonus); // nPartyBonusExp
    w.writeInt(0); // nItemBonusEXP
    w.writeInt(0); // nPremiumIPEXP
    w.writeInt(0); // nRainbowWeekEventEXP
    w.writeInt(0); // nPartyEXPRingEXP
    w.writeInt(0); // nCakePieEventBonus
    return w.getPacket();
  }

  static incPop(pop: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.IncPOP);
    w.writeInt(pop);
    return w.getPacket();
  }

  static incMoney(money: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.IncMoney);
    w.writeInt(money);
    return w.getPacket();
  }

  static incSp(job: number, sp: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.IncSP);
    w.writeShort(job);
    w.writeByte(sp);
    return w.getPacket();
  }

  // ---- GiveBuff / System -----------------------------------------------------

  static giveBuff(itemId: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.GiveBuff);
    w.writeInt(itemId);
    return w.getPacket();
  }

  static system(text: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.MESSAGE.code);
    w.writeByte(MessageType.System);
    w.writeMapleAsciiString(text);
    return w.getPacket();
  }

  static scriptProgressMessage(text: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SCRIPT_PROGRESS_MESSAGE.code);
    w.writeMapleAsciiString(text);
    return w.getPacket();
  }
}

function beginDropPickUp(dropType: DropPickUpMessageType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.MESSAGE.code);
  w.writeByte(MessageType.DropPickUp);
  w.writeByte(dropType);
  return w;
}

function dropPickUpPacket(dropType: DropPickUpMessageType): Buffer {
  return beginDropPickUp(dropType).getPacket();
}
