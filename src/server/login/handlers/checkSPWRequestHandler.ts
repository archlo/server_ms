import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";
import { Config } from "../../../util/config";

export class CheckSPWRequestHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const pic        = packet.readMapleAsciiString();
        const charId     = packet.readInt();
        packet.readMapleAsciiString(); // fake MAC 1
        packet.readMapleAsciiString(); // fake MAC 2

        const encSession  = LoginServer.instance.sessionStore.get(session.id);
        const loginClient = LoginServer.instance.loginStore.get(session.id);
        if (!encSession || !loginClient) return;

        // TODO_AUDIT.md: CheckSPWRequestHandler always required loginClient.pic === pic,
        // even when config/game.hjson has enablePic: false (no PIC ever set on the
        // account), so it failed every attempt and the client looped on the SPW screen
        // forever instead of entering the game. bLoginOpt=2 (written in loginPackets.ts)
        // already tells the client PIC is disabled; honor that here too.
        if (Config.instance.game.enablePic && (!loginClient.pic || loginClient.pic !== pic)) {
            encSession.write(LoginPackets.getCheckSPWResultFailed());
            return;
        }

        LoginServer.instance.spwPendingStore.add(session.id);
        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getMigrateToChannel(session.id, charId),
        );
    }
}
