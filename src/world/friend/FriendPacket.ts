import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { Friend } from './Friend';

export enum FriendResultType {
  LoadFriend_Done = 7,
  SetFriend_Done = 9,
  DeleteFriend_Done = 12,
  NotifyFriendAdd = 14,
  FriendFull = 17,
  UnknownUser = 20,
  ServerMsg = 25,
}

export class FriendPacket {
  static loadFriendDone(friends: Friend[]): Buffer {
    const w = begin(FriendResultType.LoadFriend_Done);
    w.writeByte(friends.length);
    for (const friend of friends) friend.encode(w);
    return w.getPacket();
  }

  static setFriendDone(friend: Friend): Buffer {
    const w = begin(FriendResultType.SetFriend_Done);
    friend.encode(w);
    return w.getPacket();
  }

  static deleteFriendDone(characterId: number): Buffer {
    const w = begin(FriendResultType.DeleteFriend_Done);
    w.writeInt(characterId);
    return w.getPacket();
  }

  static notifyFriendAdd(friend: Friend): Buffer {
    const w = begin(FriendResultType.NotifyFriendAdd);
    friend.encode(w);
    return w.getPacket();
  }

  static of(type: FriendResultType): Buffer {
    return begin(type).getPacket();
  }

  static serverMsg(message: string): Buffer {
    const w = begin(FriendResultType.ServerMsg);
    w.writeMapleAsciiString(message);
    return w.getPacket();
  }
}

function begin(type: FriendResultType): PacketWriter {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.FRIEND_RESULT.code);
  w.writeByte(type);
  return w;
}
