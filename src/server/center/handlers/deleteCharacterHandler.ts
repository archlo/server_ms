import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { CenterServer } from "../centerServer";
import { CenterPackets } from "../centerPackets";
import { Database } from "../db/database";

export class DeleteCharacterHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const charId = packet.readInt();

        try {
            await Database.knex('characters').where({ id: charId }).del();
            const response = CenterPackets.getDeleteCharacterAck(sessionId, charId, true);
            session.socket.write(response);
        } catch {
            const response = CenterPackets.getDeleteCharacterAck(sessionId, charId, false);
            session.socket.write(response);
        }
    }
}
