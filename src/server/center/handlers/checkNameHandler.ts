import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { CenterServer } from "../centerServer";
import { CenterPackets } from "../centerPackets";
import { CharacterDB } from "../../channel/db/CharacterDB";

export class CheckNameHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const name = packet.readMapleAsciiString();

        const available = await CharacterDB.checkNameAvailable(name);
        const loginSession = CenterServer.instance.loginServerSessionId;
        if (loginSession == null) return;

        const response = CenterPackets.getCheckNameAck(sessionId, name, available);
        session.socket.write(response);
    }
}
