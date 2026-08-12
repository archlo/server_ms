import { Life } from '../field/life/Life';
import { PacketWriter } from '../../protocol/packets/packetWriter';

/**
 * Port of kinoko's Dragon. The Evan dragon is a field object that
 * follows the owner and is broadcast to other users on enter-field.
 * Foothold resolution (`getFootholdBelow`) is not ported - the dragon
 * spawns on foothold 0, mirroring the User.warp foothold cut.
 */
export class Dragon extends Life {
  constructor(public readonly jobCode: number) {
    super();
  }

  /** Port of kinoko's Dragon::setPosition. */
  setPosition(field: any, x: number, y: number): void {
    this.setField(field);
    this.setX(x);
    this.setY(y);
    this.setFoothold(0); // getFootholdBelow not ported
  }

  /** Port of kinoko's Dragon::encode. */
  encode(w: PacketWriter): void {
    w.writeInt(this.getX()); // ptPos.x
    w.writeInt(this.getY()); // ptPos.y
    w.writeByte(this.getMoveAction()); // nMoveAction
    w.writeShort(this.getFoothold()); // ignored
    w.writeShort(this.jobCode); // nJobCode
  }
}
