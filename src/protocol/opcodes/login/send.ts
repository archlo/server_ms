export class LoginSendOpcode {

    static PRE_LOGIN = new LoginSendOpcode(0x500);
    static AUTO_REGISTER = new LoginSendOpcode(0x501);
    static ADD_LOGIN = new LoginSendOpcode(0x502);
    static CHARACTER_LIST_REQUEST = new LoginSendOpcode(0x503);
    static CHECK_NAME_REQUEST = new LoginSendOpcode(0x504);
    static CREATE_CHARACTER_REQUEST = new LoginSendOpcode(0x505);
    static DELETE_CHARACTER_REQUEST = new LoginSendOpcode(0x506);
    static MIGRATE_TO_CHANNEL = new LoginSendOpcode(0x507);
    static VIEW_ALL_CHAR_REQUEST = new LoginSendOpcode(0x508);
    static CASH_SHOP_MIGRATE_REQUEST = new LoginSendOpcode(0x509);

    private code: number;

    constructor(code: number) {
        this.code = code;
    }

    getValue(): number {
        return this.code;
    }
}