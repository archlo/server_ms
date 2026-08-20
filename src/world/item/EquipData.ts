import { ItemInfo } from '../../provider/item/ItemInfo';
import { ItemInfoType } from '../../provider/item/ItemInfoType';
import { ItemConstants } from './ItemConstants';
import { ItemGrade } from './ItemGrade';
import { ItemVariationOption } from './ItemVariationOption';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Item } from './Item';

const FT_ZERO_TIME = 94354848000000000n;

export class EquipData {
  incStr   = 0; incDex  = 0; incInt  = 0; incLuk   = 0;
  incMaxHp = 0; incMaxMp = 0;
  incPad   = 0; incMad  = 0; incPdd  = 0; incMdd   = 0;
  incAcc   = 0; incEva  = 0; incCraft = 0; incSpeed = 0; incJump = 0;
  incMhpPr = 0; incMmpPr = 0;  // percent stats
  Knockback = 0;

  ruc  = 0; // remaining upgrade count
  cuc  = 0; // current upgrade count
  iuc  = 0; // increase upgrade count
  chuc = 0; // current hyper upgrade count

  grade   = 0;
  option1 = 0; option2 = 0; option3 = 0;
  socket1 = 0; socket2 = 0;

  levelUpType = 0;
  level       = 0;
  exp         = 0;
  durability  = -1;

  constructor(src?: EquipData) {
    if (!src) return;
    Object.assign(this, src);
  }

  getItemGrade(): ItemGrade {
    switch (this.grade & 0x3) {
      case 1: return ItemGrade.RARE;
      case 2: return ItemGrade.EPIC;
      case 3: return ItemGrade.UNIQUE;
      default: return ItemGrade.NORMAL;
    }
  }

  isReleased(): boolean { return (this.grade & ItemGrade.RELEASED) !== 0; }

  applyScrollStats(scrollStats: Map<ItemInfoType, any>): void {
    for (const [key, rawVal] of scrollStats) {
      const value = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal)) || 0;
      const clamp = (n: number) => Math.max(0, Math.min(n, 32767));
      switch (key) {
        case ItemInfoType.incSTR: this.incStr    = clamp(this.incStr    + value); break;
        case ItemInfoType.incDEX: this.incDex    = clamp(this.incDex    + value); break;
        case ItemInfoType.incINT: this.incInt    = clamp(this.incInt    + value); break;
        case ItemInfoType.incLUK: this.incLuk    = clamp(this.incLuk    + value); break;
        case ItemInfoType.incMHP:
        case ItemInfoType.incMaxHP: this.incMaxHp = clamp(this.incMaxHp + value); break;
        case ItemInfoType.incMMP:
        case ItemInfoType.incMaxMP: this.incMaxMp = clamp(this.incMaxMp + value); break;
        case ItemInfoType.incPAD: this.incPad    = clamp(this.incPad    + value); break;
        case ItemInfoType.incMAD: this.incMad    = clamp(this.incMad    + value); break;
        case ItemInfoType.incPDD: this.incPdd    = clamp(this.incPdd    + value); break;
        case ItemInfoType.incMDD: this.incMdd    = clamp(this.incMdd    + value); break;
        case ItemInfoType.incACC: this.incAcc    = clamp(this.incAcc    + value); break;
        case ItemInfoType.incEVA: this.incEva    = clamp(this.incEva    + value); break;
        case ItemInfoType.incCraft: this.incCraft = clamp(this.incCraft + value); break;
        case ItemInfoType.incSpeed: this.incSpeed = clamp(this.incSpeed + value); break;
        case ItemInfoType.incJump:  this.incJump  = clamp(this.incJump  + value); break;
      }
    }
  }

  applyHyperUpgradeStats(): void {
    const rng = () => Math.floor(Math.random() * (ItemConstants.EQUIP_ENHANCEMENT_STAT_BASE + 1));
    const rngA = () => Math.floor(Math.random() * (ItemConstants.EQUIP_ENHANCEMENT_ATT_BASE + 1));
    const rngD = () => Math.floor(Math.random() * (ItemConstants.EQUIP_ENHANCEMENT_DEF_BASE + 1));
    const clamp = (n: number) => Math.max(0, Math.min(n, 32767));
    if (this.incStr > 0)   this.incStr   = clamp(this.incStr   + 1 + Math.floor(this.incStr   / 50) + rng());
    if (this.incDex > 0)   this.incDex   = clamp(this.incDex   + 1 + Math.floor(this.incDex   / 50) + rng());
    if (this.incInt > 0)   this.incInt   = clamp(this.incInt   + 1 + Math.floor(this.incInt   / 50) + rng());
    if (this.incLuk > 0)   this.incLuk   = clamp(this.incLuk   + 1 + Math.floor(this.incLuk   / 50) + rng());
    if (this.incPad > 0)   this.incPad   = clamp(this.incPad   + 1 + Math.floor(this.incPad   / 50) + rngA());
    if (this.incMad > 0)   this.incMad   = clamp(this.incMad   + 1 + Math.floor(this.incMad   / 50) + rngA());
    if (this.incPdd > 0)   this.incPdd   = clamp(this.incPdd   + 1 + Math.floor(this.incPdd   / 50) + rngD());
    if (this.incMdd > 0)   this.incMdd   = clamp(this.incMdd   + 1 + Math.floor(this.incMdd   / 50) + rngD());
  }

  encode(w: PacketWriter, item: Item): void {
    w.writeByte(this.ruc);
    w.writeByte(this.cuc);

    w.writeShort(this.incStr);
    w.writeShort(this.incDex);
    w.writeShort(this.incInt);
    w.writeShort(this.incLuk);
    w.writeShort(this.incMaxHp);
    w.writeShort(this.incMaxMp);
    w.writeShort(this.incPad);
    w.writeShort(this.incMad);
    w.writeShort(this.incPdd);
    w.writeShort(this.incMdd);
    w.writeShort(this.incAcc);
    w.writeShort(this.incEva);
    w.writeShort(this.incCraft);
    w.writeShort(this.incSpeed);
    w.writeShort(this.incJump);
    w.writeShort(this.incMhpPr);
    w.writeShort(this.incMmpPr);
    w.writeShort(this.Knockback);

    w.writeMapleAsciiString(item.title);

    w.writeShort(item.attribute);
    w.writeByte(this.levelUpType);
    w.writeByte(this.level);
    w.writeInt(this.exp);
    w.writeInt(this.durability);

    w.writeInt(this.iuc);
    w.writeByte(this.grade);
    w.writeByte(this.chuc);

    w.writeShort(this.option1);
    w.writeShort(this.option2);
    w.writeShort(this.option3);
    w.writeShort(this.socket1);
    w.writeShort(this.socket2);

    if (!item.cash) {
      w.writeLong(item.itemSn);
    }

    w.writeFTValue(FT_ZERO_TIME);
    w.writeInt(0); // nPrevBonusExpRate
  }

  static from(itemInfo: ItemInfo, option: ItemVariationOption): EquipData {
    const eq = new EquipData();
    for (const [infoType, rawVal] of itemInfo.itemInfos) {
      const v = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal)) || 0;
      const vary = () => ItemConstants.getVariation(v, option);
      switch (infoType) {
        case ItemInfoType.incSTR: eq.incStr    = vary(); break;
        case ItemInfoType.incDEX: eq.incDex    = vary(); break;
        case ItemInfoType.incINT: eq.incInt    = vary(); break;
        case ItemInfoType.incLUK: eq.incLuk    = vary(); break;
        case ItemInfoType.incMHP:
        case ItemInfoType.incMaxHP: eq.incMaxHp = vary(); break;
        case ItemInfoType.incMMP:
        case ItemInfoType.incMaxMP: eq.incMaxMp = vary(); break;
        case ItemInfoType.incPAD: eq.incPad    = vary(); break;
        case ItemInfoType.incMAD: eq.incMad    = vary(); break;
        case ItemInfoType.incPDD: eq.incPdd    = vary(); break;
        case ItemInfoType.incMDD: eq.incMdd    = vary(); break;
        case ItemInfoType.incACC: eq.incAcc    = vary(); break;
        case ItemInfoType.incEVA: eq.incEva    = vary(); break;
        case ItemInfoType.incCraft: eq.incCraft = vary(); break;
        case ItemInfoType.incSpeed: eq.incSpeed = vary(); break;
        case ItemInfoType.incJump:  eq.incJump  = vary(); break;
        case ItemInfoType.incMHPr: eq.incMhpPr = vary(); break;
        case ItemInfoType.incMMPr: eq.incMmpPr = vary(); break;
        case ItemInfoType.incKnockback: eq.Knockback = vary(); break;
        case ItemInfoType.tuc:      eq.ruc      = v;      break;
        case ItemInfoType.durability: eq.durability = v;  break;
      }
    }
    return eq;
  }
}
