import { NXNode } from '../../wz-utils/NXNode';
import { Rect } from '../../util/Rect';
import { ItemInfoType, itemInfoTypeFromName, itemInfoTypeIsIgnored } from './ItemInfoType';
import { ItemSpecType, itemSpecTypeFromName, itemSpecTypeIsIgnored } from './ItemSpecType';
import { Item } from '../../world/item/Item';
import { itemTypeByItemId, ItemType } from '../../world/item/ItemType';
import { EquipData } from '../../world/item/EquipData';
import { PetData } from '../../world/item/PetData';
import { ItemVariationOption } from '../../world/item/ItemVariationOption';
import { GameConstants } from '../../world/GameConstants';

export class ItemInfo {
  constructor(
    public readonly itemId: number,
    public readonly itemInfos: Map<ItemInfoType, any>,
    public readonly itemSpecs: Map<ItemSpecType, any>,
  ) {}

  getInfo(type: ItemInfoType, defaultValue = 0): number {
    const v = this.itemInfos.get(type);
    if (v === undefined || v === null) return defaultValue;
    return typeof v === 'number' ? v : parseInt(String(v)) || defaultValue;
  }

  getSpec(type: ItemSpecType, defaultValue = 0): number {
    const v = this.itemSpecs.get(type);
    if (v === undefined || v === null) return defaultValue;
    return typeof v === 'number' ? v : parseInt(String(v)) || defaultValue;
  }

  getScript(): string {
    return (this.itemSpecs.get(ItemSpecType.script) as string | undefined) ?? '';
  }

  getSkills(): number[] {
    const raw = this.itemInfos.get(ItemInfoType.skill);
    if (raw === undefined || raw === null) return [];
    if (typeof raw === 'number') return [raw];
    if (typeof raw === 'string') return raw.split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
    return [];
  }

  getRect(): Rect | null {
    const lt = this.itemInfos.get(ItemInfoType.lt) as NXNode | undefined;
    const rb = this.itemInfos.get(ItemInfoType.rb) as NXNode | undefined;
    if (!lt || !rb) return null;
    return Rect.of(lt.nX, lt.nY, rb.nX, rb.nY);
  }

  isCash():  boolean { return this.getInfo(ItemInfoType.cash) !== 0; }
  isQuest(): boolean { return this.getInfo(ItemInfoType.quest) !== 0; }
  getPrice(): number { return this.getInfo(ItemInfoType.price); }

  getReqLevel(): number {
    return Math.max(this.getInfo(ItemInfoType.reqLevel), this.getInfo(ItemInfoType.reqLEVEL));
  }

  getSlotMax(): number {
    if (this.itemInfos.has(ItemInfoType.slotMax)) return this.getInfo(ItemInfoType.slotMax);
    return itemTypeByItemId(this.itemId) === ItemType.BUNDLE ? GameConstants.DEFAULT_ITEM_SLOT_MAX : 1;
  }

  isTradeBlock(item: Item): boolean {
    const tradeBlock = this.getInfo(ItemInfoType.tradeBlock) !== 0;
    const isBinded = item.itemType === ItemType.EQUIP && item.hasAttribute(0x02);
    return (tradeBlock || isBinded || this.isCash() || this.isQuest()) && !item.isPossibleTrading();
  }

  isEquipTradeBlock(): boolean {
    return this.getInfo(ItemInfoType.equipTradeBlock) !== 0;
  }

  isAccountSharable(): boolean {
    return this.getInfo(ItemInfoType.accountSharable) !== 0;
  }

  createItem(itemSn: bigint, quantity = 1, option = ItemVariationOption.NONE): Item {
    const itemType = itemTypeByItemId(this.itemId);
    const item = new Item(itemType);
    item.itemSn = itemSn;
    item.itemId = this.itemId;
    item.cash = this.isCash();
    item.quantity = quantity;
    if (itemType === ItemType.EQUIP) {
      item.equipData = EquipData.from(this, option);
    } else if (itemType === ItemType.PET) {
      item.petData = PetData.from(this, '');
    }
    return item;
  }

  static from(itemId: number, itemProp: NXNode): ItemInfo {
    const info = new Map<ItemInfoType, any>();
    const spec = new Map<ItemSpecType, any>();

    for (const child of itemProp.nChildren) {
      if (child.nName === 'info') {
        for (const infoChild of (child as NXNode).nChildren) {
          if (itemInfoTypeIsIgnored(infoChild.nName)) continue;
          const type = itemInfoTypeFromName(infoChild.nName);
          // store vector nodes as-is (for lt/rb rect)
          info.set(type, infoChild.nTagName === 'vector' ? infoChild : infoChild.nValue);
        }
      } else if (child.nName === 'spec') {
        for (const specChild of (child as NXNode).nChildren) {
          if (itemSpecTypeIsIgnored(specChild.nName)) continue;
          const type = itemSpecTypeFromName(specChild.nName);
          if (type !== null) spec.set(type, specChild.nValue);
        }
      }
    }

    return new ItemInfo(itemId, info, spec);
  }
}
