import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { ItemProvider } from '../../provider/ItemProvider';
import { FieldOption } from '../../provider/map/FieldOption';
import { ItemConstants } from './ItemConstants';
import { InventoryOperation } from './InventoryOperation';
import { InventoryType, inventoryTypeByItemId } from './InventoryType';
import { inventoryOperation } from './ItemPacket';
import { MobProvider } from '../../provider/MobProvider';
import { Mob } from '../field/mob/Mob';
import { Util } from '../../util/Util';
import { ItemSpecType } from '../../provider/item/ItemSpecType';
import { ItemInfoType } from '../../provider/item/ItemInfoType';
import { GameConstants } from '../GameConstants';
import { PetPacket } from '../user/PetPacket';
import { Effect } from '../user/effect/Effect';
import { UserLocal } from '../user/UserLocal';
import { UserRemote } from '../user/UserRemote';
import { SkillRecord } from '../skill/SkillRecord';
import { SkillProvider } from '../../provider/SkillProvider';
import { SkillConstants } from '../skill/SkillConstants';
import { JobConstants } from '../job/JobConstants';
import { skillLearnItemResult, changeSkillRecordResultPacket } from './ItemPacket';
import { ItemRewardInfo } from '../../provider/item/ItemRewardInfo';
import { MessagePacket } from '../user/MessagePacket';
import { ScriptManager } from '../script/ScriptManager';

/**
 * Port of kinoko's ItemHandler (#16). Scope: stat-change items (potions/scrolls
 * that call User::setConsumeItemEffect) and mob summon items - the handlers
 * reachable with currently-ported infra. See PORT_GAPS.md "ItemHandler (#16)
 * scope notes" for what's cut and why.
 */
export class ItemHandler {
  /** Port of kinoko's ItemHandler::handleUserStatChangeItemUseRequest. */
  static handleUserStatChangeItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort(); // nPOS
    const itemId = r.readInt(); // nItemID

    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }

    const field = user.getField();
    const mapInfo = field?.getMapInfo();
    if (mapInfo?.hasFieldOption(FieldOption.STATCHANGEITEMCONSUMELIMIT) && !mapInfo.allowedItems.includes(itemId)) {
      user.dispose();
      return;
    }

    const op = ItemHandler.consumeItem(user, position, itemId);
    if (!op) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(op, true));

    user.setConsumeItemEffect(itemInfo);
  }

  /** Port of kinoko's ItemHandler::handleUserStatChangeItemCancelRequest. */
  static handleUserStatChangeItemCancelRequest(user: User, r: PacketReader): void {
    const itemId = r.readInt(); // sign inverted (matches the rOption set by setConsumeItemEffect)
    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }
    user.resetTemporaryStat((_cts, opt) => opt.rOption === itemId);
  }

  /** Port of kinoko's ItemHandler::handleUserStatChangeByPortableChairRequest (no-op). */
  static handleUserStatChangeByPortableChairRequest(_user: User, _r: PacketReader): void {
    // Client notifying the server that the recovery amount from UserChangeStatRequest has changed
  }

  /**
   * Port of kinoko's ItemHandler::handleUserMobSummonItemUseRequest.
   * `Field::getFootholdBelow` not ported - spawns on the user's current
   * foothold instead (same simplification as elsewhere in the mob pool).
   */
  static handleUserMobSummonItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort(); // nPOS
    const itemId = r.readInt(); // nItemID

    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    if (!ItemConstants.isMobSummonItem(itemId)) {
      user.dispose();
      return;
    }

    const mobSummonInfo = ItemProvider.getMobSummonInfo(itemId);
    if (!mobSummonInfo || mobSummonInfo.entries.length === 0) {
      user.dispose();
      return;
    }

    const field = user.getField();
    const mapInfo = field?.getMapInfo();
    if (mapInfo?.hasFieldOption(FieldOption.SUMMONLIMIT) && !mapInfo.allowedItems.includes(itemId)) {
      user.dispose();
      return;
    }

    const op = ItemHandler.consumeItem(user, position, itemId);
    if (!op) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(op, true));

    for (const entry of mobSummonInfo.entries) {
      if (!Util.succeedProp(entry.prob)) continue;
      const template = MobProvider.getMobTemplate(entry.mobId);
      if (!template) continue;
      const mob = new Mob(template, null, user.getX(), user.getY(), user.getFoothold());
      field?.getMobPool().addMob(mob);
    }
  }

  /** Port of kinoko's ItemHandler::handleUserPetFoodItemUseRequest. */
  static handleUserPetFoodItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

    if (user.getHp() <= 0 || !ItemConstants.isPetFoodItem(itemId)) {
      user.dispose();
      return;
    }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }
    const incFullness = itemInfo.getSpec(ItemSpecType.inc);

    let target = null as ReturnType<User['getPet']> | null;
    for (const pet of user.getPets()) {
      if (target === null || target.getFullness() > pet.getFullness()) {
        target = pet;
      }
    }
    if (!target) {
      user.dispose();
      return;
    }

    const petIndex = user.getPetIndex(target.getItemSn());
    if (petIndex === null) {
      user.dispose();
      return;
    }

    const petEntry = user.getInventoryManager().getItemBySn(InventoryType.CASH, target.getItemSn());
    if (!petEntry) {
      user.dispose();
      return;
    }
    const [petPosition, petItem] = petEntry;
    const petData = petItem.petData;
    if (!petData) {
      user.dispose();
      return;
    }

    const consumeOp = ItemHandler.consumeItem(user, position, itemId);
    if (!consumeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(consumeOp, false));

    const fullness = petData.fullness;
    const success = fullness < GameConstants.PET_FULLNESS_MAX;
    petData.fullness = Math.min(fullness + incFullness, GameConstants.PET_FULLNESS_MAX);

    let levelUp = false;
    if (fullness <= GameConstants.PET_FULLNESS_FOR_TAMENESS) {
      petData.tameness = Math.min(petData.tameness + 1, GameConstants.PET_TAMENESS_MAX);
      while (
        petData.level < GameConstants.PET_LEVEL_MAX &&
        petData.tameness > GameConstants.getNextLevelPetCloseness(petData.level)
      ) {
        petData.level += 1;
        levelUp = true;
      }
    } else if (fullness === GameConstants.PET_FULLNESS_MAX) {
      petData.tameness = Math.max(petData.tameness - 1, 0);
    }

    const updateOp = InventoryOperation.newItem(InventoryType.CASH, petPosition, petItem);
    user.write(inventoryOperation(updateOp, true));

    if (levelUp) {
      const effect = Effect.petLevelUp(petIndex);
      user.write(UserLocal.effect(effect));
      user.getField()?.broadcastPacket(UserRemote.effect(user, effect), user);
    }

    user.getField()?.broadcastPacket(PetPacket.petActionFeed(user, petIndex, success, target.getChatBalloon()));
  }

  /** Port of kinoko's ItemHandler::handleUserLotteryItemUseRequest. */
  static handleUserLotteryItemUseRequest(user: User, r: PacketReader): void {
    const position = r.readShort(); // nPOS
    const itemId = r.readInt(); // nItemID

    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    // Resolve reward info
    const itemRewardInfo = ItemProvider.getItemRewardInfo(itemId);
    if (!itemRewardInfo) {
      user.dispose();
      return;
    }

    // Check inventory space for all possible rewards
    const im = user.getInventoryManager();
    if (!itemRewardInfo.canAddReward(im)) {
      user.write(MessagePacket.system('You do not have enough inventory space.'));
      user.dispose();
      return;
    }

    // Resolve weighted random reward
    const rewardEntry = Util.getRandomFromCollection(itemRewardInfo.entries, (e) => e.probability);
    if (!rewardEntry) {
      user.dispose();
      return;
    }

    const rewardItemInfo = ItemProvider.getItemInfo(rewardEntry.itemId);
    if (!rewardItemInfo) {
      user.dispose();
      return;
    }

    // Consume lottery item
    const consumeOp = ItemHandler.consumeItem(user, position, itemId);
    if (!consumeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(consumeOp, false));

    // Create and add reward item
    const rewardItem = rewardItemInfo.createItem(user.getNextItemSn(), rewardEntry.count);
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

  /** Port of kinoko's ItemHandler::handleUserScriptItemUseRequest entry point. */
  static handleUserScriptItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

    if (user.getHp() <= 0 || !ItemConstants.isScriptRunItem(itemId)) {
      user.dispose();
      return;
    }

    const item = user.getInventoryManager().getInventoryByType(InventoryType.CONSUME).getItem(position);
    if (!item || item.itemId !== itemId) {
      user.dispose();
      return;
    }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }

    const field = user.getField();
    if (!field) {
      user.dispose();
      return;
    }

    const scriptName = itemInfo.getScript() || String(itemId);
    if (!ScriptManager.startItemScript(user, field, scriptName, itemId)) {
      user.dispose();
    }
  }

  /** Port of kinoko's ItemHandler::handlePetStatChangeItemUseRequest. */
  static handlePetStatChangeItemUseRequest(user: User, r: PacketReader): void {
    const petSn = r.readLong(); // nPetSn
    r.readBoolean(); // bBuffSkill
    r.readInt(); // update_time
    const position = r.readShort(); // nPOS
    const itemId = r.readInt(); // nItemID

    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    // Resolve pet
    if (user.getPetIndex(petSn) === null) {
      user.dispose();
      return;
    }

    // Resolve item
    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }

    // Check field limit
    const field = user.getField();
    if (field?.hasFieldOption(FieldOption.STATCHANGEITEMCONSUMELIMIT) && !field.getMapInfo().allowedItems.includes(itemId)) {
      user.dispose();
      return;
    }

    // Consume item
    const consumeOp = ItemHandler.consumeItem(user, position, itemId);
    if (!consumeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(consumeOp, true));

    // Apply stat change
    user.setConsumeItemEffect(itemInfo);
  }

  /** Port of kinoko's ItemHandler::handleUserPortalScrollUseRequest. */
  static handleUserPortalScrollUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort(); // nPOS
    const itemId = r.readInt(); // nItemID

    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    // Resolve item
    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }

    // Check portal scroll can be used
    const field = user.getField();
    if (!field || field.hasFieldOption(FieldOption.PORTALSCROLLLIMIT)) {
      user.write(MessagePacket.system("You can't use it here in this map."));
      user.dispose();
      return;
    }
    const moveTo = itemInfo.getSpec(ItemSpecType.moveTo);
    if (moveTo !== GameConstants.UNDEFINED_FIELD_ID && !field.isConnected(moveTo)) {
      user.write(MessagePacket.system('You cannot go to that place.'));
      user.dispose();
      return;
    }

    // Resolve target field
    const destinationFieldId = moveTo === GameConstants.UNDEFINED_FIELD_ID ? field.getReturnMap() : moveTo;
    const destinationField = field.getFieldStorage().getFieldById(destinationFieldId) as import('../field/Field').Field | null;
    if (!destinationField) {
      user.write(MessagePacket.system('You cannot go to that place.'));
      user.dispose();
      return;
    }
    const destinationPortal = destinationField.getRandomStartPoint();
    if (!destinationPortal) {
      user.write(MessagePacket.system('You cannot go to that place.'));
      user.dispose();
      return;
    }

    // Consume item
    const consumeOp = ItemHandler.consumeItem(user, position, itemId);
    if (!consumeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(consumeOp, true));

    // Move to field
    user.warp(destinationField, destinationPortal, false, false);
  }

  /** Port of kinoko's ItemHandler::handleUserSkillLearnItemUseRequest. */
  static handleUserSkillLearnItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

    if (user.getHp() <= 0) {
      user.dispose();
      return;
    }

    const isMasteryBook = ItemConstants.isMasteryBookItem(itemId);
    if (!ItemConstants.isSkillLearnItem(itemId)) {
      user.dispose();
      return;
    }

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      user.dispose();
      return;
    }

    const masterLevel = itemInfo.getInfo(ItemInfoType.masterLevel, 0);
    const reqSkillLevel = itemInfo.getInfo(ItemInfoType.reqSkillLevel, 0);
    const skills = itemInfo.getSkills();
    if (masterLevel <= 0 || skills.length === 0) {
      user.dispose();
      return;
    }

    const sm = user.getSkillManager();
    let targetSkillId = -1;
    for (const skillId of skills) {
      if (reqSkillLevel > 0) {
        const sr = sm.getSkill(skillId);
        if (sr && sr.getSkillLevel() >= reqSkillLevel && sr.getMasterLevel() < masterLevel) {
          targetSkillId = skillId;
          break;
        }
      } else {
        const skillRoot = SkillConstants.getSkillRoot(skillId);
        if (JobConstants.isCorrectJobForSkillRoot(user.getJob(), skillRoot) && !sm.getSkill(skillId)) {
          targetSkillId = skillId;
          break;
        }
      }
    }
    if (targetSkillId === -1) {
      user.write(skillLearnItemResult(user.getCharacterId(), isMasteryBook, false, false, true));
      return;
    }

    const skillInfo = SkillProvider.getSkillInfoById(targetSkillId);
    if (!skillInfo) {
      user.write(skillLearnItemResult(user.getCharacterId(), isMasteryBook, false, false, true));
      return;
    }

    const consumeOp = ItemHandler.consumeItem(user, position, itemId);
    if (!consumeOp) {
      user.dispose();
      return;
    }
    user.write(inventoryOperation(consumeOp, false));

    const success = Util.succeedProp(itemInfo.getInfo(ItemInfoType.success));
    if (success) {
      const sr = new SkillRecord(targetSkillId);
      sr.setSkillLevel(sm.getSkill(targetSkillId)?.getSkillLevel() ?? 0);
      sr.setMasterLevel(masterLevel);
      sm.addSkill(sr);
      user.write(changeSkillRecordResultPacket(sr, false));
    }
    user.write(skillLearnItemResult(user.getCharacterId(), isMasteryBook, true, success, true));
    user.getField()?.broadcastPacket(skillLearnItemResult(user.getCharacterId(), isMasteryBook, true, success, false), user);
  }

  // HELPER METHODS ------------------------------------------------------

  /**
   * Port of kinoko's ItemHandler::handleUserMapTransferItemUseRequest.
   * Consumes a map-transfer item (teleport rock / town scroll) and warps
   * the user to the item's destination map.
   */
  static handleUserMapTransferItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

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

  // ---- EXP UP ITEM ------------------------------------------------------

  static handleUserExpUpItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }

    if (!ItemConstants.isExpUpItem(itemId)) { user.dispose(); return; }

    const op = ItemHandler.consumeItem(user, position, itemId);
    if (!op) { user.dispose(); return; }
    user.write(inventoryOperation(op, true));

    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) return;
    const expValue = itemInfo.getSpec(ItemSpecType.exp) || itemInfo.getSpec(ItemSpecType.expinc);
    if (expValue <= 0) return;
    user.addExp(expValue);
  }

  // ---- TEMP EXP UP ITEM -------------------------------------------------

  static handleUserTempExpUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (!ItemConstants.isExpUpItem(itemId)) { user.dispose(); return; }

    const op = ItemHandler.consumeItem(user, position, itemId);
    if (!op) { user.dispose(); return; }
    user.write(inventoryOperation(op, true));
  }

  // ---- PAMS SONG --------------------------------------------------------

  static handleUserPamsSongUseRequest(user: User, r: PacketReader): void {
    r.readShort(); // position
    const itemId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (itemId !== 5210000) { user.dispose(); return; }

    const op = ItemHandler.consumeItem(user, 0, itemId);
    if (!op) { user.dispose(); return; }
    user.write(inventoryOperation(op, true));
    user.addExp(0);
  }

  // ---- TAMING MOB FOOD --------------------------------------------------

  static handleUserTamingMobFoodItemUseRequest(user: User, r: PacketReader): void {
    r.readInt(); // update_time
    const position = r.readShort();
    const itemId = r.readInt();
    const mountId = r.readInt();

    if (user.getHp() <= 0) { user.dispose(); return; }
    if (!ItemConstants.isTamingMobFoodItem(itemId)) { user.dispose(); return; }

    const im = user.getInventoryManager();
    const inv = im.getInventoryByType(inventoryTypeByItemId(itemId));
    const item = inv.getItem(position);
    if (!item || item.itemId !== itemId) { user.dispose(); return; }
    const op = im.removeItemAt(position, item, 1);
    if (!op) { user.dispose(); return; }
    user.write(inventoryOperation(op, true));
  }

  /** Port of kinoko's ItemHandler::consumeItem. */
  private static consumeItem(user: User, position: number, itemId: number): InventoryOperation | null {
    if (inventoryTypeByItemId(itemId) !== InventoryType.CONSUME) {
      return null;
    }
    const im = user.getInventoryManager();
    const item = im.getInventoryByType(InventoryType.CONSUME).getItem(position);
    if (!item || item.itemId !== itemId) {
      return null;
    }
    return im.removeItemAt(position, item, 1);
  }
}
