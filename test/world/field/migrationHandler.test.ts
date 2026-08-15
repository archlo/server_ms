import { expect } from 'chai';
import { PacketReader } from '../../../src/protocol/packets/packetReader';
import { PacketWriter } from '../../../src/protocol/packets/packetWriter';
import { MigrationHandler } from '../../../src/world/field/MigrationHandler';
import { GameConstants } from '../../../src/world/GameConstants';

/** The exact bytes the v95 client sends from CUIRevive::Revive →
 *  CField::SendTransferFieldRequest(0, null, bPremium, 0, 0). */
function revivePacket(fieldKey: number, targetFieldId: number, premium: boolean): PacketReader {
  const w = new PacketWriter();
  w.writeByte(fieldKey);
  w.writeInt(targetFieldId);
  w.writeMapleAsciiString('');
  w.writeByte(0);
  w.writeBoolean(premium);
  w.writeBoolean(false); // bChase
  return new PacketReader(w.getPacket());
}

describe('world/field/MigrationHandler.ts', () => {
  describe('handleUserTransferFieldRequest (revive / return-to-nearest-town)', () => {
    const portal = { x: 0, y: 0, portalId: 0 };

    const makeUser = (hp: number, field: any) => {
      const disposed: boolean[] = [];
      const user = {
        getFieldKey: () => 7,
        getHp: () => hp,
        getField: () => field,
        getSecondaryStat: () => ({ clear: () => {} }),
        validateStat: () => {},
        setHp: () => {},
        dispose: () => { disposed.push(true); },
        warp: () => {},
      } as any;
      return { user, disposed };
    };

    const makeField = (returnMap: number, fieldId = 10000) => ({
      fieldId,
      getReturnMap: () => returnMap,
      getFieldId: () => fieldId,
      getPortalByName: () => portal,
      getPortalById: () => portal,
      getFieldStorage: () => ({
        getFieldById: (id: number) => ({
          fieldId: id,
          getFieldId: () => id,
          getPortalByName: () => portal,
          getPortalById: () => portal,
        }),
      }),
    } as any);

    it('revives at the nearest town (returnMap) even when server HP > 0 (client-side death)', () => {
      // Mob/fall/field deaths are simulated client-side, so the server HP is
      // still 50 when the revive request arrives — it must NOT warp to map 0.
      const field = makeField(1020000, 10000);
      const { user, disposed } = makeUser(50, field);
      const warps: any[] = [];
      user.warp = (target: any, _portal: any, _isMigrate: boolean, isRevive: boolean) =>
        warps.push({ target, isRevive });

      MigrationHandler.handleUserTransferFieldRequest(user, revivePacket(7, 0, false));

      expect(disposed.length).to.equal(0);
      expect(warps.length).to.equal(1);
      expect(warps[0].target.fieldId).to.equal(1020000); // nearest town, NOT map 0
      expect(warps[0].isRevive).to.equal(true);
    });

    it('runs the full revive flow (clear stats, set HP 50) when server HP <= 0', () => {
      const field = makeField(1020000, 10000);
      const { user, disposed } = makeUser(0, field);
      let cleared = 0;
      let setHp = 0;
      user.getSecondaryStat = () => ({ clear: () => { cleared++; } });
      user.setHp = () => { setHp++; };
      const warps: any[] = [];
      user.warp = (target: any) => warps.push(target);

      MigrationHandler.handleUserTransferFieldRequest(user, revivePacket(7, 0, false));

      expect(disposed.length).to.equal(0);
      expect(cleared).to.equal(1);
      expect(setHp).to.equal(1);
      expect(warps.length).to.equal(1);
      expect(warps[0].fieldId).to.equal(1020000);
    });

    it('falls back to the current field when returnMap is UNDEFINED_FIELD_ID (never warps to 999999999)', () => {
      const field = makeField(GameConstants.UNDEFINED_FIELD_ID, 10000);
      const { user, disposed } = makeUser(0, field);
      const warps: any[] = [];
      user.warp = (target: any) => warps.push(target);

      MigrationHandler.handleUserTransferFieldRequest(user, revivePacket(7, 0, false));

      expect(disposed.length).to.equal(0);
      expect(warps.length).to.equal(1);
      expect(warps[0].fieldId).to.equal(10000);
    });

    it('still warps to an explicit targetFieldId when alive (admin /m <map ID>)', () => {
      const field = makeField(1020000, 10000);
      const { user, disposed } = makeUser(50, field);
      const warps: any[] = [];
      user.warp = (target: any, _portal: any, _isMigrate: boolean, isRevive: boolean) =>
        warps.push({ target, isRevive });

      MigrationHandler.handleUserTransferFieldRequest(user, revivePacket(7, 400000000, false));

      expect(disposed.length).to.equal(0);
      expect(warps.length).to.equal(1);
      expect(warps[0].target.fieldId).to.equal(400000000);
      expect(warps[0].isRevive).to.equal(false);
    });
  });
});