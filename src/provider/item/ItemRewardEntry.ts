export class ItemRewardEntry {
  constructor(
    public readonly itemId: number,
    public readonly count: number,
    public readonly probability: number,
    public readonly period: number,
    public readonly effect: string | null,
  ) {}

  hasEffect(): boolean { return !!this.effect; }
}
