import { Item } from './Item';
import { ItemType } from './ItemType';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { EquipBaseStat, EquipBaseStatKey } from '../../enums/EquipBaseStat';
import { ScrollStat } from '../../enums/ScrollStat';
import { BaseStat } from '../../enums/BaseStat';
import { EquipAttribute, getVal as getEquipAttributeVal } from '../../enums/EquipAttribute';
import { ItemOption } from '../../enums/ItemOption';
import { heneseItemGradeIsMatching } from './ItemGrade';
import { ItemData } from '../../provider/item/ItemData';
import { ItemConstants } from './ItemConstants';
import { ChatType } from '../../enums/ChatType';
import { ItemSkill } from './ItemSkill';

export class Equip extends Item {
  title = '';
  equippedDate: Date | null = null;
  prevBonusExpRate = 0;
  tuc = 0;
  cuc = 0;
  iStr = 0;
  iDex = 0;
  iInt = 0;
  iLuk = 0;
  iMaxHp = 0;
  iMaxMp = 0;
  iPad = 0;
  iMad = 0;
  iPDD = 0;
  iMDD = 0;
  iAcc = 0;
  iEva = 0;
  iCraft = 0;
  iSpeed = 0;
  iJump = 0;
  attribute = 0;
  levelUpType = 0;
  level = 0;
  exp = 0;
  durability = 0;
  iuc = 0;
  iPvpDamage = 0;
  iReduceReq = 0;
  specialAttribute = 0;
  durabilityMax = 0;
  iIncReq = 0;
  growthEnchant = 0;
  psEnchant = 0;
  imdr = 0;
  bossReward = 0;
  damR = 0;
  exGradeOption = 0;
  itemState = 0;
  chuc = 0;
  soulOptionId = 0;
  soulSocketId = 0;
  soulOption = 0;
  rStr = 0;
  rDex = 0;
  rInt = 0;
  rLuk = 0;
  rLevel = 0;
  rJob = 0;
  rPop = 0;
  options: number[] = [0, 0, 0];
  bonusOptions: number[] = [0, 0, 0];
  specialGrade = 0;
  tradeBlock = 0;
  only = false;
  notSale = false;
  attackSpeed = 0;
  price = 0;
  expireOnLogout = false;
  setItemID = 0;
  exItem = 0;
  equipTradeBlock = 0;
  iSlot = 0;
  vSlot = 0;
  fixedGrade = 0;
  dropStreak = 0;
  iucMax = 0;
  hasIUCMax = false;
  itemSkills: ItemSkill[] = [];
  sockets: number[] = [0, 0, 0];

  constructor() {
    super(ItemType.EQUIP);
  }

  deepCopy(): Equip {
    const eq = new Equip();
    eq.itemSn = this.itemSn;
    eq.itemId = this.itemId;
    eq.cash = this.cash;
    eq.quantity = this.quantity;
    eq.dateExpire = this.dateExpire;
    eq.title = this.title;
    eq.equippedDate = this.equippedDate;
    eq.prevBonusExpRate = this.prevBonusExpRate;
    eq.tuc = this.tuc;
    eq.cuc = this.cuc;
    eq.iStr = this.iStr;
    eq.iDex = this.iDex;
    eq.iInt = this.iInt;
    eq.iLuk = this.iLuk;
    eq.iMaxHp = this.iMaxHp;
    eq.iMaxMp = this.iMaxMp;
    eq.iPad = this.iPad;
    eq.iMad = this.iMad;
    eq.iPDD = this.iPDD;
    eq.iMDD = this.iMDD;
    eq.iAcc = this.iAcc;
    eq.iEva = this.iEva;
    eq.iCraft = this.iCraft;
    eq.iSpeed = this.iSpeed;
    eq.iJump = this.iJump;
    eq.attribute = this.attribute;
    eq.levelUpType = this.levelUpType;
    eq.level = this.level;
    eq.exp = this.exp;
    eq.durability = this.durability;
    eq.iuc = this.iuc;
    eq.iPvpDamage = this.iPvpDamage;
    eq.iReduceReq = this.iReduceReq;
    eq.specialAttribute = this.specialAttribute;
    eq.durabilityMax = this.durabilityMax;
    eq.iIncReq = this.iIncReq;
    eq.growthEnchant = this.growthEnchant;
    eq.psEnchant = this.psEnchant;
    eq.imdr = this.imdr;
    eq.bossReward = this.bossReward;
    eq.damR = this.damR;
    eq.exGradeOption = this.exGradeOption;
    eq.itemState = this.itemState;
    eq.chuc = this.chuc;
    eq.soulOptionId = this.soulOptionId;
    eq.soulSocketId = this.soulSocketId;
    eq.soulOption = this.soulOption;
    eq.rStr = this.rStr;
    eq.rDex = this.rDex;
    eq.rInt = this.rInt;
    eq.rLuk = this.rLuk;
    eq.rLevel = this.rLevel;
    eq.rJob = this.rJob;
    eq.rPop = this.rPop;
    eq.options = [...this.options];
    eq.bonusOptions = [...this.bonusOptions];
    eq.specialGrade = this.specialGrade;
    eq.tradeBlock = this.tradeBlock;
    eq.only = this.only;
    eq.notSale = this.notSale;
    eq.attackSpeed = this.attackSpeed;
    eq.price = this.price;
    eq.expireOnLogout = this.expireOnLogout;
    eq.setItemID = this.setItemID;
    eq.exItem = this.exItem;
    eq.equipTradeBlock = this.equipTradeBlock;
    eq.iSlot = this.iSlot;
    eq.vSlot = this.vSlot;
    eq.fixedGrade = this.fixedGrade;
    eq.dropStreak = this.dropStreak;
    eq.iucMax = this.iucMax;
    eq.hasIUCMax = this.hasIUCMax;
    eq.itemSkills = this.itemSkills.map(s => Object.assign(new ItemSkill(), s));
    eq.sockets = [...this.sockets];
    return eq;
  }

  getTitle(): string { return this.title; }
  setTitle(v: string): void { this.title = v; }
  getEquippedDate(): Date | null { return this.equippedDate; }
  setEquippedDate(v: Date | null): void { this.equippedDate = v; }
  getPrevBonusExpRate(): number { return this.prevBonusExpRate; }
  setPrevBonusExpRate(v: number): void { this.prevBonusExpRate = v; }
  getTuc(): number { return this.tuc; }
  setTuc(v: number): void { this.tuc = v; }
  getCuc(): number { return this.cuc; }
  setCuc(v: number): void { this.cuc = v; }
  getIStr(): number { return this.iStr; }
  setIStr(v: number): void { this.iStr = v; }
  getIDex(): number { return this.iDex; }
  setIDex(v: number): void { this.iDex = v; }
  getIInt(): number { return this.iInt; }
  setIInt(v: number): void { this.iInt = v; }
  getILuk(): number { return this.iLuk; }
  setILuk(v: number): void { this.iLuk = v; }
  getIMaxHp(): number { return this.iMaxHp; }
  setIMaxHp(v: number): void { this.iMaxHp = v; }
  getIMaxMp(): number { return this.iMaxMp; }
  setIMaxMp(v: number): void { this.iMaxMp = v; }
  getIPad(): number { return this.iPad; }
  setIPad(v: number): void { this.iPad = v; }
  getIMad(): number { return this.iMad; }
  setIMad(v: number): void { this.iMad = v; }
  getIPDD(): number { return this.iPDD; }
  setIPDD(v: number): void { this.iPDD = v; }
  getIMDD(): number { return this.iMDD; }
  setIMDD(v: number): void { this.iMDD = v; }
  getIAcc(): number { return this.iAcc; }
  setIAcc(v: number): void { this.iAcc = v; }
  getIEva(): number { return this.iEva; }
  setIEva(v: number): void { this.iEva = v; }
  getICraft(): number { return this.iCraft; }
  setICraft(v: number): void { this.iCraft = v; }
  getISpeed(): number { return this.iSpeed; }
  setISpeed(v: number): void { this.iSpeed = v; }
  getIJump(): number { return this.iJump; }
  setIJump(v: number): void { this.iJump = v; }
  getAttribute(): number { return this.attribute; }
  setAttribute(v: number): void { this.attribute = v; }
  getLevelUpType(): number { return this.levelUpType; }
  setLevelUpType(v: number): void { this.levelUpType = v; }
  getLevel(): number { return this.level; }
  setLevel(v: number): void { this.level = v; }
  getExp(): number { return this.exp; }
  setExp(v: number): void { this.exp = v; }
  getDurability(): number { return this.durability; }
  setDurability(v: number): void { this.durability = v; }
  getIuc(): number { return this.iuc; }
  setIuc(v: number): void { this.iuc = v; }
  getIPvpDamage(): number { return this.iPvpDamage; }
  setIPvpDamage(v: number): void { this.iPvpDamage = v; }
  getIReduceReq(): number { return this.iReduceReq; }
  setIReduceReq(v: number): void { this.iReduceReq = v; }
  getSpecialAttribute(): number { return this.specialAttribute; }
  setSpecialAttribute(v: number): void { this.specialAttribute = v; }
  getDurabilityMax(): number { return this.durabilityMax; }
  setDurabilityMax(v: number): void { this.durabilityMax = v; }
  getIIncReq(): number { return this.iIncReq; }
  setIIncReq(v: number): void { this.iIncReq = v; }
  getGrowthEnchant(): number { return this.growthEnchant; }
  setGrowthEnchant(v: number): void { this.growthEnchant = v; }
  getPsEnchant(): number { return this.psEnchant; }
  setPsEnchant(v: number): void { this.psEnchant = v; }
  getImdr(): number { return this.imdr; }
  setImdr(v: number): void { this.imdr = v; }
  getBossReward(): number { return this.bossReward; }
  setBossReward(v: number): void { this.bossReward = v; }
  getDamR(): number { return this.damR; }
  setDamR(v: number): void { this.damR = v; }
  getExGradeOption(): number { return this.exGradeOption; }
  setExGradeOption(v: number): void { this.exGradeOption = v; }
  getItemState(): number { return this.itemState; }
  setItemState(v: number): void { this.itemState = v; }
  getChuc(): number { return this.chuc; }
  setChuc(v: number): void { this.chuc = v; }
  getSoulOptionId(): number { return this.soulOptionId; }
  setSoulOptionId(v: number): void { this.soulOptionId = v; }
  getSoulSocketId(): number { return this.soulSocketId; }
  setSoulSocketId(v: number): void { this.soulSocketId = v; }
  getSoulOption(): number { return this.soulOption; }
  setSoulOption(v: number): void { this.soulOption = v; }
  getRStr(): number { return this.rStr; }
  setRStr(v: number): void { this.rStr = v; }
  getRDex(): number { return this.rDex; }
  setRDex(v: number): void { this.rDex = v; }
  getRInt(): number { return this.rInt; }
  setRInt(v: number): void { this.rInt = v; }
  getRLuk(): number { return this.rLuk; }
  setRLuk(v: number): void { this.rLuk = v; }
  getRLevel(): number { return this.rLevel; }
  setRLevel(v: number): void { this.rLevel = v; }
  getRJob(): number { return this.rJob; }
  setRJob(v: number): void { this.rJob = v; }
  getRPop(): number { return this.rPop; }
  setRPop(v: number): void { this.rPop = v; }
  getSpecialGrade(): number { return this.specialGrade; }
  setSpecialGrade(v: number): void { this.specialGrade = v; }
  getTradeBlock(): number { return this.tradeBlock; }
  setTradeBlock(v: number): void { this.tradeBlock = v; }
  isOnly(): boolean { return this.only; }
  setOnly(v: boolean): void { this.only = v; }
  isNotSale(): boolean { return this.notSale; }
  setNotSale(v: boolean): void { this.notSale = v; }
  getAttackSpeed(): number { return this.attackSpeed; }
  setAttackSpeed(v: number): void { this.attackSpeed = v; }
  getPrice(): number { return this.price; }
  setPrice(v: number): void { this.price = v; }
  isExpireOnLogout(): boolean { return this.expireOnLogout; }
  setExpireOnLogout(v: boolean): void { this.expireOnLogout = v; }
  getSetItemID(): number { return this.setItemID; }
  setSetItemID(v: number): void { this.setItemID = v; }
  getExItem(): number { return this.exItem; }
  setExItem(v: number): void { this.exItem = v; }
  getEquipTradeBlock(): number { return this.equipTradeBlock; }
  setEquipTradeBlock(v: number): void { this.equipTradeBlock = v; }
  getISlot(): number { return this.iSlot; }
  setISlot(v: number): void { this.iSlot = v; }
  getVSlot(): number { return this.vSlot; }
  setVSlot(v: number): void { this.vSlot = v; }
  getFixedGrade(): number { return this.fixedGrade; }
  setFixedGrade(v: number): void { this.fixedGrade = v; }
  getDropStreak(): number { return this.dropStreak; }
  setDropStreak(v: number): void { this.dropStreak = v; }
  getIucMax(): number { return this.iucMax; }
  setIucMax(v: number): void { this.iucMax = v; }
  isHasIUCMax(): boolean { return this.hasIUCMax; }
  setHasIUCMax(v: boolean): void { this.hasIUCMax = v; }

  private static readonly FT_ZERO_TIME = 94354848000000000n;

  encode(packet: PacketWriter): void {
    // GW_ItemSlotBase header — must match ItemDecoder.Decode() byte-for-byte.
    packet.writeByte(this.itemType);
    packet.writeInt(this.itemId);
    packet.writeBoolean(this.cash);
    if (this.cash) {
      packet.writeLong(this.itemSn);
    }
    packet.writeFT(this.dateExpire);

    // GW_ItemSlotEquip::RawEncode — the equip stat block.
    packet.writeByte(this.tuc);
    packet.writeByte(this.cuc);

    packet.writeShort(this.iStr);
    packet.writeShort(this.iDex);
    packet.writeShort(this.iInt);
    packet.writeShort(this.iLuk);
    packet.writeShort(this.iMaxHp);
    packet.writeShort(this.iMaxMp);
    packet.writeShort(this.iPad);
    packet.writeShort(this.iMad);
    packet.writeShort(this.iPDD);
    packet.writeShort(this.iMDD);
    packet.writeShort(this.iAcc);
    packet.writeShort(this.iEva);
    packet.writeShort(this.iCraft);
    packet.writeShort(this.iSpeed);
    packet.writeShort(this.iJump);

    packet.writeMapleAsciiString(this.title);
    packet.writeShort(this.attribute);
    packet.writeByte(this.levelUpType);
    packet.writeByte(this.level);
    packet.writeInt(this.exp);
    packet.writeInt(this.durability);

    packet.writeInt(this.iuc);
    packet.writeByte(this.itemState);
    packet.writeByte(this.chuc);

    packet.writeShort(this.options[0]);
    packet.writeShort(this.options[1]);
    packet.writeShort(this.options[2]);
    packet.writeShort(this.sockets[0]);
    packet.writeShort(this.sockets[1]);

    if (!this.cash) {
      packet.writeLong(this.itemSn);
    }

    packet.writeLong(Equip.FT_ZERO_TIME);
    packet.writeInt(0); // nPrevBonusExpRate
  }

  getSocketStat(stat: ScrollStat): number {
    return 0;
  }

  getTotalStat(stat: EquipBaseStatKey): number {
    switch (stat) {
      case 'tuc': return this.tuc;
      case 'cuc': return this.cuc;
      case 'iStr': return this.iStr;
      case 'iDex': return this.iDex;
      case 'iInt': return this.iInt;
      case 'iLuk': return this.iLuk;
      case 'iMaxHP': return this.iMaxHp;
      case 'iMaxMP': return this.iMaxMp;
      case 'iPAD': return this.iPad;
      case 'iMAD': return this.iMad;
      case 'iPDD': return this.iPDD;
      case 'iMDD': return this.iMDD;
      case 'iACC': return this.iAcc;
      case 'iEVA': return this.iEva;
      case 'iCraft': return this.iCraft;
      case 'iSpeed': return this.iSpeed;
      case 'iJump': return this.iJump;
      case 'attribute': return this.attribute;
      case 'levelUpType': return this.levelUpType;
      case 'level': return this.level;
      case 'exp': return this.exp;
      case 'durability': return this.durability;
      case 'iuc': return this.iuc;
      case 'iPvpDamage': return this.iPvpDamage;
      case 'iReduceReq': return this.iReduceReq;
      case 'specialAttribute': return this.specialAttribute;
      case 'durabilityMax': return this.durabilityMax;
      case 'iIncReq': return this.iIncReq;
      case 'growthEnchant': return this.growthEnchant;
      case 'psEnchant': return this.psEnchant;
      case 'imdr': return this.imdr;
      case 'damR': return this.damR;
      case 'exGradeOption': return this.exGradeOption;
      default: return 0;
    }
  }

  getBaseStat(stat: EquipBaseStatKey | BaseStat): number {
    if (typeof stat === 'string') {
      return this.getTotalStat(stat);
    }
    switch (stat) {
      case BaseStat.STR: return this.iStr;
      case BaseStat.DEX: return this.iDex;
      case BaseStat.INT: return this.iInt;
      case BaseStat.LUK: return this.iLuk;
      case BaseStat.PAD: return this.iPad;
      case BaseStat.MAD: return this.iMad;
      case BaseStat.PDD: return this.iPDD;
      case BaseStat.MDD: return this.iMDD;
      case BaseStat.ACC: return this.iAcc;
      case BaseStat.EVA: return this.iEva;
      case BaseStat.MHP: return this.iMaxHp;
      case BaseStat.MMP: return this.iMaxMp;
      case BaseStat.Speed: return this.iSpeed;
      case BaseStat.Jump: return this.iJump;
      default: return 0;
    }
  }

  setBaseStat(stat: EquipBaseStatKey, value: number): void {
    switch (stat) {
      case 'tuc': this.tuc = value; break;
      case 'cuc': this.cuc = value; break;
      case 'iStr': this.iStr = value; break;
      case 'iDex': this.iDex = value; break;
      case 'iInt': this.iInt = value; break;
      case 'iLuk': this.iLuk = value; break;
      case 'iMaxHP': this.iMaxHp = value; break;
      case 'iMaxMP': this.iMaxMp = value; break;
      case 'iPAD': this.iPad = value; break;
      case 'iMAD': this.iMad = value; break;
      case 'iPDD': this.iPDD = value; break;
      case 'iMDD': this.iMDD = value; break;
      case 'iACC': this.iAcc = value; break;
      case 'iEVA': this.iEva = value; break;
      case 'iCraft': this.iCraft = value; break;
      case 'iSpeed': this.iSpeed = value; break;
      case 'iJump': this.iJump = value; break;
      case 'attribute': this.attribute = value; break;
      case 'levelUpType': this.levelUpType = value; break;
      case 'level': this.level = value; break;
      case 'exp': this.exp = value; break;
      case 'durability': this.durability = value; break;
      case 'iuc': this.iuc = value; break;
      case 'iPvpDamage': this.iPvpDamage = value; break;
      case 'iReduceReq': this.iReduceReq = value; break;
      case 'specialAttribute': this.specialAttribute = value; break;
      case 'durabilityMax': this.durabilityMax = value; break;
      case 'iIncReq': this.iIncReq = value; break;
      case 'growthEnchant': this.growthEnchant = value; break;
      case 'psEnchant': this.psEnchant = value; break;
      case 'imdr': this.imdr = value; break;
      case 'damR': this.damR = value; break;
      case 'exGradeOption': this.exGradeOption = value; break;
    }
  }

  addStat(stat: EquipBaseStatKey, value: number): void {
    this.setBaseStat(stat, this.getBaseStat(stat) + value);
  }

  getOptionBase(idx: number): number {
    if (idx < 0 || idx >= this.options.length) return 0;
    return this.options[idx];
  }

  getOptionBonus(idx: number): number {
    if (idx < 0 || idx >= this.bonusOptions.length) return 0;
    return this.bonusOptions[idx];
  }

  getOption(idx: number): number {
    return this.getOptionBase(idx);
  }

  setOption(idx: number, value: number): void {
    if (idx >= 0 && idx < this.options.length) this.options[idx] = value;
  }

  setOptionBase(idx: number, value: number): void {
    this.setOption(idx, value);
  }

  setOptionBonus(idx: number, value: number): void {
    if (idx >= 0 && idx < this.bonusOptions.length) this.bonusOptions[idx] = value;
  }

  getAnvilId(): number {
    return this.itemId;
  }

  getRandomOption(): number {
    return 0;
  }

  getRequiredLevel(): number {
    return this.rLevel;
  }

  setHiddenOptionBase(idx: number, value: number): void {
    this.setOptionBase(idx, value);
  }

  setHiddenOptionBonus(idx: number, value: number): void {
    this.setOptionBonus(idx, value);
  }

  hasAttribute(attr: EquipAttribute): boolean {
    return (this.attribute & getEquipAttributeVal(attr)) !== 0;
  }

  addAttribute(attr: EquipAttribute): void {
    this.attribute |= getEquipAttributeVal(attr);
  }

  removeAttribute(attr: EquipAttribute): void {
    if (this.hasAttribute(attr)) {
      this.attribute ^= getEquipAttributeVal(attr);
    }
  }

  hasStat(stat: EquipBaseStatKey): boolean {
    return this.getBaseStat(stat) !== 0;
  }

  getStatMask(): number {
    let mask = 0;
    for (const [key, info] of Object.entries(EquipBaseStat)) {
      if (this.getBaseStat(key as EquipBaseStatKey) !== 0) {
        mask |= info.val;
      }
    }
    return mask;
  }

  hasUsedSlots(): boolean {
    return this.cuc > 0;
  }

  resetStats(): void {
    this.iStr = 0;
    this.iDex = 0;
    this.iInt = 0;
    this.iLuk = 0;
    this.iMaxHp = 0;
    this.iMaxMp = 0;
    this.iPad = 0;
    this.iMad = 0;
    this.iPDD = 0;
    this.iMDD = 0;
    this.iAcc = 0;
    this.iEva = 0;
    this.iCraft = 0;
    this.iSpeed = 0;
    this.iJump = 0;
    this.imdr = 0;
    this.damR = 0;
  }

  applyScroll(): void {
    // stub
  }

  addItemSkill(skill: ItemSkill): void {
    this.itemSkills.push(skill);
  }

  getItemSkills(): ItemSkill[] {
    return this.itemSkills;
  }

  getSocket(idx: number): number {
    if (idx < 0 || idx >= this.sockets.length) return 0;
    return this.sockets[idx];
  }

  setSocket(idx: number, value: number): void {
    if (idx >= 0 && idx < this.sockets.length) this.sockets[idx] = value;
  }

  isTradable(): boolean {
    return !this.hasAttribute(EquipAttribute.Untradable) && this.tradeBlock === 0 && !this.only;
  }

  hasMatchingGrade(grade: number): boolean {
    return heneseItemGradeIsMatching(this.itemState, grade);
  }

  getGrade(): number {
    return this.itemState;
  }

  getBaseGrade(): number {
    return this.itemState;
  }

  getBonusGrade(): number {
    return 0;
  }

  getPotentialBaseStat(stat: BaseStat): number {
    let total = 0;
    for (const optionId of this.options) {
      if (optionId === 0) continue;
      const option = ItemData.getItemOption(optionId);
      if (option) {
        total += option.getStatValuesByLevel(this.level).get(stat) ?? 0;
      }
    }
    return total;
  }
}
