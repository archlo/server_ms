import { Life } from '../field/life/Life';
import { CharacterData } from './CharacterData';
import { CharacterStat } from './stat/CharacterStat';
import { SecondaryStat } from './stat/SecondaryStat';
import { CharacterTemporaryStat, FLAG_SIZE } from './stat/CharacterTemporaryStat';
import { TemporaryStatOption } from './stat/TemporaryStatOption';
import { AvatarLook } from './AvatarLook';
import { InventoryManager } from '../item/InventoryManager';
import { SkillManager } from '../skill/SkillManager';
import { QuestManager } from '../quest/QuestManager';
import { Stat } from './stat/Stat';
import { BitFlag } from '../../util/BitFlag';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { EncryptedSession } from '../../protocol/crypto/encryptedSession';
import { CalcDamage } from './stat/CalcDamage';
import { SkillStat } from '../../provider/skill/SkillStat';
import { PassiveSkillData } from './stat/PassiveSkillData';
import { BasicStat } from './stat/BasicStat';
import { StagePacket } from '../field/StagePacket';
import { SkillConstants } from '../skill/SkillConstants';
import { ItemInfo } from '../../provider/item/ItemInfo';
import { ItemSpecType, itemSpecTypeGetStat } from '../../provider/item/ItemSpecType';
import { Summoned } from '../field/summoned/Summoned';
import { InventoryType } from '../item/InventoryType';
import { Pet } from './Pet';
import { PetPacket } from './PetPacket';
import { Dragon } from './Dragon';
import { Account } from './Account';
import { PartyInfo } from '../party/PartyInfo';
import { GuildInfo } from './GuildInfo';
import { RatesManager } from '../RatesManager';
import { GuildManager } from '../guild/GuildManager';
import { UserRemote } from './UserRemote';
import { ConfigManager } from './data/ConfigManager';
import { FriendManager } from '../friend/FriendManager';
import { WildHunterInfo } from './data/WildHunterInfo';
import { GameConstants } from '../GameConstants';
import { Memo } from '../memo/Memo';
import type { TownPortal } from '../field/townportal/TownPortal';
import { MiniGameRecord } from '../miniroom/MiniGameRecord';
import { CoupleRecord } from './data/CoupleRecord';
import { NewYearCard } from './data/NewYearCard';

export class User extends Life {
  private readonly characterData: CharacterData;
  private readonly secondaryStat = new SecondaryStat();
  private readonly calcDamage = new CalcDamage();
  private readonly session: EncryptedSession;
  account: Account | null = null;
  private _partyInfo: PartyInfo = PartyInfo.EMPTY;
  private readonly _miniGameRecord = new MiniGameRecord();
  private _coupleRecord: CoupleRecord = CoupleRecord.EMPTY;

  // skill schedules (skillId -> next-trigger time, port of kinoko's `schedules` map)
  private readonly schedules = new Map<number, Date>();
  private readonly summoned = new Map<number, Summoned[]>();
  private readonly pets = new Map<number, Pet>();

  // config manager (macros, key binds, pet settings)
  private readonly _configManager = ConfigManager.defaults();

  // passive skill data cache
  private readonly _passiveSkillData = new PassiveSkillData();

  // field state
  private _fieldKey = 0;
  private _dialog: any = null;
  private _effectItemId = 0;
  private _portableChairId = 0;
  private _adBoard: string | null = null;
  private _inTransfer = false;

  // town portal (Mystic Door)
  private _townPortal: TownPortal | null = null;

  // Evan dragon (port of kinoko User::dragon)
  private _dragon: Dragon | null = null;

  // open gate (Thief gate skill)
  private _openGates = new Map<number, { targetFieldId: number; targetPortalName: string }>();

  // memos (gift receipts / notes) — port of kinoko's User memos
  private _memos: Memo[] = [];

  // new year cards
  private _newYearCards: NewYearCard[] = [];

  // pet fullness tick
  private _lastPetTick = new Date();

  // follow system
  private _followTargetId = 0;
  private _followTimer: NodeJS.Timeout | null = null;

  // RPS game
  private _rpsState: 'idle' | 'playing' = 'idle';
  private _rpsWins = 0;
  private _rpsLosses = 0;
  private _rpsLastThrow: number = -1;

  getRpsState(): { state: 'idle' | 'playing'; wins: number; losses: number; lastThrow: number } {
    return { state: this._rpsState, wins: this._rpsWins, losses: this._rpsLosses, lastThrow: this._rpsLastThrow };
  }

  startRps(): void {
    this._rpsState = 'playing';
    this._rpsWins = 0;
    this._rpsLosses = 0;
    this._rpsLastThrow = -1;
  }

  setRpsResult(wins: number, losses: number, lastThrow: number): void {
    this._rpsWins = wins;
    this._rpsLosses = losses;
    this._rpsLastThrow = lastThrow;
  }

  resetRps(): void {
    this._rpsState = 'idle';
    this._rpsWins = 0;
    this._rpsLosses = 0;
    this._rpsLastThrow = -1;
  }

  constructor(session: EncryptedSession, characterData: CharacterData) {
    super();
    this.session = session;
    this.characterData = characterData;
  }

  // ---- accessors -----------------------------------------------

  getCharacterData():  CharacterData   { return this.characterData; }
  getCharacterStat():  CharacterStat   { return this.characterData.characterStat; }
  getInventoryManager(): InventoryManager { return this.characterData.inventoryManager; }
  getSkillManager():   SkillManager    { return this.characterData.skillManager; }
  getQuestManager():   QuestManager    { return this.characterData.questManager; }
  getFriendManager():  FriendManager   {
    this.characterData.friendManager.capacity = this.characterData.friendMax;
    return this.characterData.friendManager;
  }
  getSecondaryStat():  SecondaryStat   { return this.secondaryStat; }
  getCalcDamage():     CalcDamage      { return this.calcDamage; }
  getAvatarLook():     AvatarLook {
    return AvatarLook.from(
      this.getCharacterStat(),
      this.getInventoryManager().equipped,
      this.getInventoryManager().cashInventory,
    );
  }

  getAccountId():      number { return this.characterData.accountId; }
  getCharacterId():    number { return this.characterData.getCharacterId(); }
  getCharacterName():  string { return this.characterData.getCharacterName(); }
  getNextItemSn(): bigint { return this.characterData.getNextItemSn(); }

  /** Remote address of the client socket (used by the admin panel player list). */
  getClientIp(): string {
    return this.session.session.socket.remoteAddress?.replace(/^::ffff:/, '') ?? '';
  }

  /** Closes the client socket (used by admin `kick`/`ban`). */
  kick(): void {
    try {
      this.session.session.socket.destroy();
    } catch {
      /* socket already gone */
    }
  }

  /** Port of kinoko's User::getWildHunterInfo. */
  getWildHunterInfo(): WildHunterInfo { return this.characterData.getWildHunterInfo(); }

  /** Port of kinoko's User::getSkillStatValue (CalcDamage / SkillProcessor). */
  getSkillStatValue(skillId: number, stat: SkillStat): number {
    return this.getSkillManager().getSkillStatValue(skillId, stat);
  }

  /** Port of kinoko's User::getSkillLevel. */
  getSkillLevel(skillId: number): number {
    return this.getSkillManager().getSkillLevel(skillId);
  }

  /** Port of kinoko's User::getPassiveSkillData. */
  getPassiveSkillData(): PassiveSkillData {
    return this._passiveSkillData;
  }

  /** Port of kinoko's User::getConfigManager. */
  getConfigManager(): ConfigManager {
    return this._configManager;
  }

  /** Port of kinoko's User::updatePassiveSkillData. Recalculates all passive-skill stat bonuses. */
  updatePassiveSkillData(): void {
    this._passiveSkillData.setFrom(this.getBasicStat(), this.getSecondaryStat(), this.getSkillManager());
  }

  /** Port of kinoko's User::getBasicStat. */
  getBasicStat(): BasicStat {
    return new BasicStat(this.getCharacterStat(), this.getSecondaryStat(), this._passiveSkillData);
  }

  // -- town portal / open gate / memos --

  getTownPortal(): TownPortal | null { return this._townPortal; }
  setTownPortal(tp: TownPortal | null): void { this._townPortal = tp; }

  /** Port of kinoko's User::getDragon / setDragon. */
  getDragon(): Dragon | null { return this._dragon; }
  setDragon(dragon: Dragon | null): void { this._dragon = dragon; }

  getOpenGate(objectId: number): { targetFieldId: number; targetPortalName: string } | undefined {
    return this._openGates.get(objectId);
  }
  addOpenGate(objectId: number, gate: { targetFieldId: number; targetPortalName: string }): void {
    this._openGates.set(objectId, gate);
  }
  removeOpenGate(objectId: number): void { this._openGates.delete(objectId); }

  getMemos(): Memo[] { return this._memos; }
  setMemos(memos: Memo[]): void { this._memos = memos; }

  getNewYearCards(): NewYearCard[] { return this._newYearCards; }
  addNewYearCard(card: NewYearCard): void { this._newYearCards.push(card); }
  clearNewYearCards(): void { this._newYearCards = []; }
  addMemo(memo: Memo): void { this._memos.push(memo); }
  removeMemo(memoId: number): Memo | undefined {
    const idx = this._memos.findIndex(m => m.memoId === memoId);
    if (idx < 0) return undefined;
    const [removed] = this._memos.splice(idx, 1);
    return removed;
  }

  getJob():   number { return this.getCharacterStat().job; }
  getLevel(): number { return this.getCharacterStat().level; }
  getGender(): number { return this.getCharacterStat().gender; }

  /**
   * GM privilege check (port of kinoko's account-level gating for admin
   * commands). Returns true when the owning account has been flagged as a
   * GM via the `accounts.web_admin` column.
   */
  isGm(): boolean { return this.account?.gm === true; }

  getPop(): number { return this.getCharacterStat().pop; }

  addPop(pop: number): void {
    const newPop = Math.max(-32768, Math.min(32767, this.getPop() + pop));
    this.getCharacterStat().pop = newPop;
    this.validateStat();
    this.write(statChangedPacket(Stat.POP, newPop));
  }

  // ---- guild -------------------------------------------------------

  /**
   * Port of kinoko's User::getGuildInfo. Resolves the character's guild from
   * GuildManager and builds a GuildInfo DTO (empty when not in a guild).
   */
  getGuildInfo(): GuildInfo {
    const guildId = this.getCharacterData().guildId;
    const guild = GuildManager.instance?.getGuild(guildId);
    return guild ? GuildInfo.from(guild, this.getCharacterId()) : GuildInfo.EMPTY;
  }

  getGuildId(): number { return this.getGuildInfo().guildId; }
  hasGuild(): boolean { return this.getGuildId() !== 0; }
  getGuildRank(): number { return this.getGuildInfo().guildRank; }
  getAllianceId(): number { return this.getGuildInfo().allianceId; }
  hasAlliance(): boolean { return this.getAllianceId() !== 0; }

  // ---- party -------------------------------------------------------

  getPartyInfo():   PartyInfo { return this._partyInfo; }
  setPartyInfo(partyInfo: PartyInfo | null): void {
    this._partyInfo = partyInfo ?? PartyInfo.EMPTY;
    this.characterData.partyId = this._partyInfo.partyId;
  }
  getPartyId():     number { return this._partyInfo.partyId; }
  hasParty():       boolean { return this._partyInfo.partyId !== 0; }
  isPartyBoss():    boolean { return this._partyInfo.boss; }
  getPartyMemberIndex(): number { return this.hasParty() ? this._partyInfo.memberIndex - 1 : 0; }

  getCoupleRecord(): CoupleRecord { return this._coupleRecord; }
  setCoupleRecord(v: CoupleRecord): void { this._coupleRecord = v; }

  /** Port of kinoko's ScriptManagerImpl::checkParty. */
  checkParty(minMembers: number, minLevel: number): boolean {
    if (!this.hasParty() || !this.isPartyBoss()) return false;
    const members: User[] = this.getField()?.getUserPool().getPartyMembers(this.getPartyId()) ?? [];
    if (members.length < minMembers) return false;
    return members.every((m: User) => m.getLevel() >= minLevel);
  }

  // ---- follow system ------------------------------------------------

  getFollowTargetId(): number { return this._followTargetId; }

  startFollowing(targetId: number): void {
    this._followTargetId = targetId;
    this.stopFollowingTick();
    this._followTimer = setInterval(() => {
      this.tickFollow();
    }, 500);
  }

  stopFollowing(): void {
    this._followTargetId = 0;
    this.stopFollowingTick();
  }

  private stopFollowingTick(): void {
    if (this._followTimer) {
      clearInterval(this._followTimer);
      this._followTimer = null;
    }
  }

  private tickFollow(): void {
    if (this._followTargetId === 0) {
      this.stopFollowingTick();
      return;
    }
    const field = this.getField();
    if (!field) return;
    const target = field.getUserPool().getUserByCharacterId(this._followTargetId);
    if (!target) {
      this.stopFollowing();
      return;
    }
    this.warpTo(field, target.getX(), target.getY(), 0, false, false);
  }

  // ---- pets --------------------------------------------------------

  getPetIndex(petSn: bigint): number | null {
    const cs = this.getCharacterStat();
    if (petSn !== 0n && cs.petSn1 === petSn) return 0;
    if (petSn !== 0n && cs.petSn2 === petSn) return 1;
    if (petSn !== 0n && cs.petSn3 === petSn) return 2;
    return null;
  }

  getPet(petIndex: number): Pet | null {
    const petSn = [this.getCharacterStat().petSn1, this.getCharacterStat().petSn2, this.getCharacterStat().petSn3][petIndex];
    if (!petSn || petSn === 0n) return null;
    const existing = this.pets.get(petIndex);
    if (existing?.getItemSn() === petSn) return existing;
    const itemEntry = this.getInventoryManager().getItemBySn(InventoryType.CASH, petSn);
    if (!itemEntry) return null;
    const item = itemEntry[1];
    if (!item.petData) return null;
    const pet = Pet.from(this, item);
    this.pets.set(petIndex, pet);
    return pet;
  }

  setPetSn(petIndex: number, petSn: bigint, notify = true): void {
    const cs = this.getCharacterStat();
    const stat = petIndex === 0 ? Stat.PETSN : petIndex === 1 ? Stat.PETSN2 : petIndex === 2 ? Stat.PETSN3 : null;
    if (stat === null) return;
    if (petIndex === 0) cs.petSn1 = petSn;
    else if (petIndex === 1) cs.petSn2 = petSn;
    else cs.petSn3 = petSn;
    if (notify) this.write(statChangedPacket(stat, petSn));
  }

  setPet(pet: Pet, petIndex: number, notify = true): boolean {
    if (petIndex < 0 || petIndex > 2) return false;
    this.pets.set(petIndex, pet);
    this.setPetSn(petIndex, pet.getItemSn(), notify);
    return true;
  }

  addPet(pet: Pet, notify = true): boolean {
    if (this.getPetIndex(pet.getItemSn()) !== null) return false;
    for (let i = 0; i < 3; i++) {
      if (this.getPet(i) === null) return this.setPet(pet, i, notify);
    }
    return false;
  }

  removePet(petIndex: number): boolean {
    if (this.getPet(petIndex) === null) return false;
    this.pets.delete(petIndex);
    this.setPetSn(petIndex, 0n);
    return true;
  }

  getPets(): Pet[] {
    const pets: Pet[] = [];
    for (let i = 0; i < 3; i++) {
      const pet = this.getPet(i);
      if (pet) pets.push(pet);
    }
    return pets;
  }

  /**
   * Periodic pet upkeep: decreases fullness every 60 seconds. When fullness
   * reaches 0 the pet is unsummoned. Called from Field.update().
   */
  processPets(now: Date): void {
    const elapsed = (now.getTime() - this._lastPetTick.getTime()) / 1000;
    if (elapsed < GameConstants.PET_FULLNESS_TICK_INTERVAL) return;
    this._lastPetTick = now;
    for (let i = 0; i < 3; i++) {
      const pet = this.getPet(i);
      if (!pet) continue;
      const data = pet.getItem().petData;
      if (!data) continue;
      if (data.fullness <= 0) {
        this.removePet(i);
        this.getField()?.broadcastPacket(PetPacket.petDeactivated(this, i, 6));
      } else {
        data.fullness = Math.max(0, data.fullness - 1);
        if (data.fullness <= 0) {
          this.removePet(i);
          this.getField()?.broadcastPacket(PetPacket.petDeactivated(this, i, 6));
        }
      }
    }
  }

  getHp():    number { return this.getCharacterStat().hp; }
  getMp():    number { return this.getCharacterStat().mp; }
  getMaxHp(): number { return this.getBasicStat().getMaxHp(); }
  getMaxMp(): number { return this.getBasicStat().getMaxMp(); }

  setHp(hp: number): void {
    const prev = this.getCharacterStat().hp;
    this.getCharacterStat().hp = Math.max(0, Math.min(hp, this.getMaxHp()));
    this.write(statChangedPacket(Stat.HP, this.getCharacterStat().hp));
    // HP change is relayed to party members (OG CUserPool HP gauge). When the
    // character dies (transitions to 0) also broadcast to the whole field so
    // every client plays the remote dead action (CUser::OnSetDead) — a corpse
    // must be visible to all players, not just the party.
    this.getField()?.getUserPool().forEachPartyMemberOf(this, (member: User) => {
      member.write(UserRemote.receiveHp(this));
    });
    if (prev > 0 && this.getCharacterStat().hp === 0) {
      this.getField()?.broadcastPacket(UserRemote.receiveHp(this));
    }
  }
  addHp(hp: number): void { this.setHp(this.getHp() + hp); }

  setMp(mp: number): void {
    this.getCharacterStat().mp = Math.max(0, Math.min(mp, this.getMaxMp()));
    this.write(statChangedPacket(Stat.MP, this.getCharacterStat().mp));
  }
  addMp(mp: number): void { this.setMp(this.getMp() + mp); }

  addExp(exp: number): void {
    const scaled = Math.floor(exp * RatesManager.expRate);
    const changed = this.getCharacterStat().addExp(scaled, this.getCharacterStat().baseInt);
    this.write(statChangedMapPacket(changed));
  }

  getFieldKey(): number { return this._fieldKey & 0xFF; }
  getNextFieldKey(): number { this._fieldKey = (this._fieldKey + 1) & 0xFF; return this._fieldKey; }

  getDialog(): any  { return this._dialog; }
  setDialog(d: any): void { this._dialog = d; }
  hasDialog(): boolean { return this._dialog !== null; }
  closeDialog(): void { this._dialog = null; }

  getMiniGameRecord(): MiniGameRecord { return this._miniGameRecord; }

  getEffectItemId(): number      { return this._effectItemId; }
  setEffectItemId(v: number): void { this._effectItemId = v; }

  getPortableChairId(): number       { return this._portableChairId; }
  setPortableChairId(v: number): void { this._portableChairId = v; }

  getAdBoard(): string | null        { return this._adBoard; }
  setAdBoard(v: string | null): void { this._adBoard = v; }

  isInTransfer(): boolean        { return this._inTransfer; }
  setInTransfer(v: boolean): void { this._inTransfer = v; }

  // ---- summoned ----------------------------------------------------

  getSummoned(): Map<number, Summoned[]> { return this.summoned; }

  getSummonedAll(): Summoned[] {
    return [...this.summoned.values()].flat();
  }

  getSummonedBySkill(skillId: number): Summoned[] {
    return this.summoned.get(skillId) ?? [];
  }

  addSummoned(summoned: Summoned): void {
    const list = this.summoned.get(summoned.skillId) ?? [];
    list.push(summoned);
    this.summoned.set(summoned.skillId, list);
    this.getField()?.getSummonedPool().addSummoned(this, summoned);
  }

  removeSummoned(predicate: (summoned: Summoned) => boolean): void {
    for (const [skillId, list] of [...this.summoned.entries()]) {
      const keep: Summoned[] = [];
      for (const summoned of list) {
        if (predicate(summoned)) {
          this.getField()?.getSummonedPool().removeSummoned(this, summoned);
        } else {
          keep.push(summoned);
        }
      }
      if (keep.length === 0) this.summoned.delete(skillId);
      else this.summoned.set(skillId, keep);
    }
  }

  removeSummonedObject(summoned: Summoned): boolean {
    const list = this.summoned.get(summoned.skillId);
    if (!list) return false;
    const index = list.indexOf(summoned);
    if (index < 0) return false;
    list.splice(index, 1);
    if (list.length === 0) this.summoned.delete(summoned.skillId);
    return this.getField()?.getSummonedPool().removeSummoned(this, summoned) ?? false;
  }

  // ---- stat validation ------------------------------------------

  validateStat(): void {
    this.updatePassiveSkillData();
    const realEquip = new Map<number, import('../item/Item').Item>();
    for (const [pos, item] of this.getInventoryManager().equipped.getItems()) {
      realEquip.set(pos, item);
    }
    this.secondaryStat.setFrom(realEquip);

    const cs = this.getCharacterStat();
    if (cs.hp > this.getMaxHp()) this.setHp(this.getMaxHp());
    if (cs.mp > this.getMaxMp()) this.setMp(this.getMaxMp());
  }

  // ---- temporary stats ------------------------------------------

  setTemporaryStat(cts: CharacterTemporaryStat, option: TemporaryStatOption, delay = 0): void {
    this.setTemporaryStats(new Map([[cts, option]]), delay);
  }

  setTemporaryStats(setStats: Map<CharacterTemporaryStat, TemporaryStatOption>, delay = 0): void {
    for (const [cts, opt] of setStats) {
      this.secondaryStat.setOption(cts, opt);
    }
    this.validateStat();
    const flag = BitFlag.from(setStats.keys(), FLAG_SIZE);
    if (!flag.isEmpty()) {
      this.write(temporaryStatSetPacket(this.secondaryStat, flag, delay));
      this.getField()?.broadcastPacket(temporaryStatSetRemotePacket(this, this.secondaryStat, flag), this);
    }
  }

  resetTemporaryStat(predicate: (cts: CharacterTemporaryStat, opt: TemporaryStatOption) => boolean): void {
    const removed = this.secondaryStat.resetTemporaryStat(predicate);
    if (removed.size > 0) {
      this.validateStat();
      const flag = BitFlag.from(removed, FLAG_SIZE);
      if (!flag.isEmpty()) {
        this.write(temporaryStatResetPacket(flag));
        this.getField()?.broadcastPacket(temporaryStatResetRemotePacket(this, flag), this);
      }
    }
  }

  resetTemporaryStatBySkill(skillId: number): void {
    this.resetTemporaryStat((_, opt) => opt.rOption === skillId);
  }

  /**
   * Port of kinoko's User::setConsumeItemEffect (#16 ItemHandler).
   * itemupbyitem/mesoupbyitem/respectPimmune/respectMimmune duration handling
   * matches kinoko (only applied if a `time` spec is also present).
   */
  setConsumeItemEffect(itemInfo: ItemInfo): void {
    let statUpDuration = 0;
    const statUps = new Map<CharacterTemporaryStat, number>();
    const resetStats = new Set<CharacterTemporaryStat>();

    for (const [specType, value] of itemInfo.itemSpecs) {
      switch (specType) {
        case ItemSpecType.hp:
          this.addHp(this.getItemBonusRecovery(itemInfo.getSpec(specType)));
          break;
        case ItemSpecType.mp:
          this.addMp(this.getItemBonusRecovery(itemInfo.getSpec(specType)));
          break;
        case ItemSpecType.hpR:
          this.addHp(Math.floor(this.getMaxHp() * itemInfo.getSpec(specType) / 100));
          break;
        case ItemSpecType.mpR:
          this.addMp(Math.floor(this.getMaxMp() * itemInfo.getSpec(specType) / 100));
          break;
        case ItemSpecType.curse:
        case ItemSpecType.darkness:
        case ItemSpecType.poison:
        case ItemSpecType.seal:
        case ItemSpecType.weakness: {
          const cts = itemSpecTypeGetStat(specType);
          if (cts !== null) resetStats.add(cts);
          break;
        }
        case ItemSpecType.time:
          statUpDuration = this.getItemBonusDuration(itemInfo.getSpec(specType));
          break;
        case ItemSpecType.defenseAtt:
          statUps.set(CharacterTemporaryStat.DefenseAtt, itemInfo.getSpec(ItemSpecType.prob));
          statUps.set(CharacterTemporaryStat.DefenseAtt_Elem, String(value).charCodeAt(0));
          break;
        case ItemSpecType.defenseState:
          statUps.set(CharacterTemporaryStat.DefenseState, itemInfo.getSpec(ItemSpecType.prob));
          statUps.set(CharacterTemporaryStat.DefenseState_Stat, String(value).charCodeAt(0));
          break;
        case ItemSpecType.respectPimmune:
        case ItemSpecType.respectMimmune:
        case ItemSpecType.itemupbyitem:
        case ItemSpecType.mesoupbyitem: {
          const cts = itemSpecTypeGetStat(specType);
          if (cts !== null) statUps.set(cts, itemInfo.getSpec(ItemSpecType.prob));
          break;
        }
        default: {
          const cts = itemSpecTypeGetStat(specType);
          if (cts !== null) statUps.set(cts, itemInfo.getSpec(specType));
          break;
        }
      }
    }

    if (statUps.size > 0 && statUpDuration > 0) {
      const setStats = new Map<CharacterTemporaryStat, TemporaryStatOption>();
      for (const [cts, value] of statUps) {
        setStats.set(cts, TemporaryStatOption.of(value, -itemInfo.itemId, statUpDuration));
      }
      this.setTemporaryStats(setStats);
    }

    if (resetStats.size > 0) {
      this.resetTemporaryStat((cts) => resetStats.has(cts));
    }
  }

  /** Port of kinoko's User::getItemBonusRecovery. */
  private getItemBonusRecovery(recovery: number): number {
    const bonusRate = this.getSkillStatValue(SkillConstants.getItemBonusRateSkill(this.getJob()), SkillStat.x);
    return bonusRate !== 0 ? Math.floor(recovery * bonusRate / 100) : recovery;
  }

  /** Port of kinoko's User::getItemBonusDuration. */
  private getItemBonusDuration(duration: number): number {
    const bonusRate = this.getSkillStatValue(SkillConstants.getItemBonusRateSkill(this.getJob()), SkillStat.x);
    return bonusRate !== 0 ? Math.floor(duration * bonusRate / 100) : duration;
  }

  // ---- schedules --------------------------------------------------

  getSchedules(): Map<number, Date> { return this.schedules; }

  /** Port of User::getSchedule. Returns far-future date if unset (kinoko: Instant.MAX). */
  getSchedule(skillId: number): Date {
    return this.schedules.get(skillId) ?? new Date(8640000000000000);
  }

  setSchedule(skillId: number, nextSchedule: Date): void {
    this.schedules.set(skillId, nextSchedule);
  }

  // ---- skill cooltime -------------------------------------------

  setSkillCooltime(skillId: number, cooltime: number): void {
    if (cooltime > 0) {
      this.getSkillManager().setSkillCooltime(skillId, new Date(Date.now() + cooltime * 1000));
    } else {
      this.getSkillManager().getSkillCooltimes().delete(skillId);
    }
    this.write(skillCooltimePacket(skillId, cooltime));
  }

  // ---- network --------------------------------------------------

  write(buf: Buffer): void {
    this.session.write(buf).catch(() => { /* session gone */ });
  }

  // ---- field transfer --------------------------------------------

  /**
   * Port of kinoko's User::warp(Field, PortalInfo, isMigrate, isRevive).
   * `getConnectedServer().notifyUserUpdate` (multi-server registry) and
   * foothold resolution (`getFootholdBelow`) are not ported - single-process
   * server with no foothold tracking on FieldObject.
   */
  warp(destination: import('../field/Field').Field, portal: import('../../provider/map/PortalInfo').PortalInfo, isMigrate: boolean, isRevive: boolean): void {
    this.warpTo(destination, portal.x, portal.y, portal.portalId, isMigrate, isRevive);
  }

  warpTo(destination: import('../field/Field').Field, x: number, y: number, portalId: number, isMigrate: boolean, isRevive: boolean): void {
    const field = this.getField();
    if (field) {
      field.getUserPool().removeUser(this);
    }
    this.setField(destination);
    this.setX(x);
    this.setY(y);
    this.getCharacterStat().posMap = destination.getFieldId();
    this.getCharacterStat().portal = portalId & 0xFF;

    this.write(StagePacket.setField(this, 0, isMigrate, isRevive));
    destination.getUserPool().addUser(this);
  }

  /** Empty STAT_CHANGED with bOnExclRequest=true — unlocks client input after invalid packet */
  dispose(): void {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.STAT_CHANGED.code);
    w.writeByte(1); // bOnExclRequest
    w.writeInt(0);  // mask low
    w.writeInt(0);  // mask high
    w.writeShort(0);
    this.write(w.getPacket());
  }
}

// ---- inline packet builders (avoids circular import with WvsContext) --------

import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';

export function statChangedPacket(stat: Stat, value: any): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.STAT_CHANGED.code);
  w.writeByte(1); // bOnExclRequest
  w.writeInt(stat);  // low 32 bits of stat flag
  w.writeInt(0);     // high 32 bits
  encodeSingleStat(w, stat, value);
  w.writeShort(0);
  return w.getPacket();
}

export function statChangedMapPacket(changed: Map<Stat, any>): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.STAT_CHANGED.code);
  w.writeByte(1);
  let mask = 0;
  for (const stat of changed.keys()) mask |= stat;
  w.writeInt(mask);
  w.writeInt(0);
  for (const [stat, value] of changed) encodeSingleStat(w, stat, value);
  w.writeShort(0);
  return w.getPacket();
}

function encodeSingleStat(w: PacketWriter, stat: Stat, value: any): void {
  switch (stat) {
    case Stat.SKIN: case Stat.LEVEL:
      w.writeByte(Number(value)); break;
    case Stat.JOB: case Stat.STR: case Stat.DEX: case Stat.INT: case Stat.LUK:
    case Stat.AP: case Stat.POP: case Stat.SP:
      w.writeShort(Number(value)); break;
    case Stat.HP: case Stat.MHP: case Stat.MP: case Stat.MMP:
    case Stat.EXP: case Stat.FACE: case Stat.HAIR:
      w.writeInt(Number(value)); break;
    case Stat.PETSN: case Stat.PETSN2: case Stat.PETSN3:
      w.writeLong(typeof value === 'bigint' ? value : BigInt(value)); break;
    default:
      w.writeInt(Number(value)); break;
  }
}

export function temporaryStatSetPacket(ss: SecondaryStat, flag: BitFlag, delay: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.TEMPORARY_STAT_SET.code);
  ss.encodeForLocal(flag, w);
  w.writeShort(delay);
  return w.getPacket();
}

function temporaryStatSetRemotePacket(user: User, ss: SecondaryStat, flag: BitFlag): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.USER_TEMPORARY_STAT_SET.code);
  w.writeInt(user.getId());
  ss.encodeForRemoteWithFlag(flag, w);
  return w.getPacket();
}

function temporaryStatResetPacket(flag: BitFlag): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.TEMPORARY_STAT_RESET.code);
  flag.encode(w);
  return w.getPacket();
}

function temporaryStatResetRemotePacket(user: User, flag: BitFlag): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.USER_TEMPORARY_STAT_RESET.code);
  w.writeInt(user.getId());
  flag.encode(w);
  return w.getPacket();
}

export function skillCooltimePacket(skillId: number, cooltime: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.SKILL_COOLTIME_SET.code);
  w.writeInt(skillId);
  w.writeShort(cooltime);
  return w.getPacket();
}
