import { OutPacket } from '../protocol/packets/packetWriter';
import { BroadcastMsgType } from '../enums/BroadcastMsgType';
import { Item } from '../world/item/Item';

export class BroadcastMsg {
  broadcastMsgType: BroadcastMsgType = BroadcastMsgType.Notice;
  item: Item | null = null;
  string: string = '';
  string2: string = '';
  string3: string = '';
  arg1: number = 0;
  arg2: number = 0;
  arg3: number = 0;

  encode(outPacket: OutPacket): void {
    outPacket.writeByte(this.broadcastMsgType);

    outPacket.writeMapleAsciiString(this.string);

    switch (this.broadcastMsgType) {
      case BroadcastMsgType.Notice:
      case BroadcastMsgType.PopUpMessage:
      case BroadcastMsgType.DarkBlueOnLightBlue:
      case BroadcastMsgType.PartyChat:
      case BroadcastMsgType.WhiteYellow:
      case BroadcastMsgType.SwedishFlag:
        break;
      case BroadcastMsgType.Megaphone:
      case BroadcastMsgType.MegaphoneNoMessage:
        outPacket.writeByte(this.arg1);
        outPacket.writeByte(this.arg2);
        break;
      case BroadcastMsgType.ItemMegaphone:
        outPacket.writeByte(this.arg1);
        outPacket.writeByte(this.arg2);
        outPacket.writeByte(this.arg3);
        if (this.arg3 !== 0 && this.item) {
          this.item.encode(outPacket);
        }
        break;
      case BroadcastMsgType.TripleMegaphone:
        outPacket.writeByte(this.arg1);
        if (this.arg1 > 1) {
          outPacket.writeMapleAsciiString(this.string2);
        }
        if (this.arg1 > 2) {
          outPacket.writeMapleAsciiString(this.string3);
        }
        outPacket.writeByte(this.arg2);
        outPacket.writeByte(this.arg3);
        break;
      case BroadcastMsgType.BlueChat_ItemInfo:
      case BroadcastMsgType.BlueChat_ItemInfo_2:
        outPacket.writeInt(this.arg1);
        if (this.arg1 !== 0 && this.item) {
          this.item.encode(outPacket);
        }
        break;
      case BroadcastMsgType.GM_ErrorMessage:
        outPacket.writeInt(this.arg1);
        break;
      case BroadcastMsgType.RedWithChannelInfo:
        outPacket.writeInt(this.arg1);
        break;
      case BroadcastMsgType.WhiteYellow_ItemInfo:
        outPacket.writeByte(this.arg1);
        if (this.arg1 !== 0 && this.item) {
          this.item.encode(outPacket);
        }
        break;
      case BroadcastMsgType.YellowChatFiled_ItemInfo:
        outPacket.writeInt(this.arg1);
        outPacket.writeByte(this.arg2);
        if (this.item) {
          this.item.encode(outPacket);
        }
        break;
      case BroadcastMsgType.PopUpNotice:
        outPacket.writeInt(this.arg1);
        outPacket.writeInt(this.arg2);
        break;
      case BroadcastMsgType.Yellow:
      case BroadcastMsgType.Yellow_2:
        if (this.item) {
          this.item.encode(outPacket);
        }
        break;
      case BroadcastMsgType.TryRegisterAutoStartQuest:
        outPacket.writeInt(this.arg1);
        outPacket.writeInt(this.arg2);
        break;
      case BroadcastMsgType.TryRegisterAutoStartQuest_NoAnnouncement:
        outPacket.writeInt(this.arg1);
        break;
      case BroadcastMsgType.SlideNotice:
        outPacket.writeByte(this.arg1);
        break;
    }
  }

  static formatMegaphoneStrings(medalName: string, characterName: string, message: string): string {
    const medal = medalName ? `<${medalName}> ` : '';
    return `${medal}${characterName} : ${message}`;
  }

  static itemMegaphone(medalName: string, characterName: string, message: string, channel: number, whisperEar: boolean, containsItem: boolean, item: Item): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.ItemMegaphone;
    msg.string = BroadcastMsg.formatMegaphoneStrings(medalName, characterName, message);
    msg.arg1 = channel - 1;
    msg.arg2 = whisperEar ? 1 : 0;
    msg.arg3 = containsItem ? 1 : 0;
    msg.item = item;
    return msg;
  }

  static tripleMegaphone(medalName: string, characterName: string, stringList: string[], channel: number, whisperEar: boolean): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.TripleMegaphone;
    const formatted = stringList.map(s => BroadcastMsg.formatMegaphoneStrings(medalName, characterName, s));
    msg.arg1 = formatted.length;
    msg.string = formatted[0] ?? '';
    if (formatted.length > 1) msg.string2 = formatted[1];
    if (formatted.length > 2) msg.string3 = formatted[2];
    msg.arg2 = channel - 1;
    msg.arg3 = whisperEar ? 1 : 0;
    return msg;
  }

  static megaphone(medalName: string, characterName: string, message: string, channel: number, whisperEar: boolean): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.Megaphone;
    msg.string = BroadcastMsg.formatMegaphoneStrings(medalName, characterName, message);
    msg.arg1 = channel - 1;
    msg.arg2 = whisperEar ? 1 : 0;
    return msg;
  }

  static notice(string: string): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.Notice;
    msg.string = string;
    return msg;
  }

  static popUpMessage(string: string): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.PopUpMessage;
    msg.string = string;
    return msg;
  }

  static popUpNotice(string: string, width: number, height: number): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.PopUpNotice;
    msg.string = string;
    msg.arg1 = width;
    msg.arg2 = height;
    return msg;
  }

  static blueChatWithItemInfo(string: string, item: Item): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.BlueChat_ItemInfo;
    msg.string = string;
    msg.arg1 = item.itemId;
    msg.item = item;
    return msg;
  }

  static blueChatWithItemInfo2(string: string, item: Item): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.BlueChat_ItemInfo_2;
    msg.string = string;
    msg.arg1 = item.itemId;
    msg.item = item;
    return msg;
  }

  static errorMessage(string: string, npcId: number): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.GM_ErrorMessage;
    msg.string = string;
    msg.arg1 = npcId;
    return msg;
  }

  static whiteYellowItemInfo(string: string, item: Item, containsItem: boolean): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.WhiteYellow_ItemInfo;
    msg.string = string;
    msg.item = item;
    msg.arg1 = containsItem ? 1 : 0;
    return msg;
  }

  static yellowFilled(string: string, item: Item, show: boolean): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.YellowChatFiled_ItemInfo;
    msg.string = string;
    msg.item = item;
    msg.arg1 = item.itemId;
    msg.arg2 = show ? 1 : 0;
    return msg;
  }

  static yellow(string: string, item: Item): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.Yellow;
    msg.string = string;
    msg.item = item;
    return msg;
  }

  static yellow2(string: string, item: Item): BroadcastMsg {
    const msg = new BroadcastMsg();
    msg.broadcastMsgType = BroadcastMsgType.Yellow_2;
    msg.string = string;
    msg.item = item;
    return msg;
  }
}
