import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { User } from '../user/User';

/** Port of kinoko's StagePacket (CStage::OnPacket). */
export class StagePacket {
  static setField(user: User, channelId: number, isMigrate: boolean, isRevive: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.SET_FIELD.code);
    w.writeShort(0); // CClientOptMan::DecodeOpt
    w.writeInt(channelId);
    w.writeInt(user.getCharacterId()); // dwOldDriverID — client reads as characterId
    w.writeByte(user.getNextFieldKey());
    w.writeBoolean(isMigrate);
    w.writeShort(0); // nNotifierCheck / mapType

    if (isMigrate) {
      const s1 = randInt32();
      const s2 = randInt32();
      const s3 = randInt32();
      user.getCalcDamage().setSeed(s1, s2, s3);
      user.getCalcDamage().setNextAttackCritical(false);
      w.writeInt(s1);
      w.writeInt(s2);
      w.writeInt(s3);

      // The migrate remainder is the full GW_CharacterData block, which the
      // client decodes via CharacterDataDecoder (flag → combatOrders →
      // removeSn byte → CharacterStat → friendMax → inventories → skills…).
      // The previous hand-rolled "flag + CharacterStat + AvatarLook" wrote the
      // wrong fields (AvatarLook is for OTHER users, not SetField) and set
      // dwFlag=ALL, so the client read inventory sections out of AvatarLook
      // bytes and crashed in decodeIndexedItemsByte. Use the real encoder.
      user.getCharacterData().encode(w);
    } else {
      w.writeByte(isRevive ? 1 : 0); // nFieldType
      w.writeInt(user.getCharacterStat().posMap);
      w.writeByte(user.getCharacterStat().portal);
      w.writeInt(user.getHp()); // mobCapacity position
      w.writeByte(0); // bChaseEnable
    }

    w.writeFT(new Date()); // ftServer
    return w.getPacket();
  }
}

function writeAvatarLook(w: PacketWriter, user: User): void {
  const cs = user.getCharacterStat();
  const equipped = user.getInventoryManager().equipped.getItems();

  w.writeByte(cs.gender);
  w.writeByte(cs.skin);
  w.writeInt(cs.face);
  w.writeByte(0); // padding byte (job placeholder in v95 look codec)
  w.writeInt(cs.hair);

  // Equipped inventory positions are stored as negative numbers (-1 = BodyPart.CAP, etc.).
  // Normal equip slots: positions -1 to -99 → wire byte = -pos (i.e. 1–99).
  for (const [pos, item] of equipped) {
    if (pos >= -99 && pos < 0) {
      w.writeUByte(-pos);
      w.writeInt(item.itemId);
    }
  }
  w.writeUByte(0xFF);

  // Unseen (cash override) slots: positions -101 to -160 → wire byte = (-pos) - 100.
  for (const [pos, item] of equipped) {
    if (pos >= -160 && pos <= -101) {
      w.writeUByte((-pos) - 100);
      w.writeInt(item.itemId);
    }
  }
  w.writeUByte(0xFF);

  w.writeInt(0); // weaponStickerId
  w.writeInt(0); // petId[0]
  w.writeInt(0); // petId[1]
  w.writeInt(0); // petId[2]
}

function randInt32(): number {
  return (Math.floor(Math.random() * 0x100000000) | 0);
}
