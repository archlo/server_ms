import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";
import { AccountDB } from "../../center/db/account";

export class EnableSPWRequestHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        packet.readByte(); // always 1
        const characterId = packet.readInt();
        packet.readMapleAsciiString(); // fake MAC address 1
        packet.readMapleAsciiString(); // fake MAC address 2
        const pic = packet.readMapleAsciiString();

        const encSession = LoginServer.instance.sessionStore.get(session.id);
        const loginClient = LoginServer.instance.loginStore.get(session.id);
        if (!encSession || !loginClient) return;

        await AccountDB.updatePic(loginClient.id, pic);
        loginClient.pic = pic;

        encSession.write(LoginPackets.getEnableSPWResult(0, 0));
    }
}
