import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { Friend } from '../../../src/world/friend/Friend';
import { FriendHandler } from '../../../src/world/friend/FriendHandler';
import { FriendManager } from '../../../src/world/friend/FriendManager';
import { FriendResultType } from '../../../src/world/friend/FriendPacket';

describe('world/friend/FriendHandler.ts', () => {
  let originalOverride: any;

  beforeEach(() => {
    originalOverride = FriendHandler.channelServerOverride;
  });

  afterEach(() => {
    FriendHandler.channelServerOverride = originalOverride;
  });

  it('should load current friends from the user friend manager', () => {
    const manager = new FriendManager();
    manager.addFriend(new Friend(100, 'Target', 'Group', 0, 1));
    const user = fakeUser(manager);

    FriendHandler.handleFriendRequest(user as any, new PacketReader(friendRequest(0)));

    const r = new PacketReader(user.writes[0]);
    expect(r.readShort()).to.equal(MapleSendOpcode.FRIEND_RESULT.code);
    expect(r.readByte()).to.equal(FriendResultType.LoadFriend_Done);
    expect(r.readByte()).to.equal(1);
    expect(r.readInt()).to.equal(100);
  });

  it('should return unknown user when adding a friend with empty name', () => {
    installChannelFake([]);
    const user = fakeUser(new FriendManager());

    FriendHandler.handleFriendRequest(user as any, new PacketReader(friendRequest(1)));

    const r = new PacketReader(user.writes[0]);
    expect(r.readShort()).to.equal(MapleSendOpcode.FRIEND_RESULT.code);
    expect(r.readByte()).to.equal(FriendResultType.UnknownUser);
  });

  it('should add both users as friends when a valid setFriend request is made', () => {
    const target = fakeUserTarget(2, 'Target');
    const user = fakeUser(new FriendManager());
    installChannelFake([user, target]);

    FriendHandler.handleFriendRequest(user as any, new PacketReader(addFriendRequest('Target')));

    expect(user.getFriendManager().hasFriend(2)).to.equal(true);
    expect(target.getFriendManager().hasFriend(1)).to.equal(true);

    const result = new PacketReader(user.writes[0]);
    expect(result.readShort()).to.equal(MapleSendOpcode.FRIEND_RESULT.code);
    expect(result.readByte()).to.equal(FriendResultType.SetFriend_Done);
  });

  it('should delete a friend and remove from both sides', () => {
    const manager = new FriendManager();
    manager.addFriend(new Friend(2, 'Target'));
    const user = fakeUser(manager);
    const target = fakeUserTarget(2, 'Target');
    target.getFriendManager().addFriend(new Friend(1, 'User'));
    installChannelFake([user, target]);

    FriendHandler.handleFriendRequest(user as any, new PacketReader(deleteFriendRequest(2)));

    expect(user.getFriendManager().hasFriend(2)).to.equal(false);
    expect(target.getFriendManager().hasFriend(1)).to.equal(false);
  });

  it('should change group for a friend', () => {
    const manager = new FriendManager();
    manager.addFriend(new Friend(2, 'Target'));
    const user = fakeUser(manager);
    installChannelFake([user]);

    FriendHandler.handleFriendRequest(user as any, new PacketReader(changeGroupRequest(2, 'NewGroup')));

    expect(manager.getFriend(2)?.groupName).to.equal('NewGroup');
  });

  it('should dispose genuinely unsupported friend types', () => {
    const user = fakeUser(new FriendManager());

    FriendHandler.handleFriendRequest(user as any, new PacketReader(friendRequest(99)));

    expect(user.disposeCount).to.equal(1);
    expect(user.writes[0].readInt16LE(0)).to.equal(MapleSendOpcode.MESSAGE.code);
  });
});

function fakeUser(friendManager: FriendManager): any {
  const id = 1;
  return {
    id,
    writes: [] as Buffer[],
    disposeCount: 0,
    getCharacterId: (): number => id,
    getCharacterName: (): string => 'User',
    getFriendManager: (): FriendManager => friendManager,
    getField: (): any => ({}),
    write(packet: Buffer): void { this.writes.push(packet); },
    dispose(): void { this.disposeCount++; },
  };
}

function fakeUserTarget(id: number, name: string): any {
  return {
    id,
    name,
    writes: [] as Buffer[],
    getCharacterId: (): number => id,
    getCharacterName: (): string => name,
    friendManager: new FriendManager(),
    getFriendManager: function (): FriendManager { return this.friendManager; },
    getField: (): any => ({}),
    write(packet: Buffer): void { this.writes.push(packet); },
    dispose(): void {},
  };
}

function installChannelFake(users: any[]): void {
  const byId = new Map(users.map(u => [u.getCharacterId(), u]));
  const byName = new Map(users.map(u => [u.getCharacterName().toLowerCase(), u]));
  FriendHandler.channelServerOverride = {
    getUserByCharacterId: (id: number): any => byId.get(id) ?? null,
    getUserByCharacterName: (name: string): any => byName.get(name.toLowerCase()) ?? null,
  } as any;
}

function friendRequest(type: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(type);
  return w.getPacket();
}

function addFriendRequest(targetName: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(1);
  w.writeMapleAsciiString(targetName);
  return w.getPacket();
}

function deleteFriendRequest(targetId: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(3);
  w.writeInt(targetId);
  return w.getPacket();
}

function changeGroupRequest(targetId: number, groupName: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(4);
  w.writeInt(targetId);
  w.writeMapleAsciiString(groupName);
  return w.getPacket();
}
