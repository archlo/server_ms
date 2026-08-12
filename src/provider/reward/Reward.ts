export class Reward {
  constructor(
    public readonly itemId: number,
    public readonly min: number,
    public readonly max: number,
    public readonly prob: number,
    public readonly questId = 0,
    public readonly fieldId = 0,
  ) {}

  isMoney(): boolean { return this.itemId === 0; }
  isQuest(): boolean { return this.questId !== 0; }
  isFieldRequirement(): boolean { return this.fieldId !== 0; }

  static item(itemId: number, min: number, max: number, prob: number, questId = 0, fieldId = 0): Reward {
    return new Reward(itemId, min, max, prob, questId, fieldId);
  }

  static money(min: number, max: number, prob: number): Reward {
    return new Reward(0, min, max, prob);
  }
}
