export class QuestRewardEntry {
  constructor(
    public readonly itemId: number,
    public readonly count: number,
    public readonly prop: number,
    public readonly gender: number,
    public readonly job: number,
  ) {}
}

export class QuestReward {
  constructor(
    public readonly exp: number,
    public readonly meso: number,
    public readonly fame: number,
    public readonly items: QuestRewardEntry[],
    public readonly selectableItems: QuestRewardEntry[],
    public readonly skills: { skillId: number; skillLevel: number }[],
  ) {}
}
