import { Database } from '../../center/db/database';
import { ChannelServer } from '../channelServer';
import { CharacterData } from '../../../world/user/CharacterData';
import { CharacterStat } from '../../../world/user/stat/CharacterStat';
import { ExtendSp } from '../../../world/user/stat/ExtendSp';
import { InventoryManager } from '../../../world/item/InventoryManager';
import { Inventory } from '../../../world/item/Inventory';
import { Item } from '../../../world/item/Item';
import { ItemType, itemTypeByValue } from '../../../world/item/ItemType';
import { EquipData } from '../../../world/item/EquipData';
import { Equip } from '../../../world/item/Equip';
import { PetData } from '../../../world/item/PetData';
import { RingData } from '../../../world/item/RingData';
import { SkillManager } from '../../../world/skill/SkillManager';
import { SkillRecord } from '../../../world/skill/SkillRecord';
import { QuestManager } from '../../../world/quest/QuestManager';
import { QuestRecord } from '../../../world/quest/QuestRecord';
import { QuestState } from '../../../world/quest/QuestState';
import { FriendManager } from '../../../world/friend/FriendManager';
import { Friend } from '../../../world/friend/Friend';
import { GameConstants } from '../../../world/GameConstants';
import { JobConstants } from '../../../world/job/JobConstants';
import { CharacterRank } from '../../rank/CharacterRank';

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

function serializeEquipData(e: EquipData | null): object | null {
  if (!e) return null;
  const o: Record<string, number> = {};
  if (e.incStr)    o.incStr    = e.incStr;
  if (e.incDex)    o.incDex    = e.incDex;
  if (e.incInt)    o.incInt    = e.incInt;
  if (e.incLuk)    o.incLuk    = e.incLuk;
  if (e.incMaxHp)  o.incMaxHp  = e.incMaxHp;
  if (e.incMaxMp)  o.incMaxMp  = e.incMaxMp;
  if (e.incPad)    o.incPad    = e.incPad;
  if (e.incMad)    o.incMad    = e.incMad;
  if (e.incPdd)    o.incPdd    = e.incPdd;
  if (e.incMdd)    o.incMdd    = e.incMdd;
  if (e.incAcc)    o.incAcc    = e.incAcc;
  if (e.incEva)    o.incEva    = e.incEva;
  if (e.incCraft)  o.incCraft  = e.incCraft;
  if (e.incSpeed)  o.incSpeed  = e.incSpeed;
  if (e.incJump)   o.incJump   = e.incJump;
  if (e.ruc)       o.ruc       = e.ruc;
  if (e.cuc)       o.cuc       = e.cuc;
  if (e.iuc)       o.iuc       = e.iuc;
  if (e.chuc)      o.chuc      = e.chuc;
  if (e.grade)     o.grade     = e.grade;
  if (e.option1)   o.option1   = e.option1;
  if (e.option2)   o.option2   = e.option2;
  if (e.option3)   o.option3   = e.option3;
  if (e.socket1)   o.socket1   = e.socket1;
  if (e.socket2)   o.socket2   = e.socket2;
  if (e.levelUpType) o.levelUpType = e.levelUpType;
  if (e.level)     o.level     = e.level;
  if (e.exp)       o.exp       = e.exp;
  if (e.durability !== -1) o.durability = e.durability;
  return o;
}

function deserializeEquipData(o: any): EquipData | null {
  if (!o) return null;
  const e = new EquipData();
  e.incStr    = o.incStr    ?? 0;
  e.incDex    = o.incDex    ?? 0;
  e.incInt    = o.incInt    ?? 0;
  e.incLuk    = o.incLuk    ?? 0;
  e.incMaxHp  = o.incMaxHp  ?? 0;
  e.incMaxMp  = o.incMaxMp  ?? 0;
  e.incPad    = o.incPad    ?? 0;
  e.incMad    = o.incMad    ?? 0;
  e.incPdd    = o.incPdd    ?? 0;
  e.incMdd    = o.incMdd    ?? 0;
  e.incAcc    = o.incAcc    ?? 0;
  e.incEva    = o.incEva    ?? 0;
  e.incCraft  = o.incCraft  ?? 0;
  e.incSpeed  = o.incSpeed  ?? 0;
  e.incJump   = o.incJump   ?? 0;
  e.ruc       = o.ruc       ?? 0;
  e.cuc       = o.cuc       ?? 0;
  e.iuc       = o.iuc       ?? 0;
  e.chuc      = o.chuc      ?? 0;
  e.grade     = o.grade     ?? 0;
  e.option1   = o.option1   ?? 0;
  e.option2   = o.option2   ?? 0;
  e.option3   = o.option3   ?? 0;
  e.socket1   = o.socket1   ?? 0;
  e.socket2   = o.socket2   ?? 0;
  e.levelUpType = o.levelUpType ?? 0;
  e.level     = o.level     ?? 0;
  e.exp       = o.exp       ?? 0;
  e.durability = o.durability ?? -1;
  return e;
}

function serializePetData(p: PetData | null): object | null {
  if (!p) return null;
  return {
    petName: p.petName, level: p.level, fullness: p.fullness,
    tameness: p.tameness, petSkill: p.petSkill,
    petAttribute: p.petAttribute, remainLife: p.remainLife,
    exceptionList: p.exceptionList,
  };
}

function deserializePetData(o: any): PetData | null {
  if (!o) return null;
  const p = new PetData();
  p.petName = o.petName ?? '';
  p.level = o.level ?? 0;
  p.fullness = o.fullness ?? 0;
  p.tameness = o.tameness ?? 0;
  p.petSkill = o.petSkill ?? 0;
  p.petAttribute = o.petAttribute ?? 0;
  p.remainLife = o.remainLife ?? 0;
  p.exceptionList = Array.isArray(o.exceptionList) ? o.exceptionList.map((id: any) => Number(id)) : [];
  return p;
}

function serializeRingData(r: RingData | null): object | null {
  if (!r) return null;
  return {
    pairCharacterId: r.pairCharacterId,
    pairItemId: r.pairItemId,
    ringItemSn: r.ringItemSn.toString(),
  };
}

function deserializeRingData(o: any): RingData | null {
  if (!o) return null;
  const r = new RingData();
  r.pairCharacterId = o.pairCharacterId ?? 0;
  r.pairItemId = o.pairItemId ?? 0;
  r.ringItemSn = BigInt(o.ringItemSn ?? 0);
  return r;
}

function serializeFriendManager(fm: FriendManager): object[] {
  return fm.getFriends().map(f => ({
    characterId: f.characterId,
    characterName: f.characterName,
    groupName: f.groupName,
    flag: f.flag,
    channelId: f.channelId,
  }));
}

function deserializeFriendManager(arr: any[]): FriendManager {
  const fm = new FriendManager();
  for (const o of arr) {
    fm.addFriend(new Friend(
      o.characterId ?? 0,
      o.characterName ?? '',
      o.groupName ?? GameConstants.DEFAULT_FRIEND_GROUP,
      o.flag ?? 0,
      o.channelId ?? GameConstants.CHANNEL_OFFLINE,
    ));
  }
  return fm;
}

function serializeItem(item: Item): object {
  const base: Record<string, any> = {
    itemSn: item.itemSn.toString(),
    itemId: item.itemId,
    itemType: item.itemType,
    cash: item.cash,
    quantity: item.quantity,
    attribute: item.attribute,
    title: item.title,
    dateExpire: item.dateExpire ? item.dateExpire.getTime() : null,
    equipData: serializeEquipData(item.equipData),
    petData: serializePetData(item.petData),
    ringData: serializeRingData(item.ringData),
  };
  if (item instanceof Equip) {
    const eq = item;
    base.eq = {
      tuc: eq.tuc, cuc: eq.cuc, iuc: eq.iuc, chuc: eq.chuc,
      iStr: eq.iStr, iDex: eq.iDex, iInt: eq.iInt, iLuk: eq.iLuk,
      iMaxHp: eq.iMaxHp, iMaxMp: eq.iMaxMp,
      iPad: eq.iPad, iMad: eq.iMad, iPDD: eq.iPDD, iMDD: eq.iMDD,
      iAcc: eq.iAcc, iEva: eq.iEva, iCraft: eq.iCraft, iSpeed: eq.iSpeed, iJump: eq.iJump,
      attribute: eq.attribute, levelUpType: eq.levelUpType, level: eq.level,
      exp: eq.exp, durability: eq.durability,
      itemState: eq.itemState, options: eq.options, bonusOptions: eq.bonusOptions,
      sockets: eq.sockets, rStr: eq.rStr, rDex: eq.rDex, rInt: eq.rInt, rLuk: eq.rLuk,
      rLevel: eq.rLevel, rJob: eq.rJob, rPop: eq.rPop,
      iIncReq: eq.iIncReq, iReduceReq: eq.iReduceReq, iPvpDamage: eq.iPvpDamage,
      growthEnchant: eq.growthEnchant, psEnchant: eq.psEnchant,
      imdr: eq.imdr, damR: eq.damR, exGradeOption: eq.exGradeOption,
      specialAttribute: eq.specialAttribute, durabilityMax: eq.durabilityMax,
      prevBonusExpRate: eq.prevBonusExpRate, specialGrade: eq.specialGrade,
      fixedGrade: eq.fixedGrade, dropStreak: eq.dropStreak,
      attackSpeed: eq.attackSpeed, price: eq.price, setItemID: eq.setItemID,
      exItem: eq.exItem, equipTradeBlock: eq.equipTradeBlock,
      iSlot: eq.iSlot, vSlot: eq.vSlot, iucMax: eq.iucMax, hasIucMax: eq.hasIUCMax,
      only: eq.only, notSale: eq.notSale, expireOnLogout: eq.expireOnLogout,
      tradeBlock: eq.tradeBlock,
      equippedDate: eq.equippedDate ? eq.equippedDate.getTime() : null,
      soulOptionId: eq.soulOptionId, soulSocketId: eq.soulSocketId, soulOption: eq.soulOption,
    };
  }
  return base;
}

function deserializeItem(o: any): Item {
  const itemType = itemTypeByValue(o.itemType) ?? ItemType.BUNDLE;
  const item = new Item(itemType);
  item.itemSn = BigInt(o.itemSn ?? 0);
  item.itemId = o.itemId ?? 0;
  item.cash = o.cash ?? false;
  item.quantity = o.quantity ?? 1;
  item.attribute = o.attribute ?? 0;
  item.title = o.title ?? '';
  item.dateExpire = o.dateExpire != null ? new Date(o.dateExpire) : null;
  item.equipData = deserializeEquipData(o.equipData);
  item.petData = deserializePetData(o.petData);
  item.ringData = deserializeRingData(o.ringData);
  if (itemType === ItemType.EQUIP) {
    const eq = new Equip();
    eq.itemSn = item.itemSn;
    eq.itemId = item.itemId;
    eq.cash = item.cash;
    eq.quantity = item.quantity;
    eq.attribute = item.attribute;
    eq.title = item.title;
    eq.dateExpire = item.dateExpire;
    eq.petData = item.petData;
    eq.ringData = item.ringData;
    if (o.eq) {
      const e = o.eq;
      eq.tuc = e.tuc ?? 0; eq.cuc = e.cuc ?? 0; eq.iuc = e.iuc ?? 0; eq.chuc = e.chuc ?? 0;
      eq.iStr = e.iStr ?? 0; eq.iDex = e.iDex ?? 0; eq.iInt = e.iInt ?? 0; eq.iLuk = e.iLuk ?? 0;
      eq.iMaxHp = e.iMaxHp ?? 0; eq.iMaxMp = e.iMaxMp ?? 0;
      eq.iPad = e.iPad ?? 0; eq.iMad = e.iMad ?? 0; eq.iPDD = e.iPDD ?? 0; eq.iMDD = e.iMDD ?? 0;
      eq.iAcc = e.iAcc ?? 0; eq.iEva = e.iEva ?? 0; eq.iCraft = e.iCraft ?? 0;
      eq.iSpeed = e.iSpeed ?? 0; eq.iJump = e.iJump ?? 0;
      eq.attribute = e.attribute ?? eq.attribute;
      eq.levelUpType = e.levelUpType ?? 0; eq.level = e.level ?? 0;
      eq.exp = e.exp ?? 0; eq.durability = e.durability ?? 0;
      eq.itemState = e.itemState ?? 0;
      eq.options = Array.isArray(e.options) ? e.options : [0, 0, 0];
      eq.bonusOptions = Array.isArray(e.bonusOptions) ? e.bonusOptions : [0, 0, 0];
      eq.sockets = Array.isArray(e.sockets) ? e.sockets : [0, 0, 0];
      eq.rStr = e.rStr ?? 0; eq.rDex = e.rDex ?? 0; eq.rInt = e.rInt ?? 0; eq.rLuk = e.rLuk ?? 0;
      eq.rLevel = e.rLevel ?? 0; eq.rJob = e.rJob ?? 0; eq.rPop = e.rPop ?? 0;
      eq.iIncReq = e.iIncReq ?? 0; eq.iReduceReq = e.iReduceReq ?? 0; eq.iPvpDamage = e.iPvpDamage ?? 0;
      eq.growthEnchant = e.growthEnchant ?? 0; eq.psEnchant = e.psEnchant ?? 0;
      eq.imdr = e.imdr ?? 0; eq.damR = e.damR ?? 0; eq.exGradeOption = e.exGradeOption ?? 0;
      eq.specialAttribute = e.specialAttribute ?? 0; eq.durabilityMax = e.durabilityMax ?? 0;
      eq.prevBonusExpRate = e.prevBonusExpRate ?? 0; eq.specialGrade = e.specialGrade ?? 0;
      eq.fixedGrade = e.fixedGrade ?? 0; eq.dropStreak = e.dropStreak ?? 0;
      eq.attackSpeed = e.attackSpeed ?? 0; eq.price = e.price ?? 0;
      eq.setItemID = e.setItemID ?? 0; eq.exItem = e.exItem ?? 0;
      eq.equipTradeBlock = e.equipTradeBlock ?? 0;
      eq.iSlot = e.iSlot ?? 0; eq.vSlot = e.vSlot ?? 0;
      eq.iucMax = e.iucMax ?? 0; eq.hasIUCMax = e.hasIucMax ?? false;
      eq.only = e.only ?? false; eq.notSale = e.notSale ?? false;
      eq.expireOnLogout = e.expireOnLogout ?? false;
      eq.tradeBlock = e.tradeBlock ?? 0;
      eq.equippedDate = e.equippedDate != null ? new Date(e.equippedDate) : null;
      eq.soulOptionId = e.soulOptionId ?? 0; eq.soulSocketId = e.soulSocketId ?? 0; eq.soulOption = e.soulOption ?? 0;
    } else if (item.equipData) {
      // Legacy data: map EquipData fields to Equip
      const ed = item.equipData;
      eq.tuc = ed.ruc; eq.cuc = ed.cuc; eq.iuc = ed.iuc; eq.chuc = ed.chuc;
      eq.iStr = ed.incStr; eq.iDex = ed.incDex; eq.iInt = ed.incInt; eq.iLuk = ed.incLuk;
      eq.iMaxHp = ed.incMaxHp; eq.iMaxMp = ed.incMaxMp;
      eq.iPad = ed.incPad; eq.iMad = ed.incMad; eq.iPDD = ed.incPdd; eq.iMDD = ed.incMdd;
      eq.iAcc = ed.incAcc; eq.iEva = ed.incEva; eq.iCraft = ed.incCraft;
      eq.iSpeed = ed.incSpeed; eq.iJump = ed.incJump;
      eq.levelUpType = ed.levelUpType; eq.level = ed.level;
      eq.exp = ed.exp; eq.durability = ed.durability;
    }
    return eq;
  }
  return item;
}

function serializeInventory(inv: Inventory): object {
  const items: Record<string, object> = {};
  for (const [pos, item] of inv.getItems()) {
    items[String(pos)] = serializeItem(item);
  }
  return { size: inv.getSize(), items };
}

function deserializeInventory(o: any): Inventory {
  const inv = new Inventory(o.size ?? 24);
  const items = o.items ?? {};
  for (const [k, v] of Object.entries(items)) {
    inv.putItem(Number(k), deserializeItem(v as any));
  }
  return inv;
}

function serializeCharacterStat(cs: CharacterStat): object {
  const spMap: Record<string, number> = {};
  for (const [k, v] of cs.sp.getMap()) {
    spMap[String(k)] = v;
  }
  return {
    gender: cs.gender, skin: cs.skin, face: cs.face, hair: cs.hair,
    level: cs.level, job: cs.job, subJob: cs.subJob,
    baseStr: cs.baseStr, baseDex: cs.baseDex, baseInt: cs.baseInt, baseLuk: cs.baseLuk,
    hp: cs.hp, maxHp: cs.maxHp, mp: cs.mp, maxMp: cs.maxMp,
    ap: cs.ap, sp: spMap, exp: cs.exp, pop: cs.pop,
    posMap: cs.posMap, portal: cs.portal,
    petSn1: cs.petSn1.toString(), petSn2: cs.petSn2.toString(), petSn3: cs.petSn3.toString(),
  };
}

function deserializeCharacterStat(o: any): CharacterStat {
  const cs = new CharacterStat();
  cs.gender  = o.gender  ?? 0;
  cs.skin    = o.skin    ?? 0;
  cs.face    = o.face    ?? 0;
  cs.hair    = o.hair    ?? 0;
  cs.level   = o.level   ?? 1;
  cs.job     = o.job     ?? 0;
  cs.subJob  = o.subJob  ?? 0;
  cs.baseStr = o.baseStr ?? 4;
  cs.baseDex = o.baseDex ?? 4;
  cs.baseInt = o.baseInt ?? 4;
  cs.baseLuk = o.baseLuk ?? 4;
  cs.hp      = o.hp      ?? 50;
  cs.maxHp   = o.maxHp   ?? 50;
  cs.mp      = o.mp      ?? 5;
  cs.maxMp   = o.maxMp   ?? 5;
  cs.ap      = o.ap      ?? 0;
  cs.exp     = o.exp     ?? 0;
  cs.pop     = o.pop     ?? 0;
  cs.posMap  = o.posMap  ?? 0;
  cs.portal  = o.portal  ?? 0;
  cs.petSn1  = BigInt(o.petSn1 ?? 0);
  cs.petSn2  = BigInt(o.petSn2 ?? 0);
  cs.petSn3  = BigInt(o.petSn3 ?? 0);
  const spMap = new Map<number, number>();
  for (const [k, v] of Object.entries(o.sp ?? {})) {
    spMap.set(Number(k), v as number);
  }
  cs.sp = ExtendSp.from(spMap);
  return cs;
}

// ---------------------------------------------------------------------------
// CharacterDB
// ---------------------------------------------------------------------------

export const CharacterDB = {
  async loadCharacter(charId: number): Promise<CharacterData | null> {
    try {
      const rows = await Database.knex('characters')
        .where({ id: charId })
        .select(
          'id', 'account_id', 'name',
          'stat_json', 'equipped_json',
          'equip_inv_json', 'consume_inv_json', 'install_inv_json',
          'etc_inv_json', 'cash_inv_json',
          'money', 'ext_slot_expire',
          'skill_cooltimes_json', 'skill_records_json',
          'quest_records_json',
          'item_sn_counter', 'friend_max', 'party_id', 'guild_id',
          'creation_time', 'max_level_time',
          'friends_json',
        );

      if (!rows.length) return null;
      const row = rows[0];

      const parse = (v: any) => {
        if (!v) return {};
        if (typeof v === 'string') return JSON.parse(v);
        return v; // MySQL JSON column may already be parsed
      };
      const parseArr = (v: any) => {
        if (!v) return [];
        if (typeof v === 'string') return JSON.parse(v);
        return v;
      };

      const cd = new (await import('../../../world/user/CharacterData')).CharacterData(row.account_id);

      const cs = deserializeCharacterStat(parse(row.stat_json));
      cs.id   = row.id;
      cs.name = row.name;
      cd.characterStat = cs;

      const im = new (await import('../../../world/item/InventoryManager')).InventoryManager();
      im.equipped         = deserializeInventory(parse(row.equipped_json));
      console.log(`[DB] char ${row.id} equipped_json keys: ${row.equipped_json ? Object.keys(typeof row.equipped_json === 'string' ? JSON.parse(row.equipped_json) : row.equipped_json).join(',') : 'null'} equipped items: ${im.equipped.getItems().size}`);
      im.equipInventory   = deserializeInventory(parse(row.equip_inv_json));
      im.consumeInventory = deserializeInventory(parse(row.consume_inv_json));
      im.installInventory = deserializeInventory(parse(row.install_inv_json));
      im.etcInventory     = deserializeInventory(parse(row.etc_inv_json));
      im.cashInventory    = deserializeInventory(parse(row.cash_inv_json));
      im.money            = row.money ?? 0;
      im.extSlotExpire    = row.ext_slot_expire ? new Date(row.ext_slot_expire) : null;
      cd.inventoryManager = im;

      const sm = new (await import('../../../world/skill/SkillManager')).SkillManager();
      for (const [k, v] of Object.entries(parse(row.skill_cooltimes_json) as Record<string, number>)) {
        sm.setSkillCooltime(Number(k), new Date(v));
      }
      for (const r of parseArr(row.skill_records_json) as any[]) {
        const sr = new SkillRecord(r.skillId);
        sr.skillLevel  = r.skillLevel  ?? 0;
        sr.masterLevel = r.masterLevel ?? 0;
        sm.addSkill(sr);
      }
      cd.skillManager = sm;

      const qm = new (await import('../../../world/quest/QuestManager')).QuestManager();
      for (const r of parseArr(row.quest_records_json) as any[]) {
        const qr = new QuestRecord(r.questId);
        qr.state = r.state ?? QuestState.NONE;
        qr.value = r.value ?? '';
        qr.completedTime = r.completedTime ? new Date(r.completedTime) : null;
        qm.addQuestRecord(qr);
      }
      cd.questManager = qm;

      cd.itemSnCounter   = row.item_sn_counter  ?? 0;
      cd.friendMax   = row.friend_max   ?? 30;
      cd.friendManager = row.friends_json
        ? deserializeFriendManager(parseArr(row.friends_json))
        : new FriendManager(cd.friendMax);
      cd.friendManager.capacity = cd.friendMax;
      cd.partyId     = row.party_id     ?? 0;
      cd.guildId     = row.guild_id     ?? 0;
      cd.creationTime = row.creation_time  ? new Date(row.creation_time)  : null;
      cd.maxLevelTime = row.max_level_time ? new Date(row.max_level_time) : null;

      return cd;
    } catch (err: any) {
      // ChannelServer.instance is undefined on the center process (where migration
      // calls this), so its logger was silently dropping the real error — making a
      // deserialize throw look like "char not found". Fall back to console.error.
      const msg = `CharacterDB.loadCharacter(${charId}): ${err?.stack ?? err?.message ?? err}`;
      if (ChannelServer.instance) ChannelServer.instance.logger.error(msg);
      else console.error('[CENTER] ' + msg);
      return null;
    }
  },

  async saveCharacter(cd: CharacterData): Promise<boolean> {
    try {
      const im = cd.inventoryManager;
      const sm = cd.skillManager;
      const qm = cd.questManager;
      const cs = cd.characterStat;

      const skillCooltimesJson: Record<string, number> = {};
      for (const [k, v] of sm.getSkillCooltimes()) {
        skillCooltimesJson[String(k)] = v.getTime();
      }

      const skillRecordsJson = sm.getSkillRecords().map(r => ({
        skillId: r.skillId, skillLevel: r.skillLevel, masterLevel: r.masterLevel,
      }));

      const questRecordsJson = qm.getQuestRecords().map(r => ({
        questId: r.questId, state: r.state, value: r.value,
        completedTime: r.completedTime ? r.completedTime.getTime() : null,
      }));

      await Database.knex('characters')
        .where({ id: cs.id })
        .update({
          account_id:          cd.accountId,
          name:                cs.name,
          stat_json:           JSON.stringify(serializeCharacterStat(cs)),
          equipped_json:       JSON.stringify(serializeInventory(im.equipped)),
          equip_inv_json:      JSON.stringify(serializeInventory(im.equipInventory)),
          consume_inv_json:    JSON.stringify(serializeInventory(im.consumeInventory)),
          install_inv_json:    JSON.stringify(serializeInventory(im.installInventory)),
          etc_inv_json:        JSON.stringify(serializeInventory(im.etcInventory)),
          cash_inv_json:       JSON.stringify(serializeInventory(im.cashInventory)),
          money:               im.money,
          ext_slot_expire:     im.extSlotExpire ?? null,
          skill_cooltimes_json: JSON.stringify(skillCooltimesJson),
          skill_records_json:  JSON.stringify(skillRecordsJson),
          quest_records_json:  JSON.stringify(questRecordsJson),
          item_sn_counter:     cd.itemSnCounter ?? 0,
          friend_max:          cd.friendMax,
          party_id:            cd.partyId,
          guild_id:            cd.guildId,
          max_level_time:      cd.maxLevelTime ?? null,
          friends_json:        JSON.stringify(serializeFriendManager(cd.friendManager)),
        });

      return true;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`CharacterDB.saveCharacter(${cd.getCharacterId()}): ${err.message}`);
      return false;
    }
  },

  async newCharacter(cd: CharacterData): Promise<boolean> {
    try {
      const im = cd.inventoryManager;
      const cs = cd.characterStat;

      console.log(`[NEWCHAR] char ${cs.id} equipped items before save: ${im.equipped.getItems().size}`);
      await Database.knex('characters').insert({
        id:                  cs.id,
        account_id:          cd.accountId,
        name:                cs.name,
        stat_json:           JSON.stringify(serializeCharacterStat(cs)),
        equipped_json:       JSON.stringify(serializeInventory(im.equipped)),
        equip_inv_json:      JSON.stringify(serializeInventory(im.equipInventory)),
        consume_inv_json:    JSON.stringify(serializeInventory(im.consumeInventory)),
        install_inv_json:    JSON.stringify(serializeInventory(im.installInventory)),
        etc_inv_json:        JSON.stringify(serializeInventory(im.etcInventory)),
        cash_inv_json:       JSON.stringify(serializeInventory(im.cashInventory)),
        money:               im.money,
        ext_slot_expire:     im.extSlotExpire ?? null,
        skill_cooltimes_json: '{}',
        skill_records_json:  '[]',
        quest_records_json:  '[]',
        item_sn_counter:     0,
        friend_max:          cd.friendMax,
        party_id:            0,
        guild_id:            0,
        creation_time:       new Date(),
        max_level_time:      null,
      });

      return true;
    } catch (err: any) {
      console.error(`CharacterDB.newCharacter: ${err.message}`);
      ChannelServer.instance?.logger.error(`CharacterDB.newCharacter: ${err.message}`);
      return false;
    }
  },

  async getAvatarDataByAccountId(accountId: number): Promise<Array<{ id: number; name: string; statJson: any; equippedJson: any }>> {
    try {
      const rows = await Database.knex('characters')
        .where({ account_id: accountId })
        .select('id', 'name', 'stat_json', 'equipped_json');
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        statJson: typeof r.stat_json === 'string' ? JSON.parse(r.stat_json) : r.stat_json,
        equippedJson: typeof r.equipped_json === 'string' ? JSON.parse(r.equipped_json) : r.equipped_json,
      }));
    } catch (err: any) {
      console.error(`CharacterDB.getAvatarDataByAccountId: ${err.message}`);
      ChannelServer.instance?.logger.error(`CharacterDB.getAvatarDataByAccountId: ${err.message}`);
      return [];
    }
  },

  async checkNameAvailable(name: string): Promise<boolean> {
    try {
      const rows = await Database.knex('characters')
        .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
        .count('id as cnt');
      return Number(rows[0].cnt) === 0;
    } catch {
      return false;
    }
  },

  async findCharacterIdByName(name: string): Promise<number | null> {
    try {
      const rows = await Database.knex('characters')
        .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
        .select('id')
        .limit(1);
      return rows.length > 0 ? rows[0].id : null;
    } catch {
      return null;
    }
  },

  /**
   * Builds the global character ranking map (characterId -> CharacterRank).
   *
   * Mirrors kinoko's `CharacterAccessor.getCharacterRanks` +
   * `CharacterRankData.processCharacterRanks`. Characters are ordered by
   * cumulative EXP descending, then by `max_level_time` ascending (earlier
   * max-level characters rank higher on ties). The worldRank is the overall
   * 1-based position; the jobRank is the 1-based position within the
   * character's job category (`job % 1000 / 100`).
   *
   * Admin/manager jobs are filtered out (they never appear in rankings).
   */
  async getCharacterRanks(): Promise<Map<number, CharacterRank>> {
    const rankDataList: Array<{
      characterId: number;
      jobCategory: number;
      cumulativeExp: number;
      maxLevelTime: Date | null;
    }> = [];
    try {
      const rows = await Database.knex('characters')
        .select('id', 'stat_json', 'max_level_time');
      for (const r of rows) {
        const stat = typeof r.stat_json === 'string' ? JSON.parse(r.stat_json) : (r.stat_json ?? {});
        const job: number = stat.job ?? 0;
        if (JobConstants.isAdminJob(job) || JobConstants.isManagerJob(job)) continue;
        const level: number = stat.level ?? 1;
        const exp: number = stat.exp ?? 0;
        let cumulativeExp = exp;
        for (let lvl = 1; lvl < level; lvl++) {
          cumulativeExp += GameConstants.getNextLevelExp(lvl);
        }
        let maxLevelTime: Date | null = null;
        if (r.max_level_time) {
          maxLevelTime = r.max_level_time instanceof Date
            ? r.max_level_time
            : new Date(r.max_level_time);
        }
        rankDataList.push({
          characterId: r.id,
          jobCategory: JobConstants.getJobCategory(job),
          cumulativeExp,
          maxLevelTime,
        });
      }
    } catch (err: any) {
      console.error(`CharacterDB.getCharacterRanks: ${err.message}`);
      ChannelServer.instance?.logger?.error(`CharacterDB.getCharacterRanks: ${err.message}`);
    }
    // Sort by cumulativeExp DESC, then maxLevelTime ASC (null/missing treated as far future).
    rankDataList.sort((a, b) => {
      if (b.cumulativeExp !== a.cumulativeExp) return b.cumulativeExp - a.cumulativeExp;
      const ta = a.maxLevelTime ? a.maxLevelTime.getTime() : Number.MAX_SAFE_INTEGER;
      const tb = b.maxLevelTime ? b.maxLevelTime.getTime() : Number.MAX_SAFE_INTEGER;
      return ta - tb;
    });
    const jobRanks = new Map<number, number>();
    const characterRanks = new Map<number, CharacterRank>();
    for (const rd of rankDataList) {
      const worldRank = characterRanks.size + 1;
      const jobRank = (jobRanks.get(rd.jobCategory) ?? 0) + 1;
      jobRanks.set(rd.jobCategory, jobRank);
      characterRanks.set(rd.characterId, new CharacterRank(rd.characterId, worldRank, jobRank));
    }
    return characterRanks;
  },
};
