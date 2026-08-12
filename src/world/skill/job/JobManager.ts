import { Job } from './Job';
import { Char } from '../../user/Char';
import { BaseStat } from '../../../enums/BaseStat';

const jobHandlers: Map<number, Job> = new Map();

export function registerJobHandler(jobCode: number, handler: Job): void {
  jobHandlers.set(jobCode, handler);
}

export function getJobHandler(jobCode: number): Job | null {
  return jobHandlers.get(jobCode) ?? null;
}

export function setDefaultCharStatValues(chr: Char): void {
  chr.addBaseStat(BaseStat.STR, 12);
  chr.addBaseStat(BaseStat.DEX, 5);
  chr.addBaseStat(BaseStat.INT, 4);
  chr.addBaseStat(BaseStat.LUK, 4);
  chr.addBaseStat(BaseStat.MHP, 50);
  chr.addBaseStat(BaseStat.MMP, 5);
}
