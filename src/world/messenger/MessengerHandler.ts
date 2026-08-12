import { PacketReader } from '../../protocol/packets/packetReader';
import { MessagePacket } from '../user/MessagePacket';
import { User } from '../user/User';
import { MessengerPacket } from './MessengerPacket';
import { messengerManager } from './MessengerManager';
import { MessengerRoom } from './MessengerRoom';

enum MessengerRequestType {
  Open = 0,
  Invite = 1,
  Leave = 2,
  Decline = 3,
  Chat = 5,
}

export class MessengerHandler {
  /** Injectable for testing — when null, uses lazy require. */
  static channelServerOverride: any = null;

  static handleMessenger(user: User, r: PacketReader): void {
    const type = r.offset < r.data.length ? r.readByte() : MessengerRequestType.Open;

    switch (type) {
      case MessengerRequestType.Open:
        MessengerHandler.open(user, r);
        return;
      case MessengerRequestType.Invite:
        MessengerHandler.invite(user, r);
        return;
      case MessengerRequestType.Leave:
        MessengerHandler.leave(user);
        return;
      case MessengerRequestType.Decline:
        MessengerHandler.decline(user, r);
        return;
      case MessengerRequestType.Chat:
        MessengerHandler.chat(user, r);
        return;
      default:
        user.write(MessagePacket.system('That messenger action is not available yet.'));
        user.dispose();
        return;
    }
  }

  private static open(user: User, r: PacketReader): void {
    const requestedRoomId = r.offset + 4 <= r.data.length ? r.readInt() : 0;
    const room = requestedRoomId > 0
      ? messengerManager.joinRoom(user, requestedRoomId)
      : messengerManager.createRoom(user);
    if (!room) {
      user.write(MessagePacket.system('Unable to join that messenger room.'));
      user.dispose();
      return;
    }

    const self = room.getMember(user.getCharacterId());
    if (!self) return;
    MessengerHandler.broadcastRoom(room, MessengerPacket.join(self), user.getCharacterId());
    user.write(MessengerPacket.open(room, self));
  }

  private static invite(user: User, r: PacketReader): void {
    const targetName = r.readMapleAsciiString();
    const room = messengerManager.getRoomByUser(user);

    if (!room) {
      user.write(MessagePacket.system('You are not in a messenger room.'));
      return;
    }

    const target = MessengerHandler.getChannelServer()?.getUserByCharacterName(targetName);
    if (!target || target.getCharacterId() === user.getCharacterId()) {
      user.write(MessagePacket.system('Unable to find that character.'));
      return;
    }

    target.write(MessengerPacket.invite(user.getCharacterName(), room.messengerId));
  }

  private static leave(user: User): void {
    const room = messengerManager.getRoomByUser(user);
    const self = room?.getMember(user.getCharacterId()) ?? null;
    if (!room || !self) {
      user.dispose();
      return;
    }

    messengerManager.leaveRoom(user);
    const packet = MessengerPacket.leave(self.position);
    user.write(packet);
    MessengerHandler.broadcastRoom(room, packet, user.getCharacterId());
  }

  private static decline(user: User, r: PacketReader): void {
    const inviterName = r.readMapleAsciiString();
    const inviter = MessengerHandler.getChannelServer()?.getUserByCharacterName(inviterName);
    if (inviter) {
      inviter.write(MessagePacket.system(`${user.getCharacterName()} has declined your messenger invite.`));
    }
  }

  private static chat(user: User, r: PacketReader): void {
    const text = r.readMapleAsciiString();
    const room = messengerManager.getRoomByUser(user);
    if (!room) {
      user.write(MessagePacket.system('You are not in a messenger room.'));
      return;
    }
    MessengerHandler.broadcastRoom(room, MessengerPacket.chat(user.getCharacterName(), text));
  }

  private static broadcastRoom(room: MessengerRoom, packet: Buffer, exceptCharacterId?: number): void {
    for (const member of room.getMembers()) {
      if (member.characterId === exceptCharacterId) continue;
      member.user?.write(packet);
    }
  }

  private static getChannelServer(): any {
    return MessengerHandler.channelServerOverride
      ?? (require('../../server/channel/channelServer').ChannelServer.instance ?? null);
  }
}
