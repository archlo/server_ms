import { expect } from 'chai';
import { ItemInfo } from '../../../src/provider/item/ItemInfo';
import { ItemSpecType } from '../../../src/provider/item/ItemSpecType';
import { ItemProvider } from '../../../src/provider/ItemProvider';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { Item } from '../../../src/world/item/Item';
import { ItemHandler } from '../../../src/world/item/ItemHandler';
import { ItemType } from '../../../src/world/item/ItemType';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { ScriptRegistry } from '../../../src/world/script/ScriptRegistry';
import { UserHandler } from '../../../src/world/user/UserHandler';

describe('world/script script dispatch', () => {
  const originalGetItemInfo = ItemProvider.getItemInfo;

  afterEach(() => {
    ItemProvider.getItemInfo = originalGetItemInfo;
  });

  it('should start registered portal scripts from portal requests', () => {
    const writes: Buffer[] = [];
    let dialog: any = null;
    let disposed = 0;
    const scriptName = 'test_portal_script';
    ScriptRegistry.portal.register(scriptName, function* (ctx) {
      yield ctx.sayOk('portal started');
    });

    const user: any = {
      getFieldKey: (): number => 7,
      getField: (): any => ({
        getPortalByName: (name: string): any => name === 'pt00' ? { script: scriptName } : undefined,
      }),
      hasDialog: (): boolean => dialog !== null,
      setDialog: (d: any): void => { dialog = d; },
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    UserHandler.handleUserPortalScriptRequest(user, new PacketReader(portalScriptPacket(7, 'pt00')));

    expect(disposed).to.equal(0);
    expect(dialog).to.not.equal(null);
    expect(writes.length).to.equal(1);
  });

  it('should start registered item scripts without consuming the item', () => {
    const itemId = 2430000;
    const scriptName = 'test_item_script';
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    item.quantity = 1;
    im.consumeInventory.putItem(1, item);
    ItemProvider.getItemInfo = (id: number): ItemInfo | undefined => {
      if (id !== itemId) return undefined;
      return new ItemInfo(itemId, new Map(), new Map([[ItemSpecType.script, scriptName]]));
    };
    ScriptRegistry.item.register(scriptName, function* (ctx) {
      yield ctx.sayOk('item started');
    });

    const writes: Buffer[] = [];
    let dialog: any = null;
    let disposed = 0;
    const user: any = {
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({}),
      hasDialog: (): boolean => dialog !== null,
      setDialog: (d: any): void => { dialog = d; },
      write: (packet: Buffer): void => { writes.push(packet); },
      dispose: (): void => { disposed++; },
    };

    ItemHandler.handleUserScriptItemUseRequest(user, new PacketReader(scriptItemPacket(1, itemId)));

    expect(disposed).to.equal(0);
    expect(dialog).to.not.equal(null);
    expect(writes.length).to.equal(1);
    expect(im.consumeInventory.getItem(1)?.quantity).to.equal(1);
  });

  it('should reject non-script item requests without starting a dialog', () => {
    const itemId = 2000000;
    const im = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = itemId;
    im.consumeInventory.putItem(1, item);

    let dialog: any = null;
    let disposed = 0;
    const user: any = {
      getHp: (): number => 100,
      getInventoryManager: (): InventoryManager => im,
      getField: (): any => ({}),
      hasDialog: (): boolean => dialog !== null,
      setDialog: (d: any): void => { dialog = d; },
      write: (): void => undefined,
      dispose: (): void => { disposed++; },
    };

    ItemHandler.handleUserScriptItemUseRequest(user, new PacketReader(scriptItemPacket(1, itemId)));

    expect(disposed).to.equal(1);
    expect(dialog).to.equal(null);
  });
});

function portalScriptPacket(fieldKey: number, portalName: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(fieldKey);
  w.writeMapleAsciiString(portalName);
  return w.getPacket();
}

function scriptItemPacket(position: number, itemId: number): Buffer {
  const w = new PacketWriter();
  w.writeInt(0); // update_time
  w.writeShort(position);
  w.writeInt(itemId);
  return w.getPacket();
}
