import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ShopItem } from '../server/dialog/shop/ShopItem';
import { ItemProvider } from './ItemProvider';
import { ItemInfoType } from './item/ItemInfoType';

const npcShopItems = new Map<number, ShopItem[]>();
let initialized = false;

function initializeRechargeableItems(): ShopItem[] {
  const itemIds = [
    2070000, 2070001, 2070002, 2070003, 2070004, 2070005, 2070006,
    2070007, 2070008, 2070009, 2070010, 2070011, 2070012, 2070013,
    2070016, 2070018,
    2330000, 2330001, 2330002, 2330003, 2330004, 2330005,
    2331000, 2332000,
  ];
  const items: ShopItem[] = [];
  for (const itemId of itemIds) {
    const ii = ItemProvider.getItemInfo(itemId);
    if (!ii) continue;
    items.push(ShopItem.rechargeable(itemId, ii.getInfo(ItemInfoType.slotMax, 1), ii.getInfo(ItemInfoType.unitPrice, 0)));
  }
  return items;
}

export const ShopProvider = {
  initialize(dataDir = process.env.SHOP_DATA_DIR ?? path.join(process.cwd(), 'data', 'shop')): void {
    if (initialized) return;
    npcShopItems.clear();
    if (!fs.existsSync(dataDir)) {
      throw new Error(`Shop data directory not found: ${dataDir}. Set SHOP_DATA_DIR or create server/data/shop.`);
    }
    for (const fileName of fs.readdirSync(dataDir)) {
      if (!fileName.endsWith('.yaml')) continue;
      const npcId = parseInt(fileName.replace('.yaml', ''), 10);
      if (isNaN(npcId)) continue;
      const filePath = path.join(dataDir, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content) as any;
      if (!data || typeof data !== 'object') continue;
      const rechargeable = data.recharge === true;
      const rawItems: any[] = data.items ?? [];
      const shopItems: ShopItem[] = [];
      for (const itemInfo of rawItems) {
        if (!Array.isArray(itemInfo) || itemInfo.length < 2) continue;
        const itemId = Number(itemInfo[0]);
        const price = Number(itemInfo[1]);
        const quantity = itemInfo.length > 2 ? Number(itemInfo[2]) : 1;
        const maxPerSlot = itemInfo.length > 3 ? Number(itemInfo[3]) : 1;
        let unitPrice = 0;
        for (const ri of rechargeableItems) {
          if (ri.itemId === itemId) {
            unitPrice = ri.unitPrice;
            break;
          }
        }
        shopItems.push(new ShopItem(itemId, price, quantity, maxPerSlot, 0, 0, unitPrice));
      }
      if (rechargeable) {
        for (const ri of rechargeableItems) {
          if (!shopItems.some(existing => existing.itemId === ri.itemId)) {
            shopItems.push(ri);
          }
        }
      }
      npcShopItems.set(npcId, shopItems);
    }
    initialized = true;
  },

  isShop(templateId: number): boolean {
    if (!initialized) this.initialize();
    return npcShopItems.has(templateId);
  },

  getNpcShopItems(templateId: number): ShopItem[] {
    if (!initialized) this.initialize();
    return npcShopItems.get(templateId) ?? [];
  },
};

const rechargeableItems = initializeRechargeableItems();
