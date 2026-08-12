import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MovePath } from '../field/life/MovePath';
import { User } from './User';
import { Pet } from './Pet';

export class PetPacket {
  static petActivated(user: User, pet: Pet): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PET_ACTIVATED.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(pet.getPetIndex());
    w.writeBoolean(true);
    w.writeBoolean(true);
    pet.encode(w);
    return w.getPacket();
  }

  static petDeactivated(user: User, petIndex: number, reason: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PET_ACTIVATED.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(petIndex);
    w.writeBoolean(false);
    w.writeByte(reason);
    return w.getPacket();
  }

  static petMove(user: User, petIndex: number, movePath: MovePath): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PET_MOVE.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(petIndex);
    movePath.encode(w);
    return w.getPacket();
  }

  static petLoadExceptionList(user: User, petIndex: number, petSn: bigint, exceptionList: number[] = []): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PET_LOAD_EXCEPTION_LIST.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(petIndex);
    w.writeLong(petSn);
    w.writeByte(exceptionList.length);
    for (const itemId of exceptionList) w.writeInt(itemId);
    return w.getPacket();
  }

  static petAction(user: User, petIndex: number, type: number, action: number, chat: string, chatBalloon: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PET_ACTION.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(petIndex);
    w.writeByte(type);
    w.writeByte(action);
    w.writeMapleAsciiString(chat);
    w.writeBoolean(chatBalloon);
    return w.getPacket();
  }

  static petActionFeed(user: User, petIndex: number, success: boolean, chatBalloon: boolean): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PET_ACTION_COMMAND.code);
    w.writeInt(user.getCharacterId());
    w.writeByte(petIndex);
    w.writeByte(1); // PetActionType.FEED
    w.writeBoolean(success);
    w.writeBoolean(chatBalloon);
    return w.getPacket();
  }
}
