import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class WorldListRequestHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const encSession = LoginServer.instance.sessionStore.get(session.id);
        if (!encSession) {
            LoginServer.instance.logger.warn(`No encrypted session for ${session.id} on WORLD_REQUEST`);
            return;
        }

        await encSession.write(LoginPackets.getWorldInformation());
        await encSession.write(LoginPackets.getEndOfWorldList());
    }
}
