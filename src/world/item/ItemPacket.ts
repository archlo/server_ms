import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { InventoryOperation } from './InventoryOperation';
import { InventoryType } from './InventoryType';
import { SkillRecord } from '../skill/SkillRecord';

/**
 * Port of kinoko's WvsContext::inventoryOperation (item-only subset; the
 * #16 ItemHandler scope - other WvsContext packets like skillLearnItemResult
 * stay where they're already used, e.g. SkillHandler.ts).
 */
export function inventoryOperation(operations: InventoryOperation | InventoryOperation[], exclRequest: boolean): Buffer {
  const ops = Array.isArray(operations) ? operations : [operations];
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.INVENTORY_OPERATION.code);
  w.writeByte(exclRequest ? 1 : 0); // bExclRequestSent
  w.writeByte(ops.length);
  for (const op of ops) {
    op.encode(w);
  }
  w.writeByte(0); // bSN
  return w.getPacket();
}

/** Port of kinoko's WvsContext::changeSkillRecordResult (single-record overload). */
export function changeSkillRecordResultPacket(skillRecord: SkillRecord, exclRequest: boolean): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.CHANGE_SKILL_RECORD_RESULT.code);
  w.writeByte(exclRequest ? 1 : 0);
  w.writeShort(1);
  w.writeInt(skillRecord.getSkillId());
  w.writeInt(skillRecord.getSkillLevel());
  w.writeInt(skillRecord.getMasterLevel());
  w.writeFT(null); // dateExpire = FileTime.DEFAULT_TIME
  w.writeByte(0); // bSN
  return w.getPacket();
}

/** Port of kinoko's WvsContext::inventoryGrow. */
export function inventoryGrow(inventoryType: InventoryType, newSize: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.INVENTORY_GROW.code);
  w.writeByte(inventoryType);
  w.writeByte(newSize);
  return w.getPacket();
}

/** Port of kinoko's WvsContext::gatherItemResult. */
export function gatherItemResult(inventoryType: InventoryType): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.GATHER_ITEM_RESULT.code);
  w.writeByte(inventoryType);
  return w.getPacket();
}

/** Port of kinoko's WvsContext::sortItemResult. */
export function sortItemResult(inventoryType: InventoryType): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.SORT_ITEM_RESULT.code);
  w.writeByte(inventoryType);
  return w.getPacket();
}

/** Port of kinoko's WvsContext::skillLearnItemResult. */
export function skillLearnItemResult(characterId: number, masteryBook: boolean, used: boolean, success: boolean, exclRequest: boolean): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.SKILL_LEARN_ITEM_RESULT.code);
  w.writeByte(exclRequest ? 1 : 0);
  w.writeInt(characterId);
  w.writeByte(masteryBook ? 1 : 0);
  w.writeInt(0);
  w.writeInt(0);
  w.writeByte(used ? 1 : 0);
  w.writeByte(success ? 1 : 0);
  return w.getPacket();
}
