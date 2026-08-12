import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User, statChangedPacket } from '../user/User';
import { MakerProvider } from '../../provider/MakerProvider';
import { MessagePacket } from '../user/MessagePacket';
import { InventoryType, inventoryTypeByItemId } from './InventoryType';
import { InventoryOperation } from './InventoryOperation';
import { inventoryOperation } from './ItemPacket';
import { Item } from './Item';
import { ItemType } from './ItemType';
import { ItemProvider } from '../../provider/ItemProvider';
import { Stat } from '../user/stat/Stat';
import { Util } from '../../util/Util';

export class MakerHandler {
  static handleUserItemMakeRequest(user: User, r: PacketReader): void {
    const action = r.readByte();
    switch (action) {
      case 0: // Craft from recipe
        handleCraft(user, r);
        break;
      case 1: // Disassemble item
        handleDisassemble(user, r);
        break;
      case 2: // Monster crystal
        handleMonsterCrystal(user, r);
        break;
      default:
        user.write(makerResult(4)); // MakerResultType.Failed
    }
  }
}

function handleCraft(user: User, r: PacketReader): void {
  const recipeItemId = r.readInt();
  const count = Math.max(r.readShort(), 1);

  const recipe = MakerProvider.getRecipe(recipeItemId);
  if (!recipe) {
    user.write(makerResult(4));
    return;
  }

  const sm = user.getSkillManager();
  const makerSkillLevel = sm.getSkillLevel(2022) || sm.getSkillLevel(1012);
  if (makerSkillLevel < recipe.reqSkillLevel) {
    user.write(makerResult(2)); // MakerResultType.NotEnoughSkillLevel
    return;
  }

  if (user.getLevel() < recipe.reqLevel) {
    user.write(makerResult(1)); // MakerResultType.NotEnoughLevel
    return;
  }

  const im = user.getInventoryManager();
  const totalMeso = recipe.meso * count;
  if (im.money < totalMeso) {
    user.write(makerResult(7)); // MakerResultType.NotEnoughMeso
    return;
  }

  // Check ingredients
  for (const ing of recipe.ingredients) {
    if (!im.hasItem(ing.itemId, ing.count * count)) {
      user.write(makerResult(3)); // MakerResultType.NotEnoughMaterials
      return;
    }
  }

  // Check space for result
  const isEquip = recipe.resultItemId >= 1000000 && recipe.resultItemId < 2000000;
  const resultItem = new Item(isEquip ? ItemType.EQUIP : ItemType.BUNDLE);
  resultItem.itemId = recipe.resultItemId;
  resultItem.quantity = isEquip ? 1 : recipe.resultCount * count;
  if (!im.canAddItem(resultItem)) {
    user.write(makerResult(8)); // MakerResultType.InventoryFull
    return;
  }

  // Consume materials (removeItemById applies the operations internally)
  const removeOps: InventoryOperation[] = [];
  for (const ing of recipe.ingredients) {
    const ops = im.removeItemById(ing.itemId, ing.count * count);
    if (!ops) {
      user.write(makerResult(4));
      return;
    }
    removeOps.push(...ops);
  }

  // Deduct meso
  im.gainMoney(-totalMeso);

  // Determine success
  const success = Util.succeedProp(recipe.successRate);
  if (success) {
    const addOps = im.addItem(resultItem);
    if (!addOps) {
      user.write(makerResult(4));
      return;
    }
    user.write(inventoryOperation([...removeOps, ...addOps], false));
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(makerResult(0)); // MakerResultType.Success
  } else {
    // Failure: materials consumed but no result
    user.write(inventoryOperation(removeOps, false));
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(makerResult(5)); // MakerResultType.Failed
  }
}

function handleDisassemble(user: User, r: PacketReader): void {
  const position = r.readShort();
  const count = r.readShort();

  const im = user.getInventoryManager();
  const item = im.etcInventory.getItem(position);
  if (!item || item.quantity < count) {
    user.write(makerResult(4));
    return;
  }

  // Disassemble yields crystal ores based on item level (simplified)
  const crystalItemId = 4004000; // Basic crystal ore
  const yieldCount = Math.max(1, Math.floor(count / 10));

  const crystalItem = new Item(ItemType.BUNDLE);
  crystalItem.itemId = crystalItemId;
  crystalItem.quantity = yieldCount;

  if (!im.canAddItem(crystalItem)) {
    user.write(makerResult(8));
    return;
  }

  const removeOp = im.removeItemAt(position, item, count);
  if (!removeOp) {
    user.write(makerResult(4));
    return;
  }
  im.applyInventoryOperations([removeOp]);

  const addOps = im.addItem(crystalItem);
  if (!addOps) {
    user.write(makerResult(4));
    return;
  }

  user.write(inventoryOperation([removeOp, ...addOps], false));
  user.write(makerResult(0));
}

function handleMonsterCrystal(user: User, r: PacketReader): void {
  // Monster crystal extraction from equip items
  const position = r.readShort();
  r.readShort(); // count (always 1 for equip)

  const im = user.getInventoryManager();
  const item = im.equipInventory.getItem(position);
  if (!item) {
    user.write(makerResult(4));
    return;
  }

  // Extract crystal based on item level (simplified)
  const itemInfo = ItemProvider.getItemInfo(item.itemId);
  const itemLevel = itemInfo?.getReqLevel() ?? 0;
  const crystalItemId = itemLevel >= 120 ? 4004003 // Advanced
    : itemLevel >= 80 ? 4004002                 // Intermediate
    : itemLevel >= 30 ? 4004001                  // Basic
    : 4004000;                                    // Low

  const crystalItem = new Item(ItemType.BUNDLE);
  crystalItem.itemId = crystalItemId;
  crystalItem.quantity = 1;

  if (!im.canAddItem(crystalItem)) {
    user.write(makerResult(8));
    return;
  }

  const removeOp = im.removeItemAt(position, item, 1);
  if (!removeOp) {
    user.write(makerResult(4));
    return;
  }
  im.applyInventoryOperations([removeOp]);

  const addOps = im.addItem(crystalItem);
  if (!addOps) {
    user.write(makerResult(4));
    return;
  }

  user.write(inventoryOperation([removeOp, ...addOps], false));
  user.write(makerResult(0));
}

function makerResult(result: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.USER_MAKER_RESULT.code);
  w.writeInt(result);
  return w.getPacket();
}
