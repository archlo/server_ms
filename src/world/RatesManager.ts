import { Config } from '../util/config';

/**
 * Runtime-adjustable game rate multipliers, read from config/game.hjson at
 * startup and changeable live through the admin panel (no server restart
 * needed for rates). Lives in the channel worker process; values are applied
 * where EXP is granted and where drops are rolled.
 */
export class RatesManager {
  private static _expRate = 1;
  private static _dropRate = 1;
  private static _mesoRate = 1;

  static initialize(): void {
    const game = Config.instance?.game;
    RatesManager._expRate = Math.max(0.01, Number(game?.expRate ?? game?.exp_multiplier ?? 1));
    RatesManager._dropRate = Math.max(0.01, Number(game?.dropRate ?? game?.drop_multiplier ?? 1));
    RatesManager._mesoRate = Math.max(0.01, Number(game?.mesoRate ?? game?.meso_multiplier ?? 1));
  }

  static get expRate(): number { return RatesManager._expRate; }
  static get dropRate(): number { return RatesManager._dropRate; }
  static get mesoRate(): number { return RatesManager._mesoRate; }

  static setRates(expRate?: number, dropRate?: number, mesoRate?: number): void {
    if (expRate !== undefined) RatesManager._expRate = Math.max(0.01, expRate);
    if (dropRate !== undefined) RatesManager._dropRate = Math.max(0.01, dropRate);
    if (mesoRate !== undefined) RatesManager._mesoRate = Math.max(0.01, mesoRate);
  }

  static snapshot(): { expRate: number; dropRate: number; mesoRate: number } {
    return { expRate: RatesManager._expRate, dropRate: RatesManager._dropRate, mesoRate: RatesManager._mesoRate };
  }
}
