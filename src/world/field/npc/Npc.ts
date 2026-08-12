import { Life } from '../life/Life';
import { NpcTemplate } from '../../../provider/npc/NpcTemplate';
import { PacketWriter } from '../../../protocol/packets/packetWriter';

export class Npc extends Life {
  private _controller: any = null;

  constructor(
    public readonly template: NpcTemplate,
    x: number, y: number,
    public readonly rx0: number,
    public readonly rx1: number,
    fh: number,
    isFlip: boolean,
  ) {
    super();
    this.setX(x);
    this.setY(y);
    this.setFoothold(fh);
    this.setMoveAction(isFlip ? 0 : 1);
  }

  getTemplateId(): number  { return this.template.id; }
  isMove():        boolean { return this.template.move; }
  getScript():     string  { return this.template.script; }
  hasScript():     boolean { return !!this.template.script; }
  isTrunk():       boolean { return this.template.trunkPut > 0 || this.template.trunkGet > 0; }

  getController(): any    { return this._controller; }
  setController(c: any):void { this._controller = c; }

  /** CNpc::Init */
  encode(w: PacketWriter): void {
    w.writeShort(this.getX());
    w.writeShort(this.getY());
    w.writeByte(this.getMoveAction());
    w.writeShort(this.getFoothold());
    w.writeShort(this.rx0);
    w.writeShort(this.rx1);
    w.writeBoolean(true); // bEnabled
  }
}
