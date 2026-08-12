import { Mob } from '../field/mob/Mob';

/** Port of kinoko's AttackInfo (per-mob hit data within an Attack). */
export class AttackInfo {
  mobId = 0;
  hitAction = 0;
  actionAndDir = 0;
  attackCount = 0; // only used for meso explosion
  hitX = 0;
  hitY = 0;
  delay = 0;
  readonly critical: number[] = new Array(15).fill(0);
  readonly damage: number[] = new Array(15).fill(0);
  random: bigint[] = [];
  mob: Mob | null = null;
}
