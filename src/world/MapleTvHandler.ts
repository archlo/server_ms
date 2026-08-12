import { PacketReader } from '../protocol/packets/packetReader';
import { User } from './user/User';
import { Field } from './field/Field';
import { MapleTvMessage } from './field/MapleTvMessage';
import { MapleTvPacket } from './field/MapleTvPacket';
import { AvatarLook } from './user/AvatarLook';
import { inventoryOperation } from './item/ItemPacket';

/**
 * Port of kinoko's MapleTV handling (CashItemHandler MAPLETV/MAPLESOLETV/
 * MAPLELOVETV/MEGATV/MEGASOLETV/MEGALOVETV cases), routed through the
 * MapleTVSendMessageRequest opcode. Builds a queued MapleTvMessage with
 * sender/receiver AvatarLook and a 5-line message, mirroring kinoko's
 * Field mapleTvQueue wait-time behaviour.
 */
const TV_ITEM_BASE = 5075000; // MapleTV item IDs: 5075000-5075005

function mapleTvTypeByItemId(itemId: number): number {
  // % 10: 0=MAPLETV, 1=MAPLESOLETV, 2=MAPLELOVETV, 3=MEGATV, 4=MEGASOLETV, 5=MEGALOVETV
  const sub = itemId % 10;
  if (sub === 1 || sub === 4) return 1; // SOLE
  if (sub === 2 || sub === 5) return 2; // LOVE
  return 0; // MAPLETV / MEGA
}

function isMegaTv(itemId: number): boolean {
  const sub = itemId % 10;
  return sub === 3 || sub === 4 || sub === 5;
}

export class MapleTvHandler {
  static handleMapleTvSendMessageRequest(user: User, r: PacketReader): void {
    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    const itemId = r.readInt();
    const type = mapleTvTypeByItemId(itemId);
    const isMega = isMegaTv(itemId);
    // flag: type 0 reads from packet, type 1 -> 1, type 2 -> 3
    const flag = type === 0 ? r.readByte() : (type === 1 ? 1 : 3);
    if (isMega) {
      r.readBoolean(); // whisperIcon (world speaker request not ported - single-process)
    }

    // Resolve receiver if the LOVE flag bit is set
    let receiverName: string | null = null;
    let receiverLook: AvatarLook | null = null;
    if ((flag & 2) !== 0) {
      receiverName = r.readMapleAsciiString();
      const receiver = user.getField()?.getUserPool().getUserByCharacterName(receiverName);
      if (!receiver) {
        user.write(MapleTvPacket.useRes('Unable to find the character.'));
        return;
      }
      receiverLook = receiver.getAvatarLook();
    }

    const s1 = r.readMapleAsciiString();
    const s2 = r.readMapleAsciiString();
    const s3 = r.readMapleAsciiString();
    const s4 = r.readMapleAsciiString();
    const s5 = r.readMapleAsciiString();

    const field = user.getField() as Field | null;
    if (!field) {
      user.dispose();
      return;
    }

    // Check maple tv queue and compute expire time (port of kinoko CashItemHandler)
    const now = new Date();
    const duration = type === 0 ? 15 : (type === 1 ? 30 : 60);
    const queue = field.getMapleTvQueue();
    let expireTime: Date;
    if (queue.length === 0) {
      expireTime = new Date(now.getTime() + duration * 1000);
    } else {
      const lastExpire = queue[queue.length - 1].expireTime;
      if (lastExpire.getTime() > now.getTime() + 60 * 1000) {
        user.write(MapleTvPacket.useRes('The waiting line is longer than a minute. Please try using it at a later time.'));
        return;
      }
      expireTime = new Date(lastExpire.getTime() + duration * 1000);
    }

    // Consume the TV item
    const im = user.getInventoryManager();
    const inv = im.getInventoryByItemId(itemId);
    let consumed = false;
    for (const [pos, item] of inv.getItems()) {
      if (item.itemId === itemId) {
        const op = im.removeItemAt(pos, item, 1);
        if (op) {
          consumed = true;
          user.write(inventoryOperation(op, true));
        }
        break;
      }
    }
    if (!consumed) {
      user.dispose();
      return;
    }

    // Build and enqueue the message
    const message = new MapleTvMessage(
      flag,
      type,
      user.getAvatarLook(),
      user.getCharacterName(),
      receiverLook,
      receiverName,
      s1, s2, s3, s4, s5,
      expireTime,
    );

    const totalWaitTime = Math.max(Math.floor((expireTime.getTime() - now.getTime()) / 1000), 0);
    if (queue.length === 0) {
      field.broadcastPacket(MapleTvPacket.updateMessage(message, totalWaitTime));
    }
    queue.push(message);
  }
}
