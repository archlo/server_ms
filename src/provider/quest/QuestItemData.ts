import { NXNode } from '../../wz-utils/NXNode';
import { JobConstants } from '../../world/job/JobConstants';

export class QuestItemData {
  constructor(
    public readonly itemId: number,
    public readonly count: number,
    public readonly prop: number,
    public readonly gender: number,
    public readonly job: number,
    public readonly jobEx: number,
    public readonly resignRemove: boolean,
  ) {}

  isRandom(): boolean { return this.prop > 0; }
  isStatic(): boolean { return this.prop === 0; }
  isChoice(): boolean { return this.prop === -1; }

  checkJob(jobId: number): boolean {
    const myJobFlag = jobId === 2001 ? 0x20000 : (1 << Math.floor(jobId / 100));
    let job = this.job;
    let jobEx = this.jobEx;
    if ((job | jobEx) === 0) {
      job = -1;
      jobEx = -1;
    }
    return ((((myJobFlag >>> 32) & jobEx) | (myJobFlag & job)) !== 0) || Math.floor(jobId / 100) === 9;
  }

  checkGender(gender: number): boolean { return this.gender === 2 || this.gender === gender; }

  static resolveItemData(itemList: NXNode): QuestItemData[] {
    const items: QuestItemData[] = [];
    for (const itemProp of itemList.nChildren) {
      items.push(QuestItemData.from(itemProp));
    }
    return items;
  }

  static resolveChoiceItemData(itemList: NXNode): QuestItemData[] {
    const items: QuestItemData[] = [];
    for (let i = 0; ; i++) {
      const itemProp = itemList.nGet(String(i)) as NXNode | undefined;
      if (!itemProp) break;
      const prop = itemProp.nGet('prop', 0) as number;
      if (prop !== -1) continue;
      items.push(QuestItemData.from(itemProp));
    }
    return items;
  }

  private static from(itemProp: NXNode): QuestItemData {
    return new QuestItemData(
      itemProp.nGet('id', 0) as number,
      itemProp.nGet('count', 0) as number,
      itemProp.nGet('prop', 0) as number,
      itemProp.nGet('gender', 2) as number,
      itemProp.nGet('job', 0) as number,
      itemProp.nGet('jobEx', 0) as number,
      (itemProp.nGet('resignRemove', 0) as number) !== 0,
    );
  }
}
