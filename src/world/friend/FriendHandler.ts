import { PacketReader } from '../../protocol/packets/packetReader';
import { MessagePacket } from '../user/MessagePacket';
import { User } from '../user/User';
import { Friend } from './Friend';
import { FriendPacket, FriendResultType } from './FriendPacket';
import { GameConstants } from '../GameConstants';

enum FriendRequestType {
  LoadFriend = 0,
  SetFriend = 1,
  AcceptFriend = 2,
  DeleteFriend = 3,
  ChangeGroup = 4,
}

export class FriendHandler {
  /** Injectable for testing — when null, uses lazy require. */
  static channelServerOverride: any = null;

  static handleFriendRequest(user: User, r: PacketReader): void {
    const type = r.offset < r.data.length ? r.readByte() : FriendRequestType.LoadFriend;

    switch (type) {
      case FriendRequestType.LoadFriend:
        FriendHandler.loadFriend(user);
        return;
      case FriendRequestType.SetFriend:
        FriendHandler.setFriend(user, r);
        return;
      case FriendRequestType.AcceptFriend:
        FriendHandler.acceptFriend(user, r);
        return;
      case FriendRequestType.DeleteFriend:
        FriendHandler.deleteFriend(user, r);
        return;
      case FriendRequestType.ChangeGroup:
        FriendHandler.changeGroup(user, r);
        return;
      default:
        user.write(MessagePacket.system('That buddy action is not available yet.'));
        user.dispose();
        return;
    }
  }

  private static loadFriend(user: User): void {
    user.write(FriendPacket.loadFriendDone(user.getFriendManager().getFriends()));
  }

  private static setFriend(user: User, r: PacketReader): void {
    const targetName = r.readMapleAsciiString();
    const target = FriendHandler.getChannelServer()?.getUserByCharacterName(targetName);

    if (!target || target.getCharacterId() === user.getCharacterId()) {
      user.write(FriendPacket.of(FriendResultType.UnknownUser));
      return;
    }

    const fm = user.getFriendManager();
    if (fm.isFull()) {
      user.write(FriendPacket.of(FriendResultType.FriendFull));
      return;
    }

    if (fm.hasFriend(target.getCharacterId())) {
      user.write(MessagePacket.system('That character is already on your buddy list.'));
      return;
    }

    const friend = new Friend(
      target.getCharacterId(),
      target.getCharacterName(),
      GameConstants.DEFAULT_FRIEND_GROUP,
      0,
      target.getField() ? 0 : GameConstants.CHANNEL_OFFLINE,
    );

    fm.addFriend(friend);
    user.write(FriendPacket.setFriendDone(friend));

    const targetFriend = new Friend(
      user.getCharacterId(),
      user.getCharacterName(),
      GameConstants.DEFAULT_FRIEND_GROUP,
      0,
      user.getField() ? 0 : GameConstants.CHANNEL_OFFLINE,
    );
    target.getFriendManager().addFriend(targetFriend);
    target.write(FriendPacket.notifyFriendAdd(targetFriend));
  }

  private static acceptFriend(user: User, r: PacketReader): void {
    const targetId = r.readInt();
    const target = FriendHandler.getChannelServer()?.getUserByCharacterId(targetId);

    if (!target) {
      user.write(FriendPacket.of(FriendResultType.UnknownUser));
      return;
    }

    const fm = user.getFriendManager();
    if (fm.isFull()) {
      user.write(FriendPacket.of(FriendResultType.FriendFull));
      return;
    }

    if (fm.hasFriend(targetId)) {
      user.write(MessagePacket.system('That character is already on your buddy list.'));
      return;
    }

    const friend = new Friend(
      target.getCharacterId(),
      target.getCharacterName(),
      GameConstants.DEFAULT_FRIEND_GROUP,
      0,
      target.getField() ? 0 : GameConstants.CHANNEL_OFFLINE,
    );

    fm.addFriend(friend);
    user.write(FriendPacket.setFriendDone(friend));
  }

  private static deleteFriend(user: User, r: PacketReader): void {
    const targetId = r.readInt();
    const fm = user.getFriendManager();

    if (!fm.hasFriend(targetId)) return;

    fm.removeFriend(targetId);

    const target = FriendHandler.getChannelServer()?.getUserByCharacterId(targetId);
    if (target) {
      target.getFriendManager().removeFriend(user.getCharacterId());
    }

    user.write(FriendPacket.deleteFriendDone(targetId));
  }

  private static changeGroup(user: User, r: PacketReader): void {
    const targetId = r.readInt();
    const groupName = r.readMapleAsciiString();
    const fm = user.getFriendManager();

    if (fm.changeGroup(targetId, groupName)) {
      user.write(FriendPacket.loadFriendDone(fm.getFriends()));
    }
  }

  private static getChannelServer(): any {
    return FriendHandler.channelServerOverride
      ?? (require('../../server/channel/channelServer').ChannelServer.instance ?? null);
  }
}
