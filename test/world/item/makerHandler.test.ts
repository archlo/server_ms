import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { MakerHandler } from '../../../src/world/item/MakerHandler';
import { MakerProvider } from '../../../src/provider/MakerProvider';
import { RecipeInfo } from '../../../src/provider/RecipeInfo';
import { InventoryManager } from '../../../src/world/item/InventoryManager';
import { Item } from '../../../src/world/item/Item';
import { ItemType } from '../../../src/world/item/ItemType';
import { SkillManager } from '../../../src/world/skill/SkillManager';
import { SkillRecord } from '../../../src/world/skill/SkillRecord';
import { Stat } from '../../../src/world/user/stat/Stat';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { Util } from '../../../src/util/Util';

function mockUser(level: number, inventory: InventoryManager) {
  const sm = new SkillManager();
  const packets: Buffer[] = [];
  const characterStat = { level, ap: 0, sp: { addNonExtendSp: (n: number) => {}, getNonExtendSp: () => 0 }, face: 0 } as any;
  return {
    getHp: () => 100,
    getLevel: () => level,
    getInventoryManager: () => inventory,
    getSkillManager: () => sm,
    getCharacterStat: () => characterStat,
    write: (buf: Buffer) => packets.push(buf),
    packets,
  };
}

type MockUser = ReturnType<typeof mockUser>;

function craftPacket(recipeItemId: number, count: number) {
  const w = new PacketWriter();
  w.writeByte(0);
  w.writeInt(recipeItemId);
  w.writeShort(count);
  return new PacketReader(w.getPacket());
}

function disassemblePacket(position: number, count: number) {
  const w = new PacketWriter();
  w.writeByte(1);
  w.writeShort(position);
  w.writeShort(count);
  return new PacketReader(w.getPacket());
}

function crystalPacket(position: number) {
  const w = new PacketWriter();
  w.writeByte(2);
  w.writeShort(position);
  w.writeShort(1);
  return new PacketReader(w.getPacket());
}

describe('world/item/MakerHandler.ts', () => {
  let originalSucceedProp: typeof Util.succeedProp;

  before(() => {
    originalSucceedProp = Util.succeedProp;
  });

  beforeEach(() => {
    MakerProvider['recipes'].clear();
    Util.succeedProp = () => true;
  });

  afterEach(() => {
    Util.succeedProp = originalSucceedProp;
  });

  it('should craft a recipe on success', () => {
    const inv = new InventoryManager();
    inv.addMoney(5000);

    const mat = new Item(ItemType.BUNDLE);
    mat.itemId = 4000001;
    mat.quantity = 10;
    inv.etcInventory.putItem(1, mat);

    const recipe = new RecipeInfo(100000, 2000000, 5, 10, 1, 1000, [{ itemId: 4000001, count: 2 }], 100);
    MakerProvider.registerRecipe(recipe);

    const user: any = mockUser(20, inv);
    const sr = new SkillRecord(2022);
    sr.setSkillLevel(3);
    sr.setMasterLevel(3);
    user.getSkillManager().addSkill(sr);

    MakerHandler.handleUserItemMakeRequest(user, craftPacket(100000, 2));

    expect(inv.money).to.equal(3000); // 5000 - (1000 * 2)
    expect(inv.getItemCount(4000001)).to.equal(6);
    expect(inv.getItemCount(2000000)).to.equal(10);
    expect(user.packets.some((p: Buffer) => p.readUInt16LE(0) === MapleSendOpcode.USER_MAKER_RESULT.getValue())).to.be.true;
  });

  it('should fail craft when not enough materials', () => {
    const inv = new InventoryManager();
    inv.addMoney(5000);

    const recipe = new RecipeInfo(100000, 2000000, 1, 10, 1, 1000, [{ itemId: 4000001, count: 5 }], 100);
    MakerProvider.registerRecipe(recipe);

    const user: any = mockUser(20, inv);
    const sr2 = new SkillRecord(2022);
    sr2.setSkillLevel(3);
    sr2.setMasterLevel(3);
    user.getSkillManager().addSkill(sr2);

    MakerHandler.handleUserItemMakeRequest(user, craftPacket(100000, 1));

    expect(inv.money).to.equal(5000);
    expect(user.packets.length).to.be.greaterThan(0);
  });

  it('should consume materials and give no result on crafting failure', () => {
    Util.succeedProp = () => false;
    const inv = new InventoryManager();
    inv.addMoney(5000);

    const mat = new Item(ItemType.BUNDLE);
    mat.itemId = 4000001;
    mat.quantity = 10;
    inv.etcInventory.putItem(1, mat);

    const recipe = new RecipeInfo(100000, 2000000, 1, 10, 1, 1000, [{ itemId: 4000001, count: 2 }], 50);
    MakerProvider.registerRecipe(recipe);

    const user: any = mockUser(20, inv);
    const sr3 = new SkillRecord(2022);
    sr3.setSkillLevel(3);
    sr3.setMasterLevel(3);
    user.getSkillManager().addSkill(sr3);

    MakerHandler.handleUserItemMakeRequest(user, craftPacket(100000, 1));

    expect(inv.money).to.equal(4000);
    expect(inv.getItemCount(4000001)).to.equal(8);
    expect(inv.getItemCount(2000000)).to.equal(0);
  });

  it('should disassemble items into crystal ores', () => {
    const inv = new InventoryManager();
    const item = new Item(ItemType.BUNDLE);
    item.itemId = 4000100;
    item.quantity = 20;
    inv.etcInventory.putItem(2, item);

    const user: any = mockUser(30, inv);
    MakerHandler.handleUserItemMakeRequest(user, disassemblePacket(2, 20));

    expect(inv.getItemCount(4000100)).to.equal(0);
    expect(inv.getItemCount(4004000)).to.equal(2);
  });

  it('should extract monster crystals from equip items', () => {
    const inv = new InventoryManager();
    const equip = new Item(ItemType.EQUIP);
    equip.itemId = 1002140;
    inv.equipInventory.putItem(1, equip);

    const user: any = mockUser(30, inv);
    MakerHandler.handleUserItemMakeRequest(user, crystalPacket(1));

    expect(inv.equipInventory.getItem(1)).to.be.undefined;
    expect(inv.getItemCount(4004000)).to.equal(1);
  });
});
