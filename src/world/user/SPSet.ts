export class SPSet {
  private id: number = 0;
  private jobLevel: number = 0;
  private sp: number = 0;

  constructor(jobLevel?: number, sp?: number) {
    if (jobLevel !== undefined) this.jobLevel = jobLevel;
    if (sp !== undefined) this.sp = sp;
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }

  getJobLevel(): number { return this.jobLevel; }
  setJobLevel(jobLevel: number): void { this.jobLevel = jobLevel; }

  getSp(): number { return this.sp; }
  setSp(sp: number): void { this.sp = sp; }
}
