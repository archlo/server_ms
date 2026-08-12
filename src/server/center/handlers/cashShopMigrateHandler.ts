import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketWriter } from "../../../protocol/packets/packetWriter";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { CenterServer } from "../centerServer";
import { CenterPackets } from "../centerPackets";
import { CenterSendOpcode } from "../../../protocol/opcodes/center/send";
import { Config } from "../../../util/config";

export class CashShopMigrateHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const channelSessionId = packet.readInt();
        const accountId = packet.readInt();

        const shopSessionId = CenterServer.instance.shopServerSessionId;
        if (shopSessionId == null) {
            const response = CenterPackets.getCashShopMigrateAck(channelSessionId, false, '', 0);
            session.socket.write(response);
            return;
        }

        // Forward handoff to shop server so it can prepare
        const shopSession = CenterServer.instance.workerSessions.get(shopSessionId) ?? null;
        if (shopSession) {
            const handoffW = new PacketWriter(8);
            handoffW.writeShort(CenterSendOpcode.CASH_SHOP_HANDOFF.getValue());
            handoffW.writeInt(channelSessionId);
            handoffW.writeInt(accountId);
            shopSession.socket.write(handoffW.getPacket());
        }

        const shopHost = Config.instance.shop.host;
        const shopPort = Config.instance.shop.port;
        const response = CenterPackets.getCashShopMigrateAck(channelSessionId, true, shopHost, shopPort);
        session.socket.write(response);
    }
}
