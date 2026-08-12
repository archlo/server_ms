import { Util } from '../../../util/Util';

export class Option {
  static keyRng = () => Math.random();
  nOption: number = 0;
  rOption: number = 0;
  tOption: number = 0;
  xOption: number = 0;
  mOption: number = 0;
  wOption: number = 0;
  uOption: number = 0;
  zOption: number = 0;
  bOption: number = 0;
  sOption: number = 0;
  ssOption: number = 0;
  cOption: number = 0;
  yOption: number = 0;
  nReason: number = 0;
  nValue: number = 0;
  nKey: number = 0;
  tStart: number = 0;
  tTerm: number = 0;
  pOption: number = 0;
  slv: number = 0;
  extraOpts: Option[] = [];
  isInMillis: boolean = false;

  constructor(skillID?: number, slv?: number);
  constructor(itemID?: number, duration?: number);
  constructor(skillIDOrItemID?: number, slvOrDuration?: number) {
    if (skillIDOrItemID !== undefined) {
      this.nReason = skillIDOrItemID;
      this.rOption = skillIDOrItemID;
      this.tStart = Date.now();
      if (slvOrDuration !== undefined) {
        if (slvOrDuration < 100) {
          this.slv = slvOrDuration;
        } else {
          this.tTerm = slvOrDuration;
          this.tOption = slvOrDuration;
        }
      }
    }
  }

  deepCopy(): Option {
    const copy = new Option();
    copy.nOption = this.nOption;
    copy.rOption = this.rOption;
    copy.tOption = this.tOption;
    copy.xOption = this.xOption;
    copy.mOption = this.mOption;
    copy.wOption = this.wOption;
    copy.uOption = this.uOption;
    copy.zOption = this.zOption;
    copy.bOption = this.bOption;
    copy.sOption = this.sOption;
    copy.ssOption = this.ssOption;
    copy.cOption = this.cOption;
    copy.yOption = this.yOption;
    copy.nReason = this.nReason;
    copy.nValue = this.nValue;
    copy.nKey = this.nKey;
    copy.tStart = this.tStart;
    copy.tTerm = this.tTerm;
    copy.pOption = this.pOption;
    copy.slv = this.slv;
    copy.extraOpts = this.extraOpts.map(o => o.deepCopy());
    copy.isInMillis = this.isInMillis;
    return copy;
  }

  equals(other: Option): boolean {
    return this.rOption === other.rOption && this.nReason === other.nReason;
  }

  hashCode(): number {
    let result = 1;
    result = 31 * result + this.nOption;
    result = 31 * result + this.rOption;
    result = 31 * result + this.tOption;
    result = 31 * result + this.xOption;
    result = 31 * result + this.mOption;
    result = 31 * result + this.wOption;
    result = 31 * result + this.uOption;
    result = 31 * result + this.zOption;
    result = 31 * result + this.bOption;
    result = 31 * result + this.sOption;
    result = 31 * result + this.ssOption;
    result = 31 * result + this.cOption;
    result = 31 * result + this.yOption;
    result = 31 * result + this.nReason;
    result = 31 * result + this.nValue;
    result = 31 * result + this.nKey;
    result = 31 * result + this.tStart;
    result = 31 * result + this.tTerm;
    result = 31 * result + this.pOption;
    result = 31 * result + this.slv;
    result = 31 * result + (this.isInMillis ? 1 : 0);
    return result;
  }

  toString(): string {
    if (this.nReason !== 0) {
      return `Option{nReason=${this.nReason}, rOption=${this.rOption}, nOption=${this.nOption}, tOption=${this.tOption}, tTerm=${this.tTerm}, slv=${this.slv}}`;
    }
    return `Option{rOption=${this.rOption}, nOption=${this.nOption}, tOption=${this.tOption}}`;
  }

  setTimeToMillis(): void {
    this.tTerm *= 1000;
    this.tOption *= 1000;
  }
}
