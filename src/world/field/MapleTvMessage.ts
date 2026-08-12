import { AvatarLook } from '../user/AvatarLook';

/**
 * Port of kinoko's MapleTvMessage. A queued Maple TV broadcast with
 * sender/receiver AvatarLook, a 5-line message, and an expire time
 * used by the Field's MapleTV queue tick.
 */
export class MapleTvMessage {
  constructor(
    public readonly flag: number,
    public readonly type: number,
    public readonly sender: AvatarLook,
    public readonly senderName: string,
    public readonly receiver: AvatarLook | null,
    public readonly receiverName: string | null,
    public readonly s1: string,
    public readonly s2: string,
    public readonly s3: string,
    public readonly s4: string,
    public readonly s5: string,
    public readonly expireTime: Date,
  ) {}
}
