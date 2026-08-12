export class ChannelSendOpcode {

    static MIGRATE_IN_HANDOFF = new ChannelSendOpcode(0x600);
    static ADD_LOGIN_ACK = new ChannelSendOpcode(0x601);

    private code: number;

    constructor(code: number) {
        this.code = code;
    }

    getValue(): number {
        return this.code;
    }
}