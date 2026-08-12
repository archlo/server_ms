import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { TrunkResultType } from './TrunkResultType';
import { Trunk } from '../../../world/item/Trunk';
import { DBChar } from '../../../world/user/DBChar';
import { InventoryType, inventoryTypeByItemId } from '../../../world/item/InventoryType';

export function getSuccess(trunk: Trunk): Buffer {
  return of(TrunkResultType.GetSuccess, trunk);
}

export function putSuccess(trunk: Trunk): Buffer {
  return of(TrunkResultType.PutSuccess, trunk);
}

export function sortItem(trunk: Trunk): Buffer {
  return of(TrunkResultType.SortItem, trunk);
}

export function moneySuccess(trunk: Trunk): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.TRUNK_RESULT.code);
  w.writeByte(TrunkResultType.MoneySuccess);
  w.writeByte(trunk.getSize());
  w.writeLong(BigInt(DBChar.MONEY));
  w.writeInt(trunk.getMoney());
  return w.getPacket();
}

export function openTrunkDlg(templateId: number, trunk: Trunk): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.TRUNK_RESULT.code);
  w.writeByte(TrunkResultType.OpenTrunkDlg);
  w.writeInt(templateId);
  trunk.encode(w);
  return w.getPacket();
}

export function serverMsg(message: string): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.TRUNK_RESULT.code);
  w.writeByte(TrunkResultType.ServerMsg);
  w.writeBoolean(true);
  w.writeMapleAsciiString(message);
  return w.getPacket();
}

export function of(resultType: TrunkResultType, trunk?: Trunk): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.TRUNK_RESULT.code);
  w.writeByte(resultType);
  if (trunk) {
    trunk.encode(w);
  }
  return w.getPacket();
}
