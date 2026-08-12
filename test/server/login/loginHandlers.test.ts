import { expect } from 'chai';
import { MapleRecvOpcode } from '../../../src/protocol/opcodes/maple/recv';
import { MapleSendOpcode } from '../../../src/protocol/opcodes/maple/send';
import { CenterSendOpcode } from '../../../src/protocol/opcodes/center/send';
import { LoginSendOpcode } from '../../../src/protocol/opcodes/login/send';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { LoginServer } from '../../../src/server/login/loginServer';
import { EncryptedSession } from '../../../src/protocol/crypto/encryptedSession';
import { AES } from '../../../src/protocol/crypto/aes';

describe('server/login/handlers/loginHandlers', () => {

  // ---- helper: mock LoginServer.instance ----
  let centerWrites: Buffer[];
  let clientWrites: Buffer[];
  let mockSession: any;
  let mockEncSession: any;
  let mockLoginServer: any;

  beforeEach(() => {
    centerWrites = [];
    clientWrites = [];
    mockSession = { id: 42, socket: { write: (buf: Buffer) => { clientWrites.push(buf); } } };

    mockEncSession = {
      session: mockSession,
      write: async (buf: Buffer): Promise<boolean> => { clientWrites.push(buf); return true; },
    };

    mockLoginServer = {
      loginStore: new Map<number, any>(),
      sessionStore: new Map<number, any>(),
      preLoginStore: new Map<number, any>(),
      centerServerSession: {
        socket: { write: (buf: Buffer) => { centerWrites.push(buf); } },
      },
      logger: { warn: (...args: any[]) => {}, info: (...args: any[]) => {}, debug: (...args: any[]) => {} },
    };

    (LoginServer as any).instance = mockLoginServer;
  });

  // ===================================================================
  // SelectWorldHandler (opcode 5) -> CHARACTER_LIST_REQUEST to center
  // ===================================================================
  it('SelectWorldHandler should forward CHARACTER_LIST_REQUEST to center', async () => {
    const { SelectWorldHandler } = await import('../../../src/server/login/handlers/selectWorldHandler');
    const handler = new SelectWorldHandler();

    mockLoginServer.loginStore.set(42, { id: 1001, name: 'testuser', pin: '', pic: '' });

    const w = new PacketWriter();
    w.writeByte(0); // worldId
    w.writeByte(1); // channelId
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(centerWrites.length).to.equal(1);
    const packet = centerWrites[0];
    expect(packet.readInt16LE(0)).to.equal(LoginSendOpcode.CHARACTER_LIST_REQUEST.getValue());
    expect(packet.readInt32LE(2)).to.equal(42); // sessionId
    expect(packet.readInt32LE(6)).to.equal(1001); // accountId
  });

  // ===================================================================
  // CheckPinCodeHandler (opcode 9) -> CHECK_PIN_CODE_RESULT to client
  // ===================================================================
  it('CheckPinCodeHandler should accept matching PIN', async () => {
    const { CheckPinCodeHandler } = await import('../../../src/server/login/handlers/checkPinCodeHandler');
    const handler = new CheckPinCodeHandler();

    mockLoginServer.sessionStore.set(42, mockEncSession);
    mockLoginServer.loginStore.set(42, { id: 1001, pin: '1234', pic: '' });

    const w = new PacketWriter();
    w.writeMapleAsciiString('1234');
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(clientWrites.length).to.equal(1);
    const packet = clientWrites[0];
    expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.CHECK_PIN_CODE_RESULT.code);
    expect(packet.readUInt8(2)).to.equal(0); // 0 = ok
  });

  it('CheckPinCodeHandler should reject wrong PIN', async () => {
    const { CheckPinCodeHandler } = await import('../../../src/server/login/handlers/checkPinCodeHandler');
    const handler = new CheckPinCodeHandler();

    mockLoginServer.sessionStore.set(42, mockEncSession);
    mockLoginServer.loginStore.set(42, { id: 1001, pin: '1234', pic: '' });

    const w = new PacketWriter();
    w.writeMapleAsciiString('0000');
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(clientWrites.length).to.equal(1);
    const packet = clientWrites[0];
    expect(packet.readUInt8(2)).to.equal(1); // 1 = fail
  });

  // ===================================================================
  // CheckDuplicatedIdHandler (opcode 21) -> CHECK_NAME_REQUEST to center
  // ===================================================================
  it('CheckDuplicatedIdHandler should forward CHECK_NAME_REQUEST to center', async () => {
    const { CheckDuplicatedIdHandler } = await import('../../../src/server/login/handlers/checkDuplicatedIdHandler');
    const handler = new CheckDuplicatedIdHandler();

    const w = new PacketWriter();
    w.writeMapleAsciiString('NewChar');
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(centerWrites.length).to.equal(1);
    const packet = centerWrites[0];
    expect(packet.readInt16LE(0)).to.equal(LoginSendOpcode.CHECK_NAME_REQUEST.getValue());
    expect(packet.readInt32LE(2)).to.equal(42); // sessionId
    expect(packet.readInt16LE(6)).to.equal(7); // MapleAsciiString = short length prefix
    expect(packet.slice(8).toString()).to.equal('NewChar');
  });

  // ===================================================================
  // CreateNewCharacterHandler (opcode 22) -> CREATE_CHARACTER_REQUEST
  // ===================================================================
  it('CreateNewCharacterHandler should forward CREATE_CHARACTER_REQUEST with appearance data', async () => {
    const { CreateNewCharacterHandler } = await import('../../../src/server/login/handlers/createNewCharacterHandler');
    const handler = new CreateNewCharacterHandler();

    mockLoginServer.loginStore.set(42, { id: 1001 });

    const w = new PacketWriter();
    w.writeMapleAsciiString('MyChar');
    w.writeInt(0); // jobType (beginner)
    w.writeShort(0); // subJob
    w.writeInt(20000); // face
    w.writeInt(30000); // hair
    w.writeInt(7); // hairColor
    w.writeInt(0); // skin
    w.writeInt(1040002); // top
    w.writeInt(1060002); // bottom
    w.writeInt(1072001); // shoes
    w.writeInt(1302000); // weapon
    w.writeByte(0); // gender
    await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(centerWrites.length).to.equal(1);
    const packet = centerWrites[0];
    expect(packet.readInt16LE(0)).to.equal(LoginSendOpcode.CREATE_CHARACTER_REQUEST.getValue());
    // sessionId, accountId, charId (negative), name, jobType, face, hair, hairColor, skin, top, bottom, shoes, weapon, gender
    expect(packet.readInt32LE(2)).to.equal(42); // sessionId
    expect(packet.readInt32LE(6)).to.equal(1001); // accountId
  });

  // ===================================================================
  // DeleteCharacterHandler (opcode 24) -> DELETE_CHARACTER_REQUEST
  // ===================================================================
  it('DeleteCharacterHandler should forward DELETE_CHARACTER_REQUEST to center', async () => {
    const { DeleteCharacterHandler } = await import('../../../src/server/login/handlers/deleteCharacterHandler');
    const handler = new DeleteCharacterHandler();

    const w = new PacketWriter();
    w.writeInt(5001); // charId
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(centerWrites.length).to.equal(1);
    const packet = centerWrites[0];
    expect(packet.readInt16LE(0)).to.equal(LoginSendOpcode.DELETE_CHARACTER_REQUEST.getValue());
    expect(packet.readInt32LE(2)).to.equal(42); // sessionId
    expect(packet.readInt32LE(6)).to.equal(5001); // charId
  });

  // ===================================================================
  // ViewAllCharHandler (opcode 13) -> VIEW_ALL_CHAR_REQUEST to center
  // ===================================================================
  it('ViewAllCharHandler should forward VIEW_ALL_CHAR_REQUEST to center', async () => {
    const { ViewAllCharHandler } = await import('../../../src/server/login/handlers/viewAllCharHandler');
    const handler = new ViewAllCharHandler();

    mockLoginServer.loginStore.set(42, { id: 1001, name: 'testuser', pin: '', pic: '' });

    const w = new PacketWriter();
    w.writeByte(0); // worldId
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(centerWrites.length).to.equal(1);
    const packet = centerWrites[0];
    expect(packet.readInt16LE(0)).to.equal(LoginSendOpcode.VIEW_ALL_CHAR_REQUEST.getValue());
    expect(packet.readInt32LE(2)).to.equal(42); // sessionId
    expect(packet.readInt32LE(6)).to.equal(1001); // accountId
  });

  // ===================================================================
  // SelectCharacterHandler (opcode 19) -> MIGRATE_TO_CHANNEL
  // ===================================================================
  it('SelectCharacterHandler should forward MIGRATE_TO_CHANNEL to center', async () => {
    const { SelectCharacterHandler } = await import('../../../src/server/login/handlers/selectCharacterHandler');
    const handler = new SelectCharacterHandler();

    const w = new PacketWriter();
    w.writeInt(6001); // charId
    handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

    expect(centerWrites.length).to.equal(1);
    const packet = centerWrites[0];
    expect(packet.readInt16LE(0)).to.equal(LoginSendOpcode.MIGRATE_TO_CHANNEL.getValue());
    expect(packet.readInt32LE(2)).to.equal(42); // sessionId
    expect(packet.readInt32LE(6)).to.equal(6001); // charId
  });

  // ===================================================================
  // Center ack handlers (from center -> login -> client)
  // ===================================================================
  describe('centerAckHandlers', () => {

    it('CharacterListAckHandler should send SELECT_WORLD_RESULT to client', async () => {
      const { CharacterListAckHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new CharacterListAckHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);
      mockLoginServer.loginStore.set(42, { id: 1001, pic: 'somepic' });

      const w = new PacketWriter();
      w.writeInt(42); // sessionId
      w.writeInt(1);  // count
      w.writeInt(101); w.writeMapleAsciiString('CharA'); w.writeByte(0); w.writeByte(0);
      w.writeInt(20000); w.writeInt(30000);
      w.writeInt(2); // equipped count
      w.writeByte(-5); w.writeInt(1040002);
      w.writeByte(-11); w.writeInt(1302000);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.SELECT_WORLD_RESULT.code);
      expect(packet.readUInt8(2)).to.equal(0); // error code
      expect(packet.readInt32LE(3)).to.equal(0); // character count (partial data → readCharData returns null)
    });

    it('CheckNameAckHandler should send CHECK_DUPLICATED_ID_RESULT with name', async () => {
      const { CheckNameAckHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new CheckNameAckHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);

      const w = new PacketWriter();
      w.writeInt(42);
      w.writeMapleAsciiString('MyName');
      w.writeBoolean(true);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.CHECK_DUPLICATED_ID_RESULT.code);
      const nameLen = packet.readInt16LE(2);
      expect(packet.slice(4, 4 + nameLen).toString()).to.equal('MyName');
      expect(packet.readUInt8(4 + nameLen)).to.equal(0); // 0=available
    });

    it('CheckNameAckHandler should send unavailable name response', async () => {
      const { CheckNameAckHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new CheckNameAckHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);

      const w = new PacketWriter();
      w.writeInt(42);
      w.writeMapleAsciiString('Taken');
      w.writeBoolean(false);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      const nameLen = packet.readInt16LE(2);
      expect(packet.readUInt8(4 + nameLen)).to.equal(1); // 1=taken
    });

    it('DeleteCharacterAckHandler should forward success to client', async () => {
      const { DeleteCharacterAckHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new DeleteCharacterAckHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);

      const w = new PacketWriter();
      w.writeInt(42);
      w.writeInt(5001);
      w.writeBoolean(true);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.DELETE_CHARACTER_RESULT.code);
      expect(packet.readInt32LE(2)).to.equal(5001);
      expect(packet.readUInt8(6)).to.equal(1); // success
    });

    it('ViewAllCharAckHandler should send VIEW_ALL_CHAR_RESULT to client', async () => {
      const { ViewAllCharAckHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new ViewAllCharAckHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);
      mockLoginServer.loginStore.set(42, { id: 1001, pic: 'somepic' });

      const w = new PacketWriter();
      w.writeInt(42); // sessionId
      w.writeInt(1);  // count
      w.writeInt(101); w.writeMapleAsciiString('CharA'); w.writeByte(0); w.writeByte(0);
      w.writeInt(20000); w.writeInt(30000);
      w.writeInt(1); // equipped count
      w.writeByte(-5); w.writeInt(1040002);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.VIEW_ALL_CHAR_RESULT.code);
      expect(packet.readUInt8(2)).to.equal(0); // unknown/unused
      expect(packet.readUInt8(3)).to.equal(1); // world count
      expect(packet.readUInt8(4)).to.equal(0); // world ID
      expect(packet.readInt32LE(5)).to.equal(0); // character count (partial data → readCharData returns null)
    });

    it('MigrateResultHandler should send MIGRATE_COMMAND on success', async () => {
      const { MigrateResultHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new MigrateResultHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);

      const w = new PacketWriter();
      w.writeInt(42);
      w.writeBoolean(true);
      w.writeMapleAsciiString('127.0.0.1');
      w.writeInt(7575);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.MIGRATE_COMMAND.code);
      // Host as 4 IPv4 bytes
      expect(packet.readUInt8(2)).to.equal(127);
      expect(packet.readUInt8(3)).to.equal(0);
      expect(packet.readUInt8(4)).to.equal(0);
      expect(packet.readUInt8(5)).to.equal(1);
      expect(packet.readUInt16LE(6)).to.equal(7575);
    });

    it('MigrateResultHandler should send LOGIN_FAILED on failure', async () => {
      const { MigrateResultHandler } = await import('../../../src/server/login/handlers/centerAckHandlers');
      const handler = new MigrateResultHandler();

      mockLoginServer.sessionStore.set(42, mockEncSession);

      const w = new PacketWriter();
      w.writeInt(42);
      w.writeBoolean(false);

      await handler.handlePacket(new PacketReader(w.getPacket()), mockSession as any);

      expect(clientWrites.length).to.equal(1);
      const packet = clientWrites[0];
      expect(packet.readInt16LE(0)).to.equal(MapleSendOpcode.CHECK_PASSWORD_RESULT.code);
    });
  });
});
