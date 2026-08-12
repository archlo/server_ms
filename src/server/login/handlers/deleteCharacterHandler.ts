import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class DeleteCharacterHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        // Some clients send (string secondaryPassword, int charId) — skip the optional string
        const savedOffset = packet.offset;
        let charId: number;
        try {
            packet.readMapleAsciiString(); // skip optional secondary password
            charId = packet.readInt();
        } catch {
            // No password field — reset and read charId directly
            packet.offset = savedOffset;
            charId = packet.readInt();
        }

        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getDeleteCharacterRequest(session.id, charId),
        );
    }
}
