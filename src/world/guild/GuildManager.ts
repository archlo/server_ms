import { Guild } from './Guild';

export class GuildManager {
  static instance: GuildManager;

  private guilds = new Map<number, Guild>();
  private guildIdCounter = 1;

  constructor() {
    GuildManager.instance = this;
  }

  nextGuildId(): number {
    return this.guildIdCounter++;
  }

  /**
   * Seed the guild id counter so newly created guilds do not collide with
   * guild ids already persisted in the database.
   */
  setGuildIdCounter(maxId: number): void {
    this.guildIdCounter = Math.max(this.guildIdCounter, maxId + 1);
  }

  getGuild(guildId: number): Guild | undefined {
    return this.guilds.get(guildId);
  }

  getGuildByName(name: string): Guild | undefined {
    for (const guild of this.guilds.values()) {
      if (guild.name.toLowerCase() === name.toLowerCase()) return guild;
    }
    return undefined;
  }

  addGuild(guild: Guild): void {
    this.guilds.set(guild.guildId, guild);
  }

  removeGuild(guildId: number): boolean {
    return this.guilds.delete(guildId);
  }

  getGuildByLeader(characterId: number): Guild | undefined {
    for (const guild of this.guilds.values()) {
      if (guild.leader === characterId) return guild;
    }
    return undefined;
  }

  getGuildByMember(characterId: number): Guild | undefined {
    for (const guild of this.guilds.values()) {
      if (guild.members.has(characterId)) return guild;
    }
    return undefined;
  }
}
