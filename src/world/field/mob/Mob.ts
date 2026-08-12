import { Life } from '../life/Life';
import { MobTemplate } from '../../../provider/mob/MobTemplate';
import { MobAttack } from '../../../provider/mob/MobAttack';
import { MobSkill } from '../../../provider/mob/MobSkill';
import { MobAppearType } from './MobAppearType';
import { GameConstants } from '../../GameConstants';
import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { BitFlag } from '../../../util/BitFlag';
import { Util } from '../../../util/Util';
import { MobTemporaryStat, MOB_TEMPORARY_STAT_FLAG_SIZE, MOB_TEMPORARY_STAT_ENCODE_ORDER } from './MobTemporaryStat';
import { MobStatOption } from './MobStatOption';
import { MobPacket } from './MobPacket';
import { BurnedInfo } from './BurnedInfo';
import { ElementAttribute } from '../../../provider/skill/ElementAttribute';
import { DamagedAttribute } from '../../../provider/mob/DamagedAttribute';
import { MobProvider } from '../../../provider/MobProvider';
import { CharacterTemporaryStat } from '../../user/stat/CharacterTemporaryStat';
import { User } from '../../user/User';
import { RewardProvider } from '../../../provider/RewardProvider';
import { Reward } from '../../../provider/reward/Reward';
import { Drop } from '../drop/Drop';
import { DropEnterType } from '../drop/DropEnterType';
import { DropOwnType } from '../drop/DropOwnType';
import { ItemProvider } from '../../../provider/ItemProvider';
import { ItemVariationOption } from '../../item/ItemVariationOption';
import { SkillStat } from '../../../provider/skill/SkillStat';
import { MessagePacket } from '../../user/MessagePacket';
import { QuestProvider } from '../../../provider/QuestProvider';
import { RatesManager } from '../../RatesManager';

/** Port of kinoko's MobStat. */
export class MobStat {
  private readonly temporaryStats = new Map<MobTemporaryStat, MobStatOption>();
  private readonly burnedInfos = new Map<number, BurnedInfo>(); // skillId -> BurnedInfo

  getTemporaryStats(): Map<MobTemporaryStat, MobStatOption> { return this.temporaryStats; }

  getBurnedInfos(): Map<number, BurnedInfo> { return this.burnedInfos; }
  addBurnedInfo(burnedInfo: BurnedInfo): void { this.burnedInfos.set(burnedInfo.skillId, burnedInfo); }
  removeBurnedInfo(skillId: number): void { this.burnedInfos.delete(skillId); }
  hasBurnedInfo(characterId: number, skillId: number): boolean {
    const info = this.burnedInfos.get(skillId);
    return info !== undefined && info.characterId === characterId;
  }

  getOption(mts: MobTemporaryStat): MobStatOption {
    return this.temporaryStats.get(mts) ?? MobStatOption.EMPTY;
  }

  hasOption(mts: MobTemporaryStat): boolean { return this.getOption(mts).nOption > 0; }

  /** Returns removed stat set */
  resetTemporaryStat(predicate: (mts: MobTemporaryStat, opt: MobStatOption) => boolean): Set<MobTemporaryStat> {
    const removed = new Set<MobTemporaryStat>();
    for (const [mts, opt] of this.temporaryStats) {
      if (predicate(mts, opt)) { this.temporaryStats.delete(mts); removed.add(mts); }
    }
    return removed;
  }

  clear(): void { this.temporaryStats.clear(); }

  /** CMob::SetTemporaryStat — empty flag until any stat is set. */
  encodeTemporary(w: PacketWriter): void {
    const flag = BitFlag.from(this.temporaryStats.keys(), MOB_TEMPORARY_STAT_FLAG_SIZE);
    this.encodeTemporaryWithFlag(flag, w);
  }

  encodeTemporaryWithFlag(flag: BitFlag, w: PacketWriter): void {
    flag.encode(w);
    for (const mts of MOB_TEMPORARY_STAT_ENCODE_ORDER) {
      if (flag.has(mts)) this.getOption(mts).encode(w);
    }
    if (flag.has(MobTemporaryStat.Burned)) {
      w.writeInt(this.burnedInfos.size);
      for (const burnedInfo of this.burnedInfos.values()) burnedInfo.encode(w);
    }
    if (flag.has(MobTemporaryStat.PCounter)) {
      w.writeInt(0); // wPCounter
    }
    if (flag.has(MobTemporaryStat.MCounter)) {
      w.writeInt(0); // wMCounter
    }
    if (flag.has(MobTemporaryStat.PCounter) || flag.has(MobTemporaryStat.MCounter)) {
      w.writeInt(100); // nCounterProb
    }
    if (flag.has(MobTemporaryStat.Disable)) {
      w.writeBoolean(true);  // bInvincible
      w.writeBoolean(false); // bDisable
    }
  }
}

export class Mob extends Life {
  private readonly mobStat = new MobStat();
  private readonly damageDone = new Map<number, number>(); // charId -> damage
  private readonly skillCooltimes = new Map<number, Date>();

  private _hp: number;
  private _mp: number;
  private _controller: any = null; // User (forward ref)
  summonType   = MobAppearType.REGEN as number;
  itemDropCount = 0;
  slowUsed     = false;
  swallowCharacterId = 0;
  stolenReward: Reward | null = null;

  nextSendMobHp: Date;
  nextSkillUse:  Date;
  nextRecovery:  Date;
  removeAfter:   Date;
  nextDropItem:  Date;

  private readonly startFoothold: number;

  constructor(
    public readonly template: MobTemplate,
    public readonly spawnPoint: any | null, // MobSpawnPoint (forward ref)
    x: number, y: number, fh: number,
  ) {
    super();
    this.startFoothold = fh;
    this.setX(x);
    this.setY(y);
    this.setFoothold(fh);
    this.setMoveAction(5 << 1); // REGEN action

    this._hp = template.maxHp;
    this._mp = template.maxMp;
    this.summonType = MobAppearType.REGEN;

    const now = Date.now();
    this.nextSendMobHp = new Date(0);
    this.nextSkillUse  = new Date(0);
    this.nextRecovery  = new Date(now + GameConstants.MOB_RECOVER_TIME * 1000);
    this.removeAfter   = template.removeAfter > 0
      ? new Date(now + template.removeAfter * 1000)
      : new Date(8640000000000000); // far future
    this.nextDropItem  = template.dropItemPeriod > 0
      ? new Date(now + template.dropItemPeriod * 1000)
      : new Date(8640000000000000);
  }

  getTemplateId(): number  { return this.template.id; }
  getLevel():      number  { return this.template.level; }
  getExp():        number  { return this.template.exp; }
  getMaxHp():      number  { return this.template.maxHp; }
  getMaxMp():      number  { return this.template.maxMp; }
  isBoss():        boolean { return this.template.boss; }
  getMobStat():    MobStat { return this.mobStat; }

  getAttack(index: number): MobAttack | undefined { return this.template.getAttack(index); }
  getSkill(skillId: number): MobSkill | undefined { return this.template.getSkill(skillId); }

  getHp(): number  { return this._hp; }
  getMp(): number  { return this._mp; }
  setHp(hp: number): void { this._hp = Math.max(0, hp); }
  setMp(mp: number): void { this._mp = Math.max(0, mp); }

  getController(): any  { return this._controller; }
  setController(c: any): void { this._controller = c; }
  hasController(): boolean    { return this._controller !== null; }

  getDamageDone(): Map<number, number> { return this.damageDone; }

  addDamage(charId: number, damage: number): void {
    this.damageDone.set(charId, (this.damageDone.get(charId) ?? 0) + damage);
  }

  /** Port of kinoko's Mob::damage. Clamps to remaining HP and updates tracking. */
  damage(charId: number, totalDamage: number): void {
    const actualDamage = Math.min(this._hp, totalDamage);
    this.addDamage(charId, actualDamage);
    this._hp = Math.max(0, this._hp - actualDamage);
  }

  isDead(): boolean { return this._hp <= 0; }

/**
 * Port of kinoko's Mob::distributeExp (#17). Party-based exp split, the
 * HolySymbol bonus, and full party-exp-split (level-based distribution) are
 * cut - the Dice CharacterTemporaryStat bonus is applied via SecondaryStat
 * .getDiceInfo(), and full party-exp-split is not yet ported.
 * Quest-progress-on-kill is wired via QuestProvider.progressQuest.
 */
distributeExp(): void {
    const field = this.getField();
    if (!field) return;
    const totalExp = this.getExp();
    const mobId = this.getTemplateId();
    for (const [charId, damage] of this.damageDone) {
      const user = field.getUserPool().getById(charId);
      if (!user) continue;
      if (user.getField() !== field) continue;

      let exp = Math.floor(damage / this.getMaxHp() * totalExp);
      const partySize = field.getUserPool().getPartyMembers(user.getPartyId()).length;
      const partyBonus = GameConstants.getPartyBonusExp(exp, partySize);

      if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.ExpBuffRate)) {
        const multiplier = user.getSecondaryStat().getOption(CharacterTemporaryStat.ExpBuffRate).nOption / 100;
        exp = Math.floor(exp * multiplier);
      }
      // Dice expR bonus (port of kinoko Mob::distributeExp Dice branch)
      if (user.getSecondaryStat().hasOption(CharacterTemporaryStat.Dice)) {
        const expR = user.getSecondaryStat().getDiceInfo().getInfoArray()[17];
        if (expR > 0) {
          const multiplier = (expR + 100) / 100;
          exp = Math.floor(exp * multiplier);
          // partyBonus would also scale; left unchanged here to match the
          // existing simplified distributeExp (no per-party-member loop).
        }
      }

      if (exp + partyBonus > 0) {
        user.addExp(exp + partyBonus);
        user.write(MessagePacket.incExp(exp, partyBonus, false, false));
      }

      // Quest progress on kill
      for (const qr of user.getQuestManager().getStartedQuests()) {
        const questInfo = QuestProvider.getQuestInfo(qr.questId);
        if (!questInfo) continue;
        const result = questInfo.progressQuest(qr, mobId);
        if (result) {
          user.write(MessagePacket.questRecord(result));
        }
      }
    }
  }

  /**
   * Port of kinoko's Mob::spawnRevives (#17). Uses setTimeout in place of
   * ServerExecutor.schedule (no scheduling primitive ported yet).
   */
  spawnRevives(delay: number): void {
    if (this.template.revives.length === 0) return;
    const field = this.getField();
    if (!field) return;
    const x = this.getX();
    const y = this.getY();
    const fh = this.getFoothold();
    const left = this.isLeft();
    setTimeout(() => {
      for (const reviveId of this.template.revives) {
        const reviveTemplate = MobProvider.getMobTemplate(reviveId);
        if (!reviveTemplate) continue;
        const reviveMob = new Mob(reviveTemplate, null, x, y, fh);
        reviveMob.setLeft(left);
        reviveMob.summonType = MobAppearType.REVIVED;
        field.getMobPool().addMob(reviveMob);
        // OG: broadcast mobEnterField so clients see the revived mob
        field.broadcastPacket(MobPacket.mobEnterField(reviveMob));
      }
    }, this.template.reviveDelay + delay);
  }

  /**
   * Port of kinoko's Mob::dropRewards. Party ownership and quest visibility
   * are still cut because party/QuestProvider are not ported yet.
   */
  dropRewards(lastAttacker: User, delay: number): void {
    const field = this.getField();
    if (!field) return;

    let owner = lastAttacker;
    const sortedDamage = [...this.damageDone.entries()].sort((a, b) => b[1] - a[1]);
    for (const [charId] of sortedDamage) {
      const candidate = field.getUserPool().getById(charId);
      if (candidate) {
        owner = candidate;
        break;
      }
    }

    const drops: Drop[] = [];
    for (const reward of RewardProvider.getMobRewards(this.getTemplateId())) {
      const drop = this.createDrop(owner, reward);
      if (drop) drops.push(drop);
    }
    if (drops.length > 0) {
      field.getDropPool().addDrops(drops, DropEnterType.CREATE, this.getX(), this.getY() - GameConstants.DROP_HEIGHT, delay, 0);
    }
  }

  createDrop(owner: User, reward: Reward): Drop | null {
    const field = this.getField();
    if (!field) return null;
    if (reward.isFieldRequirement() && reward.fieldId !== field.getFieldId()) {
      return null;
    }

    let probability = reward.prob * RatesManager.dropRate;
    if (owner.getSecondaryStat().hasOption(CharacterTemporaryStat.ItemUpByItem)) {
      probability *= (owner.getSecondaryStat().getOption(CharacterTemporaryStat.ItemUpByItem).nOption + 100) / 100;
    }
    if (this.mobStat.hasOption(MobTemporaryStat.Showdown) && this.mobStat.getOption(MobTemporaryStat.Showdown).rOption !== 33121005) {
      probability *= (this.mobStat.getOption(MobTemporaryStat.Showdown).nOption + 100) / 100;
    }
    if (!Util.succeedDouble(probability)) {
      return null;
    }

    if (reward.isMoney()) {
      let money = Util.getRandom(reward.min, reward.max);
      money = Math.floor(money * RatesManager.mesoRate);
      if (money <= 0) return null;
      if (owner.getSkillLevel(4100001) > 0) {
        money = Math.floor(money * (owner.getSkillStatValue(4100001, SkillStat.mesoR) + 100) / 100);
      }
      if (owner.getSecondaryStat().hasOption(CharacterTemporaryStat.MesoUp)) {
        money = Math.floor(money * owner.getSecondaryStat().getOption(CharacterTemporaryStat.MesoUp).nOption / 100);
      }
      if (owner.getSecondaryStat().hasOption(CharacterTemporaryStat.MesoUpByItem)) {
        money = Math.floor(money * (owner.getSecondaryStat().getOption(CharacterTemporaryStat.MesoUpByItem).nOption + 100) / 100);
      }
      return Drop.money(DropOwnType.USEROWN, this, money, owner.getCharacterId());
    }

    const itemInfo = ItemProvider.getItemInfo(reward.itemId);
    if (!itemInfo) return null;
    const quantity = Util.getRandom(reward.min, reward.max);
    const item = itemInfo.createItem(owner.getNextItemSn(), quantity, ItemVariationOption.NORMAL);
    return Drop.item(DropOwnType.USEROWN, this, item, owner.getCharacterId(), reward.questId);
  }

  /** CMob::SetTemporaryStat next-skill cooltime check. */
  hasSkillCooltime(skillId: number): boolean {
    const exp = this.skillCooltimes.get(skillId);
    return exp !== undefined && exp > new Date();
  }

  setSkillCooltime(skillId: number, expiry: Date): void {
    this.skillCooltimes.set(skillId, expiry);
  }

  /** Mob::canUseSkill — cooltime only; SkillProvider hp/mpCon checks deferred (no SkillProvider mob-skill table ported yet). */
  canUseSkill(mobSkill: MobSkill): boolean {
    return !this.hasSkillCooltime(mobSkill.skillId);
  }

  /** Mob::getNextSkill — simplified: skips Seal/cooltime check, picks random available skill. */
  getNextSkill(): MobSkill | undefined {
    if (this.mobStat.hasOption(MobTemporaryStat.Seal)) return undefined;
    if (this.nextSkillUse > new Date()) return undefined;
    const available = [...this.template.skills.values()].filter((s) => this.canUseSkill(s));
    return Util.getRandomFromCollection(available);
  }

  recover(): void {
    if (this._hp > 0) this._hp = Math.min(this._hp + this.template.hpRecovery, this.template.maxHp);
    if (this._mp > 0) this._mp = Math.min(this._mp + this.template.mpRecovery, this.template.maxMp);
    this.nextRecovery = new Date(Date.now() + GameConstants.MOB_RECOVER_TIME * 1000);
  }

  isDamagedByMob(): boolean { return this.template.damagedByMob; }
  getSwallowCharacterId(): number { return this.swallowCharacterId; }

  isSlowUsed(): boolean { return this.slowUsed; }
  setSlowUsed(v: boolean): void { this.slowUsed = v; }

  getDamagedElemAttr(): Map<ElementAttribute, DamagedAttribute> { return this.template.damagedElemAttr; }

  getBurnedInfo(skillId: number): BurnedInfo | undefined { return this.mobStat.getBurnedInfos().get(skillId); }
  getBurnedInfos(): Map<number, BurnedInfo> { return this.mobStat.getBurnedInfos(); }

  /** Mob::setBurnedInfo */
  setBurnedInfo(burnedInfo: BurnedInfo, delay = 0): void {
    this.mobStat.addBurnedInfo(burnedInfo);
    this.setTemporaryStat(MobTemporaryStat.Burned, MobStatOption.of(1, burnedInfo.skillId, 0), delay);
  }

  /** Port of kinoko's Mob::steal - picks a random reward and drops it (once per mob). */
  steal(attacker: User): void {
    if (this.stolenReward) return;
    const rewards = RewardProvider.getMobRewards(this.getTemplateId());
    const reward = Util.getRandomFromCollection(rewards, (r) => r.prob);
    if (!reward) return;
    const drop = this.createDrop(attacker, reward);
    if (drop) {
      this.getField()?.getDropPool().addDrop(drop, DropEnterType.CREATE, this.getX(), this.getY() - GameConstants.DROP_HEIGHT, 0);
      this.stolenReward = reward;
    }
  }

  resetDropItemPeriod(): void {
    if (this.template.dropItemPeriod > 0) {
      this.nextDropItem = new Date(Date.now() + this.template.dropItemPeriod * 1000);
    }
  }

  /** Mob::heal — heals and broadcasts a negative-damage indicator. */
  heal(hp: number): void {
    this.setHp(Math.min(this.getHp() + hp, this.getMaxHp()));
    this.getField()?.broadcastPacket(MobPacket.mobDamaged(this, -hp));
  }

  /** Mob::setTemporaryStat (single-stat overload) */
  setTemporaryStat(mts: MobTemporaryStat, option: MobStatOption, delay?: number): void;
  /** Mob::setTemporaryStat */
  setTemporaryStat(setStats: Map<MobTemporaryStat, MobStatOption>, delay?: number): void;
  /** Mob::setTemporaryStat (combined with BurnedInfo, e.g. Magician PARALYZE) */
  setTemporaryStat(setStats: Map<MobTemporaryStat, MobStatOption>, burnedInfo: BurnedInfo, delay?: number): void;
  setTemporaryStat(
    arg: MobTemporaryStat | Map<MobTemporaryStat, MobStatOption>,
    optionOrBurnedOrDelay?: MobStatOption | BurnedInfo | number,
    maybeDelay = 0,
  ): void {
    let setStats: Map<MobTemporaryStat, MobStatOption>;
    let delay: number;
    if (arg instanceof Map) {
      if (optionOrBurnedOrDelay instanceof BurnedInfo) {
        setStats = new Map(arg);
        setStats.set(MobTemporaryStat.Burned, MobStatOption.of(1, optionOrBurnedOrDelay.skillId, 0));
        this.mobStat.addBurnedInfo(optionOrBurnedOrDelay);
        delay = maybeDelay;
      } else {
        setStats = arg;
        delay = (optionOrBurnedOrDelay as number | undefined) ?? 0;
      }
    } else {
      setStats = new Map([[arg, optionOrBurnedOrDelay as MobStatOption]]);
      delay = maybeDelay;
    }
    for (const [mts, opt] of setStats) {
      this.mobStat.getTemporaryStats().set(mts, opt);
    }
    const flag = BitFlag.from(setStats.keys(), MOB_TEMPORARY_STAT_FLAG_SIZE);
    if (!flag.isEmpty()) {
      this.getField()?.broadcastPacket(MobPacket.mobStatSet(this, this.mobStat, flag, delay));
    }
  }

  /** Mob::resetTemporaryStat */
  resetTemporaryStat(predicate: (mts: MobTemporaryStat, opt: MobStatOption) => boolean): void {
    const removed = this.mobStat.resetTemporaryStat(predicate);
    const flag = BitFlag.from(removed, MOB_TEMPORARY_STAT_FLAG_SIZE);
    if (!flag.isEmpty()) {
      this.getField()?.broadcastPacket(MobPacket.mobStatReset(this, flag));
    }
  }

  resetTemporaryStatBySet(stats: Set<MobTemporaryStat>): void {
    this.resetTemporaryStat((mts) => stats.has(mts));
  }

  /** CMob::Init */
  encode(w: PacketWriter): void {
    w.writeShort(this.getX()); // ptPosPrev.x
    w.writeShort(this.getY()); // ptPosPrev.y
    w.writeByte(this.getMoveAction()); // nMoveAction
    w.writeShort(this.getFoothold()); // current foothold
    w.writeShort(this.startFoothold);
    w.writeByte(this.summonType); // nAppearType
    if (this.summonType === MobAppearType.REVIVED || this.summonType >= 0) {
      w.writeInt(0); // dwOption
    }
    w.writeByte(0); // nTeamForMCarnival
    w.writeInt(0); // nEffectItemID
    w.writeInt(0); // nPhase
  }
}
