import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class ViewAllCharHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const worldId = packet.readByte();

        const loginClient = LoginServer.instance.loginStore.get(session.id);
        if (!loginClient) {
            LoginServer.instance.logger.warn(`No login client for session ${session.id} on VIEW_ALL_CHAR`);
            return;
        }

        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getViewAllCharRequest(session.id, loginClient.id),
        );
    }
}
