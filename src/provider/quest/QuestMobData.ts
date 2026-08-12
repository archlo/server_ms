export class QuestMobData {
  constructor(
    public readonly order: number,
    public readonly mobId: number,
    public readonly count: number,
  ) {}

  isMatch(killedMobId: number): boolean {
    return this.mobId === killedMobId;
  }
}
