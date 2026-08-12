import { Alliance } from './Alliance';

export class AllianceManager {
  static instance: AllianceManager;

  private alliances = new Map<number, Alliance>();
  private allianceIdCounter = 1;

  constructor() {
    AllianceManager.instance = this;
  }

  nextAllianceId(): number {
    return this.allianceIdCounter++;
  }

  getAlliance(allianceId: number): Alliance | undefined {
    return this.alliances.get(allianceId);
  }

  getAllianceByName(name: string): Alliance | undefined {
    for (const a of this.alliances.values()) {
      if (a.name.toLowerCase() === name.toLowerCase()) return a;
    }
    return undefined;
  }

  addAlliance(alliance: Alliance): void {
    this.alliances.set(alliance.allianceId, alliance);
  }

  removeAlliance(allianceId: number): boolean {
    return this.alliances.delete(allianceId);
  }
}
