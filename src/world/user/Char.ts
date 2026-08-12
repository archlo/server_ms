import type { User } from '../user/User';
import type { ItemData } from '../../provider/item/ItemData';
import { Inventory } from '../item/Inventory';
import { TemporaryStatManager } from './stat/TemporaryStatManager';
import { DBChar } from '../../enums/DBChar';
import { BaseStat } from '../../enums/BaseStat';

export class Char {
  id: number = 0;
  accountId: number = 0;
  changingChannel: boolean = false;
  moveAction: number = 0;
  foothold: number = 0;
  characterStatId: number = 0;
  avatarLookId: number = 0;
  inCashShop: boolean = false;
  avatarLook: any = null;
  characterStat: any = null;
  talkingToNpc: boolean = false;
  combatOrders: boolean = false;
  client: any = null;
  maxFriends: number = 0;
  equippedInventory: Inventory;
  equipInventory: Inventory;
  consumeInventory: Inventory;
  etcInventory: Inventory;
  installInventory: Inventory;
  cashInventory: Inventory;
  skills: Set<any> = new Set();
  skillCoolTimes: Map<number, number> = new Map();
  field: any = null;
  temporaryStatManager: TemporaryStatManager;
  bulletIDForAttack: number = 0;
  completedSetItemID: number = 0;
  portableChairID: number = 0;
  activeEffectItemID: number = 0;
  position: [number, number] = [0, 0];
  tamingMobLevel: number = 0;
  tamingMobExp: number = 0;
  tamingMobFatigue: number = 0;
  miniRoom: any = null;
  ADBoardRemoteMsg: any = null;
  baseStats: Map<number, number> = new Map();
  nonAddBaseStats: Map<number, Set<number>> = new Map();
  calcDamage: any = null;

  constructor(id: number, cs: any, accountId: number, avatarLook: any) {
    this.id = id;
    this.characterStat = cs;
    this.accountId = accountId;
    this.avatarLook = avatarLook;
    this.equippedInventory = new Inventory(-1);
    this.equipInventory = new Inventory(96);
    this.consumeInventory = new Inventory(96);
    this.etcInventory = new Inventory(96);
    this.installInventory = new Inventory(96);
    this.cashInventory = new Inventory(96);
    this.temporaryStatManager = new TemporaryStatManager(this);
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }

  getAccountId(): number { return this.accountId; }
  setAccountId(accountId: number): void { this.accountId = accountId; }

  isChangingChannel(): boolean { return this.changingChannel; }
  setChangingChannel(changingChannel: boolean): void { this.changingChannel = changingChannel; }

  getMoveAction(): number { return this.moveAction; }
  setMoveAction(moveAction: number): void { this.moveAction = moveAction; }

  getFoothold(): number { return this.foothold; }
  setFoothold(foothold: number): void { this.foothold = foothold; }

  getCharacterStatId(): number { return this.characterStatId; }
  setCharacterStatId(characterStatId: number): void { this.characterStatId = characterStatId; }

  getAvatarLookId(): number { return this.avatarLookId; }
  setAvatarLookId(avatarLookId: number): void { this.avatarLookId = avatarLookId; }

  isInCashShop(): boolean { return this.inCashShop; }
  setInCashShop(inCashShop: boolean): void { this.inCashShop = inCashShop; }

  getAvatarLook(): any { return this.avatarLook; }
  setAvatarLook(avatarLook: any): void { this.avatarLook = avatarLook; }

  getCharacterStat(): any { return this.characterStat; }
  setCharacterStat(characterStat: any): void { this.characterStat = characterStat; }

  isTalkingToNpc(): boolean { return this.talkingToNpc; }
  setTalkingToNpc(talkingToNpc: boolean): void { this.talkingToNpc = talkingToNpc; }

  hasCombatOrders(): boolean { return this.combatOrders; }
  setCombatOrders(combatOrders: boolean): void { this.combatOrders = combatOrders; }

  getClient(): any { return this.client; }
  setClient(client: any): void { this.client = client; }

  getMaxFriends(): number { return this.maxFriends; }
  setMaxFriends(maxFriends: number): void { this.maxFriends = maxFriends; }

  getEquippedInventory(): Inventory { return this.equippedInventory; }
  getEquipInventory(): Inventory { return this.equipInventory; }
  getConsumeInventory(): Inventory { return this.consumeInventory; }
  getEtcInventory(): Inventory { return this.etcInventory; }
  getInstallInventory(): Inventory { return this.installInventory; }
  getCashInventory(): Inventory { return this.cashInventory; }

  getSkills(): Set<any> { return this.skills; }
  setSkills(skills: Set<any>): void { this.skills = skills; }

  getSkillCoolTimes(): Map<number, number> { return this.skillCoolTimes; }
  setSkillCoolTimes(skillCoolTimes: Map<number, number>): void { this.skillCoolTimes = skillCoolTimes; }

  getField(): any { return this.field; }
  setField(field: any): void { this.field = field; }

  getTemporaryStatManager(): TemporaryStatManager { return this.temporaryStatManager; }

  getBulletIDForAttack(): number { return this.bulletIDForAttack; }
  setBulletIDForAttack(bulletIDForAttack: number): void { this.bulletIDForAttack = bulletIDForAttack; }

  getCompletedSetItemID(): number { return this.completedSetItemID; }
  setCompletedSetItemID(completedSetItemID: number): void { this.completedSetItemID = completedSetItemID; }

  getPortableChairID(): number { return this.portableChairID; }
  setPortableChairID(portableChairID: number): void { this.portableChairID = portableChairID; }

  getActiveEffectItemID(): number { return this.activeEffectItemID; }
  setActiveEffectItemID(activeEffectItemID: number): void { this.activeEffectItemID = activeEffectItemID; }

  getPosition(): [number, number] { return this.position; }
  setPosition(position: [number, number]): void { this.position = position; }

  getTamingMobLevel(): number { return this.tamingMobLevel; }
  setTamingMobLevel(tamingMobLevel: number): void { this.tamingMobLevel = tamingMobLevel; }

  getTamingMobExp(): number { return this.tamingMobExp; }
  setTamingMobExp(tamingMobExp: number): void { this.tamingMobExp = tamingMobExp; }

  getTamingMobFatigue(): number { return this.tamingMobFatigue; }
  setTamingMobFatigue(tamingMobFatigue: number): void { this.tamingMobFatigue = tamingMobFatigue; }

  getMiniRoom(): any { return this.miniRoom; }
  setMiniRoom(miniRoom: any): void { this.miniRoom = miniRoom; }

  getADBoardRemoteMsg(): any { return this.ADBoardRemoteMsg; }
  setADBoardRemoteMsg(ADBoardRemoteMsg: any): void { this.ADBoardRemoteMsg = ADBoardRemoteMsg; }

  getBaseStats(): Map<number, number> { return this.baseStats; }
  setBaseStats(baseStats: Map<number, number>): void { this.baseStats = baseStats; }

  getNonAddBaseStats(): Map<number, Set<number>> { return this.nonAddBaseStats; }
  setNonAddBaseStats(nonAddBaseStats: Map<number, Set<number>>): void { this.nonAddBaseStats = nonAddBaseStats; }

  getCalcDamage(): any { return this.calcDamage; }
  setCalcDamage(calcDamage: any): void { this.calcDamage = calcDamage; }

  logout(): void {
    if (this.field) {
      this.field.removeChar(this);
    }
    if (this.client && this.client.user) {
      this.client.user.currentChr = null;
    }
    if (this.client) {
      const channel = this.client.channel;
      if (channel) {
        channel.removeChar(this);
      }
      this.client.chr = null;
    }
  }

  encode(outPacket: any, dbChar: DBChar): void {
    if (dbChar & DBChar.Character) {
      this.characterStat.encode(outPacket);
    }
    if (dbChar & DBChar.Money) {
      outPacket.writeInt(this.characterStat ? this.characterStat.money || 0 : 0);
    }
    if (dbChar & DBChar.InventorySize) {
      outPacket.writeByte(this.equipInventory.getSize());
      outPacket.writeByte(this.consumeInventory.getSize());
      outPacket.writeByte(this.etcInventory.getSize());
      outPacket.writeByte(this.installInventory.getSize());
      outPacket.writeByte(this.cashInventory.getSize());
    }
    if (dbChar & DBChar.AdminShopCount) {
      outPacket.writeByte(0);
    }
    if (dbChar & DBChar.ItemSlotEquip) {
      this.encodeEquippedItems(outPacket);
    }
    if (dbChar & DBChar.ItemSlotConsume) {
      this.encodeInventoryItems(outPacket, this.consumeInventory);
    }
    if (dbChar & DBChar.ItemSlotInstall) {
      this.encodeInventoryItems(outPacket, this.installInventory);
    }
    if (dbChar & DBChar.ItemSlotEtc) {
      this.encodeInventoryItems(outPacket, this.etcInventory);
    }
    if (dbChar & DBChar.ItemSlotCash) {
      this.encodeInventoryItems(outPacket, this.cashInventory);
    }
    if (dbChar & DBChar.SkillRecord) {
      this.encodeSkills(outPacket);
    }
    if (dbChar & DBChar.SkillCooltime) {
      this.encodeSkillCooltimes(outPacket);
    }
    if (dbChar & DBChar.QuestRecord) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.QuestComplete) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.MinigameRecord) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.CoupleRecord) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.MapTransfer) {
      outPacket.writeByte(0);
    }
    if (dbChar & DBChar.NewYearCard) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.QuestRecordEx) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.WildHunterInfo) {
      outPacket.writeByte(0);
    }
    if (dbChar & DBChar.QuestCompleteOld) {
      outPacket.writeShort(0);
    }
    if (dbChar & DBChar.VisitorLog) {
      outPacket.writeByte(0);
    }
  }

  private encodeEquippedItems(outPacket: any): void {
    const items: [number, any][] = [];
    for (const [pos, item] of this.equippedInventory.getItems()) {
      items.push([pos, item]);
    }
    for (const [pos, item] of this.cashInventory.getItems()) {
      items.push([pos, item]);
    }
    for (const [pos, item] of this.equipInventory.getItems()) {
      items.push([pos, item]);
    }
    outPacket.writeShort(items.length);
    for (const [pos, item] of items) {
      outPacket.writeShort(pos);
      item.encode(outPacket);
    }
  }

  private encodeInventoryItems(outPacket: any, inventory: Inventory): void {
    const items = [...inventory.getItems().entries()];
    outPacket.writeShort(items.length);
    for (const [pos, item] of items) {
      outPacket.writeShort(pos);
      item.encode(outPacket);
    }
  }

  private encodeSkills(outPacket: any): void {
    outPacket.writeShort(this.skills.size);
    for (const skill of this.skills) {
      outPacket.writeInt(skill.skillId);
      outPacket.writeInt(skill.slv);
      outPacket.writeInt(skill.masterLevel || 0);
      outPacket.writeLong(BigInt(skill.expiration || 0));
    }
  }

  private encodeSkillCooltimes(outPacket: any): void {
    outPacket.writeShort(this.skillCoolTimes.size);
    for (const [skillId, cooltime] of this.skillCoolTimes) {
      outPacket.writeInt(skillId);
      outPacket.writeInt(cooltime);
    }
  }

  dispose(): void {
    this.setTalkingToNpc(false);
  }

  heal(amount: number, whilstDeath: boolean): void {
    if (!whilstDeath && this.characterStat.hp <= 0) return;
    this.characterStat.hp = Math.min(this.characterStat.hp + amount, this.characterStat.maxHp);
  }

  healMP(amount: number): void {
    this.characterStat.mp = Math.min(this.characterStat.mp + amount, this.characterStat.maxMp);
  }

  healHpMp(hp: number, mp: number, whilstDeath: boolean): void {
    this.heal(hp, whilstDeath);
    this.healMP(mp);
  }

  unequip(item: any): void {
    for (const [pos, equippedItem] of this.equippedInventory.getItems()) {
      if (equippedItem === item) {
        this.equippedInventory.removeItem(pos);
        const freeSlot = this.equipInventory.findFreeSlot();
        if (freeSlot !== null) {
          this.equipInventory.putItem(freeSlot, item);
        }
        break;
      }
    }
  }

  equip(item: any, position: number): boolean {
    return false;
  }

  addItemToInventory(type: any, item: any, hasCorrectBagIndex: boolean, excelReq: boolean): boolean {
    if (item.quantity <= 0) return false;
    let inventory: Inventory;
    switch (type) {
      case 1: inventory = this.equipInventory; break;
      case 2: inventory = this.consumeInventory; break;
      case 3: inventory = this.installInventory; break;
      case 4: inventory = this.etcInventory; break;
      case 5: inventory = this.cashInventory; break;
      default: return false;
    }
    if (!hasCorrectBagIndex) {
      const slot = inventory.findFreeSlot();
      if (slot === null) return false;
      inventory.putItem(slot, item);
    }
    return true;
  }

  calculateBulletIDForAttack(requiredAmount: number): number {
    for (const [pos, item] of this.consumeInventory.getItems()) {
      if (item.itemId >= 2000 && item.quantity >= requiredAmount) {
        this.bulletIDForAttack = item.itemId;
        return item.itemId;
      }
    }
    return 0;
  }

  getInventoryByType(type: any): Inventory {
    switch (type) {
      case 0: return this.equippedInventory;
      case 1: return this.equipInventory;
      case 2: return this.consumeInventory;
      case 3: return this.installInventory;
      case 4: return this.etcInventory;
      case 5: return this.cashInventory;
      default: return this.equipInventory;
    }
  }

  changeChannel(channelId: number): void {
    this.logout();
    this.setChangingChannel(true);
  }

  consumeItem(id: number, quantity: number): void {
  }

  consumeItemByItem(item: any, quantity: number): void {
  }

  chatMessage(chatType: any, message: string): void {
  }

  canHold(itemId: number): boolean {
    return true;
  }

  canHoldItem(itemId: number, quantity: number): boolean {
    return true;
  }

  warp(field: any, portal: any, characterData: any, saveReturnMap: boolean): void {
    if (this.field) {
      this.field.removeChar(this);
    }
    this.field = field;
    if (portal) {
      this.position = [portal.x, portal.y];
    }
    if (field) {
      field.addChar(this);
    }
  }

  getOrCreateFieldByCurrentInstanceType(fieldId: number): any {
    return null;
  }

  getEquippedItemByBodyPart(bodyPart: any): any {
    for (const [pos, item] of this.equippedInventory.getItems()) {
      if (pos === bodyPart) return item;
    }
    return null;
  }

  getSkill(skillId: number): any {
    for (const skill of this.skills) {
      if (skill.skillId === skillId) return skill;
    }
    return null;
  }

  addSkill(skill: any, updatePassives: boolean): void {
    this.skills.delete(skill);
    this.skills.add(skill);
    if (updatePassives) {
      this.addToBaseStatCache(skill);
    }
  }

  removeSkill(skillId: number): void {
    for (const skill of this.skills) {
      if (skill.skillId === skillId) {
        this.skills.delete(skill);
        this.removeFromBaseStatCache(skill);
        break;
      }
    }
  }

  addToBaseStatCache(skill: any): void {
  }

  removeFromBaseStatCache(skill: any): void {
  }

  addBaseStat(baseStat: BaseStat, value: number): void {
    if (this.nonAddBaseStats.has(baseStat)) return;
    const current = this.baseStats.get(baseStat) || 0;
    this.baseStats.set(baseStat, current + value);
  }

  removeBaseStat(baseStat: BaseStat, value: number): void {
    this.addBaseStat(baseStat, -value);
  }

  hasFriendshipItem(): boolean {
    return false;
  }
}
