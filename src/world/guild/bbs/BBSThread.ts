export class BBSThread {
  constructor(
    readonly threadId: number,
    readonly localThreadId: number,
    readonly posterCharacterId: number,
    readonly posterName: string,
    readonly name: string,
    readonly timestamp: bigint,
    readonly icon: number,
    readonly startPost: string,
    readonly guildId: number,
    readonly replies: BBSReply[] = [],
  ) {}

  get replyCount(): number {
    return this.replies.length;
  }
}

export interface BBSReply {
  replyId: number;
  threadId: number;
  posterCharacterId: number;
  posterName: string;
  timestamp: bigint;
  content: string;
}
