import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class CheckDuplicatedIdHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const name = packet.readMapleAsciiString();

        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getCheckNameRequest(session.id, name),
        );
    }
}
