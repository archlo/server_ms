import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { UserHandler } from '../../../src/world/user/UserHandler';

describe('world/user/UserHandler.ts', () => {
  describe('handleUserHp', () => {
    it('should update user hp and mp from packet', () => {
      let csHp = 500;
      let csMp = 300;
      const user: any = {
        getHp: (): number => csHp,
        getMaxHp: (): number => 1000,
        getMp: (): number => csMp,
        getMaxMp: (): number => 500,
        getCharacterStat: (): any => ({
          get hp(): number { return csHp; },
          set hp(v: number) { csHp = v; },
          get mp(): number { return csMp; },
          set mp(v: number) { csMp = v; },
        }),
      };

      const w = new PacketWriter();
      w.writeInt(750); w.writeInt(400);
      UserHandler.handleUserHp(user, new PacketReader(w.getPacket()));
      expect(csHp).to.equal(750);
      expect(csMp).to.equal(400);
    });

    it('should accept valid hp within range', () => {
      let csHp = 500;
      let csMp = 300;
      const user: any = {
        getHp: (): number => csHp,
        getMaxHp: (): number => 1000,
        getMp: (): number => csMp,
        getMaxMp: (): number => 500,
        getCharacterStat: (): any => ({
          get hp(): number { return csHp; },
          set hp(v: number) { csHp = v; },
          get mp(): number { return csMp; },
          set mp(v: number) { csMp = v; },
        }),
      };

      const w = new PacketWriter();
      w.writeInt(800); w.writeInt(200);
      UserHandler.handleUserHp(user, new PacketReader(w.getPacket()));
      expect(csHp).to.equal(800);
      expect(csMp).to.equal(200);
    });

    it('should ignore negative values', () => {
      let csHp = 500;
      const user: any = {
        getHp: (): number => csHp,
        getMaxHp: (): number => 1000,
        getMp: (): number => 0,
        getMaxMp: (): number => 500,
        getCharacterStat: (): any => ({
          get hp(): number { return csHp; },
          set hp(v: number) { csHp = v; },
          mp: 0,
        }),
      };

      const w = new PacketWriter();
      w.writeInt(-1); w.writeInt(0);
      UserHandler.handleUserHp(user, new PacketReader(w.getPacket()));
      expect(csHp).to.equal(500);
    });
  });

  describe('handleUserBanMapByMob', () => {
    it('should warp to return map when hp <= 0', () => {
      const w = new PacketWriter(); w.writeInt(9999999); // mobId
      let warpedTo: number | undefined;
      const user: any = {
        getHp: (): number => 0,
        getField: (): any => ({
          getReturnMap: (): number => 100000000,
          getRandomStartPoint: (): any => ({ x: 0, y: 0 }),
          getFieldStorage: (): any => ({
            getFieldById: (id: number): any => ({
              getPortals: (): any[] => [],
              getMapId: (): number => id,
            }),
          }),
        }),
        warp: (_target: any, _portal: any, _a: boolean, _b: boolean): void => {
          warpedTo = _target.getMapId();
        },
        dispose: (): void => { },
      };
      UserHandler.handleUserBanMapByMob(user, new PacketReader(w.getPacket()));
      expect(warpedTo).to.equal(100000000);
    });

    it('should not warp when hp > 0', () => {
      const w = new PacketWriter(); w.writeInt(9999999);
      let warped = false;
      const user: any = {
        getHp: (): number => 100,
        getField: (): any => ({}),
        warp: (): void => { warped = true; },
      };
      UserHandler.handleUserBanMapByMob(user, new PacketReader(w.getPacket()));
      expect(warped).to.equal(false);
    });
  });

  describe('handleUserTemporaryStatUpdateRequest', () => {
    it('should resend current temporary stats', () => {
      let setStatsCalled = false;
      const user: any = {
        getSecondaryStat: (): any => ({
          getTemporaryStats: (): Map<any, any> => new Map([[1, { nOption: 1 }]]),
        }),
        setTemporaryStats: (): void => { setStatsCalled = true; },
      };
      const w = new PacketWriter();
      UserHandler.handleUserTemporaryStatUpdateRequest(user, new PacketReader(w.getPacket()));
      expect(setStatsCalled).to.equal(true);
    });
  });

  describe('no-op stub handlers', () => {
    const user: any = {
      dispose: (): void => { },
      write: (_buffer: Buffer): void => { },
      startRps: (): void => { },
      getRpsState: () => ({ state: 'idle' as const, wins: 0, losses: 0, lastThrow: -1 }),
      setRpsResult: (_wins: number, _losses: number, _lastThrow: number): void => { },
      resetRps: (): void => { },
      getCharacterData: () => ({ monsterBookCover: 0 }),
      getHp: (): number => 1000,
      getInventoryManager: () => ({
        consumeInventory: { getItem: (): any => null },
        removeItemAt: (): any => null,
      }),
    };

    it('handlePremium should not crash', () => {
      const w = new PacketWriter(); w.writeByte(0);
      UserHandler.handlePremium(user, new PacketReader(w.getPacket()));
    });

    it('handleUserMonsterBookSetCover should not crash', () => {
      const w = new PacketWriter(); w.writeInt(0);
      UserHandler.handleUserMonsterBookSetCover(user, new PacketReader(w.getPacket()));
    });

    it('handleAdmin should not crash', () => {
      const w = new PacketWriter(); w.writeInt(0); w.writeInt(0); w.writeByte(0); w.writeByte(0);
      UserHandler.handleAdmin(user, new PacketReader(w.getPacket()));
    });

    it('handleRpsGame should not crash', () => {
      const w = new PacketWriter(); w.writeByte(0);
      UserHandler.handleRpsGame(user, new PacketReader(w.getPacket()));
    });

    it('handleMarriageRequest should not crash', () => {
      const w = new PacketWriter(); w.writeByte(0); w.writeInt(0);
      UserHandler.handleMarriageRequest(user, new PacketReader(w.getPacket()));
    });

    it('handleRequestSessionValue should not crash', () => {
      const w = new PacketWriter(); w.writeInt(0);
      UserHandler.handleRequestSessionValue(user, new PacketReader(w.getPacket()));
    });

    it('handleLogoutGiftSelect should not crash', () => {
      const w = new PacketWriter(); w.writeInt(0);
      UserHandler.handleLogoutGiftSelect(user, new PacketReader(w.getPacket()));
    });

    it('handleUserAntiMacroItemUseRequest should not crash', () => {
      const w = new PacketWriter();
      w.writeInt(123); w.writeInt(456); w.writeShort(1);
      UserHandler.handleUserAntiMacroItemUseRequest(user, new PacketReader(w.getPacket()));
    });

    it('handleUserAntiMacroSkillUseRequest should not crash', () => {
      const w = new PacketWriter();
      w.writeInt(789); w.writeInt(101);
      UserHandler.handleUserAntiMacroSkillUseRequest(user, new PacketReader(w.getPacket()));
    });

    it('handleUserAntiMacroQuestionResult should send antiMacroResult packet', () => {
      let captured: Buffer | null = null;
      const testUser: any = {
        ...user,
        write: (buf: Buffer): void => { captured = buf; },
      };
      const w = new PacketWriter();
      w.writeShort(42); // questionId
      w.writeMapleAsciiString('my answer');
      UserHandler.handleUserAntiMacroQuestionResult(testUser, new PacketReader(w.getPacket()));
      expect(captured).to.not.be.null;
      const view = new Uint8Array(captured!);
      expect(view[0]).to.equal(0x2A); // ANTI_MACRO_RESULT opcode low byte
      expect(view[1]).to.equal(0x00); // opcode high byte
      expect(view[2]).to.equal(1);    // bPassed = 1 (correct)
    });

    it('handleChatBlockUserReq should block and unblock characters', () => {
      const blockedList: string[] = [];
      const testUser: any = {
        ...user,
        write: (): void => { },
        getCharacterData: () => ({ chatBlockedList: blockedList }),
      };

      // Block a character
      const w1 = new PacketWriter();
      w1.writeMapleAsciiString('TargetPlayer');
      UserHandler.handleChatBlockUserReq(testUser, new PacketReader(w1.getPacket()));
      expect(blockedList).to.include('targetplayer');

      // Unblock the same character
      const w2 = new PacketWriter();
      w2.writeMapleAsciiString('TargetPlayer');
      UserHandler.handleChatBlockUserReq(testUser, new PacketReader(w2.getPacket()));
      expect(blockedList).to.not.include('targetplayer');
    });
  });
});
