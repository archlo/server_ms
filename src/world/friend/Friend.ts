import { PacketWriter } from '../../protocol/packets/packetWriter';
import { GameConstants } from '../GameConstants';

export class Friend {
  constructor(
    readonly characterId: number,
    readonly characterName: string,
    readonly groupName: string = GameConstants.DEFAULT_FRIEND_GROUP,
    readonly flag = 0,
    readonly channelId = GameConstants.CHANNEL_OFFLINE,
  ) {}

  withGroup(groupName: string): Friend {
    return new Friend(this.characterId, this.characterName, groupName, this.flag, this.channelId);
  }

  withChannel(channelId: number): Friend {
    return new Friend(this.characterId, this.characterName, this.groupName, this.flag, channelId);
  }

  encode(w: PacketWriter): void {
    w.writeInt(this.characterId);
    w.writeFixedString(this.characterName, 13);
    w.writeByte(0); // friend flag / account-friend marker, not yet ported
    w.writeInt(this.channelId);
    w.writeFixedString(this.groupName, 17);
  }
}
