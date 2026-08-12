import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Alliance } from './Alliance';
import { Guild } from '../guild/Guild';

export enum AllianceResultType {
  LoadAllianceDone = 0x01,
  AllianceCreated = 0x02,
  AllianceDeleted = 0x03,
  AllianceJoined = 0x05,
  AllianceGuildLeft = 0x06,
  AllianceNotice = 0x07,
  AllianceRankChange = 0x08,
  AllianceError = 0x09,
  AllianceInvite = 0x0A,
}

export class AlliancePacket {
  static loadAllianceDone(alliance: Alliance, guilds: Guild[]): Buffer {
    const w = begin(AllianceResultType.LoadAllianceDone);
    w.writeInt(alliance.allianceId);
    w.writeMapleAsciiString(alliance.name);
    for (let i = 1; i <= 5; i++) {
      w.writeMapleAsciiString(alliance.rankTitles[i - 1] ?? '');
    }
    w.writeByte(guilds.length);
    for (const guild of guilds) {
      w.writeInt(guild.guildId);
      w.writeMapleAsciiString(guild.name);
      w.writeShort(guild.logoBg);
      w.writeByte(guild.logoBgColor);
      w.writeShort(guild.logo);
      w.writeByte(guild.logoColor);
    }
    w.writeMapleAsciiString(alliance.notice);
    w.writeInt(alliance.capacity);
    return w.getPacket();
  }

  static allianceCreated(alliance: Alliance): Buffer {
    const w = begin(AllianceResultType.AllianceCreated);
    w.writeInt(alliance.allianceId);
    w.writeMapleAsciiString(alliance.name);
    return w.getPacket();
  }

  static allianceInvite(inviterName: string, allianceName: string): Buffer {
    const w = begin(AllianceResultType.AllianceInvite);
    w.writeInt(0);
    w.writeMapleAsciiString(inviterName);
    w.writeMapleAsciiString(allianceName);
    return w.getPacket();
  }

  static allianceError(): Buffer {
    return beginSimple(AllianceResultType.AllianceError);
  }
}

function begin(type: AllianceResultType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.ALLIANCE_RESULT.code);
  w.writeByte(type);
  return w;
}

function beginSimple(type: AllianceResultType): Buffer {
  return begin(type).getPacket();
}
