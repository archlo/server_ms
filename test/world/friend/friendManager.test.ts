import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { Friend } from '../../../src/world/friend/Friend';
import { FriendManager } from '../../../src/world/friend/FriendManager';
import { FriendPacket, FriendResultType } from '../../../src/world/friend/FriendPacket';
import { GameConstants } from '../../../src/world/GameConstants';

describe('world/friend/FriendManager.ts', () => {
  it('should add, sort, update, and remove friends', () => {
    const manager = new FriendManager();

    expect(manager.addFriend(new Friend(2, 'Beta'))).to.equal(true);
    expect(manager.addFriend(new Friend(1, 'Alpha'))).to.equal(true);
    expect(manager.getFriends().map(friend => friend.characterName)).to.deep.equal(['Alpha', 'Beta']);

    expect(manager.changeGroup(1, 'Bossing')).to.equal(true);
    expect(manager.updateChannel(1, 3)).to.equal(true);
    expect(manager.getFriend(1)).to.include({ groupName: 'Bossing', channelId: 3 });

    expect(manager.removeFriend(2)).to.equal(true);
    expect(manager.hasFriend(2)).to.equal(false);
  });

  it('should enforce friend capacity for new entries', () => {
    const manager = new FriendManager(1);

    expect(manager.addFriend(new Friend(1, 'Alpha'))).to.equal(true);
    expect(manager.addFriend(new Friend(2, 'Beta'))).to.equal(false);
    expect(manager.addFriend(new Friend(1, 'AlphaRenamed'))).to.equal(true);
    expect(manager.getFriend(1)?.characterName).to.equal('AlphaRenamed');
  });

  it('should encode friend list packets', () => {
    const manager = new FriendManager();
    manager.addFriend(new Friend(1, 'Alpha', GameConstants.DEFAULT_FRIEND_GROUP, 0, 2));

    const r = new PacketReader(FriendPacket.loadFriendDone(manager.getFriends()));

    expect(r.readShort()).to.equal(MapleSendOpcode.FRIEND_RESULT.code);
    expect(r.readByte()).to.equal(FriendResultType.LoadFriend_Done);
    expect(r.readByte()).to.equal(1);
    expect(r.readInt()).to.equal(1);
    expect(r.readAsciiString(13).replace(/\0+$/, '')).to.equal('Alpha');
    expect(r.readByte()).to.equal(0);
    expect(r.readInt()).to.equal(2);
    expect(r.readAsciiString(17).replace(/\0+$/, '')).to.equal(GameConstants.DEFAULT_FRIEND_GROUP);
  });
});
