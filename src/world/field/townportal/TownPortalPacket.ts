import { PacketWriter } from '../../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../../protocol/opcodes/maple/send';
import { GameConstants } from '../../GameConstants';
import { TownPortal } from './TownPortal';

/**
 * Port of kinoko's FieldPacket (CTownPortalPool::OnPacket section) and
 * WvsContext::townPortal / resetTownPortal.
 */
export class TownPortalPacket {
  /** Port of kinoko's WvsContext::townPortal - sent to the caster on creation. */
  static townPortal(townPortal: TownPortal): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.TOWN_PORTAL.code);
    w.writeInt(townPortal.townField.getFieldId()); // dwTownID
    w.writeInt(townPortal.getField().getFieldId()); // dwFieldID
    w.writeInt(townPortal.skillId); // nSkillID
    w.writeShort(townPortal.getX()); // ptFieldPortal.x
    w.writeShort(townPortal.getY()); // ptFieldPortal.y
    return w.getPacket();
  }

  /** Port of kinoko's WvsContext::resetTownPortal - sent when the portal expires. */
  static resetTownPortal(): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.TOWN_PORTAL.code);
    w.writeInt(GameConstants.UNDEFINED_FIELD_ID); // dwTownID
    w.writeInt(GameConstants.UNDEFINED_FIELD_ID); // dwFieldID
    w.writeInt(0); // nSkillID
    w.writeShort(0); // ptFieldPortal.x
    w.writeShort(0); // ptFieldPortal.y
    return w.getPacket();
  }

  /**
   * Port of kinoko's FieldPacket::townPortalCreated.
   * `animate` true -> nState = 0 (create animation plays); false -> nState = 1.
   */
  static townPortalCreated(townPortal: TownPortal, animate: boolean): Buffer {
    return this.townPortalCreatedFor(townPortal.getOwner().getCharacterId(), townPortal.getX(), townPortal.getY(), animate);
  }

  static townPortalCreatedFor(characterId: number, x: number, y: number, animate: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.TOWN_PORTAL_CREATED.code);
    w.writeByte(animate ? 0 : 1); // nState : create animation if 0
    w.writeInt(characterId); // dwCharacterID
    w.writeShort(x);
    w.writeShort(y);
    return w.getPacket();
  }

  /** Port of kinoko's FieldPacket::townPortalRemoved. */
  static townPortalRemoved(townPortal: TownPortal, animate: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.TOWN_PORTAL_REMOVED.code);
    w.writeByte(animate ? 0 : 1); // nState : remove animation if 0
    w.writeInt(townPortal.getOwner().getCharacterId()); // dwCharacterID
    return w.getPacket();
  }
}
