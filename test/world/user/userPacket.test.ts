import { expect } from 'chai';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { UserPacket } from '../../../src/world/user/UserPacket';
import { CoupleRecord } from '../../../src/world/user/data/CoupleRecord';
import { NewYearCard } from '../../../src/world/user/data/NewYearCard';
import { SecondaryStat } from '../../../src/world/user/stat/SecondaryStat';
import { AvatarLook } from '../../../src/world/user/AvatarLook';
import type { MiniRoom } from '../../../src/world/miniroom/MiniRoom';

const EMPTY_AVATAR_LOOK = new AvatarLook(0, 0, 0, 0, new Map(), new Map(), 0, [0, 0, 0]);

function baseStub(): any {
  return {
    getCharacterId: (): number => 1,
    getLevel: (): number => 10,
    getCharacterName: (): string => 'A',
    getGuildInfo: (): any => ({ guildName: '', markBg: 0, markBgColor: 0, mark: 0, markColor: 0 }),
    getSecondaryStat: (): SecondaryStat => new SecondaryStat(),
    getJob: (): number => 0,
    getAvatarLook: (): AvatarLook => EMPTY_AVATAR_LOOK,
    getEffectItemId: (): number => 0,
    getPortableChairId: (): number => 0,
    getX: (): number => 0,
    getY: (): number => 0,
    getMoveAction: (): number => 0,
    getFoothold: (): number => 0,
    getPets: (): any[] => [],
    getDialog: (): any => null,
    getAdBoard: (): any => null,
    getCoupleRecord: (): CoupleRecord => CoupleRecord.EMPTY,
    getNewYearCards: (): NewYearCard[] => [],
    write: (): void => {},
  };
}

describe('world/user/UserPacket.ts', () => {
  describe('userEnterField', () => {
    it('should encode GuildInfo with empty guild', () => {
      const user = baseStub();
      Object.assign(user, {
        getCharacterId: (): number => 42,
        getLevel: (): number => 50,
        getCharacterName: (): string => 'TestChar',
        getX: (): number => 500,
        getY: (): number => 100,
        getFoothold: (): number => 10,
      });

      const packet = UserPacket.userEnterField(user);
      // opcode(2) + charId(4) + level(1) = offset 7
      // name is mapleString: short(len) + chars
      const nameLen = packet.readUInt16LE(7);
      const name = packet.toString('ascii', 9, 9 + nameLen);
      expect(name).to.equal('TestChar');
      // guild name starts after name
      const guildNameOffset = 9 + nameLen;
      const guildNameLen = packet.readUInt16LE(guildNameOffset);
      const guildName = packet.toString('ascii', guildNameOffset + 2, guildNameOffset + 2 + guildNameLen);
      expect(guildName).to.equal('');
      // mark fields
      const markOffset = guildNameOffset + 2 + guildNameLen;
      expect(packet.readUInt16LE(markOffset)).to.equal(0);
      expect(packet.readUInt8(markOffset + 2)).to.equal(0);
      expect(packet.readUInt16LE(markOffset + 3)).to.equal(0);
      expect(packet.readUInt8(markOffset + 5)).to.equal(0);
    });

    it('should encode empty CoupleRecord as false flag at end of packet', () => {
      const user = baseStub();
      const packet = UserPacket.userEnterField(user);
      // Build expected tail: miniroom(0) + adBoard(false) + couplePresent(false) + darkForce(0) + nyCards(false) + nPhase(0)
      const tail = new PacketWriter();
      tail.writeByte(0);  // miniroom absent
      tail.writeBoolean(false); // adBoard
      tail.writeBoolean(false); // coupleRecord present (false)
      tail.writeByte(0);  // darkForce
      tail.writeBoolean(false); // newYearCards present
      tail.writeInt(0);   // nPhase
      const tailBuf = tail.getPacket();
      const tailLen = tail.bytesWritten;
      const offset = packet.length - tailLen;
      expect(packet.subarray(offset).equals(tailBuf.subarray(0, tailLen))).to.equal(true);
    });

    it('should encode non-empty CoupleRecord with full data at end of packet', () => {
      const coupleRecord = CoupleRecord.from(1001, 10, 20, 'Husband', 'Wife');
      const user = baseStub();
      user.getCoupleRecord = (): CoupleRecord => coupleRecord;

      const packet = UserPacket.userEnterField(user);
      // Expected tail: miniroom(0) + adBoard(false) + couplePresent(true) + coupleData + darkForce(0) + nyCards(false) + nPhase(0)
      const tail = new PacketWriter();
      tail.writeByte(0);  // miniroom absent
      tail.writeBoolean(false); // adBoard
      tail.writeBoolean(true);  // coupleRecord present (true)
      coupleRecord.encodeForLocal(tail, false);
      tail.writeByte(0);  // darkForce
      tail.writeBoolean(false); // newYearCards present
      tail.writeInt(0);   // nPhase
      const tailBuf = tail.getPacket();
      const tailLen = tail.bytesWritten;
      const offset = packet.length - tailLen;
      expect(packet.subarray(offset).equals(tailBuf.subarray(0, tailLen))).to.equal(true);
    });

    it('should encode non-empty NewYearCards at end of packet', () => {
      const card = new NewYearCard(500, 99, 'Santa', 'Happy New Year!', 2024, true);
      const user = baseStub();
      user.getNewYearCards = (): NewYearCard[] => [card];

      const packet = UserPacket.userEnterField(user);
      // Expected tail: miniroom(0) + adBoard(false) + couplePresent(false) + darkForce(0) + nyCards(true) + cardData + nPhase(0)
      const tail = new PacketWriter();
      tail.writeByte(0);  // miniroom absent
      tail.writeBoolean(false); // adBoard
      tail.writeBoolean(false); // coupleRecord present (false)
      tail.writeByte(0);  // darkForce
      tail.writeBoolean(true);  // newYearCards present
      card.encode(tail);
      tail.writeInt(0);   // nPhase
      const tailBuf = tail.getPacket();
      const tailLen = tail.bytesWritten;
      const offset = packet.length - tailLen;
      expect(packet.subarray(offset).equals(tailBuf.subarray(0, tailLen))).to.equal(true);
    });

    it('should encode active MiniRoom data at correct position', () => {
      const miniRoom: MiniRoom = {
        getType: (): number => 2,
        getId: (): number => 555,
        getTitle: (): string => 'Omok Room',
        isPrivate: (): boolean => true,
        getGameSpec: (): number => 1,
        getUsers: (): any => ({ size: 1 }),
        getMaxUsers: (): number => 2,
        isGameOn: (): boolean => false,
      } as any;

      const user = baseStub();
      user.getDialog = (): MiniRoom => miniRoom;

      const packet = UserPacket.userEnterField(user);
      // Expected tail: miniRoom data + adBoard(false) + couplePresent(false) + darkForce(0) + nyCards(false) + nPhase(0)
      const tail = new PacketWriter();
      tail.writeByte(2);  // type
      tail.writeInt(555); // id
      tail.writeMapleAsciiString('Omok Room');
      tail.writeBoolean(true);  // private
      tail.writeByte(1);  // gameSpec
      tail.writeByte(1);  // user count
      tail.writeByte(2);  // max users
      tail.writeBoolean(false); // game on
      tail.writeBoolean(false); // adBoard
      tail.writeBoolean(false); // coupleRecord present (false)
      tail.writeByte(0);  // darkForce
      tail.writeBoolean(false); // newYearCards present
      tail.writeInt(0);   // nPhase
      const tailBuf = tail.getPacket();
      const tailLen = tail.bytesWritten;
      const offset = packet.length - tailLen;
      expect(packet.subarray(offset).equals(tailBuf.subarray(0, tailLen))).to.equal(true);
    });

    it('should encode empty MiniRoom as 0 byte', () => {
      const user = baseStub();
      const packet = UserPacket.userEnterField(user);
      const tail = new PacketWriter();
      tail.writeByte(0);  // miniroom absent
      tail.writeBoolean(false); // adBoard
      tail.writeBoolean(false); // coupleRecord present (false)
      tail.writeByte(0);  // darkForce
      tail.writeBoolean(false); // newYearCards present
      tail.writeInt(0);   // nPhase
      const tailBuf = tail.getPacket();
      const tailLen = tail.bytesWritten;
      const offset = packet.length - tailLen;
      expect(packet.subarray(offset).equals(tailBuf.subarray(0, tailLen))).to.equal(true);
    });
  });
});
