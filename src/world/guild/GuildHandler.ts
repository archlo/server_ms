import { PacketReader } from '../../protocol/packets/packetReader';
import { User, statChangedPacket } from '../user/User';
import { Stat } from '../user/stat/Stat';
import { MessagePacket } from '../user/MessagePacket';
import { Guild } from './Guild';
import { GuildMember } from './GuildMember';
import { GuildManager } from './GuildManager';
import { GuildPacket, GuildResultType } from './GuildPacket';
import { GuildDB } from '../../server/channel/db/GuildDB';
import { GameConstants } from '../GameConstants';
import { Alliance } from '../alliance/Alliance';
import { AllianceManager } from '../alliance/AllianceManager';
import { AlliancePacket } from '../alliance/AlliancePacket';
import { BBSThread, BBSReply } from './bbs/BBSThread';
import { GuildBBSPacket } from './bbs/GuildBBSPacket';
import { BBSDB } from '../../server/channel/db/BBSDB';

enum GuildRequestType {
  LoadGuild = 0,
  CreateGuild = 1,
  InviteGuild = 2,
  JoinGuild = 3,
  LeaveGuild = 4,
  ExpelGuild = 5,
  DisbandGuild = 6,
  ChangeEmblem = 7,
  IncreaseCapacity = 8,
  ChangeNotice = 0x0C,
  ChangeRankTitle = 0x0D,
}

enum GuildResultRequestType {
  InviteAccepted = 0x12,
  ChangeNotice = 0x14,
  ChangeRankTitle = 0x15,
}

enum AllianceRequestType {
  CreateAlliance = 0x01,
  InviteAlliance = 0x03,
  AcceptAlliance = 0x04,
  LeaveAlliance = 0x05,
  DisbandAlliance = 0x06,
}

enum AllianceResultRequestType {
  InviteAccepted = 0x10,
  ChangeNotice = 0x11,
  ChangeRankTitle = 0x12,
}

enum BBSRequestType {
  ListThreads = 0x00,
  LoadThread = 0x01,
  WriteThread = 0x02,
  DeleteThread = 0x03,
  NoticeThread = 0x04,
  ReplyThread = 0x05,
}

export class GuildHandler {
  static channelServerOverride: any = null;

  // ---- Guild opcode 149 (GUILD_REQUEST) ----

  static handleGuildRequest(user: User, r: PacketReader): void {
    const type = r.offset < r.data.length ? r.readByte() : 0;

    switch (type) {
      case GuildRequestType.LoadGuild:
        GuildHandler.loadGuild(user);
        return;
      case GuildRequestType.CreateGuild:
        GuildHandler.createGuild(user, r);
        return;
      case GuildRequestType.InviteGuild:
        GuildHandler.inviteGuild(user, r);
        return;
      case GuildRequestType.JoinGuild:
        GuildHandler.joinGuild(user, r);
        return;
      case GuildRequestType.LeaveGuild:
        GuildHandler.leaveGuild(user);
        return;
      case GuildRequestType.ExpelGuild:
        GuildHandler.expelGuild(user, r);
        return;
      case GuildRequestType.DisbandGuild:
        GuildHandler.disbandGuild(user);
        return;
      case GuildRequestType.ChangeEmblem:
        GuildHandler.changeEmblem(user, r);
        return;
      case GuildRequestType.IncreaseCapacity:
        GuildHandler.increaseCapacity(user);
        return;
      default:
        user.dispose();
    }
  }

  // ---- Guild opcode 150 (GUILD_RESULT) ----

  static handleGuildResult(user: User, r: PacketReader): void {
    const type = r.offset < r.data.length ? r.readByte() : 0;

    switch (type) {
      case GuildResultRequestType.InviteAccepted:
        GuildHandler.acceptInvite(user, r);
        return;
      case GuildResultRequestType.ChangeNotice:
        GuildHandler.changeNotice(user, r);
        return;
      case GuildResultRequestType.ChangeRankTitle:
        GuildHandler.changeRankTitle(user, r);
        return;
      default:
        user.dispose();
    }
  }

  // ---- Alliance opcode 167 (ALLIANCE_REQUEST) ----

  static handleAllianceRequest(user: User, r: PacketReader): void {
    const type = r.offset < r.data.length ? r.readByte() : 0;

    switch (type) {
      case AllianceRequestType.CreateAlliance:
        GuildHandler.createAlliance(user, r);
        return;
      case AllianceRequestType.InviteAlliance:
        GuildHandler.inviteAlliance(user, r);
        return;
      case AllianceRequestType.AcceptAlliance:
        GuildHandler.acceptAlliance(user, r);
        return;
      case AllianceRequestType.LeaveAlliance:
        GuildHandler.leaveAlliance(user);
        return;
      case AllianceRequestType.DisbandAlliance:
        GuildHandler.disbandAlliance(user);
        return;
      default:
        user.dispose();
    }
  }

  // ---- Alliance opcode 168 (ALLIANCE_RESULT) ----

  static handleAllianceResult(user: User, r: PacketReader): void {
    const type = r.offset < r.data.length ? r.readByte() : 0;

    switch (type) {
      case AllianceResultRequestType.InviteAccepted:
        GuildHandler.acceptAllianceInvite(user, r);
        return;
      case AllianceResultRequestType.ChangeNotice:
        GuildHandler.changeAllianceNotice(user, r);
        return;
      case AllianceResultRequestType.ChangeRankTitle:
        GuildHandler.changeAllianceRankTitle(user, r);
        return;
      default:
        user.dispose();
    }
  }

  // ---- Guild BBS opcode 179 (GUILD_BBS) ----

  static async handleGuildBBS(user: User, r: PacketReader): Promise<void> {
    const type = r.offset < r.data.length ? r.readByte() : 0;

    switch (type) {
      case BBSRequestType.ListThreads:
        await GuildHandler.listThreads(user, r);
        return;
      case BBSRequestType.LoadThread:
        await GuildHandler.loadThread(user, r);
        return;
      case BBSRequestType.WriteThread:
        await GuildHandler.writeThread(user, r);
        return;
      case BBSRequestType.DeleteThread:
        await GuildHandler.deleteThread(user, r);
        return;
      case BBSRequestType.NoticeThread:
        await GuildHandler.noticeThread(user, r);
        return;
      case BBSRequestType.ReplyThread:
        await GuildHandler.replyThread(user, r);
        return;
      default:
        user.dispose();
    }
  }

  // ---- Guild helpers ----

  private static getGuildId(user: User): number {
    return user.getCharacterData().guildId;
  }

  private static setGuildId(user: User, guildId: number): void {
    user.getCharacterData().guildId = guildId;
  }

  // ---- Guild operations ----

  private static loadGuild(user: User): void {
    const guildId = GuildHandler.getGuildId(user);
    if (guildId === 0) return;
    const guild = GuildManager.instance.getGuild(guildId);
    if (!guild) return;
    user.write(GuildPacket.loadGuildDone(guild));
  }

  private static createGuild(user: User, r: PacketReader): void {
    if (GuildHandler.getGuildId(user) !== 0) {
      user.write(GuildPacket.error(GuildResultType.GuildCreateError));
      return;
    }

    const guildName = r.readMapleAsciiString();

    if (GuildManager.instance.getGuildByName(guildName)) {
      user.write(GuildPacket.error(GuildResultType.GuildNameAlreadyExists));
      return;
    }

    if (GuildHandler.currentMoney(user) < GameConstants.CREATE_GUILD_COST) {
      user.write(MessagePacket.system('You do not have enough mesos to create a guild.'));
      return;
    }

    const guildId = GuildManager.instance.nextGuildId();
    const guild = new Guild(guildId, guildName, user.getCharacterId());

    const member = new GuildMember(
      user.getCharacterId(),
      user.getCharacterName(),
      user.getJob(),
      user.getLevel(),
      1,
      true,
    );
    guild.addMember(member);
    GuildManager.instance.addGuild(guild);

    GuildHandler.setGuildId(user, guildId);
    GuildHandler.deductMoney(user, GameConstants.CREATE_GUILD_COST);

    GuildDB.newGuild(guild).catch(() => { /* logged in GuildDB */ });

    user.write(GuildPacket.guildCreated(guild));
    user.write(GuildPacket.loadGuildDone(guild));
  }

  private static inviteGuild(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) {
      user.write(GuildPacket.error(GuildResultType.NotInGuild));
      return;
    }

    const member = guild.getMember(user.getCharacterId());
    if (!member || member.grade > 2) {
      user.write(GuildPacket.error(GuildResultType.GuildInviteError));
      return;
    }

    if (guild.members.size >= guild.capacity) {
      user.write(GuildPacket.error(GuildResultType.GuildCapacityError));
      return;
    }

    const targetName = r.readMapleAsciiString();
    const target = GuildHandler.getChannelServer()?.getUserByCharacterName(targetName);

    if (!target || target.getCharacterId() === user.getCharacterId()) {
      user.write(GuildPacket.serverMsg('That character cannot be found.'));
      return;
    }

    if (GuildHandler.getGuildId(target) !== 0) {
      user.write(GuildPacket.serverMsg('That character is already in a guild.'));
      return;
    }

    target.write(GuildPacket.guildInvite(user.getCharacterName()));
  }

  private static acceptInvite(user: User, r: PacketReader): void {
    if (GuildHandler.getGuildId(user) !== 0) {
      user.write(GuildPacket.error(GuildResultType.GuildJoinError));
      return;
    }

    const guildId = r.readInt();
    const guild = GuildManager.instance.getGuild(guildId);
    if (!guild) {
      user.write(GuildPacket.error(GuildResultType.GuildJoinError));
      return;
    }

    if (guild.members.size >= guild.capacity) {
      user.write(GuildPacket.error(GuildResultType.GuildCapacityError));
      return;
    }

    const member = new GuildMember(
      user.getCharacterId(),
      user.getCharacterName(),
      user.getJob(),
      user.getLevel(),
      5,
      true,
    );

    if (!guild.addMember(member)) {
      user.write(GuildPacket.error(GuildResultType.GuildJoinError));
      return;
    }

    GuildHandler.setGuildId(user, guildId);
    user.write(GuildPacket.loadGuildDone(guild));

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target && target.getCharacterId() !== user.getCharacterId()) {
        target.write(GuildPacket.guildJoined(guild, user.getCharacterId()));
      }
    });
  }

  private static joinGuild(user: User, r: PacketReader): void {
    const guildId = r.readInt();
    const guild = GuildManager.instance.getGuild(guildId);
    if (!guild || guild.members.size >= guild.capacity) return;

    const member = new GuildMember(
      user.getCharacterId(),
      user.getCharacterName(),
      user.getJob(),
      user.getLevel(),
      5, true,
    );

    if (!guild.addMember(member)) return;
    GuildHandler.setGuildId(user, guildId);
    user.write(GuildPacket.loadGuildDone(guild));

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target && target.getCharacterId() !== user.getCharacterId()) {
        target.write(GuildPacket.guildJoined(guild, user.getCharacterId()));
      }
    });
  }

  private static leaveGuild(user: User): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) {
      user.write(GuildPacket.error(GuildResultType.NotInGuild));
      return;
    }

    if (guild.leader === user.getCharacterId()) {
      user.write(GuildPacket.serverMsg('The guild master cannot leave. Disband the guild instead.'));
      return;
    }

    guild.removeMember(user.getCharacterId());
    GuildHandler.setGuildId(user, 0);
    user.write(GuildPacket.guildDeleted(guild.guildId));

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target) {
        target.write(GuildPacket.guildMemberLeft(guild, user.getCharacterId()));
      }
    });
  }

  private static expelGuild(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) {
      user.write(GuildPacket.error(GuildResultType.NotInGuild));
      return;
    }

    const member = guild.getMember(user.getCharacterId());
    if (!member || member.grade > 2) {
      user.write(GuildPacket.error(GuildResultType.GuildExpelError));
      return;
    }

    const targetId = r.readInt();
    if (targetId === guild.leader) return;

    guild.removeMember(targetId);

    GuildHandler.persist(guild);

    const target = GuildHandler.getChannelServer()?.getUserByCharacterId(targetId);
    if (target) {
      GuildHandler.setGuildId(target, 0);
      target.write(GuildPacket.guildDeleted(guild.guildId));
    }

    GuildHandler.forEachGuildMember(guild, (m) => {
      const t = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (t) {
        t.write(GuildPacket.guildExpelled(guild.guildId, targetId));
      }
    });
  }

  private static disbandGuild(user: User): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) {
      user.write(GuildPacket.error(GuildResultType.NotInGuild));
      return;
    }

    if (guild.leader !== user.getCharacterId()) {
      user.write(GuildPacket.error(GuildResultType.GuildDisbandError));
      return;
    }

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target) {
        GuildHandler.setGuildId(target, 0);
        target.write(GuildPacket.guildDeleted(guild.guildId));
      }
    });

    GuildManager.instance.removeGuild(guild.guildId);

    GuildDB.deleteGuild(guild.guildId).catch(() => { /* logged in GuildDB */ });
  }

  private static changeNotice(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    const member = guild.getMember(user.getCharacterId());
    if (!member || member.grade > 2) return;

    const notice = r.readMapleAsciiString();
    guild.notice = notice.length > 100 ? notice.substring(0, 100) : notice;

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target) {
        target.write(GuildPacket.guildNotifyChange(guild));
      }
    });
  }

  private static changeRankTitle(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    if (guild.leader !== user.getCharacterId()) return;

    const rankIndex = r.readByte();
    const title = r.readMapleAsciiString();
    if (rankIndex < 1 || rankIndex > 5) return;

    guild.rankTitles[rankIndex - 1] = title.length > 10 ? title.substring(0, 10) : title;

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target) {
        target.write(GuildPacket.guildNotifyChange(guild));
      }
    });
  }

  private static changeEmblem(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    const member = guild.getMember(user.getCharacterId());
    if (!member || member.grade > 2) return;

    guild.logoBg = r.readShort();
    guild.logoBgColor = r.readByte();
    guild.logo = r.readShort();
    guild.logoColor = r.readByte();

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target) {
        target.write(GuildPacket.guildEmblemChanged(guild));
      }
    });
  }

  private static increaseCapacity(user: User): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    if (guild.leader !== user.getCharacterId()) {
      user.write(GuildPacket.error(GuildResultType.GuildCapacityError));
      return;
    }

    if (guild.capacity >= GameConstants.GUILD_CAPACITY_MAX) return;

    const newCapacity = Math.min(guild.capacity + 5, GameConstants.GUILD_CAPACITY_MAX);
    const cost = GameConstants.getGuildExpandCost(guild.capacity);

    if (GuildHandler.currentMoney(user) < cost) {
      user.write(MessagePacket.system('You do not have enough mesos.'));
      return;
    }

    guild.capacity = newCapacity;
    GuildHandler.deductMoney(user, cost);

    GuildHandler.persist(guild);

    GuildHandler.forEachGuildMember(guild, (m) => {
      const target = GuildHandler.getChannelServer()?.getUserByCharacterId(m.characterId);
      if (target) {
        target.write(GuildPacket.guildCapacityChanged(guild));
      }
    });
  }

  // ---- Alliance operations ----

  private static createAlliance(user: User, r: PacketReader): void {
    const allianceName = r.readMapleAsciiString();
    const guildId = r.readInt();

    const guild = GuildManager.instance.getGuild(guildId);
    if (!guild || guild.leader !== user.getCharacterId()) {
      user.write(AlliancePacket.allianceError());
      return;
    }

    if (guild.allianceId !== 0) {
      user.write(AlliancePacket.allianceError());
      return;
    }

    if (AllianceManager.instance.getAllianceByName(allianceName)) {
      user.write(AlliancePacket.allianceError());
      return;
    }

    if (GuildHandler.currentMoney(user) < GameConstants.CREATE_UNION_COST) {
      user.write(MessagePacket.system('You do not have enough mesos to create an alliance.'));
      return;
    }

    const allianceId = AllianceManager.instance.nextAllianceId();
    const alliance = new Alliance(allianceId, allianceName);
    alliance.addGuild(guildId);
    guild.allianceId = allianceId;
    AllianceManager.instance.addAlliance(alliance);
    GuildHandler.deductMoney(user, GameConstants.CREATE_UNION_COST);

    user.write(AlliancePacket.allianceCreated(alliance));
  }

  private static inviteAlliance(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild || guild.leader !== user.getCharacterId()) {
      user.write(AlliancePacket.allianceError());
      return;
    }

    const alliance = AllianceManager.instance.getAlliance(guild.allianceId);
    if (!alliance) {
      user.write(AlliancePacket.allianceError());
      return;
    }

    const targetGuildId = r.readInt();
    const targetGuild = GuildManager.instance.getGuild(targetGuildId);
    if (!targetGuild || targetGuild.allianceId !== 0) return;

    if (alliance.guildIds.length >= alliance.capacity) return;

    const target = GuildHandler.getChannelServer()?.getUserByCharacterId(targetGuild.leader);
    if (target) {
      target.write(AlliancePacket.allianceInvite(user.getCharacterName(), alliance.name));
    }
  }

  private static acceptAlliance(user: User, r: PacketReader): void {
    if (GuildHandler.getGuildId(user) === 0) return;

    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild || guild.leader !== user.getCharacterId()) return;

    const allianceId = r.readInt();
    const alliance = AllianceManager.instance.getAlliance(allianceId);
    if (!alliance) return;

    if (!alliance.addGuild(guild.guildId)) return;
    guild.allianceId = allianceId;
  }

  private static acceptAllianceInvite(user: User, r: PacketReader): void {
    GuildHandler.acceptAlliance(user, r);
  }

  private static leaveAlliance(user: User): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild || guild.allianceId === 0) return;

    const alliance = AllianceManager.instance.getAlliance(guild.allianceId);
    if (!alliance) return;

    alliance.removeGuild(guild.guildId);
    guild.allianceId = 0;
  }

  private static disbandAlliance(user: User): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild || guild.leader !== user.getCharacterId()) {
      user.write(AlliancePacket.allianceError());
      return;
    }

    const alliance = AllianceManager.instance.getAlliance(guild.allianceId);
    if (!alliance) return;

    for (const gid of alliance.guildIds) {
      const g = GuildManager.instance.getGuild(gid);
      if (g) g.allianceId = 0;
    }

    AllianceManager.instance.removeAlliance(alliance.allianceId);
  }

  private static changeAllianceNotice(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild || guild.leader !== user.getCharacterId()) return;

    const alliance = AllianceManager.instance.getAlliance(guild.allianceId);
    if (!alliance) return;

    alliance.notice = r.readMapleAsciiString();
  }

  private static changeAllianceRankTitle(user: User, r: PacketReader): void {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild || guild.allianceId === 0) return;
    if (guild.leader !== user.getCharacterId()) return;

    const alliance = AllianceManager.instance.getAlliance(guild.allianceId);
    if (!alliance) return;

    const rankIndex = r.readByte();
    const title = r.readMapleAsciiString();
    if (rankIndex < 1 || rankIndex > 5) return;
    alliance.rankTitles[rankIndex - 1] = title.length > 10 ? title.substring(0, 10) : title;
  }

  // ---- BBS operations ----

  private static bbsThreads = new Map<number, BBSThread[]>();
  private static bbsLoaded = new Set<number>();

  private static async ensureBBSLoaded(guildId: number): Promise<void> {
    if (GuildHandler.bbsLoaded.has(guildId)) return;
    GuildHandler.bbsLoaded.add(guildId);
    const threads = await BBSDB.loadThreads(guildId);
    GuildHandler.bbsThreads.set(guildId, threads);
  }

  private static getBBSThreads(guildId: number): BBSThread[] {
    let threads = GuildHandler.bbsThreads.get(guildId);
    if (!threads) {
      threads = [];
      GuildHandler.bbsThreads.set(guildId, threads);
    }
    return threads;
  }

  private static async listThreads(user: User, r: PacketReader): Promise<void> {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) {
      user.write(GuildBBSPacket.error());
      return;
    }

    await GuildHandler.ensureBBSLoaded(guild.guildId);

    const page = r.readByte();
    const threads = GuildHandler.getBBSThreads(guild.guildId);
    const threadsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(threads.length / threadsPerPage));
    const start = page * threadsPerPage;
    const pageThreads = threads.slice(start, start + threadsPerPage);

    user.write(GuildBBSPacket.listThreads(pageThreads, page, totalPages));
  }

  private static async loadThread(user: User, r: PacketReader): Promise<void> {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) {
      user.write(GuildBBSPacket.error());
      return;
    }

    await GuildHandler.ensureBBSLoaded(guild.guildId);

    const localThreadId = r.readInt();
    const threads = GuildHandler.getBBSThreads(guild.guildId);
    const thread = threads.find(t => t.localThreadId === localThreadId);
    if (!thread) {
      user.write(GuildBBSPacket.error());
      return;
    }

    user.write(GuildBBSPacket.loadThread(thread));
  }

  private static getNextLocalId(guildId: number): number {
    const threads = GuildHandler.getBBSThreads(guildId);
    let maxId = 0;
    for (const t of threads) {
      if (t.localThreadId > maxId) maxId = t.localThreadId;
    }
    return maxId + 1;
  }

  private static async writeThread(user: User, r: PacketReader): Promise<void> {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    await GuildHandler.ensureBBSLoaded(guild.guildId);

    const isNotice = r.readBoolean();
    const postName = r.readMapleAsciiString();
    const postText = r.readMapleAsciiString();
    const icon = r.readInt();

    const threads = GuildHandler.getBBSThreads(guild.guildId);
    const localThreadId = GuildHandler.getNextLocalId(guild.guildId);
    const threadId = await BBSDB.nextThreadId();
    if (threadId === null) {
      user.write(GuildBBSPacket.error());
      return;
    }

    const thread = new BBSThread(
      threadId, localThreadId,
      user.getCharacterId(),
      user.getCharacterName(),
      postName,
      BigInt(Date.now()) * 10000n + 116444736000000000n,
      icon,
      postText,
      guild.guildId,
    );

    if (isNotice) {
      threads.unshift(thread);
    } else {
      threads.push(thread);
    }

    await BBSDB.saveThread(thread);

    user.write(GuildBBSPacket.writeThreadDone(localThreadId, isNotice));
  }

  private static async deleteThread(user: User, r: PacketReader): Promise<void> {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    await GuildHandler.ensureBBSLoaded(guild.guildId);

    const localThreadId = r.readInt();
    const threads = GuildHandler.getBBSThreads(guild.guildId);
    const idx = threads.findIndex(t => t.localThreadId === localThreadId);
    if (idx < 0) return;

    const thread = threads[idx];
    if (thread.posterCharacterId !== user.getCharacterId() && guild.leader !== user.getCharacterId()) return;

    threads.splice(idx, 1);
    await BBSDB.deleteThread(thread.threadId);

    user.write(GuildBBSPacket.deleteThreadDone(localThreadId));
  }

  private static async noticeThread(user: User, r: PacketReader): Promise<void> {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    await GuildHandler.ensureBBSLoaded(guild.guildId);

    const member = guild.getMember(user.getCharacterId());
    if (!member || member.grade > 2) return;

    const localThreadId = r.readInt();
    const threads = GuildHandler.getBBSThreads(guild.guildId);

    if (localThreadId === 0) {
      user.write(GuildBBSPacket.listThreads([], 0, 0));
      return;
    }

    const thread = threads.find(t => t.localThreadId === localThreadId);
    if (!thread) return;

    const idx = threads.indexOf(thread);
    threads.splice(idx, 1);
    threads.unshift(thread);
  }

  private static async replyThread(user: User, r: PacketReader): Promise<void> {
    const guild = GuildManager.instance.getGuild(GuildHandler.getGuildId(user));
    if (!guild) return;

    await GuildHandler.ensureBBSLoaded(guild.guildId);

    const localThreadId = r.readInt();
    const content = r.readMapleAsciiString();

    const threads = GuildHandler.getBBSThreads(guild.guildId);
    const thread = threads.find(t => t.localThreadId === localThreadId);
    if (!thread) return;

    const replyId = await BBSDB.nextReplyId(thread.threadId);
    if (replyId === null) return;

    const reply: BBSReply = {
      replyId,
      threadId: thread.threadId,
      posterCharacterId: user.getCharacterId(),
      posterName: user.getCharacterName(),
      timestamp: BigInt(Date.now()) * 10000n + 116444736000000000n,
      content,
    };

    thread.replies.push(reply);
    await BBSDB.saveReply(reply);

    user.write(GuildBBSPacket.replyDone(localThreadId));
  }

  // ---- Shared helpers ----

  static forEachGuildMember(guild: Guild, fn: (member: GuildMember) => void): void {
    for (const member of guild.members.values()) {
      fn(member);
    }
  }

  private static getChannelServer(): any {
    return GuildHandler.channelServerOverride
      ?? (require('../../server/channel/channelServer').ChannelServer.instance ?? null);
  }

  private static currentMoney(user: User): number {
    return user.getInventoryManager().money ?? 0;
  }

  private static deductMoney(user: User, amount: number): void {
    const inv = user.getInventoryManager();
    inv.money = Math.max(0, inv.money - amount);
    user.write(statChangedPacket(Stat.MONEY, inv.money));
  }

  /** Fire-and-forget persistence of a guild (insert or update). */
  private static persist(guild: Guild): void {
    GuildDB.saveGuild(guild).catch(() => { /* logged in GuildDB */ });
  }
}
