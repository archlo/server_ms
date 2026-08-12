import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Guild } from './Guild';

export enum GuildResultType {
  GuildDisconnected = 0x2D,
  GuildInvite = 0x2E,
  GuildJoined = 0x2F,
  GuildMemberLeft = 0x30,
  GuildExpelled = 0x31,
  GuildCapacityChanged = 0x33,
  GuildNotifyChange = 0x34,
  GuildEmblemChanged = 0x35,
  GuildUpdateLoadMembers = 0x36,
  GuildCreated = 0x37,
  GuildDeleted = 0x38,
  GuildNameChanged = 0x3C,
  GuildMarkChanged = 0x3D,
  NotInGuild = 0x3E,
  GuildCreateError = 0x41,
  GuildInviteError = 0x42,
  GuildJoinError = 0x43,
  GuildLeaveError = 0x44,
  GuildExpelError = 0x45,
  GuildDisbandError = 0x46,
  GuildNameAlreadyExists = 0x47,
  GuildCapacityError = 0x48,
}

export class GuildPacket {
  static loadGuildDone(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildUpdateLoadMembers);
    w.writeInt(guild.guildId);
    guild.encodeForLoadGuild(w);
    return w.getPacket();
  }

  static guildCreated(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildCreated);
    w.writeInt(guild.guildId);
    w.writeInt(guild.capacity);
    w.writeMapleAsciiString(guild.name);
    return w.getPacket();
  }

  static guildDeleted(guildId: number): Buffer {
    const w = begin(GuildResultType.GuildDeleted);
    w.writeInt(guildId);
    return w.getPacket();
  }

  static guildInvite(inviterName: string): Buffer {
    const w = begin(GuildResultType.GuildInvite);
    w.writeInt(0); // unknown
    w.writeMapleAsciiString(inviterName);
    return w.getPacket();
  }

  static guildJoined(guild: Guild, characterId: number): Buffer {
    const w = begin(GuildResultType.GuildJoined);
    w.writeInt(guild.guildId);
    w.writeInt(characterId);
    w.writeInt(0); // nChannelId
    return w.getPacket();
  }

  static guildMemberLeft(guild: Guild, characterId: number): Buffer {
    const w = begin(GuildResultType.GuildMemberLeft);
    w.writeInt(guild.guildId);
    w.writeInt(characterId);
    return w.getPacket();
  }

  static guildExpelled(guildId: number, targetId: number): Buffer {
    const w = begin(GuildResultType.GuildExpelled);
    w.writeInt(guildId);
    w.writeInt(targetId);
    return w.getPacket();
  }

  static guildCapacityChanged(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildCapacityChanged);
    w.writeInt(guild.guildId);
    w.writeInt(guild.capacity);
    return w.getPacket();
  }

  static guildEmblemChanged(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildEmblemChanged);
    w.writeInt(guild.guildId);
    w.writeShort(guild.logoBg);
    w.writeByte(guild.logoBgColor);
    w.writeShort(guild.logo);
    w.writeByte(guild.logoColor);
    return w.getPacket();
  }

  static guildNotifyChange(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildNotifyChange);
    w.writeInt(guild.guildId);
    w.writeInt(0); // nMemberUpdateBits (0 = all)
    guild.encodeForMemberList(w);
    return w.getPacket();
  }

  static guildNameChanged(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildNameChanged);
    w.writeInt(guild.guildId);
    w.writeMapleAsciiString(guild.name);
    return w.getPacket();
  }

  static guildMarkChanged(guild: Guild): Buffer {
    const w = begin(GuildResultType.GuildMarkChanged);
    w.writeInt(guild.guildId);
    w.writeShort(guild.logoBg);
    w.writeByte(guild.logoBgColor);
    w.writeShort(guild.logo);
    w.writeByte(guild.logoColor);
    return w.getPacket();
  }

  static notInGuild(): Buffer {
    return beginSimple(GuildResultType.NotInGuild);
  }

  static error(type: GuildResultType): Buffer {
    return beginSimple(type);
  }

  static serverMsg(message: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.BROADCAST_MSG.code);
    w.writeByte(4); // notice
    w.writeMapleAsciiString(message);
    return w.getPacket();
  }
}

function begin(type: GuildResultType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.GUILD_RESULT.code);
  w.writeByte(type);
  return w;
}

function beginSimple(type: GuildResultType): Buffer {
  return begin(type).getPacket();
}
