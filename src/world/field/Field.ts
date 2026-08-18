import { MapInfo } from '../../provider/map/MapInfo';
import { LifeInfo } from '../../provider/map/LifeInfo';
import { LifeType } from '../../provider/map/LifeType';
import { PortalInfo } from '../../provider/map/PortalInfo';
import { PortalType } from '../../provider/map/PortalType';
import { ReactorInfo } from '../../provider/map/ReactorInfo';
import { NpcProvider } from '../../provider/NpcProvider';
import { MobProvider } from '../../provider/MobProvider';
import { ReactorProvider } from '../../provider/ReactorProvider';
import { MapProvider } from '../../provider/MapProvider';
import { FieldOption } from '../../provider/map/FieldOption';
import { GameConstants } from '../GameConstants';
import { Util } from '../../util/Util';
import { UserPool } from './UserPool';
import { MobPool } from './mob/MobPool';
import { MobLeaveType } from './mob/MobLeaveType';
import { MobSpawnPoint } from './mob/MobSpawnPoint';
import { Mob } from './mob/Mob';
import { MobPacket } from './mob/MobPacket';
import { NpcPool } from './npc/NpcPool';
import { Npc } from './npc/Npc';
import { DropPool } from './drop/DropPool';
import { Drop } from './drop/Drop';
import { ReactorPool } from './reactor/ReactorPool';
import { Reactor } from './reactor/Reactor';
import { SkillProcessor } from '../skill/SkillProcessor';
import { SummonedPool } from './summoned/SummonedPool';
import { AffectedAreaPool } from './AffectedAreaPool';
import { TownPortalPool } from './townportal/TownPortalPool';
import { FieldEffectPacket } from './FieldEffectPacket';
import { ClockPacket } from './ClockPacket';
import { CashItemPacket } from '../item/CashItemPacket';
import { MiniRoomPool } from './MiniRoomPool';
import { WeatherEffect } from './WeatherEffect';
import { MapleTvMessage } from './MapleTvMessage';
import { MapleTvPacket } from './MapleTvPacket';

export class Field {
  private static fieldCounter = 1;
  private readonly executorIndex: number;
  private fieldObjectCounter = 1;

  readonly userPool:    UserPool;
  readonly mobPool:     MobPool;
  readonly npcPool:     NpcPool;
  readonly dropPool:    DropPool;
  readonly reactorPool: ReactorPool;
  readonly summonedPool: SummonedPool;
  readonly affectedAreaPool: AffectedAreaPool;
  readonly townPortalPool: TownPortalPool;
  readonly miniRoomPool: MiniRoomPool;

  private nextMobRespawn:    Date = new Date(0);
  private nextDropExpire:    Date = new Date(0);
  private nextReactorExpire: Date = new Date(0);

  // Track whether onFirstUserEnter has been executed for this field
  private _firstEnterScriptRun = false;

  // Maple TV message queue (port of kinoko Field mapleTvQueue)
  private readonly mapleTvQueue: MapleTvMessage[] = [];

  // Active weather cash-item effect (port of kinoko Field weatherEffect)
  private weatherEffect: WeatherEffect | null = null;

  private tickHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    public readonly mapInfo: MapInfo,
    public readonly fieldStorage: any = null, // FieldStorage (forward ref)
  ) {
    this.executorIndex = Field.fieldCounter++;
    this.userPool     = new UserPool(this);
    this.mobPool      = new MobPool(this);
    this.npcPool      = new NpcPool(this);
    this.dropPool     = new DropPool(this);
    this.reactorPool  = new ReactorPool(this);
    this.summonedPool = new SummonedPool(this);
    this.affectedAreaPool = new AffectedAreaPool(this);
    this.townPortalPool = new TownPortalPool(this);
    this.miniRoomPool = new MiniRoomPool(this);
    this.initSpawnPoints();
    this.initNpcs();
    this.initReactors();
  }

  getFieldId():   number  { return this.mapInfo.mapId; }
  getMapId():     number  { return this.mapInfo.mapId; }
  getFieldCrc():  number  { return this.mapInfo.fieldCrc; }
  getMapInfo():   MapInfo { return this.mapInfo; }
  getReturnMap(): number  { return this.mapInfo.returnMap; }
  getFieldStorage(): any  { return this.fieldStorage; }

  /** Returns true only once — the first time it's called (for onFirstUserEnter). */
  consumeFirstEnterScript(): boolean {
    if (this._firstEnterScriptRun) return false;
    this._firstEnterScriptRun = true;
    return true;
  }

  // open gate storage (Thief gate skill)
  private readonly _openGates = new Map<number, { targetFieldId: number; targetPortalName: string }>();

  getOpenGate(objectId: number): { targetFieldId: number; targetPortalName: string } | undefined {
    return this._openGates.get(objectId);
  }
  addOpenGate(objectId: number, gate: { targetFieldId: number; targetPortalName: string }): void {
    this._openGates.set(objectId, gate);
  }
  removeOpenGate(objectId: number): void { this._openGates.delete(objectId); }

  getPortalById(id: number): PortalInfo | undefined { return this.mapInfo.getPortalById(id); }
  getPortalByName(name: string): PortalInfo | undefined { return this.mapInfo.getPortalByName(name); }
  hasFieldOption(opt: FieldOption): boolean { return this.mapInfo.hasFieldOption(opt); }
  isConnected(targetFieldId: number): boolean { return MapProvider.isConnected(this.getFieldId(), targetFieldId); }
  getRandomStartPoint(): PortalInfo | undefined {
    const startPoints = this.mapInfo.portalInfos.filter((pi) => pi.portalType === PortalType.STARTPOINT);
    return Util.getRandomFromCollection(startPoints) ?? this.getPortalById(0);
  }
  getMobPool():   MobPool { return this.mobPool; }
  getNpcPool():   NpcPool { return this.npcPool; }
  getDropPool():  DropPool { return this.dropPool; }
  getReactorPool(): ReactorPool { return this.reactorPool; }
  getSummonedPool(): SummonedPool { return this.summonedPool; }
  getAffectedAreaPool(): AffectedAreaPool { return this.affectedAreaPool; }
  getTownPortalPool(): TownPortalPool { return this.townPortalPool; }
  getMiniRoomPool(): MiniRoomPool { return this.miniRoomPool; }
  getUserPool():  UserPool { return this.userPool; }

  nextId(): number { return this.fieldObjectCounter++; }

  start(tickMs = 1000): void {
    if (this.tickHandle) return;
    this.tickHandle = setInterval(() => this.update(), tickMs);
  }

  stop(): void {
    if (this.tickHandle) { clearInterval(this.tickHandle); this.tickHandle = null; }
  }

  private update(): void {
    const now = new Date();
    // Mob respawn
    if (now >= this.nextMobRespawn) {
      const spawned = this.mobPool.tryRespawn(now);
      for (const mob of spawned) {
        this.broadcastPacket(MobPacket.mobEnterField(mob));
        // Assign mob controller to nearest user (port of kinoko MobPool::onMobEnterField)
        this.userPool.assignController(mob);
      }
      this.nextMobRespawn = new Date(now.getTime() + GameConstants.MOB_RESPAWN_TIME * 1000);
    }
    // OG: mob recovery, HP indicator, timed removal
    const mobsToExpire: Mob[] = [];
    for (const mob of this.mobPool.getAll()) {
      if (mob.isDead()) continue;
      // Recovery — heal HP/MP over time
      if (now >= mob.nextRecovery) {
        mob.recover();
      }
      // HP indicator — send periodically for damagedByMob mobs
      if (mob.isDamagedByMob() && now >= mob.nextSendMobHp) {
        const pct = Math.floor((mob.getHp() / mob.getMaxHp()) * 100);
        this.broadcastPacket(MobPacket.mobHpIndicator(mob, pct));
        mob.nextSendMobHp = new Date(now.getTime() + GameConstants.MOB_HP_TAG_INTERVAL * 1000);
      }
      // Timed removal — removeAfter check
      if (now >= mob.removeAfter) {
        mobsToExpire.push(mob);
      }
    }
    for (const mob of mobsToExpire) {
      this.mobPool.removeMob(mob, MobLeaveType.ETC);
    }
    // Drop expiry
    if (now >= this.nextDropExpire) {
      this.dropPool.expireDrops(now);
      this.nextDropExpire = new Date(now.getTime() + GameConstants.DROP_EXPIRE_INTERVAL * 1000);
    }
    // Per-user buff ticks (Recovery/DragonBlood/Infinity/MissileTank)
    for (const user of this.userPool.getAll()) {
      SkillProcessor.processUpdate(user, now);
      user.processPets(now);
      // Expire town portal (Mystic Door) - mirrors kinoko UserPool tick
      const townPortal = user.getTownPortal();
      if (townPortal && townPortal.expireTime <= now) {
        townPortal.destroy();
        user.setTownPortal(null);
      }
    }
    this.summonedPool.expireSummoned(now);
    this.summonedPool.updateSummoned(now);
    this.affectedAreaPool.updateAffectedAreas(now);
    this.miniRoomPool.updateMiniRooms();
    // Handle maple tv queue (port of kinoko Field::update)
    if (this.mapleTvQueue.length > 0) {
      if (now > this.mapleTvQueue[0].expireTime) {
        this.mapleTvQueue.shift();
        if (this.mapleTvQueue.length === 0) {
          this.broadcastPacket(MapleTvPacket.clearMessage());
        } else {
          const last = this.mapleTvQueue[this.mapleTvQueue.length - 1];
          const totalWaitTime = Math.max(Math.floor((last.expireTime.getTime() - now.getTime()) / 1000), 0);
          this.broadcastPacket(MapleTvPacket.updateMessage(this.mapleTvQueue[0], totalWaitTime));
        }
      }
    }
    // Handle weather effect (port of kinoko Field::update)
    if (this.weatherEffect) {
      if (now > this.weatherEffect.expireTime) {
        this.broadcastPacket(CashItemPacket.blowWeather(0, ''));
        this.weatherEffect = null;
      }
    }
  }

  // ---- init ----------------------------------------------------------

  private initSpawnPoints(): void {
    for (const li of this.mapInfo.lifeInfos) {
      if (li.lifeType !== LifeType.MOB) continue;
      const sp = new MobSpawnPoint(this, li.templateId, li.x, li.y, li.fh, li.mobTime);
      this.mobPool.addSpawnPoint(sp);
    }
  }

  private initNpcs(): void {
    for (const li of this.mapInfo.lifeInfos) {
      if (li.lifeType !== LifeType.NPC) continue;
      const template = NpcProvider.getNpcTemplate(li.templateId);
      if (!template) continue;
      const npc = new Npc(template, li.x, li.y, li.rx0, li.rx1, li.fh, li.flip);
      npc.setField(this);
      npc.setId(this.nextId());
      this.npcPool.addNpc(npc);
    }
  }

  private initReactors(): void {
    for (const ri of this.mapInfo.reactorInfos) {
      const template = ReactorProvider.getReactorTemplate(ri.templateId);
      if (!template) continue;
      const reactor = new Reactor(template, ri);
      this.reactorPool.addReactor(reactor);
    }
  }

  // ---- broadcast -------------------------------------------------------

  /** Port of kinoko's Field::broadcastPacket. */
  broadcastPacket(packet: Buffer, except?: { getCharacterId(): number }): void {
    for (const user of this.userPool.getAll()) {
      if (except && user.getCharacterId() === except.getCharacterId()) continue;
      user.write(packet);
    }
  }

  hasUser(): boolean { return !this.userPool.isEmpty(); }

  /** Port of kinoko's Field::reset - re-populates mobs/npcs/reactors from MapInfo. */
  reset(): void {
    this.mobPool.clear();
    this.mobPool.clearSpawnPoints();
    this.npcPool.clear();
    this.dropPool.clear();
    this.reactorPool.clear();
    this.summonedPool.clear();
    this.affectedAreaPool.clear();
    this.townPortalPool.clear();
    this.miniRoomPool.clear();
    this.mapleTvQueue.length = 0;
    this.weatherEffect = null;
    this.initSpawnPoints();
    this.initNpcs();
    this.initReactors();
  }

  // ---- drop helpers --------------------------------------------------

  addDrop(drop: Drop, x: number, y: number): void {
    drop.setX(x);
    drop.setY(y);
    drop.setId(this.nextId());
    drop.setField(this);
    this.dropPool.addDrop(drop);
  }

  // ---- field effect helpers -------------------------------------------

  /**
   * Port of kinoko's Field::blowWeather. Broadcasts the weather effect
   * and tracks it for tick-based expiry and re-send on user enter.
   * `durationSec` > 0 activates the WeatherEffect; <= 0 broadcasts only.
   */
  blowWeather(itemId: number, message?: string, durationSec?: number): void {
    this.broadcastPacket(CashItemPacket.blowWeather(itemId, message));
    if (durationSec && durationSec > 0) {
      this.weatherEffect = new WeatherEffect(itemId, message ?? '', new Date(Date.now() + durationSec * 1000));
    }
  }

  /** Returns the active weather effect, if any (port of kinoko Field). */
  getWeatherEffect(): WeatherEffect | null { return this.weatherEffect; }

  /** Returns the Maple TV message queue (port of kinoko Field::getMapleTvQueue). */
  getMapleTvQueue(): MapleTvMessage[] { return this.mapleTvQueue; }

  /** Port of kinoko's Field::broadcastChangeBgm. */
  broadcastChangeBgm(bgmPath: string, fade = false): void {
    this.broadcastPacket(FieldEffectPacket.changeBGM(bgmPath, fade));
  }

  /** Port of kinoko's Field::setMobSpawn — toggles whether mobs respawn. */
  setMobSpawn(enabled: boolean): void {
    if (enabled) {
      this.nextMobRespawn = new Date();
    } else {
      this.nextMobRespawn = new Date(8640000000000000); // far future
    }
  }

  /** Sends a countdown timer to all users in the field. */
  broadcastClock(seconds: number): void {
    this.broadcastPacket(ClockPacket.timeClock(seconds));
  }

  /** Removes any active clock from the HUD for all users. */
  destroyClock(): void {
    this.broadcastPacket(ClockPacket.destroyClock());
  }
}
