import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User, statChangedMapPacket } from '../user/User';
import { InventoryOperation } from './InventoryOperation';
import { inventoryOperation } from './ItemPacket';
import { Stat } from '../user/stat/Stat';

export class SkillResetHandler {
  static handleUserSkillResetItemUseRequest(user: User, r: PacketReader): void {
    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    const position = r.readShort();
    const itemId = r.readInt();

    const item = user.getInventoryManager().cashInventory.getItem(position);
    if (!item || item.itemId !== itemId) {
      user.dispose();
      return;
    }

    const consumeOp = user.getInventoryManager().removeItemAt(position, item, 1);
    if (!consumeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(consumeOp, true));

    const sm = user.getSkillManager();
    const cs = user.getCharacterStat();
    const changed = new Map<Stat, any>();

    let refundedSp = 0;
    for (const sr of sm.getSkillRecords()) {
      refundedSp += sr.getSkillLevel();
      sm.removeSkill(sr.skillId);
    }
    if (refundedSp > 0) {
      cs.sp.addNonExtendSp(refundedSp);
      changed.set(Stat.SP, cs.sp.getNonExtendSp());
    }

    if (changed.size > 0) {
      user.write(statChangedMapPacket(changed));
    }

    user.write(skillResetResultPacket(true));
  }
}

function skillResetResultPacket(success: boolean): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.SKILL_RESET_ITEM_RESULT.code);
  w.writeBoolean(success);
  return w.getPacket();
}
