import { expect } from 'chai';
import { MessengerManager } from '../../../src/world/messenger/MessengerManager';

describe('world/messenger/MessengerManager.ts', () => {
  it('should create rooms and assign member positions', () => {
    const manager = new MessengerManager();
    const first = fakeUser(1, 'First');
    const second = fakeUser(2, 'Second');

    const room = manager.createRoom(first as any);
    expect(room.messengerId).to.equal(1);
    expect(room.getMember(1)?.position).to.equal(0);

    expect(manager.joinRoom(second as any, room.messengerId)).to.equal(room);
    expect(room.getMembers().map(member => member.characterName)).to.deep.equal(['First', 'Second']);
    expect(room.getMember(2)?.position).to.equal(1);
  });

  it('should enforce room capacity and remove empty rooms', () => {
    const manager = new MessengerManager();
    const room = manager.createRoom(fakeUser(1, 'First') as any);
    expect(manager.joinRoom(fakeUser(2, 'Second') as any, room.messengerId)).to.equal(room);
    expect(manager.joinRoom(fakeUser(3, 'Third') as any, room.messengerId)).to.equal(room);
    expect(manager.joinRoom(fakeUser(4, 'Fourth') as any, room.messengerId)).to.equal(null);

    manager.leaveRoom(fakeUser(1, 'First') as any);
    manager.leaveRoom(fakeUser(2, 'Second') as any);
    expect(manager.getRoom(room.messengerId)).to.equal(room);
    manager.leaveRoom(fakeUser(3, 'Third') as any);
    expect(manager.getRoom(room.messengerId)).to.equal(null);
  });

  it('should move users between rooms', () => {
    const manager = new MessengerManager();
    const user = fakeUser(1, 'First');
    const firstRoom = manager.createRoom(user as any);
    const secondRoom = manager.createRoom(fakeUser(2, 'Second') as any);

    expect(manager.joinRoom(user as any, secondRoom.messengerId)).to.equal(secondRoom);
    expect(firstRoom.getMember(1)).to.equal(null);
    expect(secondRoom.getMember(1)?.characterName).to.equal('First');
  });
});

function fakeUser(id: number, name: string): any {
  return {
    getCharacterId: (): number => id,
    getCharacterName: (): string => name,
  };
}
