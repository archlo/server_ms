import { ItemInfo } from '../../provider/item/ItemInfo';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Item } from './Item';

export class PetData {
  petName    = '';
  level      = 0;
  fullness   = 0;
  tameness   = 0;
  petSkill   = 0;
  petAttribute = 0;
  remainLife = 0;
  exceptionList: number[] = [];

  constructor(src?: PetData) {
    if (src) {
      Object.assign(this, src);
      this.exceptionList = [...src.exceptionList];
    }
  }

  encode(w: PacketWriter, item: Item): void {
    w.writeFixedString(this.petName, 13);
    w.writeByte(this.level);
    w.writeShort(this.tameness);
    w.writeByte(this.fullness);
    w.writeFT(item.dateExpire);
    w.writeShort(this.petAttribute);
    w.writeShort(this.petSkill);
    w.writeInt(this.remainLife);
    w.writeShort(item.attribute);
  }

  static from(itemInfo: ItemInfo, name: string): PetData {
    const pd = new PetData();
    pd.petName  = name;
    pd.level    = 1;
    pd.fullness = 100;
    return pd;
  }
}
