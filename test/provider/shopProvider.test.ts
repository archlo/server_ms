import { expect } from 'chai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ShopProvider } from '../../src/provider/ShopProvider';

describe('provider/ShopProvider.ts', () => {
  it('should load NPC shop items from yaml files', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'maple-shop-'));
    fs.writeFileSync(path.join(dir, '900001.yaml'), [
      'items:',
      '  - [2000000, 50, 1, 100]',
      '  - [2000001, 75]',
      '',
    ].join('\n'));

    ShopProvider.initialize(dir);

    expect(ShopProvider.isShop(900001)).to.equal(true);
    const items = ShopProvider.getNpcShopItems(900001);
    expect(items).to.have.length(2);
    expect(items[0].itemId).to.equal(2000000);
    expect(items[0].price).to.equal(50);
    expect(items[0].quantity).to.equal(1);
    expect(items[0].maxPerSlot).to.equal(100);
    expect(items[1].itemId).to.equal(2000001);
    expect(items[1].quantity).to.equal(1);
    expect(items[1].maxPerSlot).to.equal(1);
  });
});
