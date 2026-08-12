import { CharacterStat } from './stat/CharacterStat';
import { InventoryManager } from '../item/InventoryManager';
import { SkillManager } from '../skill/SkillManager';
import { QuestManager } from '../quest/QuestManager';
import { AvatarLook } from './AvatarLook';
import { BodyPart } from '../item/BodyPart';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { SkillConstants } from '../skill/SkillConstants';
import { JobConstants } from '../job/JobConstants';
import { FriendManager } from '../friend/FriendManager';
import { PopularityRecord } from './data/PopularityRecord';
import { WildHunterInfo } from './data/WildHunterInfo';

export class CharacterData {
  characterStat!:    CharacterStat;
  inventoryManager!: InventoryManager;
  skillManager!:     SkillManager;
  questManager!:     QuestManager;

  friendMax    = 30;
  friendManager = new FriendManager(this.friendMax);
  partyId      = 0;
  guildId      = 0;
  creationTime: Date | null = null;
  maxLevelTime: Date | null = null;
  popularityRecord = new PopularityRecord();

  itemSnCounter = 0;
  monsterBookCover = 0;
  chatBlockedList: string[] = [];

  // Wild Hunter jaguar capture info (port of kinoko CharacterData.wildHunterInfo)
  wildHunterInfo = new WildHunterInfo();

  constructor(public readonly accountId: number) {}

  getCharacterId():   number { return this.characterStat.id; }
  getCharacterName(): string { return this.characterStat.name; }

  getWildHunterInfo(): WildHunterInfo { return this.wildHunterInfo; }
  setWildHunterInfo(wildHunterInfo: WildHunterInfo): void { this.wildHunterInfo = wildHunterInfo; }

  getNextItemSn(): bigint {
    const counter = this.itemSnCounter++;
    return BigInt(counter) | (BigInt(this.getCharacterId()) << 32n);
  }

  getAvatarLook(): AvatarLook {
    return AvatarLook.from(this.characterStat, this.inventoryManager.equipped, this.inventoryManager.cashInventory);
  }

  /** Encodes full CharacterData (DBChar.ALL) — used for SetField on initial login. */
  encode(w: PacketWriter): void {
    w.writeLong(-1n); // DBChar.ALL flag
    w.writeByte(0);   // nCombatOrders
    w.writeBoolean(false); // bool -> byte, int*FT, int*FT

    // CHARACTER
    this.characterStat.encode(w);
    w.writeByte(this.friendMax);
    w.writeBoolean(false); // sLinkedCharacter

    // MONEY
    w.writeInt(this.inventoryManager.money);

    // INVENTORYSIZE
    w.writeByte(this.inventoryManager.equipInventory.getSize());
    w.writeByte(this.inventoryManager.consumeInventory.getSize());
    w.writeByte(this.inventoryManager.installInventory.getSize());
    w.writeByte(this.inventoryManager.etcInventory.getSize());
    w.writeByte(this.inventoryManager.cashInventory.getSize());

    // EQUIPEXT
    w.writeFT(this.inventoryManager.extSlotExpire);

    // ITEMSLOTEQUIP
    const equippedItems = this.inventoryManager.equipped.getItems();
    if (equippedItems.size === 0) {
      console.log(`[ENCODE] equipped inventory EMPTY for char ${this.characterStat?.id}`);
    } else {
      console.log(`[ENCODE] equipped inventory has ${equippedItems.size} items: ${[...equippedItems.keys()].join(',')}`);
    }
    for (const [bodyPart, item] of equippedItems) {
      if (bodyPart > 0 && bodyPart < (BodyPart.EQUIPPED_END as number)) {
        w.writeShort(-bodyPart);
        item.encode(w);
      }
    }
    w.writeShort(0);
    for (const [bodyPart, item] of equippedItems) {
      if (bodyPart >= (BodyPart.CASH_BASE as number) && bodyPart < (BodyPart.CASH_END as number)) {
        w.writeShort(bodyPart - (BodyPart.CASH_BASE as number));
        item.encode(w);
      }
    }
    w.writeShort(0);
    for (const [pos, item] of this.inventoryManager.equipInventory.getItems()) {
      w.writeShort(pos);
      item.encode(w);
    }
    w.writeShort(0);
    for (const [bodyPart, item] of equippedItems) {
      if (bodyPart >= 1000 && bodyPart < 1100) { // DRAGON_BASE..DRAGON_END
        w.writeShort(bodyPart);
        item.encode(w);
      }
    }
    w.writeShort(0);
    for (const [bodyPart, item] of equippedItems) {
      if (bodyPart >= 1100 && bodyPart < 1200) { // MECHANIC_BASE..MECHANIC_END
        w.writeShort(bodyPart);
        item.encode(w);
      }
    }
    w.writeShort(0);

    // ITEMSLOTCONSUME
    for (const [pos, item] of this.inventoryManager.consumeInventory.getItems()) {
      w.writeByte(pos);
      item.encode(w);
    }
    w.writeByte(0);

    // ITEMSLOTINSTALL
    for (const [pos, item] of this.inventoryManager.installInventory.getItems()) {
      w.writeByte(pos);
      item.encode(w);
    }
    w.writeByte(0);

    // ITEMSLOTETC
    for (const [pos, item] of this.inventoryManager.etcInventory.getItems()) {
      w.writeByte(pos);
      item.encode(w);
    }
    w.writeByte(0);

    // ITEMSLOTCASH
    for (const [pos, item] of this.inventoryManager.cashInventory.getItems()) {
      w.writeByte(pos);
      item.encode(w);
    }
    w.writeByte(0);

    // SKILLRECORD
    const skillRecords = this.skillManager.getSkillRecords();
    w.writeShort(skillRecords.length);
    for (const sr of skillRecords) {
      w.writeInt(sr.skillId);
      w.writeInt(sr.skillLevel);
      w.writeFTValue(150842304000000000n); // FileTime.DEFAULT_TIME
      if (SkillConstants.isSkillNeedMasterLevel(sr.skillId)) {
        w.writeInt(sr.masterLevel);
      }
    }

    // SKILLCOOLTIME
    const now = Date.now();
    const cooltimes: Array<[number, number]> = [];
    for (const [skillId, end] of this.skillManager.getSkillCooltimes()) {
      if (skillId === SkillConstants.BATTLESHIP_DURABILITY) {
        cooltimes.push([skillId, Math.floor(end.getTime() / 1000)]);
      } else {
        if (now >= end.getTime()) continue;
        cooltimes.push([skillId, Math.floor((end.getTime() - now) / 1000)]);
      }
    }
    w.writeShort(cooltimes.length);
    for (const [skillId, value] of cooltimes) {
      w.writeInt(skillId);
      w.writeShort(value);
    }

    // QUESTRECORD
    const startedQuests = this.questManager.getStartedQuests();
    w.writeShort(startedQuests.length);
    for (const qr of startedQuests) {
      w.writeShort(qr.questId);
      w.writeMapleAsciiString(qr.value);
    }

    // QUESTCOMPLETE
    const completedQuests = this.questManager.getCompletedQuests();
    w.writeShort(completedQuests.length);
    for (const qr of completedQuests) {
      w.writeShort(qr.questId);
      w.writeFT(qr.completedTime);
    }

    // MINIGAMERECORD (2 empty GW_MiniGameRecord entries)
    w.writeShort(2);
    for (let i = 0; i < 2; i++) {
      w.writeInt(0); // nGameID
      w.writeInt(0); // nWin
      w.writeInt(0); // nDraw
      w.writeInt(0); // nLose
      w.writeInt(0); // nScore
    }

    // COUPLERECORD (empty)
    w.writeBoolean(false);

    // MAPTRANSFER (empty)
    for (let i = 0; i < 10; i++) w.writeInt(-1); // adwMapTransfer
    for (let i = 0; i < 5; i++) w.writeInt(-1);  // adwMapTransferEx

    // NEWYEARCARD
    w.writeShort(0);

    // QUESTRECORDEX
    const exQuests = this.questManager.getExQuests();
    w.writeShort(exQuests.length);
    for (const qr of exQuests) {
      w.writeShort(qr.questId);
      w.writeMapleAsciiString(qr.value);
    }

    // WILDHUNTERINFO (only present for Wild Hunter jobs)
    if (JobConstants.isWildHunterJob(this.characterStat.job)) {
      this.wildHunterInfo.encode(w);
    }

    // QUESTCOMPLETEOLD
    w.writeShort(0);

    // VISITORLOG
    w.writeShort(0);
  }
}
