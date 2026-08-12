/** Port of kinoko's MobAttackInfo. */
export class MobAttackInfo {
  actionMask = 0;
  actionAndDir = 0;
  targetInfo = 0;
  multiTargetForBall: Array<[number, number]> = [];
  randTimeForAreaAttack: number[] = [];

  isAttack = false;
  isSkill = false;
}
