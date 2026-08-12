import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { InventoryType } from './InventoryType';
import { InventoryOperation } from './InventoryOperation';
import { inventoryOperation } from './ItemPacket';
import { MessagePacket } from '../user/MessagePacket';
import { Stat } from '../user/stat/Stat';
import { statChangedPacket } from '../user/User';

export class RepairHandler {
  static handleUserRepairDurabilityAll(user: User, r: PacketReader): void {
    const npcId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const equipped = im.equipInventory;
    const ops: InventoryOperation[] = [];
    let totalCost = 0;

    for (const [pos, item] of equipped.getItems()) {
      if (!item.equipData || item.equipData.durability < 0) continue;
      if (item.equipData.durability >= 100) continue;

      const cost = Math.ceil((100 - item.equipData.durability) * 0.01);
      totalCost += cost;
    }

    if (totalCost > 0 && im.money < totalCost) {
      user.write(MessagePacket.system('You do not have enough mesos.'));
      user.dispose();
      return;
    }

    for (const [pos, item] of equipped.getItems()) {
      if (!item.equipData || item.equipData.durability < 0) continue;
      if (item.equipData.durability >= 100) continue;

      const before = item.equipData.durability;
      item.equipData.durability = 100;
      const op = InventoryOperation.exp(InventoryType.EQUIPPED, pos, 0);
      ops.push(op);
    }

    if (ops.length === 0) { user.dispose(); return; }

    im.addMoney(-totalCost);
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(inventoryOperation(ops, false));
  }

  static handleUserRepairDurability(user: User, r: PacketReader): void {
    const position = r.readShort();
    r.readInt(); // npcId

    if (user.getHp() <= 0) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const item = im.equipInventory.getItem(Math.abs(position));
    if (!item?.equipData || item.equipData.durability < 0) {
      user.dispose();
      return;
    }

    if (item.equipData.durability >= 100) {
      user.write(MessagePacket.system('This item does not need repair.'));
      user.dispose();
      return;
    }

    const cost = Math.ceil((100 - item.equipData.durability) * 0.01);
    if (im.money < cost) {
      user.write(MessagePacket.system('You do not have enough mesos.'));
      user.dispose();
      return;
    }

    item.equipData.durability = 100;
    im.addMoney(-cost);
    const op = InventoryOperation.exp(InventoryType.EQUIPPED, position, 0);
    user.write(statChangedPacket(Stat.MONEY, im.money));
    user.write(inventoryOperation(op, false));
  }
}
