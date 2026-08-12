import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { ChatType } from '../../../src/world/user/ChatType';

const channelServerModulePath = require.resolve('../../../src/server/channel/channelServer');
require.cache[channelServerModulePath] = {
  id: channelServerModulePath,
  filename: channelServerModulePath,
  loaded: true,
  exports: { ChannelServer: { instance: null } },
} as NodeJS.Module;

const { ChannelServer } = require('../../../src/server/channel/channelServer');
const { SocialHandler } = require('../../../src/world/social/SocialHandler');

describe('world/social/SocialHandler.ts', () => {
  let originalInstance: any;

  beforeEach(() => {
    originalInstance = ChannelServer.instance;
  });

  afterEach(() => {
    ChannelServer.instance = originalInstance;
  });

  it('should route whisper text to an online target and acknowledge the sender', () => {
    const sender = fakeUser(1, 'Sender');
    const target = fakeUser(2, 'Target');
    installChannelFake([sender, target]);

    SocialHandler.handleWhisper(sender as any, new PacketReader(whisperRequest('Target', 'hello')));

    const incoming = firstPacket(target.writes, MapleSendOpcode.WHISPER.code);
    const ack = firstPacket(sender.writes, MapleSendOpcode.WHISPER.code);
    expect(readWhisperIncoming(incoming)).to.deep.equal({ type: 18, name: 'Sender', channel: 0, text: 'hello' });
    expect(readWhisperAck(ack)).to.deep.equal({ type: 10, name: 'Target', success: true });
  });

  it('should reject whisper text when the target is offline', () => {
    const sender = fakeUser(3, 'Sender');
    installChannelFake([sender]);

    SocialHandler.handleWhisper(sender as any, new PacketReader(whisperRequest('Missing', 'hello')));

    expect(readWhisperAck(firstPacket(sender.writes, MapleSendOpcode.WHISPER.code))).to.deep.equal({
      type: 10,
      name: 'Missing',
      success: false,
    });
  });

  it('should route group messages to unique online named targets', () => {
    const sender = fakeUser(4, 'Sender');
    const first = fakeUser(5, 'First');
    const second = fakeUser(6, 'Second');
    installChannelFake([sender, first, second]);

    SocialHandler.handleGroupMessage(sender as any, new PacketReader(groupMessageRequest(
      ChatType.GROUPFRIEND,
      ['First', 'Second', 'First', 'Missing', 'Sender'],
      'meet here',
    )));

    expect(readGroupMessage(firstPacket(first.writes, MapleSendOpcode.GROUP_MESSAGE.code))).to.deep.equal({
      type: ChatType.GROUPFRIEND,
      name: 'Sender',
      text: 'meet here',
    });
    expect(readGroupMessage(firstPacket(second.writes, MapleSendOpcode.GROUP_MESSAGE.code))).to.deep.equal({
      type: ChatType.GROUPFRIEND,
      name: 'Sender',
      text: 'meet here',
    });
    expect(sender.writes.some((p: Buffer) => p.readInt16LE(0) === MapleSendOpcode.GROUP_MESSAGE.code)).to.equal(false);
  });

});

function fakeUser(id: number, name: string): any {
  return {
    id,
    name,
    writes: [] as Buffer[],
    disposeCount: 0,
    getCharacterId: (): number => id,
    getCharacterName: (): string => name,
    getCharacterData: () => ({ chatBlockedList: [] as string[] }),
    write(packet: Buffer): void { this.writes.push(packet); },
    dispose(): void { this.disposeCount++; },
  };
}

function installChannelFake(users: any[]): void {
  const byName = new Map(users.map(u => [u.name.toLowerCase(), u]));
  ChannelServer.instance = {
    getUserByCharacterName: (name: string): any => byName.get(name.toLowerCase()) ?? null,
  } as any;
}

function whisperRequest(targetName: string, text: string): Buffer {
  const w = new PacketWriter();
  w.writeMapleAsciiString(targetName);
  w.writeMapleAsciiString(text);
  return w.getPacket();
}

function groupMessageRequest(type: ChatType, targetNames: string[], text: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(type);
  w.writeByte(targetNames.length);
  for (const targetName of targetNames) w.writeMapleAsciiString(targetName);
  w.writeMapleAsciiString(text);
  return w.getPacket();
}

function firstPacket(writes: Buffer[], opcode: number): Buffer {
  const packet = writes.find(p => p.readInt16LE(0) === opcode);
  expect(packet).to.not.equal(undefined);
  return packet!;
}

function readWhisperIncoming(packet: Buffer): { type: number; name: string; channel: number; text: string } {
  const r = new PacketReader(packet);
  r.readShort();
  const type = r.readByte();
  const name = r.readMapleAsciiString();
  const channel = r.readShort();
  const text = r.readMapleAsciiString();
  return { type, name, channel, text };
}

function readWhisperAck(packet: Buffer): { type: number; name: string; success: boolean } {
  const r = new PacketReader(packet);
  r.readShort();
  const type = r.readByte();
  const name = r.readMapleAsciiString();
  const success = r.readByte() !== 0;
  return { type, name, success };
}

function readGroupMessage(packet: Buffer): { type: ChatType; name: string; text: string } {
  const r = new PacketReader(packet);
  r.readShort();
  const type = r.readByte() as ChatType;
  const name = r.readMapleAsciiString();
  const text = r.readMapleAsciiString();
  return { type, name, text };
}
