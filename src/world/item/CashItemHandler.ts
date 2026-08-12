import { PacketReader } from '../../protocol/packets/packetReader';
import { User, statChangedPacket } from '../user/User';
import { UserRemote } from '../user/UserRemote';
import { CashItemPacket } from './CashItemPacket';
import { CashItemType, cashItemTypeByItemId } from './CashItemType';
import { InventoryOperation } from './InventoryOperation';
import { InventoryType, inventoryTypeByItemId, inventoryTypeByPosition } from './InventoryType';
import { ItemType } from './ItemType';
import { ItemAttribute } from './ItemAttribute';
import { inventoryOperation } from './ItemPacket';
import { Stat } from '../user/stat/Stat';
import { ItemSpecType } from '../../provider/item/ItemSpecType';
import { ItemProvider } from '../../provider/ItemProvider';
import { Util } from '../../util/Util';
import { Effect } from '../user/effect/Effect';
import { UserLocal } from '../user/UserLocal';

export class CashItemHandler {
  static handleUserConsumeCashItemUseRequest(user: User, r: PacketReader): void {
    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    const position = r.readShort();
    const itemId = r.readInt();

    const cashType = cashItemTypeByItemId(itemId);
    if (cashType === null) {
      user.dispose();
      return;
    }

    const item = user.getInventoryManager().cashInventory.getItem(position);
    if (!item || item.itemId !== itemId) {
      user.dispose();
      return;
    }

    switch (cashType) {
      case CashItemType.WEATHER:
        handleWeather(user, r, position, itemId);
        break;
      case CashItemType.PET_NAME_CHANGE:
        handlePetNameChange(user, r, position, itemId);
        break;
      case CashItemType.COLOR_LENS:
        handleColorLens(user, r, position, itemId);
        break;
      case CashItemType.AP_RESET:
        handleApReset(user, position, itemId);
        break;
      case CashItemType.SP_RESET:
        handleSpReset(user, position, itemId);
        break;
      case CashItemType.EFFECT_ITEM:
        handleEffectItem(user, position, itemId);
        break;
      case CashItemType.KARMA_SCISSORS:
        handleKarmaScissors(user, r, position, itemId);
        break;
      case CashItemType.VICIOUS_HAMMER:
        handleViciousHammer(user, r, position, itemId);
        break;
      case CashItemType.REWARD_ITEM:
        handleRewardItem(user, position, itemId);
        break;
      case CashItemType.MAP_TELEPORT:
        handleMapTeleport(user, position, itemId);
        break;
      default:
        handleGeneric(user, position, itemId);
        break;
    }
  }
}

function consumeCashItem(user: User, position: number, itemId: number): InventoryOperation | null {
  const im = user.getInventoryManager();
  const item = im.cashInventory.getItem(position);
  if (!item || item.itemId !== itemId) {
    return null;
  }
  return im.removeItemAt(position, item, 1);
}

function handleWeather(user: User, r: PacketReader, position: number, itemId: number): void {
  // Port of kinoko CashItemHandler WEATHER case: read the message and
  // apply a 30-second weather effect on the field.
  const message = r.getRemainingPacket().length > 0
    ? `${user.getCharacterName()} : ${r.readMapleAsciiString()}`
    : user.getCharacterName();
  const op = consumeCashItem(user, position, itemId);
  if (!op) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(op, true));
  user.getField()?.blowWeather(itemId, message, 30);
}

function handlePetNameChange(user: User, r: PacketReader, position: number, itemId: number): void {
  const petName = r.readMapleAsciiString();
  if (petName.length < 4 || petName.length > 13) {
    user.dispose();
    return;
  }

  const petEntry = findFirstPet(user);
  if (!petEntry) {
    user.dispose();
    return;
  }
  const [petPosition, petItem] = petEntry;

  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, false));

  petItem.petData!.petName = petName;
  const updateOp = InventoryOperation.newItem(InventoryType.CASH, petPosition, petItem);
  user.write(inventoryOperation(updateOp, true));
}

function handleColorLens(user: User, r: PacketReader, position: number, itemId: number): void {
  const color = r.readInt();

  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, true));

  const cs = user.getCharacterStat();
  cs.face = color;
  user.write(statChangedPacket(Stat.FACE, cs.face));
  user.getField()?.broadcastPacket(UserRemote.avatarModified(user), user);
}

function handleApReset(user: User, position: number, itemId: number): void {
  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, true));

  const cs = user.getCharacterStat();
  cs.ap += 1;
  user.write(statChangedPacket(Stat.AP, cs.ap));
}

function handleSpReset(user: User, position: number, itemId: number): void {
  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, true));

  const cs = user.getCharacterStat();
  cs.sp.addNonExtendSp(1);
  user.write(statChangedPacket(Stat.SP, cs.sp.getNonExtendSp()));
}

function handleEffectItem(user: User, position: number, itemId: number): void {
  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, true));

  const field = user.getField();
  if (field) {
    field.broadcastPacket(CashItemPacket.setActiveEffectItem(user.getCharacterId(), itemId), user);
  }
}

function handleKarmaScissors(user: User, r: PacketReader, position: number, itemId: number): void {
  const equipPosition = r.readShort();
  const im = user.getInventoryManager();
  const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
  const equip = im.getInventoryByType(equipType).getItem(equipPosition);
  if (!equip || !equip.equipData) {
    user.dispose();
    return;
  }
  if (equip.hasAttribute(ItemAttribute.KARMA)) {
    user.dispose();
    return;
  }
  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, true));
  equip.addAttribute(ItemAttribute.KARMA);
  const updateOp = InventoryOperation.newItem(equipType, equipPosition, equip);
  user.write(inventoryOperation(updateOp, true));
}

function handleViciousHammer(user: User, r: PacketReader, position: number, itemId: number): void {
  const equipPosition = r.readShort();
  const im = user.getInventoryManager();
  const equipType = inventoryTypeByPosition(InventoryType.EQUIP, equipPosition);
  const equip = im.getInventoryByType(equipType).getItem(equipPosition);
  if (!equip || !equip.equipData) {
    user.dispose();
    return;
  }
  const eq = equip.equipData;
  if (eq.cuc + eq.iuc >= 10) {
    user.dispose();
    return;
  }
  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, true));
  eq.iuc += 1;
  eq.ruc += 1;
  const updateOp = InventoryOperation.newItem(equipType, equipPosition, equip);
  user.write(inventoryOperation(updateOp, true));
}

function handleMapTeleport(user: User, position: number, itemId: number): void {
  if (user.getHp() <= 0) { user.dispose(); return; }

  const itemInfo = ItemProvider.getItemInfo(itemId);
  if (!itemInfo) { user.dispose(); return; }

  const field = user.getField();
  if (!field) { user.dispose(); return; }

  const moveTo = itemInfo.getSpec(ItemSpecType.moveTo);
  if (moveTo <= 0) { user.dispose(); return; }

  const destinationField = field.getFieldStorage().getFieldById(moveTo);
  if (!destinationField) { user.dispose(); return; }

  const destinationPortal = destinationField.getRandomStartPoint();
  if (!destinationPortal) { user.dispose(); return; }

  const im = user.getInventoryManager();
  const invType = inventoryTypeByItemId(itemId);
  const item = im.getInventoryByType(invType).getItem(position);
  if (!item || item.itemId !== itemId) { user.dispose(); return; }

  const op = im.removeItemAt(position, item, 1);
  if (!op) { user.dispose(); return; }
  user.write(inventoryOperation(op, true));

  user.warp(destinationField, destinationPortal, false, false);
}

function handleRewardItem(user: User, position: number, itemId: number): void {
  const itemRewardInfo = ItemProvider.getItemRewardInfo(itemId);
  if (!itemRewardInfo) {
    user.dispose();
    return;
  }

  const im = user.getInventoryManager();
  if (!itemRewardInfo.canAddReward(im)) {
    user.dispose();
    return;
  }

  const rewardEntry = Util.getRandomFromCollection(itemRewardInfo.entries, (e) => e.probability);
  if (!rewardEntry) {
    user.dispose();
    return;
  }

  const rewardInfo = ItemProvider.getItemInfo(rewardEntry.itemId);
  if (!rewardInfo) {
    user.dispose();
    return;
  }

  const consumeOp = consumeCashItem(user, position, itemId);
  if (!consumeOp) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(consumeOp, false));

  const rewardItem = rewardInfo.createItem(user.getNextItemSn(), rewardEntry.count);
  if (rewardEntry.period > 0) {
    rewardItem.dateExpire = new Date(Date.now() + rewardEntry.period * 60000);
  }
  const addResult = im.addItem(rewardItem);
  if (!addResult) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(addResult, true));
  if (rewardEntry.hasEffect()) {
    user.write(UserLocal.effect(Effect.lotteryUse(itemId, rewardEntry.effect!)));
  }
}

function handleGeneric(user: User, position: number, itemId: number): void {
  const op = consumeCashItem(user, position, itemId);
  if (!op) {
    user.dispose();
    return;
  }
  user.write(inventoryOperation(op, true));
}

function findFirstPet(user: User): [number, import('../item/Item').Item] | null {
  for (const [pos, item] of user.getInventoryManager().cashInventory.getItems()) {
    if (item.itemType === ItemType.PET && item.petData) {
      return [pos, item];
    }
  }
  return null;
}
