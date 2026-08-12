

export class CenterSendOpcode {

    static WORKER_HANDSHAKE = new CenterSendOpcode(0x200);
    static PRE_LOGIN_ACK = new CenterSendOpcode(0x201);
    static AUTO_REGISTER_ACK = new CenterSendOpcode(0x202);
    static CHARACTER_LIST_ACK = new CenterSendOpcode(0x203);
    static CHECK_NAME_ACK = new CenterSendOpcode(0x204);
    static CREATE_CHARACTER_ACK = new CenterSendOpcode(0x205);
    static DELETE_CHARACTER_ACK = new CenterSendOpcode(0x206);
    static MIGRATE_RESULT = new CenterSendOpcode(0x207);
    static MIGRATE_REQUEST = new CenterSendOpcode(0x208);
    static VIEW_ALL_CHAR_ACK = new CenterSendOpcode(0x209);
    static CASH_SHOP_MIGRATE_ACK = new CenterSendOpcode(0x20A);
    static CASH_SHOP_HANDOFF = new CenterSendOpcode(0x20B);

    private code: number;

    constructor(code: number) {
        this.code = code;
    }

    getValue(): number {
        return this.code;
    }
}