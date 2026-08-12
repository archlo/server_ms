import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets } from "../loginPackets";

export class CreateNewCharacterHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const name = packet.readMapleAsciiString();
        const race = packet.readInt();        // race/job family (4 bytes)
        packet.readShort();                   // subJob (2 bytes) — clients that send short subJob after race
        const face = packet.readInt();
        const hair = packet.readInt();
        const hairColor = packet.readInt();
        const skin = packet.readInt();
        const top = packet.readInt();
        const bottom = packet.readInt();
        const shoes = packet.readInt();
        const weapon = packet.readInt();
        const gender = packet.readByte();

        const loginClient = LoginServer.instance.loginStore.get(session.id);
        if (!loginClient) {
            LoginServer.instance.logger.warn(`No login client for session ${session.id} on CREATE_NEW_CHARACTER`);
            return;
        }

        const tempCharId = Math.floor(Date.now() / 1000) % 2_000_000_000 + 1;

        LoginServer.instance.centerServerSession.socket.write(
            LoginPackets.getCreateCharacterRequest(session.id, loginClient.id, tempCharId, name, race, face, hair, hairColor, skin, top, bottom, shoes, weapon, gender),
        );
    }
}
