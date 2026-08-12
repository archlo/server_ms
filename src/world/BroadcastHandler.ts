import { PacketReader } from '../protocol/packets/packetReader';
import { PacketWriter } from '../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../protocol/opcodes/maple/send';
import { User } from './user/User';
import { Config } from '../util/config';
import { ChannelServer } from '../server/channel/channelServer';

enum BroadcastType {
  NORMAL = 0,
  POPUP = 1,
  MEGAPHONE = 2,
  WORLD = 3,
  ITEM = 5,
  AVATAR = 9,
  BRIDGE = 10,
  WORLDEX = 11,
}

export class BroadcastHandler {
  static handleBroadcastMsg(user: User, r: PacketReader): void {
    const type = r.readByte();
    const message = r.readMapleAsciiString();

    if (!message) { user.dispose(); return; }

    switch (type) {
      case BroadcastType.NORMAL:
      case BroadcastType.POPUP:
      case BroadcastType.MEGAPHONE:
        broadcastToChannel(type, message, false);
        break;
      case BroadcastType.WORLD:
        broadcastToWorld(type, message, false);
        break;
      case BroadcastType.ITEM:
        r.readByte(); // megaphone flag
        const itemId = r.readInt();
        broadcastToChannel(type, message, false, itemId);
        break;
      case BroadcastType.AVATAR:
        const avatarMessage = r.readMapleAsciiString();
        const act = r.readInt();
        const move = r.readInt();
        const emot = r.readInt();
        broadcastToWorld(type, message, true, 0, avatarMessage, act, move, emot);
        break;
      default:
        broadcastToChannel(type, message, false);
    }
  }
}

function broadcastToAllFields(packet: Buffer): void {
  const fs = ChannelServer.instance?.fieldStorage;
  if (!fs) return;
  for (const field of fs.getAllFields()) {
    field.broadcastPacket(packet);
  }
}

function broadcastToChannel(
  type: number, message: string, whisper: boolean,
  itemId = 0, avatarMessage = '', act = 0, move = 0, emot = 0,
): void {
  const packet = buildBroadcast(type, message, false, itemId, avatarMessage, act, move, emot, whisper);
  broadcastToAllFields(packet);
}

function broadcastToWorld(
  type: number, message: string, whisper: boolean,
  itemId = 0, avatarMessage = '', act = 0, move = 0, emot = 0,
): void {
  const packet = buildBroadcast(type, message, true, itemId, avatarMessage, act, move, emot, whisper);
  broadcastToAllFields(packet);
}

function buildBroadcast(
  type: number, message: string, world: boolean,
  itemId: number, avatarMessage: string,
  act: number, move: number, emot: number,
  whisper: boolean,
): Buffer {
  const w = new PacketWriter();
  w.writeShort(MapleSendOpcode.BROADCAST_MSG.code);
  w.writeByte(type);
  if (whisper) w.writeByte(0);
  w.writeMapleAsciiString(message);
  if (type === BroadcastType.ITEM) {
    w.writeInt(itemId);
  }
  if (type === BroadcastType.AVATAR) {
    w.writeMapleAsciiString(avatarMessage);
    w.writeInt(act);
    w.writeInt(move);
    w.writeInt(emot);
  }
  return w.getPacket();
}
