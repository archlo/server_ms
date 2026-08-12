import { CenterSendOpcode } from "../../protocol/opcodes/center/send";
import { PacketDelegator } from "../baseDelegator";
import { CenterHandshakeHandler } from './handlers/centerHandshakeHandler';
import { CashShopHandoffHandler } from './handlers/cashShopHandoffHandler';


export class ShopServerPacketDelegator extends PacketDelegator {

    init(): void {
        this.handlers.set(CenterSendOpcode.WORKER_HANDSHAKE.getValue(), new CenterHandshakeHandler());
        this.handlers.set(CenterSendOpcode.CASH_SHOP_HANDOFF.getValue(), new CashShopHandoffHandler());
    }
    
}