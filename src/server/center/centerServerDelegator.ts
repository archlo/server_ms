import { PacketDelegator } from "../baseDelegator";
import { CommonSendOpcode } from '../../protocol/opcodes/common/send';
import { CenterHandshakeAckHandler } from "./handlers/centerHandshakeAckHandler";
import { LoginSendOpcode } from "../../protocol/opcodes/login/send";
import { PreLoginPasswordHandler } from "./handlers/preLoginHandler";
import { AutoRegisterHandler } from "./handlers/autoRegisterHandler";
import { CharacterListHandler } from "./handlers/characterListHandler";
import { CheckNameHandler } from "./handlers/checkNameHandler";
import { CreateCharacterHandler } from "./handlers/createCharacterHandler";
import { DeleteCharacterHandler } from "./handlers/deleteCharacterHandler";
import { MigrationHandler } from "./handlers/migrationHandler";
import { ViewAllCharHandler } from "./handlers/viewAllCharHandler";
import { CashShopMigrateHandler } from "./handlers/cashShopMigrateHandler";

export class CenterServerDelegator extends PacketDelegator {
    init(): void {
        this.handlers.set(CommonSendOpcode.CENTER_HANDSHAKE_ACK.getValue(), new CenterHandshakeAckHandler());
        this.handlers.set(LoginSendOpcode.PRE_LOGIN.getValue(), new PreLoginPasswordHandler());
        this.handlers.set(LoginSendOpcode.AUTO_REGISTER.getValue(), new AutoRegisterHandler());
        this.handlers.set(LoginSendOpcode.CHARACTER_LIST_REQUEST.getValue(), new CharacterListHandler());
        this.handlers.set(LoginSendOpcode.CHECK_NAME_REQUEST.getValue(), new CheckNameHandler());
        this.handlers.set(LoginSendOpcode.CREATE_CHARACTER_REQUEST.getValue(), new CreateCharacterHandler());
        this.handlers.set(LoginSendOpcode.DELETE_CHARACTER_REQUEST.getValue(), new DeleteCharacterHandler());
        this.handlers.set(LoginSendOpcode.MIGRATE_TO_CHANNEL.getValue(), new MigrationHandler());
        this.handlers.set(LoginSendOpcode.VIEW_ALL_CHAR_REQUEST.getValue(), new ViewAllCharHandler());
        this.handlers.set(LoginSendOpcode.CASH_SHOP_MIGRATE_REQUEST.getValue(), new CashShopMigrateHandler());
    }
}
