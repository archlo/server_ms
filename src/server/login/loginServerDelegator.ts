import { CenterSendOpcode } from "../../protocol/opcodes/center/send";
import { MapleRecvOpcode } from "../../protocol/opcodes/maple/recv";
import { PacketDelegator } from "../baseDelegator";
import { CenterHandshakeHandler } from './handlers/centerHandshakeHandler';
import { AutoRegisterAckHandler, PreLoginPasswordAckHandler, PreLoginPasswordHandler } from "./handlers/loginPasswordHandler";
import { WorldListRequestHandler } from "./handlers/worldListHandler";
import { SelectWorldHandler } from "./handlers/selectWorldHandler";
import { CheckPinCodeHandler } from "./handlers/checkPinCodeHandler";
import { CheckDuplicatedIdHandler } from "./handlers/checkDuplicatedIdHandler";
import { CreateNewCharacterHandler } from "./handlers/createNewCharacterHandler";
import { DeleteCharacterHandler } from "./handlers/deleteCharacterHandler";
import { SelectCharacterHandler } from "./handlers/selectCharacterHandler";
import { CharacterListAckHandler, CheckNameAckHandler, CreateCharacterAckHandler, DeleteCharacterAckHandler, MigrateResultHandler, ViewAllCharAckHandler } from "./handlers/centerAckHandlers";
import { ViewAllCharHandler } from "./handlers/viewAllCharHandler";
import { EnableSPWRequestHandler } from "./handlers/enableSPWRequestHandler";
import { CheckSPWRequestHandler } from "./handlers/checkSPWRequestHandler";


export class LoginServerPacketDelegator extends PacketDelegator {

    init(): void {
        this.handlers.set(CenterSendOpcode.WORKER_HANDSHAKE.getValue(), new CenterHandshakeHandler());
        this.handlers.set(MapleRecvOpcode.CHECK_PASSWORD.getValue(), new PreLoginPasswordHandler());
        this.handlers.set(CenterSendOpcode.PRE_LOGIN_ACK.getValue(), new PreLoginPasswordAckHandler());
        this.handlers.set(CenterSendOpcode.AUTO_REGISTER_ACK.getValue(), new AutoRegisterAckHandler());
        this.handlers.set(MapleRecvOpcode.WORLD_REQUEST.getValue(), new WorldListRequestHandler());
        this.handlers.set(MapleRecvOpcode.WORLD_INFO_REQUEST.getValue(), new WorldListRequestHandler());
        this.handlers.set(MapleRecvOpcode.SELECT_WORLD.getValue(), new SelectWorldHandler());
        this.handlers.set(MapleRecvOpcode.CHECK_PIN_CODE.getValue(), new CheckPinCodeHandler());
        this.handlers.set(MapleRecvOpcode.ENABLE_SPW_REQUEST.getValue(), new EnableSPWRequestHandler());
        this.handlers.set(MapleRecvOpcode.CHECK_SPW_REQUEST.getValue(), new CheckSPWRequestHandler());
        this.handlers.set(MapleRecvOpcode.CHECK_DUPLICATED_ID.getValue(), new CheckDuplicatedIdHandler());
        this.handlers.set(MapleRecvOpcode.CREATE_NEW_CHARACTER.getValue(), new CreateNewCharacterHandler());
        this.handlers.set(MapleRecvOpcode.DELETE_CHARACTER.getValue(), new DeleteCharacterHandler());
        this.handlers.set(MapleRecvOpcode.SELECT_CHARACTER.getValue(), new SelectCharacterHandler());
        this.handlers.set(MapleRecvOpcode.VIEW_ALL_CHAR.getValue(), new ViewAllCharHandler());
        this.handlers.set(CenterSendOpcode.CHARACTER_LIST_ACK.getValue(), new CharacterListAckHandler());
        this.handlers.set(CenterSendOpcode.CHECK_NAME_ACK.getValue(), new CheckNameAckHandler());
        this.handlers.set(CenterSendOpcode.CREATE_CHARACTER_ACK.getValue(), new CreateCharacterAckHandler());
        this.handlers.set(CenterSendOpcode.DELETE_CHARACTER_ACK.getValue(), new DeleteCharacterAckHandler());
        this.handlers.set(CenterSendOpcode.MIGRATE_RESULT.getValue(), new MigrateResultHandler());
        this.handlers.set(CenterSendOpcode.VIEW_ALL_CHAR_ACK.getValue(), new ViewAllCharAckHandler());
    }
    
}
