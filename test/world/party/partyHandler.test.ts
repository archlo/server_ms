import { expect } from 'chai';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { PartyInfo } from '../../../src/world/party/PartyInfo';
import { PartyRequestType } from '../../../src/world/party/PartyRequestType';
import { PartyResultType } from '../../../src/world/party/PartyResultType';
import { ChannelServer } from '../../../src/server/channel/channelServer';
import { PartyHandler } from '../../../src/world/party/PartyHandler';

describe('world/party/PartyHandler.ts', () => {
  let originalInstance: any;

  beforeEach(() => {
    originalInstance = ChannelServer.instance;
  });

  afterEach(() => {
    ChannelServer.instance = originalInstance;
  });

  it('should create a new party for solo users', () => {
    const user = fakeUser(1, 'Leader');
    installChannelFake([user]);

    PartyHandler.handlePartyRequest(user as any, new PacketReader(partyRequestPacket(PartyRequestType.CreateNewParty)));

    expect(user.getPartyId()).to.equal(9001);
    expect(user.isPartyBoss()).to.equal(true);
    expect(lastPartyResult(user.writes)).to.equal(PartyResultType.CreateNewParty_Done);
  });

  it('should invite and join a target user', () => {
    const leader = fakeUser(2, 'Leader');
    const target = fakeUser(3, 'Target');
    installChannelFake([leader, target]);

    PartyHandler.handlePartyRequest(leader as any, new PacketReader(partyRequestPacket(PartyRequestType.CreateNewParty)));
    PartyHandler.handlePartyRequest(leader as any, new PacketReader(invitePacket('Target')));
    PartyHandler.handlePartyRequest(target as any, new PacketReader(joinPacket(leader.id)));

    expect(leader.getPartyId()).to.equal(9001);
    expect(target.getPartyId()).to.equal(9001);
    expect(leader.isPartyBoss()).to.equal(true);
    expect(target.isPartyBoss()).to.equal(false);
    expect(lastPartyResult(target.writes)).to.equal(PartyResultType.JoinParty_Done);
  });

  it('should change party boss when requested by the current leader', () => {
    const leader = fakeUser(4, 'Leader');
    const target = fakeUser(5, 'Target');
    installChannelFake([leader, target]);

    PartyHandler.handlePartyRequest(leader as any, new PacketReader(partyRequestPacket(PartyRequestType.CreateNewParty)));
    PartyHandler.handlePartyRequest(leader as any, new PacketReader(invitePacket('Target')));
    PartyHandler.handlePartyRequest(target as any, new PacketReader(joinPacket(leader.id)));
    PartyHandler.handlePartyRequest(leader as any, new PacketReader(changeBossPacket(target.id)));

    expect(leader.isPartyBoss()).to.equal(false);
    expect(target.isPartyBoss()).to.equal(true);
    expect(lastPartyResult(target.writes)).to.equal(PartyResultType.ChangePartyBoss_Done);
  });
});

function fakeUser(id: number, name: string): any {
  let partyInfo = PartyInfo.EMPTY;
  return {
    id,
    name,
    writes: [] as Buffer[],
    getCharacterId: (): number => id,
    getCharacterName: (): string => name,
    getJob: (): number => 100,
    getLevel: (): number => 20,
    getField: (): any => ({ getFieldId: (): number => 100000000 }),
    getPartyInfo: (): PartyInfo => partyInfo,
    setPartyInfo: (info: PartyInfo | null): void => { partyInfo = info ?? PartyInfo.EMPTY; },
    getPartyId: (): number => partyInfo.partyId,
    hasParty: (): boolean => partyInfo.partyId !== 0,
    isPartyBoss: (): boolean => partyInfo.boss,
    getPartyMemberIndex: (): number => partyInfo.memberIndex,
    write(packet: Buffer): void { this.writes.push(packet); },
  };
}

function installChannelFake(users: any[]): void {
  let nextPartyId = 9001;
  const byId = new Map(users.map(u => [u.id, u]));
  const byName = new Map(users.map(u => [u.name.toLowerCase(), u]));
  ChannelServer.instance = {
    nextPartyId: (): number => nextPartyId++,
    getUserByCharacterId: (id: number): any => byId.get(id) ?? null,
    getUserByCharacterName: (name: string): any => byName.get(name.toLowerCase()) ?? null,
  } as any;
}

function partyRequestPacket(type: PartyRequestType): Buffer {
  const w = new PacketWriter();
  w.writeByte(type);
  return w.getPacket();
}

function invitePacket(name: string): Buffer {
  const w = new PacketWriter();
  w.writeByte(PartyRequestType.InviteParty);
  w.writeMapleAsciiString(name);
  return w.getPacket();
}

function joinPacket(inviterId: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(PartyRequestType.JoinParty);
  w.writeInt(inviterId);
  w.writeByte(0);
  return w.getPacket();
}

function changeBossPacket(targetId: number): Buffer {
  const w = new PacketWriter();
  w.writeByte(PartyRequestType.ChangePartyBoss);
  w.writeInt(targetId);
  return w.getPacket();
}

function lastPartyResult(writes: Buffer[]): PartyResultType {
  const packet = [...writes].reverse().find(p => p.readInt16LE(0) === MapleSendOpcode.PARTY_RESULT.code);
  expect(packet).to.not.equal(undefined);
  return packet!.readUInt8(2) as PartyResultType;
}
