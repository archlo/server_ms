export class MobAttack {
  constructor(
    public readonly skillId: number,
    public readonly skillLevel: number,
    public readonly conMp: number,
    public readonly mpBurn: number,
    public readonly magic: boolean,
    public readonly deadlyAttack: boolean,
  ) {}
}
