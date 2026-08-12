import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { ShopItem } from './ShopItem';
import { ShopResultType } from './ShopResultType';
import { User } from '../../../world/user/User';
import { ItemConstants } from '../../../world/item/ItemConstants';
import { ItemProvider } from '../../../provider/ItemProvider';
import { Thief } from '../../../world/skill/job/Thief';
import { NightWalker } from '../../../world/skill/job/NightWalker';
import { Pirate } from '../../../world/skill/job/Pirate';
import { SkillStat } from '../../../provider/skill/SkillStat';

export function openShopDlg(user: User, npcTemplateId: number, items: ShopItem[]): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.OPEN_SHOP_DLG.code);
  w.writeInt(npcTemplateId);
  w.writeShort(items.length);
  for (const item of items) {
    w.writeInt(item.itemId);
    w.writeInt(item.price);
    w.writeByte(0); // nDiscountRate
    w.writeInt(item.tokenItemId);
    w.writeInt(item.tokenPrice);
    w.writeInt(0); // nItemPeriod
    w.writeInt(0); // nLevelLimited
    if (ItemConstants.isRechargeableItem(item.itemId)) {
      w.writeDouble(item.unitPrice);
      w.writeShort(item.maxPerSlot + getIncSlotMax(user, item.itemId));
    } else {
      w.writeShort(item.quantity);
      w.writeShort(item.maxPerSlot);
    }
  }
  return w.getPacket();
}

export function shopResult(resultType: ShopResultType, message?: string): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.SHOP_RESULT.code);
  w.writeByte(resultType);
  switch (resultType) {
    case ShopResultType.LimitLevelLess:
    case ShopResultType.LimitLevelMore:
      w.writeInt(0); // level
      break;
    case ShopResultType.ServerMsg:
      w.writeBoolean(!!message);
      if (message) {
        w.writeMapleAsciiString(message);
      }
      break;
  }
  return w.getPacket();
}

function getIncSlotMax(user: User, itemId: number): number {
  let skillId = 0;
  if (ItemConstants.isJavelinItem(itemId)) {
    if (user.getSkillLevel(Thief.CLAW_MASTERY) > 0) {
      skillId = Thief.CLAW_MASTERY;
    } else if (user.getSkillLevel(NightWalker.CLAW_MASTERY) > 0) {
      skillId = NightWalker.CLAW_MASTERY;
    }
  } else if (ItemConstants.isPelletItem(itemId)) {
    if (user.getSkillLevel(Pirate.GUN_MASTERY) > 0) {
      skillId = Pirate.GUN_MASTERY;
    }
  }
  return skillId > 0 ? user.getSkillStatValue(skillId, SkillStat.y) : 0;
}
