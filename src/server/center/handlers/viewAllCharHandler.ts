import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { CenterServer } from "../centerServer";
import { CenterPackets } from "../centerPackets";
import { CharacterDB } from "../../channel/db/CharacterDB";
import { RankManager } from "../../rank/RankManager";
import { CharacterRank } from "../../rank/CharacterRank";

export class ViewAllCharHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const accountId = packet.readInt();

        const characters = await CharacterDB.getAvatarDataByAccountId(accountId);
        const loginSession = CenterServer.instance.loginServerSessionId;
        if (loginSession == null) return;

        const ranks = new Map<number, CharacterRank>();
        for (const c of characters) {
            const job: number = c.statJson?.job ?? 0;
            const rank = RankManager.getCharacterRank(c.id, job);
            if (rank) ranks.set(c.id, rank);
        }

        const response = CenterPackets.getViewAllCharAck(sessionId, characters, ranks);
        session.socket.write(response);
    }
}
