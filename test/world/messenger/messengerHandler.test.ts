import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { messengerManager } from '../../../src/world/messenger/MessengerManager';
import { MessengerHandler } from '../../../src/world/messenger/MessengerHandler';
import { MessengerResultType } from '../../../src/world/messenger/MessengerPacket';

describe('world/messenger/MessengerHandler.ts', () => {
  let originalOverride: any;

  beforeEach(() => {
    originalOverride = MessengerHandler.channelServerOverride;
    messengerManager.clear();
  });

  afterEach(() => {
    MessengerHandler.channelServerOverride = originalOverride;
    messengerManager.clear();
  });

  it('should open a new messenger room for the user', () => {
    const user = fakeUser(1, 'First');
    installChannelFake([user]);

    MessengerHandler.handleMessenger(user as any, new PacketReader(messengerRequest(0)));

    const packet = firstPacket(user.writes, MapleSendOpcode.MESSENGER.code);
    const r = new PacketReader(packet);
    expect(r.readShort()).to.equal(MapleSendOpcode.MESSENGER.code);
    expect(r.readByte()).to.equal(MessengerResultType.Open);
    expect(r.readInt()).to.equal(1);
    expect(r.readByte()).to.equal(0);
    expect(r.readByte()).to.equal(1);
  });

  it('should join an existing room and notify existing members', () => {
    const first = fakeUser(1, 'First');
    const second = fakeUser(2, 'Second');
    installChannelFake([first, second]);
    MessengerHandler.handleMessenger(first as any, new PacketReader(messengerRequest(0)));

    MessengerHandler.handleMessenger(second as any, new PacketReader(messengerRequest(0, 1)));

    const joinPacket = first.writes.find((p: Buffer) => p.readInt16LE(0) === MapleSendOpcode.MESSENGER.code && p.readUInt8(2) === MessengerResultType.Join);
    expect(joinPacket).to.not.equal(undefined);
    const r = new PacketReader(joinPacket!);
    r.readShort();
    expect(r.readByte()).to.equal(MessengerResultType.Join);
    expect(r.readByte()).to.equal(1);
    expect(r.readInt()).to.equal(2);
  });

  it('should leave a messenger room and notify remaining members', () => {
    const first = fakeUser(1, 'First');
    const second = fakeUser(2, 'Second');
    installChannelFake([first, second]);
    MessengerHandler.handleMessenger(first as any, new PacketReader(messengerRequest(0)));
    MessengerHandler.handleMessenger(second as any, new PacketReader(messengerRequest(0, 1)));

    MessengerHandler.handleMessenger(second as any, new PacketReader(messengerRequest(2)));

    const leavePacket = first.writes.find((p: Buffer) => p.readInt16LE(0) === MapleSendOpcode.MESSENGER.code && p.readUInt8(2) === MessengerResultType.Leave);
    expect(leavePacket).to.not.equal(undefined);
    const r = new PacketReader(leavePacket!);
    r.readShort();
    expect(r.readByte()).to.equal(MessengerResultType.Leave);
    expect(r.readByte()).to.equal(1);
  });

  it('should send invite packet to target user', () => {
    const user = fakeUser(1, 'User');
    const target = fakeUser(2, 'Target');
    installChannelFake([user, target]);
    MessengerHandler.handleMessenger(user as any, new PacketReader(messengerRequest(0)));

    MessengerHandler.handleMessenger(user as any, new PacketReader(inviteRequest('Target')));

    const invitePacket = target.writes.find((p: Buffer) => p.readInt16LE(0) === MapleSendOpcode.MESSENGER.code && p.readUInt8(2) === MessengerResultType.Invite);
    expect(invitePacket).to.not.equal(undefined);
    const r = new PacketReader(invitePacket!);
    r.readShort();
    expect(r.readByte()).to.equal(MessengerResultType.Invite);
    expect(r.readInt()).to.equal(1);
    expect(r.readMapleAsciiString()).to.equal('User');
  });

  it('should broadcast chat to all room members', () => {
    const first = fakeUser(1, 'First');
    const second = fakeUser(2, 'Second');
    installChannelFake([first, second]);
    MessengerHandler.handleMessenger(first as any, new PacketReader(messengerRequest(0)));
    MessengerHandler.handleMessenger(second as any, new PacketReader(messengerRequest(0, 1)));

    MessengerHandler.handleMessenger(first as any, new PacketReader(chatRequest('hello')));

    const chatPacket = second.writes.find((p: Buffer) => p.readInt16LE(0) === MapleSendOpcode.MESSENGER.code && p.readUInt8(2) === MessengerResultType.Chat);
    expect(chatPacket).to.not.equal(undefined);
    const r = new PacketReader(chatPacket!);
    r.readShort();
    expect(r.readByte()).to.equal(MessengerResultType.Chat);
    expect(r.readMapleAsciiString()).to.equal('First');
    expect(r.readMapleAsciiString()).to.equal('hello');
  });
});

function fakeUser(id: number, name: string): any {
  return {
    id,
    name,
    writes: [] as Buffer[],
    getCharacterId: (): number => id,
    getCharacterName: (): string => name,
    write(packet: Buffer): void { this.writes.push(packet); },
    dispose(): void { this.disposed = true; },
  };
}

function installChannelFake(users: any[]): void {
  const byId = new Map(users.map(u => [u.getCharacterId(), u]));
  const byName = new Map(users.map(u => [u.getCharacterName().toLowerCase(), u]));
  MessengerHandler.channelServerOverride = {
    getUserByCharacterId: (id: number): any => byId.get(id) ?? null,
    getUserByCharacterName: (name: string): any => byName.get(name.toLowerCase()) ?? null,
  } as any;
}

function messengerRequest(type: number, roomId?: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(type);
  if (roomId !== undefined) w.writeInt(roomId);
  return w.getPacket();
}

function inviteRequest(targetName: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(1);
  w.writeMapleAsciiString(targetName);
  return w.getPacket();
}

function chatRequest(text: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(5);
  w.writeMapleAsciiString(text);
  return w.getPacket();
}

function firstPacket(writes: Buffer[], opcode: number): Buffer {
  const packet = writes.find(p => p.readInt16LE(0) === opcode);
  expect(packet).to.not.equal(undefined);
  return packet!;
}
