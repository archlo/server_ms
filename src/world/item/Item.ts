import { ItemType } from './ItemType';
import { ItemConstants } from './ItemConstants';
import { EquipData } from './EquipData';
import { PetData } from './PetData';
import { RingData } from './RingData';
import { PacketWriter } from '../../protocol/packets/packetWriter';

export const EXPIRE_NEVER = new Date(2079, 11, 31, 23, 59); // FILETIME far future

export class Item {
  itemSn     = 0n; // bigint (CashSN or rechargeable SN)
  itemId     = 0;
  cash       = false;
  quantity   = 1;
  attribute  = 0;
  dateExpire: Date | null = null;
  title      = '';
  equipData: EquipData | null = null;
  petData:   PetData   | null = null;
  ringData:  RingData  | null = null;

  constructor(public readonly itemType: ItemType) {}

  copy(): Item {
    const n     = new Item(this.itemType);
    n.itemSn    = this.itemSn;
    n.itemId    = this.itemId;
    n.cash      = this.cash;
    n.quantity  = this.quantity;
    n.attribute = this.attribute;
    n.dateExpire = this.dateExpire;
    n.title     = this.title;
    n.equipData = this.equipData ? new EquipData(this.equipData) : null;
    n.petData   = this.petData   ? new PetData(this.petData)     : null;
    n.ringData  = this.ringData  ? new RingData(this.ringData)   : null;
    return n;
  }

  hasAttribute(flag: number): boolean { return (this.attribute & flag) !== 0; }
  addAttribute(flag: number): void    { this.attribute |= flag; }
  removeAttribute(flag: number): void { if (this.hasAttribute(flag)) this.attribute ^= flag; }

  isExpired(now: Date = new Date()): boolean {
    return this.dateExpire != null && this.dateExpire < now;
  }

  isPossibleTrading(): boolean {
    switch (this.itemType) {
      case ItemType.EQUIP:  return this.hasAttribute(0x10);
      case ItemType.BUNDLE: return this.hasAttribute(0x02);
      case ItemType.PET:    return this.hasAttribute(0x01);
    }
  }

  setPossibleTrading(set: boolean): void {
    const flag = this.itemType === ItemType.EQUIP  ? 0x10
               : this.itemType === ItemType.BUNDLE ? 0x02 : 0x01;
    set ? this.addAttribute(flag) : this.removeAttribute(flag);
  }

  encode(w: PacketWriter): void {
    w.writeByte(this.itemType);

    w.writeInt(this.itemId);
    w.writeBoolean(this.cash);
    if (this.cash) {
      w.writeLong(this.itemSn);
    }
    w.writeFT(this.dateExpire);

    switch (this.itemType) {
      case ItemType.EQUIP:
        this.equipData!.encode(w, this);
        break;
      case ItemType.PET:
        this.petData!.encode(w, this);
        break;
      default:
        w.writeShort(this.quantity);
        w.writeMapleAsciiString(this.title);
        w.writeShort(this.attribute);
        if (ItemConstants.isRechargeableItem(this.itemId)) {
          w.writeLong(this.itemSn);
        }
        break;
    }
  }
}
