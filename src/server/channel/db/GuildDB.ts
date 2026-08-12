import { Database } from '../../center/db/database';
import { ChannelServer } from '../channelServer';
import { Guild } from '../../../world/guild/Guild';
import { GuildMember } from '../../../world/guild/GuildMember';
import { GameConstants } from '../../../world/GameConstants';

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

function serializeMember(m: GuildMember): object {
  return {
    characterId: m.characterId,
    characterName: m.characterName,
    job: m.job,
    level: m.level,
    grade: m.grade,
    online: m.online,
    allianceGrade: m.allianceGrade,
  };
}

function deserializeMember(o: any): GuildMember {
  return new GuildMember(
    o.characterId ?? 0,
    o.characterName ?? '',
    o.job ?? 0,
    o.level ?? 1,
    o.grade ?? 5,
    Boolean(o.online),
    o.allianceGrade ?? 0,
  );
}

function serializeMembers(guild: Guild): object[] {
  return Array.from(guild.members.values()).map(serializeMember);
}

function deserializeMembers(arr: any[], guild: Guild): void {
  for (const o of arr) {
    guild.addMember(deserializeMember(o));
  }
}

function parseJson(v: any): any {
  if (!v) return null;
  if (typeof v === 'string') return JSON.parse(v);
  return v; // MySQL JSON column may already be parsed
}

// ---------------------------------------------------------------------------
// GuildDB - persistent guild storage (mirrors kinoko's SqliteGuildAccessor)
// ---------------------------------------------------------------------------

export const GuildDB = {
  /**
   * Load every guild row from the database into Guild objects.
   * Used on channel server startup to restore in-memory state.
   */
  async loadAllGuilds(): Promise<Guild[]> {
    if (!Database.knex) return [];
    try {
      const rows = await Database.knex('guilds').select(
        'guild_id', 'guild_name', 'leader',
        'capacity', 'notice', 'rank_titles',
        'points', 'logo', 'logo_color', 'logo_bg', 'logo_bg_color',
        'alliance_id', 'signature', 'members',
      );

      const guilds: Guild[] = [];
      for (const row of rows) {
        const guild = new Guild(row.guild_id, row.guild_name, row.leader);
        guild.capacity = row.capacity ?? GameConstants.GUILD_CAPACITY_MIN;
        guild.notice = row.notice ?? '';
        guild.rankTitles = parseJson(row.rank_titles) ?? [...GameConstants.GUILD_GRADE_NAMES];
        guild.points = row.points ?? 0;
        guild.logo = row.logo ?? 0;
        guild.logoColor = row.logo_color ?? 0;
        guild.logoBg = row.logo_bg ?? 0;
        guild.logoBgColor = row.logo_bg_color ?? 0;
        guild.allianceId = row.alliance_id ?? 0;
        guild.signature = row.signature ?? 0;

        const membersArr = parseJson(row.members) ?? [];
        deserializeMembers(membersArr, guild);

        // All members are offline on load; the channel will flip them online
        // as their characters log in.
        for (const charId of guild.members.keys()) {
          guild.setOnline(charId, false);
        }

        guilds.push(guild);
      }
      return guilds;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`GuildDB.loadAllGuilds: ${err.message}`);
      return [];
    }
  },

  /**
   * Insert a brand new guild row. Returns true on success.
   */
  async newGuild(guild: Guild): Promise<boolean> {
    if (!Database.knex) return false;
    try {
      await Database.knex('guilds').insert({
        guild_id: guild.guildId,
        guild_name: guild.name,
        leader: guild.leader,
        capacity: guild.capacity,
        notice: guild.notice,
        rank_titles: JSON.stringify(guild.rankTitles),
        points: guild.points,
        logo: guild.logo,
        logo_color: guild.logoColor,
        logo_bg: guild.logoBg,
        logo_bg_color: guild.logoBgColor,
        alliance_id: guild.allianceId,
        signature: guild.signature,
        members: JSON.stringify(serializeMembers(guild)),
      });
      return true;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`GuildDB.newGuild(${guild.guildId}): ${err.message}`);
      return false;
    }
  },

  /**
   * Update an existing guild row with the current in-memory state.
   * Used after any mutation (member add/remove, emblem, notice, capacity, etc).
   */
  async saveGuild(guild: Guild): Promise<boolean> {
    if (!Database.knex) return false;
    try {
      await Database.knex('guilds')
        .where({ guild_id: guild.guildId })
        .update({
          guild_name: guild.name,
          leader: guild.leader,
          capacity: guild.capacity,
          notice: guild.notice,
          rank_titles: JSON.stringify(guild.rankTitles),
          points: guild.points,
          logo: guild.logo,
          logo_color: guild.logoColor,
          logo_bg: guild.logoBg,
          logo_bg_color: guild.logoBgColor,
          alliance_id: guild.allianceId,
          signature: guild.signature,
          members: JSON.stringify(serializeMembers(guild)),
        });
      return true;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`GuildDB.saveGuild(${guild.guildId}): ${err.message}`);
      return false;
    }
  },

  /**
   * Delete a guild row (on disband).
   */
  async deleteGuild(guildId: number): Promise<boolean> {
    if (!Database.knex) return false;
    try {
      await Database.knex('guilds').where({ guild_id: guildId }).delete();
      return true;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`GuildDB.deleteGuild(${guildId}): ${err.message}`);
      return false;
    }
  },

  /**
   * Check whether a guild name is already taken (case-insensitive).
   */
  async checkGuildNameAvailable(name: string): Promise<boolean> {
    if (!Database.knex) return true;
    try {
      const rows = await Database.knex('guilds')
        .whereRaw('LOWER(guild_name) = ?', [name.toLowerCase()])
        .count('guild_id as cnt');
      return Number(rows[0].cnt) === 0;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`GuildDB.checkGuildNameAvailable: ${err.message}`);
      return false;
    }
  },
};
