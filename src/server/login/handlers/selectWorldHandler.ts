import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class SelectWorldHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const worldId = packet.readByte();
        const channelId = packet.readByte();

        const loginClient = LoginServer.instance.loginStore.get(session.id);
        if (!loginClient) {
            LoginServer.instance.logger.warn(`No login client for session ${session.id} on SELECT_WORLD`);
            return;
        }

        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getCharacterListRequest(session.id, loginClient.id),
        );
    }
}
