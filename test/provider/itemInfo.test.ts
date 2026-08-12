import { expect } from 'chai';
import { ItemInfo } from '../../src/provider/item/ItemInfo';
import { ItemInfoType } from '../../src/provider/item/ItemInfoType';
import { ItemType } from '../../src/world/item/ItemType';
import { ItemVariationOption } from '../../src/world/item/ItemVariationOption';

describe('provider/item/ItemInfo.ts', () => {
  it('should create bundle items', () => {
    const info = new ItemInfo(2000000, new Map([[ItemInfoType.cash, 0]]), new Map());
    const item = info.createItem(123n, 7);

    expect(item.itemType).to.equal(ItemType.BUNDLE);
    expect(item.itemId).to.equal(2000000);
    expect(item.itemSn).to.equal(123n);
    expect(item.quantity).to.equal(7);
    expect(item.cash).to.equal(false);
  });

  it('should create equip items with equip data', () => {
    const info = new ItemInfo(1002067, new Map([
      [ItemInfoType.incSTR, 3],
      [ItemInfoType.tuc, 7],
    ]), new Map());
    const item = info.createItem(456n, 1, ItemVariationOption.NONE);

    expect(item.itemType).to.equal(ItemType.EQUIP);
    expect(item.equipData).to.not.equal(null);
    expect(item.equipData!.incStr).to.equal(3);
    expect(item.equipData!.ruc).to.equal(7);
  });
});
