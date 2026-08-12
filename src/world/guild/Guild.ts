import { PacketWriter } from '../../protocol/packets/packetWriter';
import { GuildMember } from './GuildMember';
import { GameConstants } from '../GameConstants';

export class Guild {
  guildId: number;
  name: string;
  leader: number;
  logo = 0;
  logoColor = 0;
  logoBg = 0;
  logoBgColor = 0;
  capacity: number;
  notice = '';
  rankTitles: string[];
  points = 0;
  allianceId = 0;
  signature = 0;

  readonly members = new Map<number, GuildMember>();

  constructor(guildId: number, name: string, leader: number) {
    this.guildId = guildId;
    this.name = name;
    this.leader = leader;
    this.capacity = GameConstants.GUILD_CAPACITY_MIN;
    this.rankTitles = [...GameConstants.GUILD_GRADE_NAMES];
  }

  getMember(characterId: number): GuildMember | undefined {
    return this.members.get(characterId);
  }

  addMember(member: GuildMember): boolean {
    if (this.members.has(member.characterId)) return false;
    if (this.members.size >= this.capacity) return false;
    this.members.set(member.characterId, member);
    return true;
  }

  removeMember(characterId: number): boolean {
    return this.members.delete(characterId);
  }

  setOnline(characterId: number, online: boolean): void {
    const m = this.members.get(characterId);
    if (m) {
      this.members.set(characterId, new GuildMember(
        m.characterId, m.characterName, m.job, m.level, m.grade, online, m.allianceGrade,
      ));
    }
  }

  encodeForMemberList(w: PacketWriter): void {
    w.writeShort(this.members.size);
    for (const member of this.members.values()) {
      member.encode(w);
    }
  }

  encodeForLoadGuild(w: PacketWriter): void {
    w.writeInt(this.guildId);
    w.writeMapleAsciiString(this.name);
    w.writeShort(this.logoBg);
    w.writeByte(this.logoBgColor);
    w.writeShort(this.logo);
    w.writeByte(this.logoColor);
    w.writeInt(this.points);
    w.writeInt(this.capacity);
    w.writeInt(this.members.size);
    for (let i = 1; i <= 5; i++) {
      w.writeMapleAsciiString(this.rankTitles[i - 1] ?? '');
    }
    w.writeMapleAsciiString(this.notice);
    w.writeInt(this.signature);
    w.writeInt(this.allianceId);
    w.writeByte(0); // nAllianceMarkBg
    w.writeByte(0); // nAllianceMarkBgColor
    w.writeByte(0); // nAllianceMark
    w.writeByte(0); // nAllianceMarkColor
  }
}
