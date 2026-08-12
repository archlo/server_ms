import { WorkerServer } from '../workerServer';
import { ServerType } from '../baseServer';
import { Session } from '../session';
import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { AES } from '../../protocol/crypto/aes';
import { EncryptedSession } from '../../protocol/crypto/encryptedSession';
import { Shanda } from '../../protocol/crypto/shanda';
import { Config } from '../../util/config';
import { MapleRecvOpcode } from '../../protocol/opcodes/maple/recv';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { ChannelSendOpcode } from '../../protocol/opcodes/channel/send';
import { CenterSendOpcode } from '../../protocol/opcodes/center/send';
import { CommonSendOpcode } from '../../protocol/opcodes/common/send';
import { LoginSendOpcode } from '../../protocol/opcodes/login/send';
import { FieldStorage } from '../field/FieldStorage';
import { EventManager } from '../event/EventManager';
import { CharacterData } from '../../world/user/CharacterData';
import { CharacterDB } from './db/CharacterDB';
import { MemoDB } from './db/MemoDB';
import { GuildDB } from './db/GuildDB';
import { User } from '../../world/user/User';
import { Dragon } from '../../world/user/Dragon';
import { JobConstants } from '../../world/job/JobConstants';
import { StagePacket } from '../../world/field/StagePacket';
import { PortalInfo } from '../../provider/map/PortalInfo';
import { ScriptManager } from '../../world/script/ScriptManager';
import { NpcScriptRegistry } from '../../world/script/NpcScriptRegistry';
import '../../world/script/npc';
import { ScriptAnswer } from '../../world/script/ScriptAnswer';
import { ScriptMessageType } from '../../world/script/ScriptMessageType';
import { UserHandler } from '../../world/user/UserHandler';
import { AttackHandler } from '../../world/field/AttackHandler';
import { HitHandler } from '../../world/field/HitHandler';
import { SkillHandler } from '../../world/field/SkillHandler';
import { FieldHandler } from '../../world/field/FieldHandler';
import { MigrationHandler } from '../../world/field/MigrationHandler';
import { MobHandler } from '../../world/field/mob/MobHandler';
import { ItemHandler } from '../../world/item/ItemHandler';
import { CashItemHandler } from '../../world/item/CashItemHandler';
import { SkillResetHandler } from '../../world/item/SkillResetHandler';
import { UpgradeItemHandler } from '../../world/item/UpgradeItemHandler';
import { GoldHammerHandler } from '../../world/item/GoldHammerHandler';
import { MapleTvHandler } from '../../world/MapleTvHandler';
import { inventoryOperation } from '../../world/item/ItemPacket';
import { MessagePacket } from '../../world/user/MessagePacket';
import { SummonedHandler } from '../../world/field/summoned/SummonedHandler';
import { PetHandler } from '../../world/user/PetHandler';
import { NpcHandler } from '../../world/field/npc/NpcHandler';

import { ShopProvider } from '../../provider/ShopProvider';
import { MapProvider } from '../../provider/MapProvider';
import { MobProvider } from '../../provider/MobProvider';
import { ItemProvider } from '../../provider/ItemProvider';
import { SkillProvider } from '../../provider/SkillProvider';
import { NpcProvider } from '../../provider/NpcProvider';
import { StringProvider } from '../../provider/StringProvider';
import { ReactorProvider } from '../../provider/ReactorProvider';
import { QuestProvider } from '../../provider/QuestProvider';
import { RewardProvider } from '../../provider/RewardProvider';
import { registerAllJobHandlers } from '../../world/skill/job/index';
import { ShopDialog, openShopDialog } from '../../server/dialog/shop/ShopDialog';
import { TrunkDialog, openTrunkDialog } from '../../server/dialog/trunk/TrunkDialog';
import { AccountDB } from '../center/db/account';
import { PartyHandler } from '../../world/party/PartyHandler';
import { QuestHandler } from '../../world/quest/QuestHandler';
import { SocialHandler } from '../../world/social/SocialHandler';
import { FriendHandler } from '../../world/friend/FriendHandler';
import { MessengerHandler } from '../../world/messenger/MessengerHandler';
import { GuildHandler } from '../../world/guild/GuildHandler';
import { GuildManager } from '../../world/guild/GuildManager';
import { Guild } from '../../world/guild/Guild';
import { AllianceManager } from '../../world/alliance/AllianceManager';
import { RatesManager } from '../../world/RatesManager';
import { MiniRoomHandler } from '../../world/miniroom/MiniRoomHandler';
import { ClientHandler } from '../../world/ClientHandler';
import { MakerHandler } from '../../world/item/MakerHandler';
import { BroadcastHandler } from '../../world/BroadcastHandler';
import { RepairHandler } from '../../world/item/RepairHandler';

const CHANNEL_VERSION = 95;

export class ChannelServer extends WorkerServer {
  static instance: ChannelServer;

  readonly fieldStorage = new FieldStorage();
  readonly eventManager = new EventManager();

  // active client sessions: sessionId -> { encSession, charData, user }
  private readonly clientSessions = new Map<number, {
    enc: EncryptedSession;
    charData: CharacterData | null;
    user: User | null;
  }>();

  // characters waiting to enter channel (migration token -> charData)
  private readonly migrationStore = new Map<number, CharacterData>();

  // global user registry for party system
  readonly userRegistry = new Map<number, User>();
  private readonly userNameMap = new Map<string, number>();
  private partyIdCounter = 1;

  nextPartyId(): number { return this.partyIdCounter++; }

  getUserByCharacterId(charId: number): User | undefined {
    return this.userRegistry.get(charId);
  }

  getUserByCharacterName(name: string): User | undefined {
    const charId = this.userNameMap.get(name.toLowerCase());
    if (charId === undefined) return undefined;
    return this.userRegistry.get(charId);
  }

  constructor() {
    super(ServerType.CHANNEL, Config.instance.channel.host, Config.instance.channel.port);
    this.packetDelegator = null as any; // channel uses inline dispatch for now
    ChannelServer.instance = this;
    new GuildManager();
    new AllianceManager();
  }

  // ---- WorkerServer hooks -----------------------------------------

  onStart(): void {
    MapProvider.initialize(CHANNEL_VERSION);
    MobProvider.initialize();
    ItemProvider.initialize();
    SkillProvider.initialize();
    NpcProvider.initialize();
    StringProvider.initialize();
    ReactorProvider.initialize();
    QuestProvider.initialize();
    RewardProvider.initialize();
    RatesManager.initialize();
    this.eventManager.initialize(this.fieldStorage);

    registerAllJobHandlers();

    // Restore persisted guilds into the in-memory GuildManager.
    GuildDB.loadAllGuilds().then(guilds => {
      let maxId = 0;
      for (const guild of guilds) {
        GuildManager.instance.addGuild(guild);
        if (guild.guildId > maxId) maxId = guild.guildId;
      }
      GuildManager.instance.setGuildIdCounter(maxId);
      if (guilds.length > 0) {
        this.logger.info(`Loaded ${guilds.length} guild(s) from database`);
      }
    }).catch(err => {
      this.logger.error(`Failed to load guilds: ${err?.message}`);
    });

    this.logger.info(`ChannelServer started on port ${this.port}`);
  }

  onShutdown(): void {
    // Flush all in-memory guilds to the database before shutting down.
    const gm = GuildManager.instance as any;
    if (gm && gm.guilds) {
      for (const guild of gm.guilds.values() as Iterable<Guild>) {
        GuildDB.saveGuild(guild).catch(err =>
          this.logger.error(`save failed for guild ${guild.guildId}: ${err?.message}`),
        );
      }
    }
    this.eventManager.shutdown();
    this.fieldStorage.clear();
    this.logger.info('ChannelServer shut down');
  }

  onConnection(session: Session): void {
    if (this.isCenterServer(session)) {
      this.connected = true;
      this.logger.info('ChannelServer connected to CenterServer');
      return;
    }
    this.logger.info(`Channel client connected: session ${session.id}`);
    const ivRecv = Buffer.from([70, 114, Math.round(Math.random() * 127), 82]);
    const ivSend = Buffer.from([0x52, 0x30, 0x78, 0x61]);
    const enc = new EncryptedSession(
      session,
      new AES(ivSend, 0xffff - CHANNEL_VERSION),
      new AES(ivRecv, CHANNEL_VERSION),
    );
    this.clientSessions.set(session.id, { enc, charData: null, user: null });
    session.socket.write(buildHandshake(CHANNEL_VERSION, ivRecv, ivSend));
  }

  onClose(session: Session, _hadError: any): void {
    if (this.isCenterServer(session)) {
      this.connected = false;
      this.logger.error('ChannelServer lost CenterServer connection');
      return;
    }
    const entry = this.clientSessions.get(session.id);
    if (entry?.charData) {
      const cd = entry.charData;
      if (entry.user) {
        // Destroy the priest's Mystic Door portal on disconnect (port of kinoko User.logout)
        const tp = entry.user.getTownPortal();
        if (tp) {
          tp.destroy();
          entry.user.setTownPortal(null);
        }
        entry.user.getField()?.getUserPool().removeUser(entry.user);
        this.userRegistry.delete(entry.user.getCharacterId());
        this.userNameMap.delete(entry.user.getCharacterName().toLowerCase());
      }
      CharacterDB.saveCharacter(cd).catch(err =>
        this.logger.error(`save failed for char ${cd.getCharacterId()}: ${err?.message}`),
      );
    }
    this.clientSessions.delete(session.id);
    this.logger.info(`Channel client disconnected: session ${session.id}`);
  }

  /** Parse the4-byte MapleStory header to extract body length. */
  private parseHeaderLength(header: Buffer): number {
    const a = ((header[0] & 0xFF) << 8) | (header[1] & 0xFF);
    const b = ((header[2] & 0xFF) << 8) | (header[3] & 0xFF);
    const lenSwapped = a ^ b;
    return ((lenSwapped >> 8) & 0xFF) | ((lenSwapped & 0xFF) << 8);
  }

  onData(session: Session, data: Buffer): void {
    if (this.isCenterServer(session)) {
      this.handleCenterPacket(session, data);
      return;
    }
    const entry = this.clientSessions.get(session.id);
    if (!entry) return;

    // Accumulate into per-session buffer to handle TCP stream framing
    session.recvBuffer = session.recvBuffer.length > 0
      ? Buffer.concat([session.recvBuffer, data])
      : data;

    // Extract complete packets: each is 4-byte header + body
    while (session.recvBuffer.length >= 4) {
      const bodyLen = this.parseHeaderLength(session.recvBuffer);
      const packetLen = 4 + bodyLen;
      if (session.recvBuffer.length < packetLen) break; // incomplete, wait for more

      const packetData = session.recvBuffer.subarray(0, packetLen);
      session.recvBuffer = session.recvBuffer.slice(packetLen);

      const body = packetData.slice(4);
      entry.enc.recvCrypto.transform(body);
      const decrypted = Shanda.decrypt(body);
      const packet = new PacketReader(decrypted);
      const opcode = packet.readShort();
      this.handleClientPacket(session, entry, packet, opcode);
    }
  }

  onError(error: any): void {
    this.logger.error(error?.message ?? error);
  }

  // ---- packet dispatch -----------------------------------------------

  private handleCenterPacket(session: Session, data: Buffer): void {
    const packet = new PacketReader(data);
    const opcode = packet.readShort();

    // Center's WORKER_HANDSHAKE: reply with our ServerType so center registers us
    // as the channel server. Without this, channelServerSessionId stays null and
    // all migrations fail with login code 7.
    if (opcode === CenterSendOpcode.WORKER_HANDSHAKE.getValue()) {
      const serverType = packet.readByte();
      if (ServerType[serverType] === 'CENTER') {
        const w = new PacketWriter();
        w.writeShort(CommonSendOpcode.CENTER_HANDSHAKE_ACK.getValue());
        w.writeByte(ServerType.CHANNEL);
        session.socket.write(w.getPacket());
      }
      return;
    }

    if (opcode === ChannelSendOpcode.MIGRATE_IN_HANDOFF.getValue()) {
      const charId = packet.readInt();
      const _sessionId = packet.readInt();

      CharacterDB.loadCharacter(charId).then(cd => {
        if (!cd) {
          this.logger.warn(`MIGRATE_IN_HANDOFF: charId ${charId} not found in DB`);
          return;
        }
        this.registerMigration(cd);
        this.logger.info(`Registered migration for character ${charId}`);
      }).catch(err => {
        this.logger.error(`MIGRATE_IN_HANDOFF DB error for charId ${charId}: ${err?.message}`);
      });
      return;
    }

    if (opcode === CenterSendOpcode.CASH_SHOP_MIGRATE_ACK.getValue()) {
      const sessionId = packet.readInt();
      const success = packet.readBoolean();
      const entry = this.clientSessions.get(sessionId);
      if (!entry) return;
      if (success) {
        const host = packet.readMapleAsciiString();
        const port = packet.readInt();
        const w = new PacketWriter(10 + host.length);
        w.writeShort(MapleSendOpcode.MIGRATE_TO_CASH_SHOP_RESULT.getValue());
        w.writeMapleAsciiString(host);
        w.writeInt(port);
        entry.enc.write(w.getPacket());
      }
      return;
    }

    this.logger.debug(`CenterServer packet 0x${opcode.toString(16)} — not yet handled`);
  }

  private handleClientPacket(
    session: Session,
    entry:   { enc: EncryptedSession; charData: CharacterData | null; user: User | null },
    packet:  PacketReader,
    opcode:  number,
  ): void {
    this.logger.debug(`Channel opcode 0x${opcode.toString(16)} from session ${session.id}`);
    switch (opcode) {
      case MapleRecvOpcode.MIGRATE_IN.code:
        this.handlePlayerLoggedIn(session, entry, packet);
        break;
      case MapleRecvOpcode.USER_SELECT_NPC.code:
        this.handleNpcTalk(session, entry, packet);
        break;
      case MapleRecvOpcode.USER_SELECT_NPC_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, NpcHandler.handleUserSelectNpcItemUseRequest);
        break;
      case MapleRecvOpcode.USER_SCRIPT_MESSAGE_ANSWER.code:
        this.handleNpcTalkMore(session, entry, packet);
        break;
      case MapleRecvOpcode.ALIVE_ACK.code:
        break; // keepalive
      case MapleRecvOpcode.EXCEPTION_LOG.code:
        this.dispatch(entry, packet, ClientHandler.handleExceptionLog);
        break;
      case MapleRecvOpcode.CLIENT_DUMP_LOG.code:
        this.dispatch(entry, packet, ClientHandler.handleClientDumpLog);
        break;
      case MapleRecvOpcode.USER_TRANSFER_CHANNEL_REQUEST.code:
        break; // no-op (single-channel server)

      // ---- UserHandler (movement/chat/sit/stat/drop-money) ----
      case MapleRecvOpcode.USER_MOVE.code:
        this.dispatch(entry, packet, UserHandler.handleUserMove);
        break;
      case MapleRecvOpcode.USER_SIT_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserSitRequest);
        break;
      case MapleRecvOpcode.USER_PORTABLE_CHAIR_SIT_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserPortableChairSitRequest);
        break;
      case MapleRecvOpcode.USER_CHAT.code:
        this.dispatch(entry, packet, UserHandler.handleUserChat);
        break;
      case MapleRecvOpcode.USER_AD_BOARD_CLOSE.code:
        this.dispatch(entry, packet, UserHandler.handleUserAdBoardClose);
        break;
      case MapleRecvOpcode.USER_EMOTION.code:
        this.dispatch(entry, packet, UserHandler.handleUserEmotion);
        break;
      case MapleRecvOpcode.USER_ACTIVATE_EFFECT_ITEM.code:
        this.dispatch(entry, packet, UserHandler.handleUserActivateEffectItem);
        break;
      case MapleRecvOpcode.USER_UPGRADE_TOMB_EFFECT.code:
        this.dispatch(entry, packet, UserHandler.handleUserUpgradeTombEffect);
        break;
      case MapleRecvOpcode.USER_HP.code:
        this.dispatch(entry, packet, UserHandler.handleUserHp);
        break;
      case MapleRecvOpcode.USER_ABILITY_UP_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserAbilityUpRequest);
        break;
      case MapleRecvOpcode.USER_ABILITY_MASS_UP_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserAbilityMassUpRequest);
        break;
      case MapleRecvOpcode.USER_CHANGE_STAT_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserChangeStatRequest);
        break;
      case MapleRecvOpcode.USER_CHANGE_STAT_REQUEST_BY_ITEM_OPTION.code:
        this.dispatch(entry, packet, UserHandler.handleUserChangeStatRequestByItemOption);
        break;
      case MapleRecvOpcode.USER_DROP_MONEY_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserDropMoneyRequest);
        break;
      case MapleRecvOpcode.USER_GATHER_ITEM_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserGatherItemRequest);
        break;
      case MapleRecvOpcode.USER_SORT_ITEM_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserSortItemRequest);
        break;
      case MapleRecvOpcode.USER_CHANGE_SLOT_POSITION_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserChangeSlotPositionRequest);
        break;
      case MapleRecvOpcode.USER_MACRO_SYS_DATA_MODIFIED.code:
        this.dispatch(entry, packet, UserHandler.handleUserMacroSysDataModified);
        break;
      case MapleRecvOpcode.FUNC_KEY_MAPPED_MODIFIED.code:
        this.dispatch(entry, packet, UserHandler.handleFuncKeyMappedModified);
        break;
      case MapleRecvOpcode.QUICKSLOT_KEY_MAPPED_MODIFIED.code:
        this.dispatch(entry, packet, UserHandler.handleQuickslotKeyMappedModified);
        break;
      case MapleRecvOpcode.USER_PORTAL_TELEPORT_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserPortalTeleportRequest);
        break;
      case MapleRecvOpcode.USER_PORTAL_SCRIPT_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserPortalScriptRequest);
        break;
      case MapleRecvOpcode.USER_MAP_TRANSFER_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserMapTransferRequest);
        break;
      case MapleRecvOpcode.USER_ITEM_MAKE_REQUEST.code:
        this.dispatch(entry, packet, MakerHandler.handleUserItemMakeRequest);
        break;
      case MapleRecvOpcode.MEMO_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleMemoRequest);
        break;
      case MapleRecvOpcode.ENTER_TOWN_PORTAL_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleEnterTownPortalRequest);
        break;
      case MapleRecvOpcode.ENTER_OPEN_GATE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleEnterOpenGateRequest);
        break;
      case MapleRecvOpcode.TALK_TO_TUTOR.code:
        this.dispatch(entry, packet, UserHandler.handleTalkToTutor);
        break;
      case MapleRecvOpcode.USER_GIVE_POPULARITY_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserGivePopularityRequest);
        break;
      case MapleRecvOpcode.USER_CHARACTER_INFO_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserCharacterInfoRequest);
        break;
      case MapleRecvOpcode.DRAGON_MOVE.code:
        this.dispatch(entry, packet, UserHandler.handleUserDragonMove);
        break;
      case MapleRecvOpcode.PASSIVESKILL_INFO_UPDATE.code:
        this.dispatch(entry, packet, UserHandler.handlePassiveSkillInfoUpdate);
        break;
      case MapleRecvOpcode.UPDATE_SCREEN_SETTING.code:
        this.dispatch(entry, packet, UserHandler.handleUpdateScreenSetting);
        break;
      case MapleRecvOpcode.UPDATE_GM_BOARD.code:
        this.dispatch(entry, packet, UserHandler.handleUpdateGmBoard);
        break;

      // ---- AttackHandler ----
      case MapleRecvOpcode.USER_MELEE_ATTACK.code:
        this.dispatch(entry, packet, AttackHandler.handleUserMeleeAttack);
        break;
      case MapleRecvOpcode.USER_SHOOT_ATTACK.code:
        this.dispatch(entry, packet, AttackHandler.handleUserShootAttack);
        break;
      case MapleRecvOpcode.USER_MAGIC_ATTACK.code:
        this.dispatch(entry, packet, AttackHandler.handleUserMagicAttack);
        break;
      case MapleRecvOpcode.USER_BODY_ATTACK.code:
        this.dispatch(entry, packet, AttackHandler.handleUserBodyAttack);
        break;

      // ---- HitHandler ----
      case MapleRecvOpcode.USER_HIT.code:
        this.dispatch(entry, packet, HitHandler.handleUserHit);
        break;

      // ---- SkillHandler ----
      case MapleRecvOpcode.USER_SKILL_USE_REQUEST.code:
        this.dispatch(entry, packet, SkillHandler.handleUserSkillUseRequest);
        break;
      case MapleRecvOpcode.USER_SKILL_CANCEL_REQUEST.code:
        this.dispatch(entry, packet, SkillHandler.handleUserSkillCancelRequest);
        break;
      case MapleRecvOpcode.USER_SKILL_PREPARE_REQUEST.code:
        this.dispatch(entry, packet, SkillHandler.handleUserSkillPrepareRequest);
        break;
      case MapleRecvOpcode.USER_MOVING_SHOOT_ATTACK_PREPARE.code:
        this.dispatch(entry, packet, SkillHandler.handleMovingShootAttackPrepare);
        break;
      case MapleRecvOpcode.USER_EFFECT_LOCAL.code:
        this.dispatch(entry, packet, SkillHandler.handleUserEffectLocal);
        break;
      case MapleRecvOpcode.USER_CALC_DAMAGE_STAT_SET_REQUEST.code:
        this.dispatch(entry, packet, SkillHandler.handleUserCalcDamageStatSetRequest);
        break;
      case MapleRecvOpcode.USER_THROW_GRENADE.code:
        this.dispatch(entry, packet, SkillHandler.handleUserThrowGrenade);
        break;
      case MapleRecvOpcode.USER_CLIENT_TIMER_END_REQUEST.code:
        this.dispatch(entry, packet, SkillHandler.handleUserClientTimerEndRequest);
        break;
      case MapleRecvOpcode.USER_SKILL_UP_REQUEST.code:
        this.dispatch(entry, packet, SkillHandler.handleUserSkillUpRequest);
        break;

      // ---- MobHandler ----
      case MapleRecvOpcode.MOB_MOVE.code:
        this.dispatch(entry, packet, MobHandler.handleMobMove);
        break;
      case MapleRecvOpcode.MOB_APPLY_CTRL.code:
        this.dispatch(entry, packet, MobHandler.handleMobApplyCtrl);
        break;
      case MapleRecvOpcode.MOB_HIT_BY_MOB.code:
        this.dispatch(entry, packet, MobHandler.handleMobHitByMob);
        break;
      case MapleRecvOpcode.MOB_ATTACK_MOB.code:
        this.dispatch(entry, packet, MobHandler.handleMobAttackMob);
        break;
      case MapleRecvOpcode.MOB_TIME_BOMB_END.code:
        this.dispatch(entry, packet, MobHandler.handleMobTimeBombEnd);
        break;

      // ---- SummonedHandler ----
      case MapleRecvOpcode.SUMMONED_MOVE.code:
        this.dispatch(entry, packet, SummonedHandler.handleSummonedMove);
        break;
      case MapleRecvOpcode.SUMMONED_ATTACK.code:
        this.dispatch(entry, packet, SummonedHandler.handleSummonedAttack);
        break;
      case MapleRecvOpcode.SUMMONED_REMOVE.code:
        this.dispatch(entry, packet, SummonedHandler.handleSummonedRemove);
        break;
      case MapleRecvOpcode.SUMMONED_HIT.code:
        this.dispatch(entry, packet, SummonedHandler.handleSummonedHit);
        break;
      case MapleRecvOpcode.SUMMONED_SKILL.code:
        this.dispatch(entry, packet, SummonedHandler.handleSummonedSkill);
        break;

      // ---- FieldHandler ----
      case MapleRecvOpcode.DROP_PICK_UP_REQUEST.code:
        this.dispatch(entry, packet, FieldHandler.handleDropPickUpRequest);
        break;
      case MapleRecvOpcode.REACTOR_HIT.code:
        this.dispatch(entry, packet, FieldHandler.handleReactorHit);
        break;
      case MapleRecvOpcode.REACTOR_TOUCH.code:
        this.dispatch(entry, packet, FieldHandler.handleReactorTouch);
        break;
      case MapleRecvOpcode.REQUIRE_FIELD_OBSTACLE_STATUS.code:
        this.dispatch(entry, packet, FieldHandler.handleRequireFieldObstacleStatus);
        break;
      case MapleRecvOpcode.ITEM_UPGRADE_COMPLETE.code:
        this.dispatch(entry, packet, FieldHandler.handleItemUpgradeComplete);
        break;
      case MapleRecvOpcode.CONTISTATE.code:
        this.dispatch(entry, packet, FieldHandler.handleContiState);
        break;
      case MapleRecvOpcode.CANCEL_INVITE_PARTY_MATCH.code:
        this.dispatch(entry, packet, FieldHandler.handleCancelInvitePartyMatch);
        break;

      // ---- MigrationHandler ----
      case MapleRecvOpcode.USER_TRANSFER_FIELD_REQUEST.code:
        this.dispatch(entry, packet, MigrationHandler.handleUserTransferFieldRequest);
        break;
      case MapleRecvOpcode.USER_MIGRATE_TO_CASH_SHOP_REQUEST.code:
        this.handleCashShopMigrateRequest(session, entry);
        break;

      // ---- ItemHandler ----
      case MapleRecvOpcode.USER_STAT_CHANGE_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserStatChangeItemUseRequest);
        break;
      case MapleRecvOpcode.USER_STAT_CHANGE_ITEM_CANCEL_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserStatChangeItemCancelRequest);
        break;
      case MapleRecvOpcode.USER_STAT_CHANGE_BY_PORTABLE_CHAIR_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserStatChangeByPortableChairRequest);
        break;
      case MapleRecvOpcode.USER_MOB_SUMMON_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserMobSummonItemUseRequest);
        break;
      case MapleRecvOpcode.USER_SCRIPT_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserScriptItemUseRequest);
        break;
      case MapleRecvOpcode.USER_PET_FOOD_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserPetFoodItemUseRequest);
        break;
      case MapleRecvOpcode.USER_SKILL_LEARN_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserSkillLearnItemUseRequest);
        break;
      case MapleRecvOpcode.USER_LOTTERY_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserLotteryItemUseRequest);
        break;
      case MapleRecvOpcode.USER_PORTAL_SCROLL_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserPortalScrollUseRequest);
        break;
      case MapleRecvOpcode.USER_CONSUME_CASH_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, CashItemHandler.handleUserConsumeCashItemUseRequest);
        break;
      case MapleRecvOpcode.USER_SKILL_RESET_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, SkillResetHandler.handleUserSkillResetItemUseRequest);
        break;
      case MapleRecvOpcode.USER_UPGRADE_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, UpgradeItemHandler.handleUserUpgradeItemUseRequest);
        break;
      case MapleRecvOpcode.USER_HYPER_UPGRADE_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, UpgradeItemHandler.handleUserHyperUpgradeItemUseRequest);
        break;
      case MapleRecvOpcode.USER_ITEM_OPTION_UPGRADE_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, UpgradeItemHandler.handleUserItemOptionUpgradeItemUseRequest);
        break;
      case MapleRecvOpcode.USER_ITEM_RELEASE_REQUEST.code:
        this.dispatch(entry, packet, UpgradeItemHandler.handleUserItemReleaseRequest);
        break;
      case MapleRecvOpcode.USER_MAP_TRANSFER_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserMapTransferItemUseRequest);
        break;
      case MapleRecvOpcode.GOLD_HAMMER_REQUEST.code:
        this.dispatch(entry, packet, GoldHammerHandler.handleGoldHammerRequest);
        break;
      case MapleRecvOpcode.GOLD_HAMMER_COMPLETE.code:
        this.dispatch(entry, packet, GoldHammerHandler.handleGoldHammerComplete);
        break;
      case MapleRecvOpcode.USER_EXP_UP_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserExpUpItemUseRequest);
        break;
      case MapleRecvOpcode.USER_TEMP_EXP_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserTempExpUseRequest);
        break;
      case MapleRecvOpcode.USER_PAMS_SONG_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserPamsSongUseRequest);
        break;
      case MapleRecvOpcode.USER_TAMING_MOB_FOOD_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handleUserTamingMobFoodItemUseRequest);
        break;
      case MapleRecvOpcode.USER_REPAIR_DURABILITY_ALL.code:
        this.dispatch(entry, packet, RepairHandler.handleUserRepairDurabilityAll);
        break;
      case MapleRecvOpcode.USER_REPAIR_DURABILITY.code:
        this.dispatch(entry, packet, RepairHandler.handleUserRepairDurability);
        break;
      case MapleRecvOpcode.USER_ACTIVATE_PET_REQUEST.code:
        this.dispatch(entry, packet, PetHandler.handleUserActivatePetRequest);
        break;
      case MapleRecvOpcode.USER_DESTROY_PET_ITEM_REQUEST.code:
        this.dispatch(entry, packet, PetHandler.handleUserDestroyPetItemRequest);
        break;

      // ---- PetHandler ----
      case MapleRecvOpcode.PET_STAT_CHANGE_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, ItemHandler.handlePetStatChangeItemUseRequest);
        break;
      case MapleRecvOpcode.PET_INTERACTION_REQUEST.code:
        this.dispatch(entry, packet, PetHandler.handlePetInteractionRequest);
        break;
      case MapleRecvOpcode.PET_MOVE.code:
        this.dispatch(entry, packet, PetHandler.handlePetMove);
        break;
      case MapleRecvOpcode.PET_ACTION.code:
        this.dispatch(entry, packet, PetHandler.handlePetAction);
        break;
      case MapleRecvOpcode.PET_DROP_PICK_UP_REQUEST.code:
        this.dispatch(entry, packet, PetHandler.handlePetDropPickUpRequest);
        break;
      case MapleRecvOpcode.PET_UPDATE_EXCEPTION_LIST_REQUEST.code:
        this.dispatch(entry, packet, PetHandler.handlePetUpdateExceptionListRequest);
        break;

      // ---- NpcHandler ----
      case MapleRecvOpcode.NPC_MOVE.code:
        this.dispatch(entry, packet, NpcHandler.handleNpcMove);
        break;
      case MapleRecvOpcode.NPC_SPECIAL_ACTION.code:
        this.dispatch(entry, packet, NpcHandler.handleNpcSpecialAction);
        break;

      // ---- Shop/Trunk dialogs ----
      case MapleRecvOpcode.USER_SHOP_REQUEST.code:
        this.handleUserShopRequest(session, entry, packet);
        break;
      case MapleRecvOpcode.USER_TRUNK_REQUEST.code:
        this.handleUserTrunkRequest(session, entry, packet);
        break;

      // ---- Party system ----
      case MapleRecvOpcode.MINI_ROOM.code:
        this.dispatch(entry, packet, MiniRoomHandler.handleMiniRoom);
        break;

      case MapleRecvOpcode.PARTY_REQUEST.code:
        this.dispatch(entry, packet, PartyHandler.handlePartyRequest);
        break;
      case MapleRecvOpcode.PARTY_RESULT.code:
        // no-op - party result feedback from center (single-process)
        break;
      case MapleRecvOpcode.USER_PARTY_REQUEST.code:
        this.dispatch(entry, packet, PartyHandler.handlePartyResult);
        break;

      // ---- Quest system ----
      case MapleRecvOpcode.USER_QUEST_REQUEST.code:
        this.dispatch(entry, packet, QuestHandler.handleUserQuestRequest);
        break;
      case MapleRecvOpcode.USER_QUEST_RECORD_SET_STATE.code:
        this.dispatch(entry, packet, QuestHandler.handleUserQuestRecordSetState);
        break;
      case MapleRecvOpcode.QUEST_GUIDE_REQUEST.code:
        this.dispatch(entry, packet, QuestHandler.handleQuestGuideRequest);
        break;

      // ---- Social system ----
      case MapleRecvOpcode.BROADCAST_MSG.code:
        this.dispatch(entry, packet, BroadcastHandler.handleBroadcastMsg);
        break;
      case MapleRecvOpcode.GROUP_MESSAGE.code:
        this.dispatch(entry, packet, SocialHandler.handleGroupMessage);
        break;
      case MapleRecvOpcode.WHISPER.code:
        this.dispatch(entry, packet, SocialHandler.handleWhisper);
        break;
      case MapleRecvOpcode.MESSENGER.code:
        this.dispatch(entry, packet, MessengerHandler.handleMessenger);
        break;
      case MapleRecvOpcode.FRIEND_REQUEST.code:
        this.dispatch(entry, packet, FriendHandler.handleFriendRequest);
        break;

      // ---- Guild / Alliance / BBS ----
      case MapleRecvOpcode.GUILD_REQUEST.code:
        this.dispatch(entry, packet, GuildHandler.handleGuildRequest);
        break;
      case MapleRecvOpcode.GUILD_RESULT.code:
        this.dispatch(entry, packet, GuildHandler.handleGuildResult);
        break;
      case MapleRecvOpcode.ALLIANCE_REQUEST.code:
        this.dispatch(entry, packet, GuildHandler.handleAllianceRequest);
        break;
      case MapleRecvOpcode.ALLIANCE_RESULT.code:
        this.dispatch(entry, packet, GuildHandler.handleAllianceResult);
        break;
      case MapleRecvOpcode.GUILD_BBS.code:
        this.dispatch(entry, packet, GuildHandler.handleGuildBBS);
        break;
      case MapleRecvOpcode.MAPLE_TV_SEND_MESSAGE_REQUEST.code:
        this.dispatch(entry, packet, MapleTvHandler.handleMapleTvSendMessageRequest);
        break;
      case MapleRecvOpcode.MAPLE_TV_UPDATE_VIEW_COUNT.code:
        // no-op
        break;

      case MapleRecvOpcode.CASH_ITEM_GACHAPON_REQUEST.code:
        break; // no-op (cash shop scene result)

      // ---- Newly ported no-op/stub handlers ----
      case MapleRecvOpcode.USER_ATTACK_USER.code:
        this.dispatch(entry, packet, UserHandler.handleUserAttackUser);
        break;
      case MapleRecvOpcode.PREMIUM.code:
        this.dispatch(entry, packet, UserHandler.handlePremium);
        break;
      case MapleRecvOpcode.USER_BAN_MAP_BY_MOB.code:
        this.dispatch(entry, packet, UserHandler.handleUserBanMapByMob);
        break;
      case MapleRecvOpcode.USER_MONSTER_BOOK_SET_COVER.code:
        this.dispatch(entry, packet, UserHandler.handleUserMonsterBookSetCover);
        break;
      case MapleRecvOpcode.USER_REMOTE_SHOP_OPEN_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserRemoteShopOpenRequest);
        break;
      case MapleRecvOpcode.USER_ENTRUSTED_SHOP_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserEntrustedShopRequest);
        break;
      case MapleRecvOpcode.USER_STORE_BANK_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserStoreBankRequest);
        break;
      case MapleRecvOpcode.USER_PARCEL_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserParcelRequest);
        break;
      case MapleRecvOpcode.SHOP_SCANNER_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleShopScannerRequest);
        break;
      case MapleRecvOpcode.SHOP_LINK_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleShopLinkRequest);
        break;
      case MapleRecvOpcode.ADMIN_SHOP_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleAdminShopRequest);
        break;
      case MapleRecvOpcode.USER_TEMPORARY_STAT_UPDATE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserTemporaryStatUpdateRequest);
        break;
      case MapleRecvOpcode.USER_ANTI_MACRO_ITEM_USE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserAntiMacroItemUseRequest);
        break;
      case MapleRecvOpcode.USER_ANTI_MACRO_SKILL_USE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserAntiMacroSkillUseRequest);
        break;
      case MapleRecvOpcode.USER_ANTI_MACRO_QUESTION_RESULT.code:
        this.dispatch(entry, packet, UserHandler.handleUserAntiMacroQuestionResult);
        break;
      case MapleRecvOpcode.USER_CLAIM_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserClaimRequest);
        break;
      case MapleRecvOpcode.USER_SUE_CHARACTER_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserSueCharacterRequest);
        break;
      case MapleRecvOpcode.USER_USE_GACHAPON_BOX_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserUseGachaponBoxRequest);
        break;
      case MapleRecvOpcode.USER_USE_GACHAPON_REMOTE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserUseGachaponRemoteRequest);
        break;
      case MapleRecvOpcode.USER_USE_WATER_OF_LIFE.code:
        this.dispatch(entry, packet, UserHandler.handleUserUseWaterOfLife);
        break;
      case MapleRecvOpcode.USER_FOLLOW_CHARACTER_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserFollowCharacterRequest);
        break;
      case MapleRecvOpcode.USER_FOLLOW_CHARACTER_WITHDRAW.code:
        this.dispatch(entry, packet, UserHandler.handleUserFollowCharacterWithdraw);
        break;
      case MapleRecvOpcode.USER_SELECT_PQ_REWARD.code:
        this.dispatch(entry, packet, UserHandler.handleUserSelectPqReward);
        break;
      case MapleRecvOpcode.USER_REQUEST_PQ_REWARD.code:
        this.dispatch(entry, packet, UserHandler.handleUserRequestPqReward);
        break;
      case MapleRecvOpcode.SET_PASSENSER_RESULT.code:
        this.dispatch(entry, packet, UserHandler.handleSetPassengerResult);
        break;
      case MapleRecvOpcode.COUPLE_MESSAGE.code:
        this.dispatch(entry, packet, UserHandler.handleCoupleMessage);
        break;
      case MapleRecvOpcode.EXPEDITION_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleExpeditionRequest);
        break;
      case MapleRecvOpcode.PARTY_ADVER_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handlePartyAdverRequest);
        break;
      case MapleRecvOpcode.ADMIN.code:
        this.dispatch(entry, packet, UserHandler.handleAdmin);
        break;
      case MapleRecvOpcode.LOG.code:
        this.dispatch(entry, packet, UserHandler.handleLog);
        break;
      case MapleRecvOpcode.MEMO_FLAG_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleMemoFlagRequest);
        break;
      case MapleRecvOpcode.SLIDE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleSlideRequest);
        break;
      case MapleRecvOpcode.RPS_GAME.code:
        this.dispatch(entry, packet, UserHandler.handleRpsGame);
        break;
      case MapleRecvOpcode.MARRIAGE_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleMarriageRequest);
        break;
      case MapleRecvOpcode.WEDDING_WISH_LIST_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleWeddingWishListRequest);
        break;
      case MapleRecvOpcode.WEDDING_PROGRESS.code:
        this.dispatch(entry, packet, UserHandler.handleWeddingProgress);
        break;
      case MapleRecvOpcode.GUEST_BLESS.code:
        this.dispatch(entry, packet, UserHandler.handleGuestBless);
        break;
      case MapleRecvOpcode.BOOBY_TRAP_ALERT.code:
        this.dispatch(entry, packet, UserHandler.handleBoobyTrapAlert);
        break;
      case MapleRecvOpcode.STALK_BEGIN.code:
        this.dispatch(entry, packet, UserHandler.handleStalkBegin);
        break;
      case MapleRecvOpcode.FAMILY_CHART_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyChartRequest);
        break;
      case MapleRecvOpcode.FAMILY_INFO_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyInfoRequest);
        break;
      case MapleRecvOpcode.FAMILY_REGISTER_JUNIOR.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyRegisterJunior);
        break;
      case MapleRecvOpcode.FAMILY_UNREGISTER_JUNIOR.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyUnregisterJunior);
        break;
      case MapleRecvOpcode.FAMILY_UNREGISTER_PARENT.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyUnregisterParent);
        break;
      case MapleRecvOpcode.FAMILY_JOIN_RESULT.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyJoinResult);
        break;
      case MapleRecvOpcode.FAMILY_USE_PRIVILEGE.code:
        this.dispatch(entry, packet, UserHandler.handleFamilyUsePrivilege);
        break;
      case MapleRecvOpcode.FAMILY_SET_PRECEPT.code:
        this.dispatch(entry, packet, UserHandler.handleFamilySetPrecept);
        break;
      case MapleRecvOpcode.FAMILY_SUMMON_RESULT.code:
        this.dispatch(entry, packet, UserHandler.handleFamilySummonResult);
        break;
      case MapleRecvOpcode.CHAT_BLOCK_USER_REQ.code:
        this.dispatch(entry, packet, UserHandler.handleChatBlockUserReq);
        break;
      case MapleRecvOpcode.USER_MIGRATE_TO_ITC_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserMigrateToItcRequest);
        break;
      case MapleRecvOpcode.NEW_YEAR_CARD_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleNewYearCardRequest);
        break;
      case MapleRecvOpcode.RANDOM_MORPH_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleRandomMorphRequest);
        break;
      case MapleRecvOpcode.CASH_GACHAPON_OPEN_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleCashGachaponOpenRequest);
        break;
      case MapleRecvOpcode.CHANGE_MAPLE_POINT_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleChangeMaplePointRequest);
        break;
      case MapleRecvOpcode.REQUEST_INC_COMBO.code:
        this.dispatch(entry, packet, UserHandler.handleRequestIncCombo);
        break;
      case MapleRecvOpcode.REQUEST_SESSION_VALUE.code:
        this.dispatch(entry, packet, UserHandler.handleRequestSessionValue);
        break;
      case MapleRecvOpcode.ACCOUNT_MORE_INFO.code:
        this.dispatch(entry, packet, UserHandler.handleAccountMoreInfo);
        break;
      case MapleRecvOpcode.FIND_FRIEND.code:
        this.dispatch(entry, packet, UserHandler.handleFindFriend);
        break;
      case MapleRecvOpcode.ACCEPT_APSP_EVENT.code:
        this.dispatch(entry, packet, UserHandler.handleAcceptApspEvent);
        break;
      case MapleRecvOpcode.USER_DRAGON_BALL_BOX_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserDragonBallBoxRequest);
        break;
      case MapleRecvOpcode.USER_DRAGON_BALL_SUMMON_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleUserDragonBallSummonRequest);
        break;
      case MapleRecvOpcode.USER_ATTACK_USER_SPECIFIC.code:
        this.dispatch(entry, packet, UserHandler.handleUserAttackUserSpecific);
        break;
      case MapleRecvOpcode.USER_REPEAT_EFFECT_REMOVE.code:
        this.dispatch(entry, packet, UserHandler.handleUserRepeatEffectRemove);
        break;
      case MapleRecvOpcode.CHECK_SSN2_ON_CREATE_NEW_CHARACTER.code:
        this.dispatch(entry, packet, UserHandler.handleCheckSsn2OnCreateNewCharacter);
        break;
      case MapleRecvOpcode.CHECK_SPW_ON_CREATE_NEW_CHARACTER.code:
        this.dispatch(entry, packet, UserHandler.handleCheckSpwOnCreateNewCharacter);
        break;
      case MapleRecvOpcode.FIRST_SSN_ON_CREATE_NEW_CHARACTER.code:
        this.dispatch(entry, packet, UserHandler.handleFirstSsnOnCreateNewCharacter);
        break;
      case MapleRecvOpcode.RAISE_REFESH.code:
        this.dispatch(entry, packet, UserHandler.handleRaiseRefresh);
        break;
      case MapleRecvOpcode.RAISE_UI_STATE.code:
        this.dispatch(entry, packet, UserHandler.handleRaiseUiState);
        break;
      case MapleRecvOpcode.RAISE_INC_EXP.code:
        this.dispatch(entry, packet, UserHandler.handleRaiseIncExp);
        break;
      case MapleRecvOpcode.RAISE_ADD_PIECE.code:
        this.dispatch(entry, packet, UserHandler.handleRaiseAddPiece);
        break;
      case MapleRecvOpcode.SEND_MATE_MAIL.code:
        this.dispatch(entry, packet, UserHandler.handleSendMateMail);
        break;
      case MapleRecvOpcode.REQUEST_GUILD_BOARD_AUTH_KEY.code:
        this.dispatch(entry, packet, UserHandler.handleRequestGuildBoardAuthKey);
        break;
      case MapleRecvOpcode.REQUEST_CONSULT_AUTH_KEY.code:
        this.dispatch(entry, packet, UserHandler.handleRequestConsultAuthKey);
        break;
      case MapleRecvOpcode.REQUEST_CLASS_COMPETITION_AUTH_KEY.code:
        this.dispatch(entry, packet, UserHandler.handleRequestClassCompetitionAuthKey);
        break;
      case MapleRecvOpcode.REQUEST_WEB_BOARD_AUTH_KEY.code:
        this.dispatch(entry, packet, UserHandler.handleRequestWebBoardAuthKey);
        break;
      case MapleRecvOpcode.BATTLERECORD_ONOFF_REQUEST.code:
        this.dispatch(entry, packet, UserHandler.handleBattleRecordOnOffRequest);
        break;
      case MapleRecvOpcode.LOGOUT_GIFT_SELECT.code:
        this.dispatch(entry, packet, UserHandler.handleLogoutGiftSelect);
        break;

      // ---- MobHandler (newly ported) ----
      case MapleRecvOpcode.MOB_CRC_KEY_CHANGED_REPLY.code:
        this.dispatch(entry, packet, MobHandler.handleMobCrcKeyChangedReply);
        break;
      case MapleRecvOpcode.MOB_DROP_PICK_UP_REQUEST.code:
        this.dispatch(entry, packet, MobHandler.handleMobDropPickUpRequest);
        break;
      case MapleRecvOpcode.MOB_HIT_BY_OBSTACLE.code:
        this.dispatch(entry, packet, MobHandler.handleMobHitByObstacle);
        break;
      case MapleRecvOpcode.MOB_SELF_DESTRUCT.code:
        this.dispatch(entry, packet, MobHandler.handleMobSelfDestruct);
        break;
      case MapleRecvOpcode.MOB_SKILL_DELAY_END.code:
        this.dispatch(entry, packet, MobHandler.handleMobSkillDelayEnd);
        break;
      case MapleRecvOpcode.MOB_ESCORT_COLLISION.code:
        this.dispatch(entry, packet, MobHandler.handleMobEscortCollision);
        break;
      case MapleRecvOpcode.MOB_REQUEST_ESCORT_INFO.code:
        this.dispatch(entry, packet, MobHandler.handleMobRequestEscortInfo);
        break;
      case MapleRecvOpcode.MOB_ESCORT_STOP_END_REQUEST.code:
        this.dispatch(entry, packet, MobHandler.handleMobEscortStopEndRequest);
        break;

      // ---- FieldHandler (newly ported) ----
      case MapleRecvOpcode.REQUEST_FOOT_HOLD_INFO.code:
        this.dispatch(entry, packet, FieldHandler.handleRequestFootholdInfo);
        break;
      case MapleRecvOpcode.INVITE_PARTY_MATCH.code:
        this.dispatch(entry, packet, FieldHandler.handleInvitePartyMatch);
        break;

      default:
        this.logger.warn(`Channel unhandled opcode 0x${opcode.toString(16)} from session ${session.id}`);
    }
  }

  /** Shared guard for handlers that require an entered field/User (port pattern: kinoko's `User user` handler arg is never null since the session is field-bound by then). */
  private dispatch(
    entry: { user: User | null },
    packet: PacketReader,
    handler: (user: User, r: PacketReader) => void,
  ): void {
    if (!entry.user) return;
    handler(entry.user, packet);
  }

  // ---- handlers -------------------------------------------------------

  private handleCashShopMigrateRequest(session: Session, entry: { charData: CharacterData | null; user: User | null }): void {
    if (!entry.charData) return;

    CharacterDB.saveCharacter(entry.charData).catch(err =>
      this.logger.error(`save before cash shop failed for char ${entry.charData?.getCharacterId()}: ${err?.message}`),
    );

    const w = new PacketWriter(10);
    w.writeShort(LoginSendOpcode.CASH_SHOP_MIGRATE_REQUEST.getValue());
    w.writeInt(session.id);
    w.writeInt(entry.charData.accountId);
    this.centerServerSession.socket.write(w.getPacket());
  }

  private handlePlayerLoggedIn(session: Session, entry: any, packet: PacketReader): void {
    const charId = packet.readInt();

    const fromMigration = this.migrationStore.get(charId);
    if (fromMigration) {
      this.migrationStore.delete(charId);
      entry.charData = fromMigration;
      this.enterField(entry, entry.charData, true);
      return;
    }

    // No migration record — load from DB (reconnect / first login)
    CharacterDB.loadCharacter(charId).then(cd => {
      if (!cd) {
        this.logger.warn(`MIGRATE_IN charId ${charId} not found in DB`);
        session.socket.destroy();
        return;
      }
      entry.charData = cd;
      this.enterField(entry, cd, false);
    }).catch(err => {
      this.logger.error(`MIGRATE_IN DB error for charId ${charId}: ${err?.message}`);
      session.socket.destroy();
    });
  }

  /**
   * Port of kinoko's User entering a field on login/migration: resolves the
   * spawn portal, constructs the User, sends StagePacket.setField, and adds
   * the user to the field's UserPool (broadcasts UserEnterField, spawns
   * existing field objects - see UserPool.addUser).
   */
  private enterField(entry: { enc: EncryptedSession; charData: CharacterData | null; user: User | null }, charData: CharacterData, isMigrate: boolean): void {
    const mapId = charData.characterStat.posMap;
    const field = this.fieldStorage.getFieldById(mapId);
    if (!field) {
      this.logger.warn(`enterField: unknown map ${mapId} for character ${charData.getCharacterId()}`);
      return;
    }

    const user = new User(entry.enc, charData);
    const portal = field.getPortalById(charData.characterStat.portal) ?? PortalInfo.EMPTY;
    user.setX(portal.x);
    user.setY(portal.y);

    // Initialize dragon (port of kinoko MigrationHandler dragon init)
    if (JobConstants.isDragonJob(user.getJob())) {
      user.setDragon(new Dragon(user.getJob()));
    }

    // Load account (async, may complete after the user is already in-field)
    AccountDB.loadAccount(charData.accountId).then(account => {
      if (account) user.account = account;
    }).catch(err => {
      this.logger.error(`enterField: failed to load account for char ${charData.getCharacterId()}: ${err?.message}`);
    });

    // Load memos (async) — port of kinoko MigrationHandler memo load
    MemoDB.getMemosByCharacterId(charData.getCharacterId()).then(memos => {
      user.setMemos(memos);
    }).catch(err => {
      this.logger.error(`enterField: failed to load memos for char ${charData.getCharacterId()}: ${err?.message}`);
    });

    user.write(StagePacket.setField(user, 0, isMigrate, false));

    // Remove expired items and notify client
    const { ops, removedItemIds } = charData.inventoryManager.removeExpiredItems();
    if (ops.length > 0) {
      user.write(inventoryOperation(ops, false));
      const notified = new Set<number>();
      for (const itemId of removedItemIds) {
        if (notified.has(itemId)) continue;
        notified.add(itemId);
        const isCash = itemId >= 5000000;
        user.write(isCash ? MessagePacket.cashItemExpire(itemId) : MessagePacket.generalItemExpire(itemId));
      }
    }

    field.getUserPool().addUser(user);
    entry.user = user;
    this.userRegistry.set(user.getCharacterId(), user);
    this.userNameMap.set(user.getCharacterName().toLowerCase(), user.getCharacterId());

    this.logger.info(`Character ${charData.getCharacterId()} entered field ${mapId}`);
  }

  /** Port of kinoko's UserHandler::handleUserSelectNpc (script + shop + trunk). */
  private handleNpcTalk(session: Session, entry: any, packet: PacketReader): void {
    if (!entry.charData || !entry.user) return;
    const objectId = packet.readInt(); // dwNpcId
    packet.readShort(); // ptUserPos.x (unused)
    packet.readShort(); // ptUserPos.y (unused)

    const user: User = entry.user;
    const field = user.getField();
    const npc = field?.getNpcPool().getById(objectId);
    if (!npc) {
      this.logger.warn(`NPC_TALK: unknown npc objectId=${objectId}`);
      return;
    }
    if (npc.hasScript()) {
      const script = NpcScriptRegistry.get(npc.getScript());
      if (!script) {
        this.logger.warn(`NPC_TALK: no registered script "${npc.getScript()}" for npc ${npc.getTemplateId()}`);
        return;
      }
      if (user.hasDialog()) {
        this.logger.warn(`NPC_TALK: user ${user.getCharacterId()} already has a dialog open`);
        return;
      }
      new ScriptManager(user, field, script, npc.getTemplateId()).start();
      return;
    }
    // Handle trunk / npc shop dialog
    if (user.hasDialog()) {
      this.logger.warn(`NPC_TALK: user ${user.getCharacterId()} already has a dialog open`);
      return;
    }
    const templateId = npc.getTemplateId();
    if (npc.isTrunk()) {
      const trunk = user.account?.trunk;
      if (!trunk) {
        this.logger.warn(`NPC_TALK: npc ${templateId} is a trunk but user has no account/trunk`);
        return;
      }
      openTrunkDialog(user, templateId, npc.template.trunkPut, npc.template.trunkGet, trunk);
    } else if (ShopProvider.isShop(templateId)) {
      const items = ShopProvider.getNpcShopItems(templateId);
      openShopDialog(user, templateId, items);
    } else {
      this.logger.debug(`NPC_TALK: npc ${templateId} has no script, is not a shop or trunk`);
    }
  }

  /** Port of kinoko's UserHandler::handleUserScriptMessageAnswer. */
  private handleNpcTalkMore(session: Session, entry: any, packet: PacketReader): void {
    if (!entry.charData || !entry.user) return;
    const user: User = entry.user;
    const type   = packet.readByte(); // nMsgType
    const action = packet.readByte(); // nAction

    if (!user.hasDialog()) {
      this.logger.warn(`NPC_TALK_MORE: user ${user.getCharacterId()} has no dialog`);
      return;
    }
    const dialog = user.getDialog() as ScriptManager;

    switch (type as ScriptMessageType) {
      case ScriptMessageType.SAY:
      case ScriptMessageType.SAYIMAGE:
      case ScriptMessageType.ASKYESNO:
      case ScriptMessageType.ASKACCEPT:
        dialog.submitAnswer(ScriptAnswer.withAction(action));
        break;
      case ScriptMessageType.ASKTEXT:
      case ScriptMessageType.ASKBOXTEXT:
        if (action === 1) {
          dialog.submitAnswer(ScriptAnswer.withTextAnswer(action, packet.readMapleAsciiString()));
        } else {
          dialog.submitAnswer(ScriptAnswer.withAction(-1));
        }
        break;
      case ScriptMessageType.ASKNUMBER:
      case ScriptMessageType.ASKMENU:
      case ScriptMessageType.ASKSLIDEMENU:
        if (action === 1) {
          dialog.submitAnswer(ScriptAnswer.withAnswer(action, packet.readInt()));
        } else {
          dialog.submitAnswer(ScriptAnswer.withAction(-1));
        }
        break;
      case ScriptMessageType.ASKAVATAR:
      case ScriptMessageType.ASKMEMBERSHOPAVATAR:
        if (action === 1) {
          dialog.submitAnswer(ScriptAnswer.withAnswer(action, packet.readByte()));
        } else {
          dialog.submitAnswer(ScriptAnswer.withAction(-1));
        }
        break;
      default:
        this.logger.warn(`NPC_TALK_MORE: unhandled message type ${type}`);
    }
  }

  /** Port of kinoko's UserHandler::handleUserShopRequest. */
  private handleUserShopRequest(session: Session, entry: any, packet: PacketReader): void {
    if (!entry.user) return;
    const user: User = entry.user;
    const dialog = user.getDialog();
    if (!(dialog instanceof ShopDialog)) {
      this.logger.warn(`USER_SHOP_REQUEST: user ${user.getCharacterId()} has no shop dialog`);
      return;
    }
    dialog.handlePacket(user, packet);
  }

  /** Port of kinoko's UserHandler::handleUserTrunkRequest. */
  private handleUserTrunkRequest(session: Session, entry: any, packet: PacketReader): void {
    if (!entry.user) return;
    const user: User = entry.user;
    const dialog = user.getDialog();
    if (!(dialog instanceof TrunkDialog)) {
      this.logger.warn(`USER_TRUNK_REQUEST: user ${user.getCharacterId()} has no trunk dialog`);
      return;
    }
    const trunk = user.account?.trunk;
    if (!trunk) {
      this.logger.warn(`USER_TRUNK_REQUEST: user ${user.getCharacterId()} has no account/trunk`);
      return;
    }
    dialog.handlePacket(user, packet, trunk);
  }

  // ---- migration API (called by CenterServer handler) -----------------

  registerMigration(charData: CharacterData): void {
    this.migrationStore.set(charData.getCharacterId(), charData);
  }
}

function buildHandshake(version: number, ivRecv: Buffer, ivSend: Buffer): Buffer {
  // Exactly 16 bytes: len(2)+version(2)+patch"1"(3)+ivRecv(4)+ivSend(4)+locale(1).
  // getPacket() returns the whole preallocated buffer (not sliced to
  // bytesWritten), and this handshake is written RAW (bypassing enc.write's
  // slicing). An over-sized alloc (was 18) appends stray 0x00 bytes that the
  // client reads as the next packet's header → "Bad packet header".
  const w = new PacketWriter(16);
  w.writeShort(14);       // packet length field
  w.writeShort(version);
  w.writeMapleAsciiString('1'); // patch string
  w.write(ivRecv);
  w.write(ivSend);
  w.writeByte(8);         // locale
  return w.getPacket();
}
