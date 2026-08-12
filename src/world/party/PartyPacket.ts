import { PacketWriter } from '../../protocol/packets/packetWriter';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { Party } from './Party';
import { PartyResultType } from './PartyResultType';
import { PartyMember } from './Party';

export class PartyPacket {
  static inviteParty(member: PartyMember): Buffer {
    const w = PartyPacket.of(PartyResultType.InviteParty);
    w.writeInt(member.characterId);
    w.writeMapleAsciiString(member.characterName);
    w.writeInt(member.level);
    w.writeInt(member.job);
    w.writeByte(0);
    return w.getPacket();
  }

  static loadPartyDone(party: Party): Buffer {
    const w = PartyPacket.of(PartyResultType.LoadParty_Done);
    w.writeInt(party.partyId);
    party.encode(w);
    return w.getPacket();
  }

  static createNewPartyDone(party: Party): Buffer {
    const w = PartyPacket.of(PartyResultType.CreateNewParty_Done);
    w.writeInt(party.partyId);
    w.writeInt(0);
    w.writeInt(0);
    w.writeInt(0);
    return w.getPacket();
  }

  static withdrawPartyDone(party: Party, memberId: number, disband: boolean, kick: boolean): Buffer {
    const w = PartyPacket.of(PartyResultType.WithdrawParty_Done);
    w.writeInt(party.partyId);
    w.writeInt(memberId);
    w.writeBoolean(!disband);
    if (!disband) {
      const member = party.getMember(memberId);
      w.writeBoolean(kick);
      w.writeMapleAsciiString(member?.characterName ?? '');
      party.encode(w);
    }
    return w.getPacket();
  }

  static joinPartyDone(party: Party, memberId: number): Buffer {
    const w = PartyPacket.of(PartyResultType.JoinParty_Done);
    w.writeInt(party.partyId);
    const member = party.getMember(memberId);
    w.writeMapleAsciiString(member?.characterName ?? '');
    party.encode(w);
    return w.getPacket();
  }

  static changePartyBossDone(newBossId: number, isDisconnect: boolean): Buffer {
    const w = PartyPacket.of(PartyResultType.ChangePartyBoss_Done);
    w.writeInt(newBossId);
    w.writeBoolean(isDisconnect);
    return w.getPacket();
  }

  static changeLevelOrJob(charId: number, level: number, job: number): Buffer {
    const w = PartyPacket.of(PartyResultType.ChangeLevelOrJob);
    w.writeInt(charId);
    w.writeInt(level);
    w.writeInt(job);
    return w.getPacket();
  }

  static serverMsg(message: string | null): Buffer {
    const w = PartyPacket.of(PartyResultType.ServerMsg);
    w.writeBoolean(message != null);
    if (message != null) {
      w.writeMapleAsciiString(message);
    }
    return w.getPacket();
  }

  static of(resultType: PartyResultType): PacketWriter {
    const w = new PacketWriter();
    w.writeShort(MapleSendOpcode.PARTY_RESULT.code);
    w.writeByte(resultType);
    return w;
  }
}
