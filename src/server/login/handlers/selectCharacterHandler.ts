import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class SelectCharacterHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const charId = packet.readInt();

        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getMigrateToChannel(session.id, charId),
        );
    }
}
