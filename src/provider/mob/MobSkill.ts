import { MobSkillType } from './MobSkillType';

export class MobSkill {
  skillSN: number = 0;
  action: number = 0;
  level: number = 0;
  effectAfter: number = 0;
  skillAfter: number = 0;
  firstAttack: boolean = false;
  onlyFsm: boolean = false;
  onlyOtherSkill: boolean = false;
  afterDelay: number = 0;
  fixDamR: number = 0;
  doFirst: boolean = false;
  info: string = '';
  afterDead: boolean = false;
  afterAttack: number = -1;
  afterAttackCount: number = 0;
  coolTime: number = 0;
  speak: string = '';
  skillID: number = 0;
  disease: number = 0;

  constructor(
    public readonly skillType?: MobSkillType,
    public readonly skillId?: number,
    public readonly skillLevel?: number,
  ) {}
}
