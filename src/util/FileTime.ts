export class FileTime {
  static readonly MAX_TIME: bigint = BigInt(150842304000000000);
  static readonly PLAIN_ZERO: bigint = BigInt(0);

  private fileTime: bigint = BigInt(0);
  private static readonly FT_UT_OFFSET: bigint = BigInt(116444736000000000);

  constructor(fileTime: bigint = BigInt(0)) {
    this.fileTime = fileTime;
  }

  static fromType(type: bigint): FileTime {
    return new FileTime(type);
  }

  static fromLong(time: bigint): FileTime {
    return new FileTime(time);
  }

  static fromDate(date: Date): FileTime {
    const epoch = BigInt(date.getTime()) * BigInt(10000) + FileTime.FT_UT_OFFSET;
    return new FileTime(epoch);
  }

  toDate(): Date {
    const epoch = Number((this.fileTime - FileTime.FT_UT_OFFSET) / BigInt(10000));
    return new Date(epoch);
  }

  deepCopy(): FileTime {
    return new FileTime(this.fileTime);
  }

  isPermanent(): boolean {
    return this.fileTime === FileTime.MAX_TIME || this.fileTime === BigInt(0);
  }

  equals(other: FileTime): boolean {
    return this.fileTime === other.fileTime;
  }

  getLong(): bigint {
    return this.fileTime;
  }

  encode(packet: any): void {
    packet.encodeLong(this.fileTime);
  }
}
