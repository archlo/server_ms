import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Guild } from '../guild/Guild';
import { AllianceManager } from '../alliance/AllianceManager';

/**
 * Port of kinoko's GuildInfo (kinoko/world/user/GuildInfo.java).
 * Immutable DTO carrying the guild/alliance fields needed when encoding a
 * user's avatar in enter-field/remote packets. An "empty" GuildInfo (all
 * zeros / empty strings) is used when the character is not in a guild.
 */
export class GuildInfo {
  static readonly EMPTY = new GuildInfo(0, '', 0, 0, 0, 0, 0, 0, 0, '');

  constructor(
    readonly guildId: number,
    readonly guildName: string,
    readonly guildRank: number,
    readonly memberMax: number,
    readonly markBg: number,
    readonly markBgColor: number,
    readonly mark: number,
    readonly markColor: number,
    readonly allianceId: number,
    readonly allianceName: string,
  ) {}

  /**
   * Port of kinoko's GuildInfo::from. Resolves the member's rank and the
   * alliance name (if any) from the guild/alliance managers.
   */
  static from(guild: Guild, characterId: number): GuildInfo {
    const member = guild.getMember(characterId);
    const allianceName = guild.allianceId !== 0
      ? AllianceManager.instance?.getAlliance(guild.allianceId)?.name ?? ''
      : '';
    return new GuildInfo(
      guild.guildId,
      guild.name,
      member?.grade ?? 0,
      guild.capacity,
      guild.logoBg,
      guild.logoBgColor,
      guild.logo,
      guild.logoColor,
      guild.allianceId,
      allianceName,
    );
  }

  /** Full GuildInfo encode (matches kinoko GuildInfo::encode). Used by central/guild-result packets. */
  encode(w: PacketWriter): void {
    w.writeInt(this.guildId);
    w.writeMapleAsciiString(this.guildName);
    w.writeByte(this.guildRank);
    w.writeInt(this.memberMax);
    w.writeShort(this.markBg);
    w.writeByte(this.markBgColor);
    w.writeShort(this.mark);
    w.writeByte(this.markColor);
    w.writeInt(this.allianceId);
    w.writeMapleAsciiString(this.allianceName);
  }
}
