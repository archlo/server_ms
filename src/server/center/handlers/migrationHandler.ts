import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketWriter } from "../../../protocol/packets/packetWriter";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { CenterServer } from "../centerServer";
import { CenterPackets } from "../centerPackets";
import { CharacterDB } from "../../channel/db/CharacterDB";
import { ChannelSendOpcode } from "../../../protocol/opcodes/channel/send";
import { Config } from "../../../util/config";

export class MigrationHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const charId = packet.readInt();

        // Load character from DB
        const cd = await CharacterDB.loadCharacter(charId);
        if (!cd) {
            CenterServer.instance.logger.warn(`Migration failed: charId ${charId} not found in DB (session ${sessionId})`);
            const response = CenterPackets.getMigrateResult(sessionId, false, '', 0);
            session.socket.write(response);
            return;
        }

        // Forward migration to channel server
        const channelSessionId = CenterServer.instance.channelServerSessionId;
        if (channelSessionId == null) {
            CenterServer.instance.logger.warn(`Migration failed: no channel server registered (session ${sessionId}, char ${charId})`);
            const response = CenterPackets.getMigrateResult(sessionId, false, '', 0);
            session.socket.write(response);
            return;
        }

        const channelSession = CenterServer.instance.workerSessions.get(channelSessionId) ?? null;

        if (!channelSession) {
            CenterServer.instance.logger.warn(`Migration failed: channel session ${channelSessionId} gone (session ${sessionId}, char ${charId})`);
            const response = CenterPackets.getMigrateResult(sessionId, false, '', 0);
            session.socket.write(response);
            return;
        }

        // Serialize charData minimally for migration and send to channel
        const migrateW = new PacketWriter();
        migrateW.writeShort(ChannelSendOpcode.MIGRATE_IN_HANDOFF.getValue());
        migrateW.writeInt(charId);
        migrateW.writeInt(sessionId);
        // Channel will load from DB itself, we just send the charId and sessionId
        channelSession.socket.write(migrateW.getPacket());

        // Respond to login server with channel server connection info
        const channelHost = Config.instance.channel.host;
        const channelPort = Config.instance.channel.port;
        const response = CenterPackets.getMigrateResult(sessionId, true, channelHost, channelPort, charId);
        session.socket.write(response);
    }
}
