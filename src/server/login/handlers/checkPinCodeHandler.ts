import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class CheckPinCodeHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const pin = packet.readMapleAsciiString();

        const encSession = LoginServer.instance.sessionStore.get(session.id);
        const loginClient = LoginServer.instance.loginStore.get(session.id);
        if (!encSession || !loginClient) return;

        const ok = loginClient.pin === pin;
        encSession.write(LoginPackets.getCheckPinCodeResult(ok));
    }
}
