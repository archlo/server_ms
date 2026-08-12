import { expect } from 'chai';
import { PacketReader } from '../../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../../src/protocol/packets/packetWriter';
import { MobHandler } from '../../../../src/world/field/mob/MobHandler';

describe('world/field/mob/MobHandler.ts', () => {
  describe('handleMobCrcKeyChangedReply', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeInt(1); w.writeInt(2); w.writeInt(3);
      MobHandler.handleMobCrcKeyChangedReply({} as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleMobDropPickUpRequest', () => {
    it('should not crash (no-op stub)', () => {
      const w = new PacketWriter();
      w.writeByte(0); w.writeInt(0); w.writeShort(0); w.writeShort(0);
      w.writeInt(0); w.writeInt(0);
      MobHandler.handleMobDropPickUpRequest({ dispose: (): void => {} } as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleMobHitByObstacle', () => {
    it('should broadcast damaged packet when mob found', () => {
      let broadcast: any;
      const w = new PacketWriter(); w.writeInt(1); w.writeByte(0); w.writeShort(0);
      const mob = { getId: (): number => 1, isDamagedByMob: (): boolean => false, getHp: (): number => 100, getMaxHp: (): number => 1000 };
      const user: any = {
        getField: (): any => ({
          getMobPool: (): any => ({
            getById: (id: number): any => id === 1 ? mob : undefined,
          }),
          broadcastPacket: (p: any): void => { broadcast = p; },
        }),
      };
      MobHandler.handleMobHitByObstacle(user, new PacketReader(w.getPacket()));
      expect(broadcast).to.not.be.undefined;
    });
  });

  describe('handleMobSelfDestruct', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeInt(1); w.writeShort(0);
      MobHandler.handleMobSelfDestruct({} as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleMobSkillDelayEnd', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeInt(1); w.writeByte(0); w.writeByte(0); w.writeShort(0);
      MobHandler.handleMobSkillDelayEnd({} as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleMobEscortCollision', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeInt(1); w.writeInt(2); w.writeInt(3); w.writeInt(4); w.writeShort(0);
      MobHandler.handleMobEscortCollision({} as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleMobRequestEscortInfo', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeInt(0);
      MobHandler.handleMobRequestEscortInfo({} as any, new PacketReader(w.getPacket()));
    });
  });

  describe('handleMobEscortStopEndRequest', () => {
    it('should not crash', () => {
      const w = new PacketWriter(); w.writeInt(0); w.writeShort(0);
      MobHandler.handleMobEscortStopEndRequest({} as any, new PacketReader(w.getPacket()));
    });
  });
});
