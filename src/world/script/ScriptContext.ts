import { ScriptMessage } from './ScriptMessage';
import { ScriptMessageType, ScriptMessageParam } from './ScriptMessageType';
import { User, statChangedPacket, statChangedMapPacket } from '../user/User';
import { UserRemote } from '../user/UserRemote';
import { Field } from '../field/Field';
import { Stat } from '../user/stat/Stat';
import { GameConstants } from '../GameConstants';
import { ItemProvider } from '../../provider/ItemProvider';
import { ItemInfoType } from '../../provider/item/ItemInfoType';
import { inventoryOperation, inventoryGrow } from '../item/ItemPacket';
import { InventoryOperation } from '../item/InventoryOperation';
import { BodyPart } from '../item/BodyPart';
import { ItemVariationOption } from '../item/ItemVariationOption';
import { InventoryType } from '../item/InventoryType';
import { Drop } from '../field/drop/Drop';
import { DropOwnType } from '../field/drop/DropOwnType';
import { DropEnterType } from '../field/drop/DropEnterType';
import { Reward } from '../../provider/reward/Reward';
import { Util } from '../../util/Util';
import { MobProvider } from '../../provider/MobProvider';
import { Mob } from '../field/mob/Mob';
import { MobAppearType } from '../field/mob/MobAppearType';
import { NpcProvider } from '../../provider/NpcProvider';
import { Npc } from '../field/npc/Npc';
import { ReactorProvider } from '../../provider/ReactorProvider';
import { Reactor } from '../field/reactor/Reactor';
import { ReactorInfo } from '../../provider/map/ReactorInfo';
import { SkillProvider } from '../../provider/SkillProvider';
import { SkillRecord } from '../skill/SkillRecord';
import { UserLocal } from '../user/UserLocal';
import { Effect } from '../user/effect/Effect';
import { ReactorPacket } from '../field/reactor/ReactorPacket';
import { NpcPacket } from '../field/npc/NpcPacket';
import { MessagePacket } from '../user/MessagePacket';
import { EventType } from '../../server/event/EventType';
import { EventState } from '../../server/event/EventState';
import { InstanceManager } from '../field/instance/InstanceManager';
import { FieldEffectPacket } from '../field/FieldEffectPacket';
import { StatConstants } from '../user/stat/StatConstants';
import { JobConstants } from '../job/JobConstants';
import { CharacterTemporaryStat } from '../user/stat/CharacterTemporaryStat';
import { TemporaryStatOption } from '../user/stat/TemporaryStatOption';
import { partyStorage } from '../party/PartyStorage';
import { Party } from '../party/Party';
import { PartyInfo } from '../party/PartyInfo';
import { PartyPacket } from '../party/PartyPacket';

/**
 * Helper API for NPC scripts (port of the relevant parts of kinoko's
 * ScriptManager interface). A script is a generator function:
 *
 *   function* myScript(ctx: ScriptContext) {
 *     yield ctx.sayNext('Hello!');
 *     if (yield ctx.askYesNo('Do you want a quest?')) {
 *       yield ctx.sayOk('Great, here it is.');
 *     } else {
 *       yield ctx.sayOk('Maybe next time.');
 *     }
 *   }
 *
 * `yield` sends a ScriptMessage to the client and suspends until the player
 * answers; the resumed value is a `ScriptAnswer`-derived primitive (boolean
 * for yes/no, number for menu/number selections, string for text input).
 * ScriptDriver (in ScriptManager.ts) handles the yield<->ScriptAnswer
 * plumbing and action codes (-1/5 = termination, 0 = prev).
 */
export class ScriptContext {
  speakerId: number;
  messageParam: number = ScriptMessageParam.NONE;

  constructor(
    public readonly user: User,
    public readonly field: Field,
    speakerId: number,
  ) {
    this.speakerId = speakerId;
  }

  /** Port of ScriptManagerImpl::sayOk - no prev/next, ends dialog when dismissed. */
  sayOk(text: string): ScriptMessage {
    return ScriptMessage.say(this.speakerId, this.messageParam, text, false, false);
  }

  /** Port of ScriptManagerImpl::sayPrev. */
  sayPrev(text: string): ScriptMessage {
    return ScriptMessage.say(this.speakerId, this.messageParam, text, true, false);
  }

  /** Port of ScriptManagerImpl::sayNext. */
  sayNext(text: string): ScriptMessage {
    return ScriptMessage.say(this.speakerId, this.messageParam, text, false, true);
  }

  /** Port of ScriptManagerImpl::sayBoth. */
  sayBoth(text: string): ScriptMessage {
    return ScriptMessage.say(this.speakerId, this.messageParam, text, true, true);
  }

  /** Port of ScriptManagerImpl::sayImage. */
  sayImage(images: string[]): ScriptMessage {
    return ScriptMessage.sayImage(this.speakerId, this.messageParam, images);
  }

  /** Port of ScriptManagerImpl::askYesNo - resume value is boolean (true = yes). */
  askYesNo(text: string): ScriptMessage {
    return ScriptMessage.ask(this.speakerId, this.messageParam, ScriptMessageType.ASKYESNO, text);
  }

  /** Port of ScriptManagerImpl::askAccept - resume value is boolean (true = accept). */
  askAccept(text: string): ScriptMessage {
    return ScriptMessage.ask(this.speakerId, this.messageParam, ScriptMessageType.ASKACCEPT, text);
  }

  /**
   * Port of ScriptManagerImpl::askMenu - resume value is the selected option
   * key (number), or -1 if cancelled. `options` maps selection index -> label.
   */
  askMenu(text: string | null, options: Map<number, string>): ScriptMessage {
    const optionString = [...options.entries()]
      .map(([key, value]) => `#L${key}#${value}#l`)
      .join('\r\n');
    const fullText = text !== null ? `${text}\r\n${optionString}` : optionString;
    return ScriptMessage.ask(this.speakerId, this.messageParam, ScriptMessageType.ASKMENU, fullText);
  }

  /**
   * Port of ScriptManagerImpl::askSlideMenu - resume value is the selected option
   * key (number). `options` maps selection index -> label.
   */
  askSlideMenu(slideMenuType: number, options: Map<number, string>): ScriptMessage {
    const text = [...options.entries()]
      .sort(([a], [b]) => a - b)
      .map(([key, value]) => `#${key}#${value}`)
      .join('');
    return ScriptMessage.askSlideMenu(this.speakerId, this.messageParam, slideMenuType, text);
  }

  /** Port of ScriptManagerImpl::askNumber - resume value is the entered number. */
  askNumber(text: string, numberDefault: number, numberMin: number, numberMax: number): ScriptMessage {
    return ScriptMessage.askNumber(this.speakerId, this.messageParam, text, numberDefault, numberMin, numberMax);
  }

  /** Port of ScriptManagerImpl::askText - resume value is the entered string. */
  askText(text: string, textDefault: string, textLengthMin = 0, textLengthMax = 0): ScriptMessage {
    return ScriptMessage.askText(this.speakerId, this.messageParam, text, textDefault, textLengthMin, textLengthMax);
  }

  /** Port of ScriptManagerImpl::askBoxText - resume value is the entered string. */
  askBoxText(text: string, textDefault: string, textBoxColumns: number, textBoxLines: number): ScriptMessage {
    return ScriptMessage.askBoxText(this.speakerId, this.messageParam, text, textDefault, textBoxColumns, textBoxLines);
  }

  /** Port of ScriptManagerImpl::askAvatar - resume value is the selected option index. */
  askAvatar(text: string, options: number[]): ScriptMessage {
    return ScriptMessage.askAvatar(this.speakerId, this.messageParam, text, options);
  }

  // ---- USER / STAT METHODS --------------------------------------------

  getGender(): number { return this.user.getGender(); }
  getLevel(): number { return this.user.getLevel(); }
  getJob(): number { return this.user.getJob(); }

  /** Port of ScriptManagerImpl::addExp. */
  addExp(exp: number): void {
    this.user.addExp(exp);
  }

  /** Port of ScriptManagerImpl::addExpAll - grants exp to every user in the field. */
  addExpAll(exp: number): void {
    for (const member of this.field.getUserPool().getAll()) {
      member.addExp(exp);
    }
  }

  /**
   * Port of ScriptManagerImpl::setAvatar - sets skin/face/hair, broadcasts the
   * stat change and avatar update. Item-name validation (StringProvider) is
   * not ported; out-of-range values are logged and ignored.
   */
  setAvatar(look: number): void {
    const cs = this.user.getCharacterStat();
    if (look >= 0 && look <= GameConstants.SKIN_MAX) {
      cs.skin = look;
      this.user.write(statChangedPacket(Stat.SKIN, cs.skin));
    } else if (look >= GameConstants.FACE_MIN && look <= GameConstants.FACE_MAX) {
      cs.face = look;
      this.user.write(statChangedPacket(Stat.FACE, cs.face));
    } else if (look >= GameConstants.HAIR_MIN && look <= GameConstants.HAIR_MAX) {
      cs.hair = look;
      this.user.write(statChangedPacket(Stat.HAIR, cs.hair));
    } else {
      console.warn(`[ScriptContext] setAvatar: invalid look ID ${look}`);
      return;
    }
    this.field.broadcastPacket(UserRemote.avatarModified(this.user), this.user);
  }

  /**
   * Port of ScriptManagerImpl::setJob - handles all job advancements
   * (1st/2nd/3rd/4th) for Explorer branches, Cygnus, Aran, Evan, Resistance.
   * For 1st job, resets base stats to the job's starting values. For higher
   * job levels, preserves the existing stat distribution.
   * SP is granted according to the job branch rules.
   */
  setJob(jobId: number): void {
    const cs = this.user.getCharacterStat();
    const prevJob = cs.job;
    const prevJobLevel = JobConstants.getJobLevel(prevJob) || 1;
    const newJobLevel = JobConstants.getJobLevel(jobId) || 1;

    cs.job = jobId;
    const sumAp = StatConstants.getSumAp(cs.level, cs.job, cs.subJob);
    const jobCategory = JobConstants.getJobCategory(jobId);

    if (newJobLevel <= 1 || (prevJobLevel <= 1 && newJobLevel > 1)) {
      // 1st job advancement (or resets): set base stats
      switch (jobCategory) {
        case 1: // Warrior branch
          cs.baseStr = 35; cs.baseDex = 4; cs.baseInt = 4; cs.baseLuk = 4;
          cs.maxHp += Util.getRandom(200, 250);
          break;
        case 2: // Magician branch
          cs.baseStr = 4; cs.baseDex = 4; cs.baseInt = 20; cs.baseLuk = 4;
          cs.maxMp += Util.getRandom(100, 150);
          break;
        case 3: // Archer branch
        case 4: // Rogue branch
          cs.baseStr = 4; cs.baseDex = 25; cs.baseInt = 4; cs.baseLuk = 4;
          cs.maxHp += Util.getRandom(100, 150);
          cs.maxMp += Util.getRandom(25, 50);
          break;
        case 5: // Pirate branch
          cs.baseStr = 4; cs.baseDex = 20; cs.baseInt = 4; cs.baseLuk = 4;
          cs.maxHp += Util.getRandom(100, 150);
          cs.maxMp += Util.getRandom(25, 50);
          break;
        default: {
          // Cygnus (1000+), Aran (2000+), Evan (2001+), Resistance (3000+)
          if (JobConstants.isCygnusJob(jobId) || JobConstants.isBeginnerJob(jobId)) {
            cs.maxHp += Util.getRandom(100, 150);
            cs.maxMp += Util.getRandom(25, 50);
          } else if (JobConstants.isAranJob(jobId)) {
            cs.baseStr = 35; cs.baseDex = 4; cs.baseInt = 4; cs.baseLuk = 4;
            cs.maxHp += Util.getRandom(200, 250);
          } else if (JobConstants.isEvanJob(jobId)) {
            cs.baseStr = 4; cs.baseDex = 4; cs.baseInt = 20; cs.baseLuk = 4;
            cs.maxMp += Util.getRandom(100, 150);
          } else if (JobConstants.isResistanceJob(jobId)) {
            cs.maxHp += Util.getRandom(100, 150);
            cs.maxMp += Util.getRandom(25, 50);
          }
          break;
        }
      }
      cs.ap = sumAp - (cs.baseStr + cs.baseDex + cs.baseInt + cs.baseLuk);
    } else {
      // 2nd/3rd/4th job: preserve existing stats, add HP/MP bonus
      const hpBonus = this.getJobAdvanceHpBonus(jobId);
      const mpBonus = this.getJobAdvanceMpBonus(jobId);
      cs.maxHp += hpBonus;
      cs.maxMp += mpBonus;
    }

    // SP grant
    if (JobConstants.isExtendSpJob(jobId)) {
      const extendJobLevel = JobConstants.getExtendSpJobLevel(jobId, cs.level);
      cs.sp.setSp(extendJobLevel, 3);
    } else {
      const spPerLevel = 3;
      const spOffset = JobConstants.getJobCategory(jobId) === 2 ? 8 : 10;
      cs.sp.setNonExtendSp(Math.max(cs.level - spOffset, 0) * spPerLevel + 1);
    }

    const statMap = new Map<Stat, any>([
      [Stat.STR, cs.baseStr],
      [Stat.DEX, cs.baseDex],
      [Stat.INT, cs.baseInt],
      [Stat.LUK, cs.baseLuk],
      [Stat.MHP, cs.maxHp],
      [Stat.MMP, cs.maxMp],
      [Stat.AP, cs.ap],
      [Stat.SP, cs.sp.getNonExtendSp()],
      [Stat.JOB, cs.job],
    ]);
    this.user.write(statChangedMapPacket(statMap));
    this.field.broadcastPacket(UserRemote.effect(this.user, Effect.jobChanged()), this.user);
  }

  private getJobAdvanceHpBonus(jobId: number): number {
    const cat = JobConstants.getJobCategory(jobId);
    if (cat === 1) return Util.getRandom(300, 350);
    if (cat === 2) return Util.getRandom(10, 20);
    if (cat === 5) return Util.getRandom(200, 250);
    if (JobConstants.isAranJob(jobId)) return Util.getRandom(300, 350);
    return Util.getRandom(100, 150);
  }

  private getJobAdvanceMpBonus(jobId: number): number {
    const cat = JobConstants.getJobCategory(jobId);
    if (cat === 2) return Util.getRandom(200, 250);
    if (cat === 1) return Util.getRandom(50, 100);
    if (cat === 5) return Util.getRandom(50, 100);
    if (JobConstants.isEvanJob(jobId)) return Util.getRandom(200, 250);
    return Util.getRandom(25, 50);
  }

  // ---- INVENTORY METHODS ------------------------------------------------

  hasItem(itemId: number, quantity = 1): boolean {
    return this.user.getInventoryManager().hasItem(itemId, quantity);
  }

  getItemCount(itemId: number): number {
    return this.user.getInventoryManager().getItemCount(itemId);
  }

  /** Port of ScriptManagerImpl::removeEquipped. */
  removeEquipped(bodyPart: BodyPart): boolean {
    const equipped = this.user.getInventoryManager().equipped;
    const item = equipped.removeItem(bodyPart);
    if (!item) return false;
    this.user.write(inventoryOperation(InventoryOperation.delItem(InventoryType.EQUIP, -bodyPart), false));
    return true;
  }

  /** Port of ScriptManagerImpl::addInventorySlots. */
  addInventorySlots(inventoryType: InventoryType, addSlots: number): void {
    const inventory = this.user.getInventoryManager().getInventoryByType(inventoryType);
    inventory.setSize(Math.min(inventory.getSize() + addSlots, GameConstants.INVENTORY_SLOT_MAX));
    this.user.write(inventoryGrow(inventoryType, inventory.getSize()));
  }

  /** Port of ScriptManagerImpl::removeItem. */
  removeItem(itemId: number, quantity = 1): boolean {
    const ops = this.user.getInventoryManager().removeItemById(itemId, quantity);
    if (!ops) return false;
    this.user.write(inventoryOperation(ops, false));
    return true;
  }

  /** Port of ScriptManagerImpl::addItems (single item). */
  addItem(itemId: number, quantity = 1): boolean {
    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      console.warn(`[ScriptContext] addItem: could not resolve item ID ${itemId}`);
      return false;
    }
    const slotMax = itemInfo.getInfo(ItemInfoType.slotMax);
    if (!this.user.getInventoryManager().canAddItemsByIdQty([[itemId, quantity]])) {
      return false;
    }
    const item = itemInfo.createItem(this.user.getNextItemSn(), Math.min(quantity, slotMax || quantity));
    const ops = this.user.getInventoryManager().addItem(item);
    if (!ops) return false;
    this.user.write(inventoryOperation(ops, false));
    return true;
  }

  /** Port of ScriptManagerImpl::addItems - all items, or none, are added. */
  addItems(items: Array<[number, number]>): boolean {
    if (!this.user.getInventoryManager().canAddItemsByIdQty(items)) {
      return false;
    }
    for (const [itemId, quantity] of items) {
      const itemInfo = ItemProvider.getItemInfo(itemId);
      if (!itemInfo) {
        console.warn(`[ScriptContext] addItems: could not resolve item ID ${itemId}`);
        return false;
      }
      const slotMax = itemInfo.getInfo(ItemInfoType.slotMax);
      const item = itemInfo.createItem(this.user.getNextItemSn(), Math.min(quantity, slotMax || quantity));
      const ops = this.user.getInventoryManager().addItem(item);
      if (!ops) return false;
      this.user.write(inventoryOperation(ops, false));
    }
    return true;
  }

  /** Port of ScriptManagerImpl::addMoney. */
  addMoney(money: number): boolean {
    const im = this.user.getInventoryManager();
    if (!im.addMoney(money)) return false;
    this.user.write(statChangedPacket(Stat.MONEY, im.money));
    return true;
  }

  canAddMoney(money: number): boolean {
    return this.user.getInventoryManager().canAddMoney(money);
  }

  /** Port of ScriptManagerImpl::canAddItem. */
  canAddItem(itemId: number, quantity: number): boolean {
    return this.user.getInventoryManager().canAddItemsByIdQty([[itemId, quantity]]);
  }

  // ---- QUEST METHODS ------------------------------------------------------

  hasQuestStarted(questId: number): boolean {
    return this.user.getQuestManager().hasQuestStarted(questId);
  }

  hasQuestCompleted(questId: number): boolean {
    return this.user.getQuestManager().hasQuestCompleted(questId);
  }

  forceStartQuest(questId: number): void {
    this.user.getQuestManager().forceStartQuest(questId);
  }

  forceCompleteQuest(questId: number): void {
    this.user.getQuestManager().forceCompleteQuest(questId);
  }

  /** Port of ScriptManagerImpl::getQRValue. */
  getQRValue(questId: number): string {
    return this.user.getQuestManager().getQuestRecord(questId)?.value ?? '';
  }

  /** Port of ScriptManagerImpl::hasQRValue - checks `;`-separated value list. */
  hasQRValue(questId: number, value: string): boolean {
    return this.getQRValue(questId).split(';').includes(value);
  }

  setQRValue(questId: number, value: string): void {
    this.user.getQuestManager().setQuestInfoEx(questId, value);
  }

  /** Port of ScriptManagerImpl::addQRValue - appends to the `;`-separated value list. */
  addQRValue(questId: number, value: string): void {
    const existing = this.getQRValue(questId);
    this.setQRValue(questId, existing.length === 0 ? value : `${existing};${value}`);
  }

  // ---- SKILL METHODS --------------------------------------------------

  /** Port of ScriptManagerImpl::addSkill. */
  addSkill(skillId: number, skillLevel: number, masterLevel = 0): void {
    const skillInfo = SkillProvider.getSkillInfoById(skillId);
    if (!skillInfo) {
      console.warn(`[ScriptContext] addSkill: could not resolve skill ID ${skillId}`);
      return;
    }
    const sr = new SkillRecord(skillId);
    sr.setSkillLevel(Math.min(skillLevel, skillInfo.maxLevel));
    sr.masterLevel = masterLevel;
    this.user.getSkillManager().addSkill(sr);
  }

  removeSkill(skillId: number): void {
    this.user.getSkillManager().removeSkill(skillId);
  }

  /** Port of ScriptManagerImpl::addSp. */
  addSp(jobLevel: number, skillPoint: number): void {
    const cs = this.user.getCharacterStat();
    cs.sp.addSp(jobLevel, skillPoint);
    this.user.write(statChangedPacket(Stat.SP, cs.sp.getNonExtendSp()));
  }

  // ---- WARP METHODS -----------------------------------------------------

  /** Port of ScriptManagerImpl::warp(int) / warp(int, String). */
  warp(mapId: number | string, portalName?: string | number): void {
    const targetField = this.field.getFieldStorage()?.getFieldById(Number(mapId));
    if (!targetField) {
      console.warn(`[ScriptContext] warp: could not resolve field ID ${mapId}`);
      return;
    }
    let portal;
    if (portalName === undefined) {
      portal = targetField.getMapInfo().getRandomStartPoint();
    } else if (typeof portalName === 'number') {
      portal = targetField.getMapInfo().getPortalById(portalName);
    } else {
      portal = targetField.getPortalByName(portalName);
    }
    if (!portal) {
      console.warn(`[ScriptContext] warp: could not resolve portal '${portalName}' on field ${mapId}`);
      return;
    }
    this.user.warp(targetField, portal, false, false);
  }

  /**
   * Port of ScriptManagerImpl::partyWarp - warps the user (and party members,
   * once the party system is ported - see UserPool.getPartyMembers).
   */
  partyWarp(mapId: number, portalName: string): void {
    const targetField = this.field.getFieldStorage()?.getFieldById(mapId);
    if (!targetField) {
      console.warn(`[ScriptContext] partyWarp: could not resolve field ID ${mapId}`);
      return;
    }
    const portal = targetField.getPortalByName(portalName);
    if (!portal) {
      console.warn(`[ScriptContext] partyWarp: could not resolve portal '${portalName}' on field ${mapId}`);
      return;
    }
    this.user.warp(targetField, portal, false, false);
  }

  /** Port of ScriptManagerImpl::warpInstance - creates a temp field-clone instance and warps the user into it. */
  warpInstance(mapIds: number[], portalName: string, returnMap: number, timeLimit: number, variables?: Record<string, string>): void {
    const instance = InstanceManager.createInstance(mapIds, returnMap, timeLimit);
    if (!instance) {
      console.warn(`[ScriptContext] warpInstance: could not create instance for map IDs ${mapIds}`);
      return;
    }
    if (variables) {
      for (const [key, value] of Object.entries(variables)) instance.setVariable(key, value);
    }
    const targetField = instance.fieldStorage.getFieldById(mapIds[0]);
    if (!targetField) {
      console.warn(`[ScriptContext] warpInstance: could not resolve field ID ${mapIds[0]}`);
      return;
    }
    const portal = targetField.getPortalByName(portalName);
    if (!portal) {
      console.warn(`[ScriptContext] warpInstance: could not resolve portal '${portalName}' on field ${mapIds[0]}`);
      return;
    }
    instance.addUser(this.user);
    this.user.warp(targetField, portal, false, false);
  }

  /** Warps all online party members into an instance. Port of kinoko's partyWarpInstance. */
  partyWarpInstance(mapIds: number[], portalName: string, returnMap: number, timeLimit: number, variables?: Record<string, string>): void {
    const instance = InstanceManager.createInstance(mapIds, returnMap, timeLimit);
    if (!instance) {
      console.warn(`[ScriptContext] partyWarpInstance: could not create instance for map IDs ${mapIds}`);
      return;
    }
    if (variables) {
      for (const [key, value] of Object.entries(variables)) instance.setVariable(key, value);
    }
    const targetField = instance.fieldStorage.getFieldById(mapIds[0]);
    if (!targetField) {
      console.warn(`[ScriptContext] partyWarpInstance: could not resolve field ID ${mapIds[0]}`);
      return;
    }
    const portal = targetField.getPortalByName(portalName);
    if (!portal) {
      console.warn(`[ScriptContext] partyWarpInstance: could not resolve portal '${portalName}' on field ${mapIds[0]}`);
      return;
    }
    const members = this.field.getUserPool().getPartyMembers(this.user.getPartyId());
    if (members.length === 0) {
      instance.addUser(this.user);
    } else {
      for (const member of members) {
        instance.addUser(member);
      }
    }
    for (const member of (members.length > 0 ? members : [this.user])) {
      member.warp(targetField, portal, false, false);
    }
  }

  /** Port of ScriptManagerImpl::getAreaCheck. Returns a bitmask string indicating
   *  which area rectangles in the current field have party members inside them.
   *  Each character is '1' if at least one party member is within that area,
   *  or '0' otherwise. Used by KerningPQ stages 2/3. */
  getAreaCheck(): string {
    const areas = this.field.getMapInfo().areas;
    const partyMembers = this.field.getUserPool().getPartyMembers(this.user.getPartyId());
    const allUsers = partyMembers.length > 0 ? partyMembers : [this.user];
    let result = '';
    for (let i = 0; i < areas.length; i++) {
      let occupied = false;
      for (const user of allUsers) {
        if (areas[i].isInsideRect(user.getX(), user.getY())) {
          occupied = true;
          break;
        }
      }
      result += occupied ? '1' : '0';
    }
    return result;
  }

  /** Number of users in the current instance field. */
  getInstanceUserCount(): number {
    return this.field.getUserPool().getCount();
  }

  // ---- FIELD / SPAWN METHODS ---------------------------------------------

  /** Port of ScriptManagerImpl::spawnMob. */
  spawnMob(templateId: number, x: number, y: number, summonType: number = MobAppearType.REGEN, isLeft = false): void {
    const template = MobProvider.getMobTemplate(templateId);
    if (!template) {
      console.warn(`[ScriptContext] spawnMob: could not resolve mob template ID ${templateId}`);
      return;
    }
    const fh = this.field.getMapInfo().getFootholdBelow(x, y - GameConstants.REACTOR_SPAWN_HEIGHT)?.sn ?? 0;
    const mob = new Mob(template, null, x, y, fh);
    mob.setLeft(isLeft);
    mob.summonType = summonType;
    this.field.getMobPool().addMob(mob);
  }

  /** Port of ScriptManagerImpl::spawnNpc. */
  spawnNpc(templateId: number, x: number, y: number, isFlip = false, originalField = true): void {
    const template = NpcProvider.getNpcTemplate(templateId);
    if (!template) {
      console.warn(`[ScriptContext] spawnNpc: could not resolve npc template ID ${templateId}`);
      return;
    }
    const targetField = originalField ? this.field : (this.user.getField() ?? this.field);
    const fh = targetField.getMapInfo().getFootholdBelow(x, y - GameConstants.REACTOR_SPAWN_HEIGHT)?.sn ?? 0;
    const npc = new Npc(template, x, y, x + 50, y - 50, fh, isFlip);
    targetField.getNpcPool().addNpc(npc);
  }

  /** Port of ScriptManagerImpl::removeNpc. */
  removeNpc(templateId: number): void {
    const npc = this.field.getNpcPool().getNpcByTemplateId(templateId);
    if (!npc) {
      console.warn(`[ScriptContext] removeNpc: could not find npc with template ID ${templateId}`);
      return;
    }
    this.field.getNpcPool().removeNpc(npc);
  }

  /** Port of ScriptManagerImpl::spawnReactor. */
  spawnReactor(templateId: number, x: number, y: number, isFlip = false, reactorTime = 0, originalField = true): void {
    const template = ReactorProvider.getReactorTemplate(templateId);
    if (!template) {
      console.warn(`[ScriptContext] spawnReactor: could not resolve reactor template ID ${templateId}`);
      return;
    }
    const targetField = originalField ? this.field : (this.user.getField() ?? this.field);
    const reactorInfo = new ReactorInfo(templateId, '', x, y, isFlip, reactorTime);
    targetField.getReactorPool().addReactor(new Reactor(template, reactorInfo));
  }

  /** Port of ScriptManagerImpl::getInstanceVariable. */
  getInstanceVariable(key: string): string {
    const instance = this.field.getFieldStorage()?.instance;
    if (!instance) {
      console.warn(`[ScriptContext] getInstanceVariable: field ${this.getFieldId()} is not an instance`);
      return '';
    }
    return instance.getVariable(key) ?? '';
  }

  /** Port of ScriptManagerImpl::setInstanceVariable. */
  setInstanceVariable(key: string, value: string): void {
    const instance = this.field.getFieldStorage()?.instance;
    if (!instance) {
      console.warn(`[ScriptContext] setInstanceVariable: field ${this.getFieldId()} is not an instance`);
      return;
    }
    instance.setVariable(key, value);
  }

  /**
   * Port of ScriptManagerImpl::dropRewards - rolls each Reward's probability
   * and drops the result around the user's position.
   */
  dropRewards(rewards: Reward[]): void {
    const drops: Drop[] = [];
    for (const reward of rewards) {
      if (!Util.succeedDouble(reward.prob)) continue;
      if (reward.isMoney()) {
        const money = Util.getRandom(reward.min, reward.max);
        if (money <= 0) continue;
        drops.push(Drop.money(DropOwnType.USEROWN, this.user, money, this.user.getCharacterId()));
      } else {
        const itemInfo = ItemProvider.getItemInfo(reward.itemId);
        if (!itemInfo) continue;
        const quantity = Util.getRandom(reward.min, reward.max);
        const item = itemInfo.createItem(this.user.getNextItemSn(), quantity, ItemVariationOption.NORMAL);
        drops.push(Drop.item(DropOwnType.USEROWN, this.user, item, this.user.getCharacterId(), reward.questId));
      }
    }
    this.field.getDropPool().addDrops(drops, DropEnterType.CREATE, this.user.getX(), this.user.getY() - GameConstants.DROP_HEIGHT, 0, 200);
  }

  /** Port of ScriptManagerImpl::setReactorState. */
  setReactorState(templateId: number, newState: number): void {
    for (const reactor of this.field.getReactorPool().getAll()) {
      if (reactor.getTemplateId() === templateId) {
        reactor.setState(newState);
        this.field.broadcastPacket(ReactorPacket.reactorChangeState(reactor, 0, 0, 0));
      }
    }
  }

  /** Port of ScriptManagerImpl::setNpcAction. */
  setNpcAction(templateId: number, action: string): void {
    const npc = this.field.getNpcPool().getNpcByTemplateId(templateId);
    if (!npc) {
      console.warn(`[ScriptContext] setNpcAction: could not resolve npc with template ID ${templateId}`);
      return;
    }
    this.user.write(NpcPacket.npcSpecialAction(npc, action));
  }

  /** Port of ScriptManagerImpl::addItemWithExpiration. */
  addItemWithExpiration(itemId: number, expirationInSeconds: number): boolean {
    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      console.warn(`[ScriptContext] addItemWithExpiration: could not resolve item ID ${itemId}`);
      return false;
    }
    if (!this.user.getInventoryManager().canAddItemsByIdQty([[itemId, 1]])) {
      return false;
    }
    const item = itemInfo.createItem(this.user.getNextItemSn(), 1);
    item.dateExpire = new Date(Date.now() + expirationInSeconds * 1000);
    const ops = this.user.getInventoryManager().addItem(item);
    if (!ops) return false;
    this.user.write(inventoryOperation(ops, false));
    return true;
  }

  // ---- MISC METHODS -------------------------------------------------------

  getFieldId(): number { return this.field.getFieldId(); }

  /**
   * Returns the NPC's position/foothold/flip for mob-spawn or other positional
   * lookups. Port of kinoko's ScriptManagerImpl::getSource.
   */
  getSource(): { x: number; y: number; fh: number; flip: boolean } | null {
    const npc = this.field.getNpcPool().getNpcByTemplateId(this.speakerId);
    if (!npc) return null;
    return { x: npc.getX(), y: npc.getY(), fh: npc.getFoothold(), flip: npc.isLeft() };
  }

  /** Port of ScriptManagerImpl::message - sends a system message to the user. */
  message(text: string): void {
    this.user.write(MessagePacket.system(text));
  }

  /** Port of ScriptManagerImpl::broadcastMessage - system message to everyone in the field. */
  broadcastMessage(text: string): void {
    this.field.broadcastPacket(MessagePacket.system(text));
  }

  /** Port of ScriptManagerImpl::playPortalSE. */
  playPortalSE(): void {
    this.user.write(UserLocal.effect(Effect.playPortalSE()));
  }

  /** Port of ScriptManagerImpl::avatarOriented. */
  avatarOriented(effectPath: string): void {
    this.user.write(UserLocal.effect(Effect.avatarOriented(effectPath)));
  }

  /** Port of ScriptManagerImpl::squibEffect. */
  squibEffect(effectPath: string): void {
    this.user.write(UserLocal.effect(Effect.squibEffect(effectPath)));
  }

  /** Port of ScriptManagerImpl::reservedEffect. */
  reservedEffect(effectPath: string): void {
    this.user.write(UserLocal.effect(Effect.reservedEffect(effectPath)));
  }

  /** Port of ScriptManagerImpl::screenEffect. */
  screenEffect(effectPath: string): void {
    this.user.write(FieldEffectPacket.screen(effectPath));
  }

  /** Port of ScriptManagerImpl::soundEffect. */
  soundEffect(effectPath: string): void {
    this.user.write(FieldEffectPacket.sound(effectPath));
  }

  /** Port of ScriptManagerImpl::changeBGM - broadcasts BGM change to the field. */
  broadcastChangeBgm(bgmPath: string, fade = false): void {
    this.field.broadcastChangeBgm(bgmPath, fade);
  }

  /** Port of ScriptManagerImpl::balloonMsg. */
  balloonMsg(text: string, width: number, duration: number): void {
    this.user.write(UserLocal.balloonMsg(text, width, duration));
  }

  /** Port of ScriptManagerImpl::setDirectionMode. */
  setDirectionMode(set: boolean, delay: number): void {
    this.user.write(UserLocal.setDirectionMode(set, delay));
  }

  /** Port of UserLocal::hireTutor. */
  hireTutor(hire: boolean): void {
    this.user.write(UserLocal.hireTutor(hire));
  }

  /** Port of UserLocal::tutorMsg(int, int). */
  tutorMsg(index: number, duration: number): void {
    this.user.write(UserLocal.tutorMsgIndex(index, duration));
  }

  /** Port of UserLocal::tutorMsg(String, int, int). */
  tutorMsgText(message: string, width: number, duration: number): void {
    this.user.write(UserLocal.tutorMsgText(message, width, duration));
  }

  /** Port of UserLocal::openSkillGuide. */
  openSkillGuide(): void {
    this.user.write(UserLocal.openSkillGuide());
  }

  /** Port of ScriptManagerImpl::scriptProgressMessage. */
  scriptProgressMessage(text: string): void {
    this.user.write(MessagePacket.scriptProgressMessage(text));
  }

  /** Port of ScriptManagerImpl::setConsumeItemEffect. */
  setConsumeItemEffect(itemId: number): void {
    const itemInfo = ItemProvider.getItemInfo(itemId);
    if (!itemInfo) {
      console.warn(`[ScriptContext] setConsumeItemEffect: could not resolve item info for item ID ${itemId}`);
      return;
    }
    this.user.setConsumeItemEffect(itemInfo);
    this.user.write(MessagePacket.giveBuff(itemId));
  }

  /** Port of ScriptManagerImpl::resetConsumeItemEffect. */
  resetConsumeItemEffect(itemId: number): void {
    this.user.resetTemporaryStat((_cts, opt) => opt.rOption === -itemId);
  }

  /** Port of ScriptManagerImpl::getEquippedItemId - body part slot of the equipped inventory. */
  getEquippedItemId(bodyPart: number): number | undefined {
    return this.user.getInventoryManager().getInventoryByType(InventoryType.EQUIPPED).getItem(bodyPart)?.itemId;
  }

  /** Port of ScriptManagerImpl::getEventState - throws if the event type isn't registered. */
  getEventState(eventType: EventType): EventState {
    const state = getChannelServer().instance.eventManager.getEventState(eventType);
    if (state === undefined) {
      throw new Error(`Could not resolve event state for event type : ${eventType}`);
    }
    return state;
  }

  getSpeakerId(): number { return this.speakerId; }
  setSpeakerId(speakerId: number): void { this.speakerId = speakerId; }

  /** Returns the user running this script. */
  getUser(): User { return this.user; }

  // ---- PORTED SWORDIE sm.* COMPATIBILITY METHODS ---------------------------

  /** Port of swordie ScriptManager::getMesos. */
  getMesos(): number { return this.user.getInventoryManager().money; }

  /** Port of swordie ScriptManager::giveMesos. */
  giveMesos(meso: number): boolean { return this.addMoney(meso); }

  /** Port of swordie ScriptManager::deductMesos. */
  deductMesos(meso: number): boolean { return this.addMoney(-meso); }

  /** Port of swordie ScriptManager::getFieldID. */
  getFieldID(): number { return this.field.getFieldId(); }

  /** Port of swordie ScriptManager::getQuantityOfItem. */
  getQuantityOfItem(itemId: number): number { return this.getItemCount(itemId); }

  /** Port of swordie ScriptManager::chatScript (system message). */
  chatScript(text: string): void { this.message(text); }

  /** Port of swordie ScriptManager::chat. */
  chat(text: string): void { this.message(text); }

  /** Port of swordie ScriptManager::chatBlue. */
  chatBlue(text: string): void { this.message(text); }

  /** Port of swordie ScriptManager::deleteQuest. */
  deleteQuest(questId: number): void {
    this.user.getQuestManager().removeQuestRecord(questId);
  }

  /** Port of swordie ScriptManager::teleportToPortal. */
  teleportToPortal(portalName: string | number): void {
    const portal = typeof portalName === 'number'
      ? this.field.getMapInfo().getPortalById(portalName)
      : this.field.getPortalByName(portalName);
    if (!portal) {
      console.warn(`[ScriptContext] teleportToPortal: could not resolve portal '${portalName}' on field ${this.getFieldId()}`);
      return;
    }
    this.user.warp(this.field, portal, false, false);
  }

  /** Port of swordie ScriptManager::setInstanceTime - updates the instance clock/expiry. */
  setInstanceTime(seconds: number): void {
    const fieldStorage = this.field.getFieldStorage();
    const instance = fieldStorage?.instance;
    if (instance) {
      instance.extendTime(seconds);
    }
    this.field.broadcastClock(seconds);
  }

  /** Port of swordie ScriptManager::warpInstanceIn - creates an instance for the map and warps into it. */
  warpInstanceIn(mapId: number, returnMap: number = this.field.getReturnMap(), timeLimit = 0): void {
    this.warpInstance([mapId], 'sp', returnMap, timeLimit);
  }

  /** Port of swordie ScriptManager::warpInstanceOut - warps back out to the given map. */
  warpInstanceOut(mapId: number): void {
    this.warp(mapId);
  }

  /** Port of swordie ScriptManager::isPartyLeader. */
  isPartyLeader(): boolean { return this.user.isPartyBoss(); }

  /** Port of swordie ScriptManager::getPartySize. */
  getPartySize(): number {
    const party = partyStorage.getPartyById(this.user.getPartyId());
    return party ? party.partyMembers.length : 0;
  }

  /** Port of swordie ScriptManager::getParty - returns the party object or null. */
  getParty(): Party | null {
    return partyStorage.getPartyById(this.user.getPartyId()) ?? null;
  }

  /** Port of swordie ScriptManager::createSoloParty - creates a party containing just this user. */
  createSoloParty(): void {
    if (this.user.hasParty()) return;
    const partyId = getChannelServer().instance.nextPartyId();
    const party = new Party(partyId, {
      characterId: this.user.getCharacterId(),
      characterName: this.user.getCharacterName(),
      job: this.user.getJob(),
      level: this.user.getLevel(),
      channelId: 0,
      fieldId: this.getFieldId(),
      townPortal: { fieldId: 0, portalId: 0, hp: 0 },
    });
    partyStorage.addParty(party);
    this.user.setPartyInfo(new PartyInfo(party.partyId, 1, true));
    this.user.write(PartyPacket.createNewPartyDone(party));
  }

  /** Port of swordie ScriptManager::checkParty - true if the user is in a party with at least 1 member. */
  checkParty(_cooldown = 0, _level = 0): boolean {
    return this.getParty() !== null;
  }

  /** Port of swordie ScriptManager::getEmptyInventorySlots. */
  getEmptyInventorySlots(inventoryType: InventoryType): number {
    return this.user.getInventoryManager().getInventoryByType(inventoryType).getRemaining();
  }

  /** Port of swordie ScriptManager::getnOptionByCTS. */
  getnOptionByCTS(cts: CharacterTemporaryStat): number {
    return this.user.getSecondaryStat().getOption(cts).nOption;
  }

  /** Port of swordie ScriptManager::removeBuff. */
  removeBuff(cts: CharacterTemporaryStat): void {
    this.user.resetTemporaryStat((stat) => stat === cts);
  }

  /** Port of swordie ScriptManager::giveSkill - grants the skill at its max level. */
  giveSkill(skillId: number): void {
    const skillInfo = SkillProvider.getSkillInfoById(skillId);
    if (!skillInfo) {
      console.warn(`[ScriptContext] giveSkill: could not resolve skill ID ${skillId}`);
      return;
    }
    const sr = new SkillRecord(skillId);
    sr.setSkillLevel(skillInfo.maxLevel);
    sr.masterLevel = skillInfo.maxLevel;
    this.user.getSkillManager().addSkill(sr);
  }

  /** Port of swordie ScriptManager::jobAdvance. */
  jobAdvance(jobId: number): void { this.setJob(jobId); }

  /** Port of swordie ScriptManager::setDeathCount - no death-count system in v95. */
  setDeathCount(_count: number): void { /* no-op */ }

  /** Port of swordie ScriptManager::setBossCooldown - no boss cooldown system in v95. */
  setBossCooldown(_cooldown: number): void { /* no-op */ }

  /** Port of swordie ScriptManager::killMobs - removes all mobs (optionally by template id) from the field. */
  killMobs(templateId = 0): void {
    const { MobLeaveType } = require('../field/mob/MobLeaveType');
    for (const mob of this.field.getMobPool().getAll()) {
      if (templateId === 0 || mob.getTemplateId() === templateId) {
        this.field.getMobPool().removeMob(mob, MobLeaveType.ETC);
      }
    }
  }

  /** Port of swordie ScriptManager::hasMobsInField. */
  hasMobsInField(): boolean { return !this.field.getMobPool().isEmpty(); }

  /** Port of swordie ScriptManager::setReturnField. */
  setReturnField(_mapId: number): void { /* no-op */ }

  /** Port of swordie ScriptManager::getReturnField. */
  getReturnField(): number { return this.field.getReturnMap(); }

  /** Port of swordie ScriptManager::openUI - no UI opening helper in v95. */
  openUI(_uiType: number): void { /* no-op */ }

  /** Port of swordie ScriptManager::useItem. */
  useItem(itemId: number): void {
    if (this.removeItem(itemId, 1)) {
      this.setConsumeItemEffect(itemId);
    }
  }

  /** Port of swordie ScriptManager::setSTR/setINT/setDEX/setLUK/setAP - job-advance stat resets. */
  setStat(stat: Stat, value: number): void {
    const cs = this.user.getCharacterStat();
    switch (stat) {
      case Stat.STR: cs.baseStr = value; break;
      case Stat.DEX: cs.baseDex = value; break;
      case Stat.INT: cs.baseInt = value; break;
      case Stat.LUK: cs.baseLuk = value; break;
      case Stat.AP: cs.ap = value; break;
      case Stat.MHP: cs.maxHp = value; break;
      case Stat.MMP: cs.maxMp = value; break;
      default: return;
    }
    this.user.write(statChangedMapPacket(new Map([[stat, value]])));
  }

  /** Port of swordie ScriptManager::formatInlineItem - returns the #i...# text. */
  formatInlineItem(itemId: number): string { return `#i${itemId}#`; }

  /** Port of swordie ScriptManager::formatItem - returns the #z...# text. */
  formatItem(itemId: number): string { return `#z${itemId}#`; }

  /** Port of swordie ScriptManager::join - joins an array of strings. */
  join(parts: string[]): string { return parts.join(''); }

  /** Port of swordie ScriptManager::formatString - formats a Python-style dict template. */
  formatString(template: string, args: Record<string, number | string>): string {
    return template.replace(/\{(\w+)\}/g, (_m, key: string) => String(args[key] ?? ''));
  }

  /** Port of swordie ScriptManager::selectionString - builds a `#L`-style menu string from a list. */
  selectionString(template: string, items: Array<Record<string, any>>): string {
    let out = '';
    for (let i = 0; i < items.length; i++) {
      let line = template;
      line = line.replace(/\{i\}/g, String(i));
      for (const [key, value] of Object.entries(items[i])) {
        line = line.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      }
      out += line + '\r\n';
    }
    return out;
  }

  /** Port of swordie ScriptManager::getChr. */
  getChr(): User { return this.user; }

  /** Port of swordie ScriptManager::setParam. */
  setParam(param: number): void { this.messageParam = param | 0; }

  /** Port of swordie ScriptManager::setPreviousFieldID. */
  setPreviousFieldID(_mapId: number): void { /* no-op */ }

  /** Port of swordie ScriptManager::getPreviousFieldID. */
  getPreviousFieldID(): number { return this.field.getReturnMap(); }

  /** Port of swordie ScriptManager::warpPartyIn. */
  warpPartyIn(mapId: number): void {
    const targetField = this.field.getFieldStorage()?.getFieldById(mapId);
    if (!targetField) {
      console.warn(`[ScriptContext] warpPartyIn: could not resolve field ID ${mapId}`);
      return;
    }
    const portal = targetField.getMapInfo().getRandomStartPoint();
    if (!portal) return;
    const members = this.field.getUserPool().getPartyMembers(this.user.getPartyId());
    const targets = members.length > 0 ? members : [this.user];
    for (const member of targets) {
      member.warp(targetField, portal, false, false);
    }
  }

  setNotCancellable(enabled: boolean): void { this.toggleParam(ScriptMessageParam.NOT_CANCELLABLE, enabled); }
  setPlayerAsSpeaker(enabled: boolean): void { this.toggleParam(ScriptMessageParam.PLAYER_AS_SPEAKER, enabled); }
  setSpeakerOnRight(enabled: boolean): void { this.toggleParam(ScriptMessageParam.SPEAKER_ON_RIGHT, enabled); }
  setFlipSpeaker(enabled: boolean): void { this.toggleParam(ScriptMessageParam.FLIP_SPEAKER, enabled); }

  /** Port of ScriptManagerImpl::toggleParam. */
  private toggleParam(param: number, enabled: boolean): void {
    if (enabled) {
      this.messageParam |= param;
    } else if ((this.messageParam & param) !== 0) {
      this.messageParam ^= param;
    }
  }
}

/**
 * A script is a generator: yields ScriptMessages, receives the player's
 * answer (typed per message kind - see ScriptContext docs above) as the
 * `yield` expression's value.
 */
export type NpcScript = (ctx: ScriptContext) => Generator<ScriptMessage, void, any>;

function getChannelServer(): typeof import('../../server/channel/channelServer').ChannelServer {
  return require('../../server/channel/channelServer').ChannelServer;
}
