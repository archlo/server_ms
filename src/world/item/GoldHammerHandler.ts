import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { User } from '../user/User';
import { InventoryOperation } from './InventoryOperation';
import { InventoryType, inventoryTypeByPosition } from './InventoryType';
import { inventoryOperation } from './ItemPacket';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
const GOLD_HAMMER_ITEM_ID = 2470000;
const MAX_ENHANCEMENT_BASE = 10;

function goldHammerResultPacket(success: boolean): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.GOLD_HAMMER_RESULT.code);
  w.writeBoolean(success);
  return w.getPacket();
}

export class GoldHammerHandler {
  static handleGoldHammerRequest(user: User, r: PacketReader): void {
    const equipPosition = r.readShort();
    const equipItemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
    const equip = im.getInventoryByType(equipType).getItem(equipPosition);
    if (!equip || equip.itemId !== equipItemId || !equip.equipData) {
      user.write(goldHammerResultPacket(false));
      user.dispose();
      return;
    }

    const eq = equip.equipData;
    if (eq.cuc + eq.iuc >= MAX_ENHANCEMENT_BASE) {
      user.write(goldHammerResultPacket(false));
      return;
    }

    user.write(goldHammerResultPacket(true));
  }

  static handleGoldHammerComplete(user: User, r: PacketReader): void {
    const equipPosition = r.readShort();
    const equipItemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
    const equip = im.getInventoryByType(equipType).getItem(equipPosition);
    if (!equip || equip.itemId !== equipItemId || !equip.equipData) {
      user.dispose();
      return;
    }

    const eq = equip.equipData;
    if (eq.cuc + eq.iuc >= MAX_ENHANCEMENT_BASE) {
      user.dispose();
      return;
    }

    // Find and consume gold hammer from cash or consume inventory
    const hammerEntry = findGoldHammer(im);
    if (!hammerEntry) {
      user.dispose();
      return;
    }
    const [hammerPos, hammerItem, hammerInvType] = hammerEntry;

    const hammerInv = im.getInventoryByType(hammerInvType);
    if (!hammerInv.removeItemExact(hammerPos, hammerItem)) { user.dispose(); return; }
    const consumeOp = InventoryOperation.delItem(hammerInvType, hammerPos);
    user.write(inventoryOperation(consumeOp, true));

    eq.iuc += 1;
    eq.ruc += 1;

    const updateOp = InventoryOperation.newItem(equipType, equipPosition, equip);
    user.write(inventoryOperation(updateOp, true));
  }
}

function findGoldHammer(im: any): [number, any, InventoryType] | null {
  for (const [pos, item] of im.cashInventory.getItems()) {
    if (item.itemId === GOLD_HAMMER_ITEM_ID) return [pos, item, InventoryType.CASH];
  }
  for (const [pos, item] of im.consumeInventory.getItems()) {
    if (item.itemId === GOLD_HAMMER_ITEM_ID) return [pos, item, InventoryType.CONSUME];
  }
  return null;
}
