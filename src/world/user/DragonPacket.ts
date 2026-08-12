import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { Dragon } from './Dragon';
import { User } from './User';
import { MovePath } from '../field/life/MovePath';

/**
 * Port of kinoko's DragonPacket (CUser::OnDragonPacket).
 */
export class DragonPacket {
  /** Port of kinoko's DragonPacket::dragonEnterField. */
  static dragonEnterField(user: User, dragon: Dragon): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.DRAGON_ENTER_FIELD.code);
    w.writeInt(user.getCharacterId());
    dragon.encode(w);
    return w.getPacket();
  }

  /** Port of kinoko's DragonPacket::dragonMove. */
  static dragonMove(user: User, movePath: MovePath): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.DRAGON_MOVE.code);
    w.writeInt(user.getCharacterId());
    movePath.encode(w);
    return w.getPacket();
  }
}
