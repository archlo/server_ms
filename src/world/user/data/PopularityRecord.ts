export class PopularityRecord {
  private readonly records = new Map<number, number>();

  getRecords(): Map<number, number> {
    return this.records;
  }

  addRecord(characterId: number, timestampMs: number): void {
    this.records.set(characterId, timestampMs);
  }

  hasGivenPopularityToday(): boolean {
    const now = Date.now();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    for (const ts of this.records.values()) {
      if (ts >= todayStart) return true;
    }
    return false;
  }

  hasGivenPopularityTarget(characterId: number): boolean {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).getTime();
    const ts = this.records.get(characterId);
    return ts != null && ts >= monthStart;
  }
}
