import NXManager from '../wz-utils/NXManager';

export interface CashShopItem {
  sn: number;
  itemId: number;
  price: number;
  discountPrice: number;
  count: number;
  period: number;
  priority: number;
  gender: number;
  onSale: boolean;
  label: string;
  packageSNs: number[];
  meso: number;
}

export class CashShopProvider {
  private static items: Map<number, CashShopItem> = new Map();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;
    this.items.clear();

    try {
      const commodity = NXManager.get('Etc.wz/Commodity.img');
      if (!commodity) return;

      const packageSNs = new Map<number, number[]>();
      try {
        const packages = NXManager.get('Etc.wz/CashPackage.img');
        if (packages) {
          for (const pkg of packages.nChildren) {
            const packageId = parseInt(pkg.nName);
            if (isNaN(packageId)) continue;
            const snNode = pkg.nGet('SN');
            const sns: number[] = [];
            if (snNode) {
              for (const c of snNode.nChildren) {
                const v = Number(c.nValue);
                if (isFinite(v)) sns.push(v);
              }
            }
            if (sns.length > 0) packageSNs.set(packageId, sns);
          }
        }
      } catch (_) {}

      for (const node of commodity.nChildren) {
        const sn = nVal(node, 'SN', -1);
        const itemId = nVal(node, 'ItemId', -1);
        const price = nVal(node, 'Price', 0);
        if (sn < 0 || itemId < 0 || price <= 0) continue;
        const discountPrice = nVal(node, 'DiscountPrice', 0);
        const meso = nVal(node, 'Meso', 0);
        this.items.set(sn, {
          sn,
          itemId,
          price,
          discountPrice: discountPrice > 0 ? discountPrice : 0,
          count: Math.max(1, nVal(node, 'Count', 1)),
          period: nVal(node, 'Period', 0),
          priority: nVal(node, 'Priority', 0),
          gender: nVal(node, 'Gender', 2),
          onSale: nVal(node, 'OnSale', 0) !== 0,
          label: nStr(node, 'Label', ''),
          packageSNs: packageSNs.get(itemId) ?? [],
          meso,
        });
      }
    } catch (_) {}

    this.initialized = true;
  }

  static getItem(sn: number): CashShopItem | undefined {
    return this.items.get(sn);
  }
}

function nVal(node: any, key: string, def = 0): number {
  const child = node.nGet(key);
  if (child === undefined || child === null || child.nValue === undefined || child.nValue === '') return def;
  const n = Number(child.nValue);
  return isFinite(n) ? n : def;
}

function nStr(node: any, key: string, def = ''): string {
  const child = node.nGet(key);
  if (child === undefined || child === null || child.nValue === undefined || child.nValue === null) return def;
  return String(child.nValue);
}
