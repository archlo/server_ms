import { expect } from 'chai';
import { PacketReader } from '../../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../../src/protocol/packets/packetWriter';
import { NpcHandler } from '../../../../src/world/field/npc/NpcHandler';
import { ScriptRegistry } from '../../../../src/world/script/ScriptRegistry';

describe('world/field/npc/NpcHandler.ts', () => {
  describe('handleUserSelectNpcItemUseRequest', () => {
    it('should start a script when NPC has one registered', () => {
      const scriptFn: any = function*(): Generator<any, void, any> { return; };
      ScriptRegistry.npc.register('testNpc', scriptFn);

      let disposed = 0;
      let setDialogTo: any = undefined;
      const user: any = {
        getHp: (): number => 100,
        getField: (): any => ({
          getNpcPool: (): any => ({
            getById: (): any => ({
              hasScript: (): boolean => true,
              getScript: (): string => 'testNpc',
              getTemplateId: (): number => 9010000,
              isTrunk: (): boolean => false,
            }),
          }),
        }),
        hasDialog: (): boolean => false,
        setDialog: (d: any): void => { setDialogTo = d; },
        write: (): void => {},
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(1);
      NpcHandler.handleUserSelectNpcItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(0);
      // Script started, then terminated (generator returned immediately),
      // so setDialog was called with null on termination.
      expect(setDialogTo).to.equal(null);
    });

    it('should dispose when NPC not found', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getField: (): any => ({
          getNpcPool: (): any => ({ getById: (): null => null }),
        }),
        hasDialog: (): boolean => false,
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(99);
      NpcHandler.handleUserSelectNpcItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });

    it('should dispose when user already has a dialog', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getField: (): any => ({
          getNpcPool: (): any => ({
            getById: (): any => ({ hasScript: (): boolean => true, getScript: (): string => 'test', getTemplateId: (): number => 0 }),
          }),
        }),
        hasDialog: (): boolean => true,
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(1);
      NpcHandler.handleUserSelectNpcItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });

    it('should dispose when NPC script is not registered', () => {
      let disposed = 0;
      const user: any = {
        getHp: (): number => 100,
        getField: (): any => ({
          getNpcPool: (): any => ({
            getById: (): any => ({
              hasScript: (): boolean => true,
              getScript: (): string => 'unregisteredScript',
              getTemplateId: (): number => 9010000,
            }),
          }),
        }),
        hasDialog: (): boolean => false,
        dispose: (): void => { disposed++; },
      };

      const w = new PacketWriter();
      w.writeInt(1);
      NpcHandler.handleUserSelectNpcItemUseRequest(user, new PacketReader(w.getPacket()));
      expect(disposed).to.equal(1);
    });
  });
});
