import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { PacketWriter } from '../../protocol/packets/packetWriter';

export enum FamilyResultType {
  None = 0,
  FmSkillActivate = 1,
  FmSkillOffer = 2,
  FmPointInc = 3,
  FmJoinRequest = 4,
  FmJoinAccept = 5,
  FmJoinCancel = 6,
  FmExpel = 7,
  FmJuniorRequest = 8,
  FmSeniorRequest = 9,
  FmDelete = 10,
  FmNotice = 11,
}

export enum FamilyInfoType {
  Chart = 0,
  Info = 1,
  Log = 2,
}

export class FamilyPacket {
  static familyResult(type: FamilyResultType, data?: Buffer): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_RESULT.code);
    w.writeByte(type);
    if (data) {
      w.write(data);
    }
    return w.getPacket();
  }

  static familyChartResult(characterId: number, familyId: number, reputation: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_CHART_RESULT.code);
    w.writeInt(characterId);
    w.writeInt(familyId);
    w.writeInt(reputation);
    return w.getPacket();
  }

  static familyInfoResult(familyName: string, members: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_INFO_RESULT.code);
    w.writeMapleAsciiString(familyName);
    w.writeByte(members);
    return w.getPacket();
  }

  static familyJoinRequest(requesterId: number, requesterName: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_JOIN_REQUEST.code);
    w.writeInt(requesterId);
    w.writeMapleAsciiString(requesterName);
    return w.getPacket();
  }

  static familyJoinRequestResult(requesterId: number, result: number): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_JOIN_REQUEST_RESULT.code);
    w.writeInt(requesterId);
    w.writeByte(result);
    return w.getPacket();
  }

  static familyJoinAccepted(accepted: boolean, seniorName: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_JOIN_ACCEPTED.code);
    w.writeBoolean(accepted);
    w.writeMapleAsciiString(seniorName);
    return w.getPacket();
  }

  static familySummonRequest(summonerId: number, summonerName: string): Buffer {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.FAMILY_SUMMON_REQUEST.code);
    w.writeInt(summonerId);
    w.writeMapleAsciiString(summonerName);
    return w.getPacket();
  }
}
