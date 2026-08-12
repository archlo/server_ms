import { PacketReader } from '../../protocol/packets/packetReader';
import { ChatType } from '../user/ChatType';
import { MessagePacket } from '../user/MessagePacket';
import { User } from '../user/User';
import { SocialPacket } from './SocialPacket';

export class SocialHandler {
  static handleGroupMessage(user: User, r: PacketReader): void {
    // OG SendGroupMessage: str(update_time), byte(nChatTarget), byte(nMemberCnt), int[](memberIDs), str(text)
    r.readMapleAsciiString(); // update_time (unused)
    const type = r.readByte() as ChatType;
    const targetCount = r.readByte();
    const targetIds: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      targetIds.push(r.readInt());
    }
    const text = r.readMapleAsciiString();

    if (!SocialHandler.isSupportedGroupMessage(type)) {
      user.write(MessagePacket.system('That group chat type is not available yet.'));
      user.dispose();
      return;
    }

    const packet = SocialPacket.groupMessage(user, type, text);
    const sent = new Set<number>();
    for (const targetId of targetIds) {
      if (targetId === user.getCharacterId() || sent.has(targetId)) continue;
      const target = getChannelServer().instance?.getUserByCharacterId(targetId);
      if (!target) continue;
      const targetBlocked = target.getCharacterData().chatBlockedList;
      if (targetBlocked.includes(user.getCharacterName().toLowerCase())) continue;
      target.write(packet);
      sent.add(targetId);
    }
  }

  static handleWhisper(user: User, r: PacketReader): void {
    const targetName = r.readMapleAsciiString();
    const text = r.readMapleAsciiString();
    const target = getChannelServer().instance?.getUserByCharacterName(targetName);

    if (!target || target.getCharacterId() === user.getCharacterId()) {
      user.write(SocialPacket.whisperResult(targetName, false));
      return;
    }

    const blockedList = target.getCharacterData().chatBlockedList;
    if (blockedList.includes(user.getCharacterName().toLowerCase())) {
      user.write(SocialPacket.whisperResult(targetName, false));
      return;
    }

    target.write(SocialPacket.whisper(user, text));
    user.write(SocialPacket.whisperResult(target.getCharacterName(), true));
  }

  private static isSupportedGroupMessage(type: ChatType): boolean {
    return type === ChatType.GROUPPARTY
      || type === ChatType.GROUPFRIEND
      || type === ChatType.GROUPGUILD
      || type === ChatType.GROUPALLIANCE;
  }
}

function getChannelServer(): typeof import('../../server/channel/channelServer').ChannelServer {
  return require('../../server/channel/channelServer').ChannelServer;
}
