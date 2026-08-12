import { PacketWriter } from '../../protocol/packets/packetWriter';
import { ScriptMessageType, ScriptMessageParam } from './ScriptMessageType';

/** Port of kinoko's ScriptMessage. */
export class ScriptMessage {
  // SAY
  text = '';
  hasPrev = false;
  hasNext = false;

  // SAYIMAGE
  images: string[] = [];

  // ASKTEXT / ASKBOXTEXT
  textDefault = '';
  textLengthMin = 0;
  textLengthMax = 0;

  // ASKNUMBER
  numberDefault = 0;
  numberMin = 0;
  numberMax = 0;

  // ASKAVATAR / ASKMEMBERSHOPAVATAR
  options: number[] = [];

  // ASKBOXTEXT
  textBoxColumns = 0;
  textBoxLines = 0;

  // ASKSLIDEMENU
  slideMenuType = 0;

  private constructor(
    public readonly speakerId: number,
    public readonly messageType: ScriptMessageType,
    public readonly messageParam: number,
  ) {}

  isPrevPossible(): boolean {
    return this.messageType === ScriptMessageType.SAY && this.hasPrev;
  }

  /** Port of ScriptMessage::encode. */
  encode(w: PacketWriter): void {
    w.writeByte(0); // nSpeakerTypeID, unused
    w.writeInt(this.speakerId); // nSpeakerTemplateID
    w.writeByte(this.messageType); // nMsgType
    w.writeByte(this.messageParam); // bParam
    switch (this.messageType) {
      case ScriptMessageType.SAY:
        if ((this.messageParam & ScriptMessageParam.SPEAKER_ON_RIGHT) !== 0) {
          w.writeInt(this.speakerId);
        }
        w.writeMapleAsciiString(this.text);
        w.writeBoolean(this.hasPrev);
        w.writeBoolean(this.hasNext);
        break;
      case ScriptMessageType.SAYIMAGE:
        w.writeByte(this.images.length);
        for (const image of this.images) w.writeMapleAsciiString(image);
        break;
      case ScriptMessageType.ASKYESNO:
      case ScriptMessageType.ASKACCEPT:
      case ScriptMessageType.ASKMENU:
        w.writeMapleAsciiString(this.text);
        break;
      case ScriptMessageType.ASKTEXT:
        w.writeMapleAsciiString(this.text);
        w.writeMapleAsciiString(this.textDefault);
        w.writeShort(this.textLengthMin);
        w.writeShort(this.textLengthMax);
        break;
      case ScriptMessageType.ASKNUMBER:
        w.writeMapleAsciiString(this.text);
        w.writeInt(this.numberDefault);
        w.writeInt(this.numberMin);
        w.writeInt(this.numberMax);
        break;
      case ScriptMessageType.ASKAVATAR:
      case ScriptMessageType.ASKMEMBERSHOPAVATAR:
        w.writeMapleAsciiString(this.text);
        w.writeByte(this.options.length);
        for (const option of this.options) w.writeInt(option);
        break;
      case ScriptMessageType.ASKBOXTEXT:
        w.writeMapleAsciiString(this.text);
        w.writeMapleAsciiString(this.textDefault);
        w.writeShort(this.textBoxColumns);
        w.writeShort(this.textBoxLines);
        break;
      case ScriptMessageType.ASKSLIDEMENU:
        w.writeInt(this.slideMenuType);
        w.writeInt(0); // last index
        w.writeMapleAsciiString(this.text);
        break;
      case ScriptMessageType.ASKQUIZ:
      case ScriptMessageType.ASKSPEEDQUIZ:
      case ScriptMessageType.ASKPET:
      case ScriptMessageType.ASKPETALL:
        throw new Error(`Unsupported message type : ${ScriptMessageType[this.messageType]}`);
    }
  }

  static say(speakerId: number, messageParam: number, text: string, hasPrev: boolean, hasNext: boolean): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.SAY, messageParam);
    m.text = text;
    m.hasPrev = hasPrev;
    m.hasNext = hasNext;
    return m;
  }

  static sayImage(speakerId: number, messageParam: number, images: string[]): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.SAYIMAGE, messageParam);
    m.images = images;
    return m;
  }

  static ask(speakerId: number, messageParam: number, messageType: ScriptMessageType, text: string): ScriptMessage {
    const m = new ScriptMessage(speakerId, messageType, messageParam);
    m.text = text;
    return m;
  }

  static askText(speakerId: number, messageParam: number, text: string, textDefault: string, textLengthMin: number, textLengthMax: number): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.ASKTEXT, messageParam);
    m.text = text;
    m.textDefault = textDefault;
    m.textLengthMin = textLengthMin;
    m.textLengthMax = textLengthMax;
    return m;
  }

  static askNumber(speakerId: number, messageParam: number, text: string, numberDefault: number, numberMin: number, numberMax: number): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.ASKNUMBER, messageParam);
    m.text = text;
    m.numberDefault = numberDefault;
    m.numberMin = numberMin;
    m.numberMax = numberMax;
    return m;
  }

  static askAvatar(speakerId: number, messageParam: number, text: string, options: number[]): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.ASKAVATAR, messageParam);
    m.text = text;
    m.options = options;
    return m;
  }

  static askBoxText(speakerId: number, messageParam: number, text: string, textDefault: string, textBoxColumns: number, textBoxLines: number): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.ASKBOXTEXT, messageParam);
    m.text = text;
    m.textDefault = textDefault;
    m.textBoxColumns = textBoxColumns;
    m.textBoxLines = textBoxLines;
    return m;
  }

  static askSlideMenu(speakerId: number, messageParam: number, slideMenuType: number, text: string): ScriptMessage {
    const m = new ScriptMessage(speakerId, ScriptMessageType.ASKSLIDEMENU, messageParam);
    m.slideMenuType = slideMenuType;
    m.text = text;
    return m;
  }
}
