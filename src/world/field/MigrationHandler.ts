import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { Field } from './Field';
import { GameConstants } from '../GameConstants';

/**
 * Port of kinoko's MigrationHandler.
 *
 * Cuts (documented in PORT_GAPS.md):
 * - `handleMigrateIn`: requires CenterServer + multi-channel architecture
 *   (account/migration storage, messenger/party/guild central requests) -
 *   not ported, single-process server has no channel migration.
 * - `handleUserTransferChannelRequest`: requires multi-channel transfer -
 *   not ported, single-channel server.
 * - `handleUserMigrateToCashShopRequest`: cash shop stage not ported.
 * - Premium revive (SoulStone / Wheel of Destiny) branches in
 *   handleUserTransferFieldRequest: require SecondaryStat option clearing
 *   and inventory item removal helpers not yet wired - falls through to
 *   normal revive.
 */
export class MigrationHandler {
  /** Port of kinoko's MigrationHandler::handleUserTransferFieldRequest. */
  static handleUserTransferFieldRequest(user: User, r: PacketReader): void {
    if (r.getRemainingPacket().length === 0) {
      // Returning from CashShop - not ported (no cash shop stage).
      return;
    }

    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    const targetFieldId = r.readInt(); // dwTargetField
    const portalName = r.readMapleAsciiString(); // sPortal
    if (portalName.length > 0) {
      r.readShort(); // GetPos()->x
      r.readShort(); // GetPos()->y
    }
    r.readByte(); // 0
    r.readBoolean(); // bPremium
    const chase = r.readBoolean(); // bChase
    if (chase) {
      r.readInt(); // nTargetPosition_X
      r.readInt(); // nTargetPosition_Y
    }

    const currentField = user.getField() as Field;
    if (portalName.length === 0) {
      if (user.getHp() <= 0) {
        // Premium revive (SoulStone / Wheel of Destiny) cut - falls through to normal revive.
        MigrationHandler.handleRevive(user, currentField, false);
        return;
      }
      // Transfer field by client request : ReservedEffect, CField::OBSTACLE, /m <map ID>
      MigrationHandler.handleTransferField(user, targetFieldId, GameConstants.DEFAULT_PORTAL_NAME, false);
      return;
    }
    // Enter portal to next field
    const portal = currentField.getPortalByName(portalName);
    if (!portal || !portal.hasDestinationField()) {
      user.dispose();
      return;
    }
    MigrationHandler.handleTransferField(user, portal.destinationFieldId, portal.destinationPortalName, false);
  }

  /** Port of kinoko's MigrationHandler::handleTransferField. */
  private static handleTransferField(user: User, fieldId: number, portalName: string, isRevive: boolean): void {
    const targetField = (user.getField() as Field).getFieldStorage().getFieldById(fieldId) as Field | null;
    if (!targetField) {
      user.dispose();
      return;
    }
    let targetPortal = targetField.getPortalByName(portalName);
    if (!targetPortal) {
      targetPortal = targetField.getPortalById(0);
      if (!targetPortal) {
        user.dispose();
        return;
      }
    }
    user.warp(targetField, targetPortal, false, isRevive);
  }

  /** Port of kinoko's MigrationHandler::handleRevive. */
  private static handleRevive(user: User, field: Field, premium: boolean): void {
    user.getSecondaryStat().clear();
    user.validateStat();
    if (premium) {
      user.setHp(user.getMaxHp());
      user.setMp(user.getMaxMp());
      MigrationHandler.handleTransferField(user, field.getFieldId(), GameConstants.DEFAULT_PORTAL_NAME, true);
    } else {
      const returnMap = field.getReturnMap();
      user.setHp(50);
      MigrationHandler.handleTransferField(user, returnMap, GameConstants.DEFAULT_PORTAL_NAME, true);
    }
  }
}
