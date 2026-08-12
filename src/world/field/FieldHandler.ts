import { PacketReader } from '../../protocol/packets/packetReader';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User } from '../user/User';
import { DropLeaveType } from './drop/DropLeaveType';

/**
 * Port of kinoko's FieldHandler.
 *
 * Cuts (documented inline):
 * - `handleReactorTouch`: kinoko itself has no v95 reactors activated by touch
 *   (logs an error and returns) - ported as a no-op.
 */
export class FieldHandler {
  /** Port of kinoko's FieldHandler::handleInvitePartyMatch (no-op). */
  static handleInvitePartyMatch(_user: User, r: PacketReader): void {
    r.readByte(); r.readByte(); r.readInt(); // type, age, fieldId
  }

  /** Port of kinoko's FieldHandler::handleRequestFootholdInfo (no-op - footholds sent in setField). */
  static handleRequestFootholdInfo(_user: User, _r: PacketReader): void {
    // no-op
  }

  /** Port of kinoko's FieldHandler::handleContiState (cut - continent ship state machine). */
  static handleContiState(_user: User, r: PacketReader): void {
    r.readInt(); // fieldId
    r.readByte(); // nShipKind
  }

  /** Port of kinoko's FieldHandler::handleCancelInvitePartyMatch (no-op). */
  static handleCancelInvitePartyMatch(_user: User, _r: PacketReader): void {
    // no-op
  }

  /** Port of kinoko's FieldHandler::handleDropPickUpRequest. */
  static handleDropPickUpRequest(user: User, r: PacketReader): void {
    const fieldKey = r.readByte();
    if (user.getFieldKey() !== fieldKey) {
      user.dispose();
      return;
    }
    r.readInt(); // update_time
    r.readShort(); // pt->x
    r.readShort(); // pt->y
    const objectId = r.readInt(); // dwDropID
    r.readInt(); // dwCliCrc

    const field = user.getField();
    const drop = field?.getDropPool().getById(objectId);
    if (!drop) {
      user.dispose();
      return;
    }

    field.getDropPool().pickUpDrop(user, drop, DropLeaveType.PICKED_UP_BY_USER, 0);
    user.dispose();
  }

  /** Port of kinoko's FieldHandler::handleReactorHit. */
  static handleReactorHit(user: User, r: PacketReader): void {
    const objectId = r.readInt(); // dwID
    r.readInt(); // skillReactor?
    r.readInt(); // dwHitOption
    const delay = r.readShort(); // tDelay
    const skillId = r.readInt(); // skillId, 0 for basic attack

    const field = user.getField();
    const reactor = field?.getReactorPool().getById(objectId);
    if (!reactor) {
      return;
    }
    if (reactor.isNotHitable()) {
      return;
    }
    if (!reactor.tryHit(skillId)) {
      return;
    }
    field.getReactorPool().hitReactor(user, reactor, delay);
  }

  /** Port of kinoko's FieldHandler::handleReactorTouch (no-op - no touch reactors in v95). */
  static handleReactorTouch(_user: User, r: PacketReader): void {
    r.readInt(); // dwID
    r.readBoolean(); // PtInRect
  }

  /** Port of kinoko's FieldHandler::handleRequireFieldObstacleStatus (no-op). */
  static handleRequireFieldObstacleStatus(_user: User, _r: PacketReader): void {
    // no-op
  }

  /** Port of kinoko's FieldHandler::handleItemUpgradeComplete. */
  static handleItemUpgradeComplete(user: User, r: PacketReader): void {
    r.readInt(); // nReturnResult
    const result = r.readInt(); // nResult
    user.write(itemUpgradeResultDonePacket(result));
  }
}

/** Port of kinoko's FieldPacket::itemUpgradeResultDone. */
function itemUpgradeResultDonePacket(result: number): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.ITEM_UPGRADE_RESULT.code);
  w.writeByte(65); // CashItemResultType.ItemUpgradeDone
  w.writeInt(result);
  w.writeInt(0); // nIUC?
  return w.getPacket();
}
