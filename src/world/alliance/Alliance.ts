export class Alliance {
  constructor(
    readonly allianceId: number,
    readonly name: string,
    readonly capacity: number = 2,
    public notice: string = '',
    public rankTitles: string[] = ['Master', 'Jr. Master', 'Member', 'Member', 'Member'],
  ) {}

  readonly guildIds: number[] = [];

  addGuild(guildId: number): boolean {
    if (this.guildIds.length >= this.capacity) return false;
    if (this.guildIds.includes(guildId)) return false;
    this.guildIds.push(guildId);
    return true;
  }

  removeGuild(guildId: number): boolean {
    const idx = this.guildIds.indexOf(guildId);
    if (idx < 0) return false;
    this.guildIds.splice(idx, 1);
    return true;
  }

  hasGuild(guildId: number): boolean {
    return this.guildIds.includes(guildId);
  }
}
