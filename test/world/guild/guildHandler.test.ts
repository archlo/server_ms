import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { GuildHandler } from '../../../src/world/guild/GuildHandler';
import { GuildManager } from '../../../src/world/guild/GuildManager';
import { GuildMember } from '../../../src/world/guild/GuildMember';
import { Guild } from '../../../src/world/guild/Guild';
import { GuildResultType } from '../../../src/world/guild/GuildPacket';
import { AllianceManager } from '../../../src/world/alliance/AllianceManager';
import { GameConstants } from '../../../src/world/GameConstants';

describe('world/guild/GuildHandler.ts', () => {
  let originalOverride: any;

  beforeEach(() => {
    originalOverride = GuildHandler.channelServerOverride;
    new GuildManager();
    new AllianceManager();
  });

  afterEach(() => {
    GuildHandler.channelServerOverride = originalOverride;
  });

  it('should create a guild and set guildId on the user', () => {
    const user = fakeUser(1, 'User', 100, 0, 5_000_000);
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('TestGuild')));

    expect(user.getCharacterData().guildId).to.equal(1);
    const guild = GuildManager.instance.getGuild(1);
    expect(guild).not.to.equal(undefined);
    expect(guild!.name).to.equal('TestGuild');
    expect(guild!.leader).to.equal(1);
    expect(guild!.members.size).to.equal(1);

    expect(user.writes.length).to.equal(3); // guildCreated + loadGuildDone + statChanged (money)
  });

  it('should reject duplicate guild names', () => {
    const user = fakeUser(1, 'User', 100, 0, 5_000_000);
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Existing')));
    expect(user.getCharacterData().guildId).to.equal(1);

    const user2 = fakeUser(2, 'User2', 100, 0, 5_000_000);
    GuildHandler.handleGuildRequest(user2 as any, new PacketReader(createGuildRequest('Existing')));

    expect(user2.getCharacterData().guildId).to.equal(0);
  });

  it('should reject guild creation when already in a guild', () => {
    const user = fakeUser(1, 'User', 100, 0, 5_000_000);
    user.getCharacterData().guildId = 5;
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('NewGuild')));

    expect(GuildManager.instance.getGuildByName('NewGuild')).to.equal(undefined);
  });

  it('should invite another user to the guild', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    const target = fakeUser(2, 'Target', 10, 0, 0);
    installChannelFake([user, target]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));

    GuildHandler.handleGuildRequest(user as any, new PacketReader(inviteGuildRequest('Target')));

    expect(target.writes.length).to.equal(1);
    const r = new PacketReader(target.writes[0]);
    expect(r.readShort()).to.equal(MapleSendOpcode.GUILD_RESULT.code);
  });

  it('should accept an invite and notify existing members', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    const target = fakeUser(2, 'Target', 10, 0, 0);
    installChannelFake([user, target]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));

    GuildHandler.handleGuildResult(target as any, new PacketReader(acceptInviteRequest(1)));

    expect(target.getCharacterData().guildId).to.equal(1);
    const guild = GuildManager.instance.getGuild(1);
    expect(guild!.members.size).to.equal(2);
  });

  it('should leave a guild and notify remaining members', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    const target = fakeUser(2, 'Target', 10, 0, 0);
    installChannelFake([user, target]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));
    GuildHandler.handleGuildResult(target as any, new PacketReader(acceptInviteRequest(1)));

    target.writes = [];
    user.writes = [];

    GuildHandler.handleGuildRequest(target as any, new PacketReader(leaveGuildRequest()));

    expect(target.getCharacterData().guildId).to.equal(0);
    expect(user.writes.length).to.be.greaterThan(0);
  });

  it('should refuse leave for the guild master', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));

    GuildHandler.handleGuildRequest(user as any, new PacketReader(leaveGuildRequest()));

    expect(user.getCharacterData().guildId).to.equal(1);
  });

  it('should expel a member and notify remaining members', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    const target = fakeUser(2, 'Target', 10, 0, 0);
    installChannelFake([user, target]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));
    GuildHandler.handleGuildResult(target as any, new PacketReader(acceptInviteRequest(1)));

    user.writes = [];

    GuildHandler.handleGuildRequest(user as any, new PacketReader(expelGuildRequest(2)));

    expect(target.getCharacterData().guildId).to.equal(0);
    const guild = GuildManager.instance.getGuild(1);
    expect(guild!.members.has(2)).to.equal(false);
  });

  it('should disband a guild and clear guildId for all members', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    const target = fakeUser(2, 'Target', 10, 0, 0);
    installChannelFake([user, target]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));
    GuildHandler.handleGuildResult(target as any, new PacketReader(acceptInviteRequest(1)));

    GuildHandler.handleGuildRequest(user as any, new PacketReader(disbandGuildRequest()));

    expect(user.getCharacterData().guildId).to.equal(0);
    expect(target.getCharacterData().guildId).to.equal(0);
    expect(GuildManager.instance.getGuild(1)).to.equal(undefined);
  });

  it('should change emblem and notify members', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));

    GuildHandler.handleGuildRequest(user as any, new PacketReader(changeEmblemRequest(10, 2, 20, 3)));

    const guild = GuildManager.instance.getGuild(1);
    expect(guild!.logoBg).to.equal(10);
    expect(guild!.logoBgColor).to.equal(2);
    expect(guild!.logo).to.equal(20);
    expect(guild!.logoColor).to.equal(3);
  });

  it('should increase guild capacity when leader has enough mesos', () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    user.getCharacterData().guildId = 1;
    installChannelFake([user]);

    const guild = new Guild(1, 'Test', 1);
    const member = new GuildMember(1, 'Master', 100, 100, 1, true);
    guild.addMember(member);
    guild.capacity = 10;
    GuildManager.instance.addGuild(guild);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(increaseCapacityRequest()));

    expect(guild.capacity).to.equal(15);
    expect(user.inventoryManager.money).to.be.lessThan(5_000_000);
  });

  it('should write and read a BBS thread', async () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));

    user.writes = [];

    await GuildHandler.handleGuildBBS(user as any, new PacketReader(writeBBSRequest('Hello', 'World', 0)));

    expect(user.writes.length).to.equal(1);

    await GuildHandler.handleGuildBBS(user as any, new PacketReader(listBBSRequest(0)));

    expect(user.writes.length).to.equal(2);
    const r = new PacketReader(user.writes[1]);
    expect(r.readShort()).to.equal(MapleSendOpcode.GUILD_BBS.code);
  });

  it('should reply to a BBS thread', async () => {
    const user = fakeUser(1, 'Master', 100, 0, 5_000_000);
    installChannelFake([user]);

    GuildHandler.handleGuildRequest(user as any, new PacketReader(createGuildRequest('Guild1')));
    await GuildHandler.handleGuildBBS(user as any, new PacketReader(writeBBSRequest('Thread', 'Content', 0)));

    user.writes = [];

    await GuildHandler.handleGuildBBS(user as any, new PacketReader(replyBBSRequest(1, 'Nice post!')));

    expect(user.writes.length).to.equal(1);
  });
});

function fakeUser(id: number, name: string, level = 1, job = 0, money = 0): any {
  return {
    id,
    writes: [] as Buffer[],
    disposeCount: 0,
    getCharacterId: (): number => id,
    getCharacterName: (): string => name,
    getJob: (): number => job,
    getLevel: (): number => level,
    getField: (): any => ({}),
    characterData: { guildId: 0, friendMax: 30, friendManager: { getFriends: (): any[] => [], capacity: 30, hasFriend: (): boolean => false } },
    getCharacterData: function (): any { return this.characterData; },
    inventoryManager: { money },
    getInventoryManager: function (): any { return this.inventoryManager; },
    write(packet: Buffer): void { this.writes.push(packet); },
    dispose(): void { this.disposeCount++; },
    account: null,
  };
}

function installChannelFake(users: any[]): void {
  const byId = new Map(users.map((u: any): [number, any] => [u.getCharacterId(), u]));
  const byName = new Map(users.map((u: any): [string, any] => [u.getCharacterName().toLowerCase(), u]));
  GuildHandler.channelServerOverride = {
    getUserByCharacterId: (id: number): any => byId.get(id) ?? null,
    getUserByCharacterName: (name: string): any => byName.get(name.toLowerCase()) ?? null,
  } as any;
}

function createGuildRequest(name: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(0);
  w.writeMapleAsciiString(name);
  return w.getPacket();
}

function inviteGuildRequest(targetName: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(2);
  w.writeMapleAsciiString(targetName);
  return w.getPacket();
}

function acceptInviteRequest(guildId: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(0x12);
  w.writeInt(guildId);
  return w.getPacket();
}

function leaveGuildRequest(): Buffer {
  const w = new PacketWriter();
  w.writeByte(4);
  return w.getPacket();
}

function expelGuildRequest(targetId: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(5);
  w.writeInt(targetId);
  return w.getPacket();
}

function disbandGuildRequest(): Buffer {
  const w = new PacketWriter();
  w.writeByte(6);
  return w.getPacket();
}

function changeEmblemRequest(bg: number, bgColor: number, logo: number, logoColor: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(7);
  w.writeShort(bg);
  w.writeByte(bgColor);
  w.writeShort(logo);
  w.writeByte(logoColor);
  return w.getPacket();
}

function increaseCapacityRequest(): Buffer {
  const w = new PacketWriter();
  w.writeByte(8);
  return w.getPacket();
}

function writeBBSRequest(title: string, content: string, icon: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(2);
  w.writeBoolean(false);
  w.writeMapleAsciiString(title);
  w.writeMapleAsciiString(content);
  w.writeInt(icon);
  return w.getPacket();
}

function listBBSRequest(page: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(0);
  w.writeByte(page);
  return w.getPacket();
}

function replyBBSRequest(localThreadId: number, content: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(5);
  w.writeInt(localThreadId);
  w.writeMapleAsciiString(content);
  return w.getPacket();
}
