import { PacketReader } from '../../protocol/packets/packetReader';
import { User } from '../user/User';
import { Party, PartyMember } from './Party';
import { PartyPacket } from './PartyPacket';
import { PartyResultType } from './PartyResultType';
import { PartyRequestType, getPartyRequestType } from './PartyRequestType';
import { getPartyResultType } from './PartyResultType';
import { partyStorage } from './PartyStorage';
import { PartyInfo } from './PartyInfo';
import { ChannelServer } from '../../server/channel/channelServer';

export class PartyHandler {
  static handlePartyRequest(user: User, r: PacketReader): void {
    const type = r.readByte();
    const requestType = getPartyRequestType(type);
    if (requestType === null) return;

    const partyId = user.getPartyId();

    switch (requestType) {
      case PartyRequestType.CreateNewParty: {
        if (partyId !== 0) {
          user.write(PartyPacket.of(PartyResultType.CreateNewParty_AlreadyJoined).getPacket());
          return;
        }
        PartyHandler.createNewParty(user);
        return;
      }
      case PartyRequestType.WithdrawParty: {
        if (partyId === 0) {
          user.write(PartyPacket.of(PartyResultType.WithdrawParty_NotJoined).getPacket());
          return;
        }
        r.readByte(); // hardcoded 0
        PartyHandler.withdrawParty(user);
        return;
      }
      case PartyRequestType.JoinParty: {
        if (partyId !== 0) {
          user.write(PartyPacket.of(PartyResultType.JoinParty_AlreadyJoined).getPacket());
          return;
        }
        const inviterId = r.readInt();
        r.readByte(); // unknown
        PartyHandler.joinParty(user, inviterId);
        return;
      }
      case PartyRequestType.InviteParty: {
        if (partyId === 0) {
          PartyHandler.createNewParty(user);
        }
        if (!user.isPartyBoss()) {
          user.write(PartyPacket.serverMsg("You are not the leader of the party."));
          return;
        }
        const targetName = r.readMapleAsciiString();
        PartyHandler.inviteParty(user, targetName);
        return;
      }
      case PartyRequestType.KickParty: {
        if (!user.isPartyBoss()) {
          user.write(PartyPacket.serverMsg("You are not the leader of the party."));
          return;
        }
        const targetId = r.readInt();
        PartyHandler.kickParty(user, targetId);
        return;
      }
      case PartyRequestType.ChangePartyBoss: {
        if (!user.isPartyBoss()) {
          user.write(PartyPacket.serverMsg("You are not the leader of the party."));
          return;
        }
        const targetId = r.readInt();
        PartyHandler.changePartyBoss(user, targetId, false);
        return;
      }
    }
  }

  static handlePartyResult(user: User, r: PacketReader): void {
    const type = r.readByte();
    const resultType = getPartyResultType(type);
    if (resultType === null) return;

    switch (resultType) {
      case PartyResultType.InviteParty_Sent:
      case PartyResultType.InviteParty_BlockedUser:
      case PartyResultType.InviteParty_AlreadyInvited:
      case PartyResultType.InviteParty_AlreadyInvitedByInviter:
      case PartyResultType.InviteParty_Rejected: {
        const inviterId = r.readInt();
        const message = PartyHandler.inviteResponseMessage(resultType, user.getCharacterName());
        const inviter = ChannelServer.instance.getUserByCharacterId(inviterId);
        if (inviter) {
          inviter.write(PartyPacket.serverMsg(message));
        }
        return;
      }
      case PartyResultType.InviteParty_Accepted: {
        const inviterId = r.readInt();
        PartyHandler.joinParty(user, inviterId);
        return;
      }
      default:
        break;
    }
  }

  // ---- internal party logic (merged from CentralPartyHandler) ----

  private static createNewParty(user: User): void {
    const partyId = ChannelServer.instance.nextPartyId();
    const member = PartyHandler.makeMember(user);
    const party = new Party(partyId, member);
    partyStorage.addParty(party);
    user.setPartyInfo(new PartyInfo(party.partyId, 1, true));
    user.write(PartyPacket.createNewPartyDone(party));
  }

  private static withdrawParty(user: User): void {
    const partyId = user.getPartyId();
    const party = partyStorage.getPartyById(partyId);
    if (!party) {
      user.write(PartyPacket.of(PartyResultType.WithdrawParty_NotJoined).getPacket());
      return;
    }
    if (party.partyBossId === user.getCharacterId()) {
      const outPacket = PartyPacket.withdrawPartyDone(party, user.getCharacterId(), true, false);
      partyStorage.removeParty(party);
      PartyHandler.forEachPartyMember(party, (member) => {
        const target = ChannelServer.instance.getUserByCharacterId(member.characterId);
        if (target) {
          target.setPartyInfo(null);
          target.write(outPacket);
        }
      });
    } else {
      if (!party.removeMember(user.getCharacterId())) return;
      const outPacket = PartyPacket.withdrawPartyDone(party, user.getCharacterId(), false, false);
      user.setPartyInfo(null);
      user.write(outPacket);
      PartyHandler.forEachPartyMember(party, (member) => {
        const target = ChannelServer.instance.getUserByCharacterId(member.characterId);
        if (target) {
          const info = party.createInfo(member.characterId);
          target.setPartyInfo(new PartyInfo(info.partyId, info.memberIndex, info.boss));
          target.write(outPacket);
        }
      });
    }
  }

  private static joinParty(user: User, inviterId: number): void {
    if (user.getPartyId() !== 0) {
      user.write(PartyPacket.of(PartyResultType.JoinParty_AlreadyJoined).getPacket());
      return;
    }
    const inviter = ChannelServer.instance.getUserByCharacterId(inviterId);
    if (!inviter) {
      user.write(PartyPacket.of(PartyResultType.JoinParty_Unknown).getPacket());
      return;
    }
    const party = partyStorage.getPartyById(inviter.getPartyId());
    if (!party) {
      user.write(PartyPacket.of(PartyResultType.JoinParty_Unknown).getPacket());
      return;
    }
    if (!party.unregisterInvite(inviterId, user.getCharacterId())) {
      user.write(PartyPacket.of(PartyResultType.JoinParty_Unknown).getPacket());
      return;
    }
    const member = PartyHandler.makeMember(user);
    if (!party.addMember(member)) {
      user.write(PartyPacket.of(PartyResultType.JoinParty_AlreadyFull).getPacket());
      return;
    }
    const outPacket = PartyPacket.joinPartyDone(party, user.getCharacterId());
    const info = party.createInfo(user.getCharacterId());
    user.setPartyInfo(new PartyInfo(info.partyId, info.memberIndex, info.boss));
    user.write(outPacket);
    PartyHandler.forEachPartyMember(party, (member) => {
      if (member.characterId !== user.getCharacterId()) {
        const target = ChannelServer.instance.getUserByCharacterId(member.characterId);
        if (target) {
          const info = party.createInfo(member.characterId);
          target.setPartyInfo(new PartyInfo(info.partyId, info.memberIndex, info.boss));
          target.write(outPacket);
        }
      }
    });
  }

  private static inviteParty(user: User, targetName: string): void {
    const partyId = user.getPartyId();
    let party = partyStorage.getPartyById(partyId);
    if (!party) {
      party = PartyHandler.createPartyForUser(user);
      if (!party) return;
    }
    const target = ChannelServer.instance.getUserByCharacterName(targetName);
    if (!target) {
      user.write(PartyPacket.serverMsg(`Unable to find '${targetName}'`));
      return;
    }
    if (target.getPartyId() !== 0) {
      user.write(PartyPacket.serverMsg(`'${targetName}' is already in a party.`));
      return;
    }
    if (!party.canAddMember(target.getCharacterId())) return;
    party.registerInvite(user.getCharacterId(), target.getCharacterId());
    target.write(PartyPacket.inviteParty(PartyHandler.makeMember(user)));
  }

  private static kickParty(user: User, targetId: number): void {
    const party = partyStorage.getPartyById(user.getPartyId());
    if (!party) {
      user.write(PartyPacket.of(PartyResultType.KickParty_Unknown).getPacket());
      return;
    }
    if (party.partyBossId !== user.getCharacterId()) {
      user.write(PartyPacket.of(PartyResultType.KickParty_Unknown).getPacket());
      return;
    }
    const targetMember = party.getMember(targetId);
    if (!targetMember || !party.removeMember(targetId)) {
      user.write(PartyPacket.of(PartyResultType.KickParty_Unknown).getPacket());
      return;
    }
    const outPacket = PartyPacket.withdrawPartyDone(party, targetId, false, true);
    const target = ChannelServer.instance.getUserByCharacterId(targetId);
    if (target) {
      target.setPartyInfo(null);
      target.write(outPacket);
    }
    PartyHandler.forEachPartyMember(party, (member) => {
      const target = ChannelServer.instance.getUserByCharacterId(member.characterId);
      if (target) {
        const info = party.createInfo(member.characterId);
        target.setPartyInfo(new PartyInfo(info.partyId, info.memberIndex, info.boss));
        target.write(outPacket);
      }
    });
  }

  private static changePartyBoss(user: User, targetId: number, isDisconnect: boolean): void {
    const party = partyStorage.getPartyById(user.getPartyId());
    if (!party) {
      user.write(PartyPacket.of(PartyResultType.ChangePartyBoss_Unknown).getPacket());
      return;
    }
    if (!party.setPartyBossId(user.getCharacterId(), targetId)) {
      user.write(PartyPacket.of(PartyResultType.ChangePartyBoss_Unknown).getPacket());
      return;
    }
    const outPacket = PartyPacket.changePartyBossDone(targetId, isDisconnect);
    PartyHandler.forEachPartyMember(party, (member) => {
      const target = ChannelServer.instance.getUserByCharacterId(member.characterId);
      if (target) {
        const info = party.createInfo(member.characterId);
        target.setPartyInfo(new PartyInfo(info.partyId, info.memberIndex, info.boss));
        target.write(outPacket);
      }
    });
  }

  // ---- helpers ----

  private static createPartyForUser(user: User): Party | null {
    const partyId = ChannelServer.instance.nextPartyId();
    const member = PartyHandler.makeMember(user);
    const party = new Party(partyId, member);
    partyStorage.addParty(party);
    user.setPartyInfo(new PartyInfo(party.partyId, 1, true));
    user.write(PartyPacket.createNewPartyDone(party));
    return party;
  }

  static forEachPartyMember(party: Party, fn: (member: PartyMember) => void): void {
    for (const member of party.partyMembers) {
      fn(member);
    }
  }

  static makeMember(user: User): PartyMember {
    return {
      characterId: user.getCharacterId(),
      characterName: user.getCharacterName(),
      job: user.getJob(),
      level: user.getLevel(),
      channelId: 0,
      fieldId: user.getField()?.getFieldId() ?? 999999999,
      townPortal: { fieldId: 0, portalId: 0, hp: 0 },
    };
  }

  private static inviteResponseMessage(resultType: PartyResultType, userName: string): string {
    switch (resultType) {
      case PartyResultType.InviteParty_Sent:
      case PartyResultType.InviteParty_BlockedUser:
        return `You have invited '${userName}' to your party.`;
      case PartyResultType.InviteParty_AlreadyInvited:
        return `'${userName}' is taking care of another invitation.`;
      case PartyResultType.InviteParty_AlreadyInvitedByInviter:
        return `You have already invited '${userName}' to your party.`;
      case PartyResultType.InviteParty_Rejected:
        return `'${userName}' has declined the party request.`;
      default:
        return '';
    }
  }
}
