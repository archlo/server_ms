import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { ShopServer } from "../shopServer";

export class CashShopHandoffHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const channelSessionId = packet.readInt();
        const accountId = packet.readInt();

        ShopServer.instance.pendingMigrations.set(channelSessionId, accountId);
        ShopServer.instance.logger.info(`Cash shop handoff for account ${accountId} (channel session ${channelSessionId})`);
    }
}
