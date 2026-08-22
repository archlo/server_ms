import { ServerType } from "../baseServer";
import { PacketReader } from "../../protocol/packets/packetReader";
import { ShopServerPacketDelegator } from "./shopServerDelegator";
import { Session } from "../session";
import { Config } from '../../util/config';
import { WorkerServer } from '../workerServer';
import { CenterSendOpcode } from "../../protocol/opcodes/center/send";
import { MapleRecvOpcode } from "../../protocol/opcodes/maple/recv";
import { MapleSendOpcode } from "../../protocol/opcodes/maple/send";
import { PacketWriter } from "../../protocol/packets/packetWriter";
import { EncryptedSession } from "../../protocol/crypto/encryptedSession";
import { AES } from "../../protocol/crypto/aes";
import { Shanda } from "../../protocol/crypto/shanda";
import { AccountDB } from "../center/db/account";
import { CenterServer } from "../center/centerServer";
import { CashShopProvider } from '../../provider/CashShopProvider';

const SHOP_VERSION = 95;

export class ShopServer extends WorkerServer {

    static instance: ShopServer;

    readonly pendingMigrations = new Map<number, number>();
    private readonly clientSessions = new Map<number, {
        enc: EncryptedSession;
        accountId: number;
        account: any;
    }>();

    constructor() {
        super(ServerType.SHOP, Config.instance.shop.host, Config.instance.shop.port);
        this.packetDelegator = new ShopServerPacketDelegator();
        ShopServer.instance = this;
    }

    onConnection(session: Session): void {
        if (this.isCenterServer(session)) {
            this.connected = true;
            this.logger.info(`ShopServer has established CenterServer connection`);
            return;
        }
        this.logger.info(`Cash shop client connected: session ${session.id}`);
        const ivRecv = Buffer.from([70, 114, Math.round(Math.random() * 127), 82]);
        const ivSend = Buffer.from([0x52, 0x30, 0x78, 0x61]);
        const enc = new EncryptedSession(
            session,
            new AES(ivSend, 0xffff - SHOP_VERSION),
            new AES(ivRecv, SHOP_VERSION),
        );
        this.clientSessions.set(session.id, { enc, accountId: 0, account: null });
        session.socket.write(this.buildHandshake(SHOP_VERSION, ivRecv, ivSend));
    }

    onClose(session: Session, hadError: any): void {
        if (this.isCenterServer(session)) {
            this.connected = false;
            delete this.centerServerSession;
            return;
        }
        this.clientSessions.delete(session.id);
        this.logger.info(`Cash shop client disconnected: session ${session.id}`);
    }

    /** Parse the4-byte MapleStory header to extract body length. */
    private parseHeaderLength(header: Buffer): number {
        const a = ((header[0] & 0xFF) << 8) | (header[1] & 0xFF);
        const b = ((header[2] & 0xFF) << 8) | (header[3] & 0xFF);
        const lenSwapped = a ^ b;
        return ((lenSwapped >> 8) & 0xFF) | ((lenSwapped & 0xFF) << 8);
    }

    onData(session: Session, data: Buffer): void {
        if (this.isCenterServer(session)) {
            const packet = new PacketReader(data);
            const opcode = packet.readShort();
            const packetHandler = this.packetDelegator.getHandler(opcode);
            if (packetHandler === undefined) {
                this.logger.debug(`ShopServer unhandled center packet 0x${opcode.toString(16)}`);
                return;
            }
            packetHandler.handlePacket(packet, this.centerServerSession);
            return;
        }

        const entry = this.clientSessions.get(session.id);
        if (!entry) return;

        // Accumulate into per-session buffer to handle TCP stream framing
        session.recvBuffer = session.recvBuffer.length > 0
            ? Buffer.concat([session.recvBuffer, data])
            : data;

        // Extract complete packets: each is 4-byte header + body
        while (session.recvBuffer.length >= 4) {
            const bodyLen = this.parseHeaderLength(session.recvBuffer);
            const packetLen = 4 + bodyLen;
            if (session.recvBuffer.length < packetLen) break;

            const packetData = session.recvBuffer.subarray(0, packetLen);
            session.recvBuffer = session.recvBuffer.slice(packetLen);

            const body = packetData.slice(4);
            entry.enc.recvCrypto.transform(body);
            const decrypted = Shanda.decrypt(body);
            const packet = new PacketReader(decrypted);
            const opcode = packet.readShort();
            this.handleClientPacket(session, entry, packet, opcode);
        }
    }

    onError(error: any): void {
        this.logger.error(error?.message ?? error);
    }

    onStart(): void {
        CashShopProvider.initialize();
        this.logger.info(`ShopServer has started listening on port ${this.port}`);
    }

    onShutdown(): void {
        // noop
    }

    private handleClientPacket(
        session: Session,
        entry: { enc: EncryptedSession; accountId: number; account: any },
        packet: PacketReader,
        opcode: number,
    ): void {
        switch (opcode) {
            case MapleRecvOpcode.MIGRATE_IN.code: {
                const charId = packet.readInt();
                this.handleMigrateIn(session, entry, charId);
                break;
            }
            case MapleRecvOpcode.CASH_SHOP_QUERY_CASH_REQUEST.code: {
                this.handleQueryCash(session, entry);
                break;
            }
            case MapleRecvOpcode.CASH_SHOP_CASH_ITEM_REQUEST.code: {
                this.handleCashItemRequest(session, entry, packet);
                break;
            }
            case MapleRecvOpcode.USER_TRANSFER_FIELD_REQUEST.code: {
                this.handleMigrateBack(session, entry);
                break;
            }
            default:
                this.logger.warn(`ShopServer unhandled opcode 0x${opcode.toString(16)}`);
        }
    }

    private async handleMigrateIn(
        session: Session,
        entry: { enc: EncryptedSession; accountId: number; account: any },
        charId: number,
    ): Promise<void> {
        let accountId = 0;
        for (const [csSessionId, accId] of this.pendingMigrations) {
            accountId = accId;
            this.pendingMigrations.delete(csSessionId);
            break;
        }

        if (!accountId) {
            this.logger.warn(`CASH_SHOP MIGRATE_IN: no pending migration for session ${session.id}`);
            session.socket.destroy();
            return;
        }

        entry.accountId = accountId;

        try {
            const account = await AccountDB.loadAccount(accountId);
            entry.account = account;
            this.logger.info(`Cash shop MIGRATE_IN success for account ${accountId}`);
        } catch (err) {
            this.logger.error(`Cash shop MIGRATE_IN: failed to load account ${accountId}`);
        }

        const w = new PacketWriter(3);
        w.writeShort(MapleSendOpcode.SET_CASH_SHOP.getValue());
        entry.enc.write(w.getPacket());
    }

    private async handleQueryCash(
        session: Session,
        entry: { enc: EncryptedSession; accountId: number; account: any },
    ): Promise<void> {
        if (!entry.account) {
            this.logger.warn(`CASH_SHOP_QUERY_CASH: no account loaded for session ${session.id}`);
            return;
        }
        const w = new PacketWriter(13);
        w.writeShort(MapleSendOpcode.CASH_SHOP_QUERY_CASH_RESULT.getValue());
        w.writeInt(entry.account.nxCredit ?? 0);
        w.writeInt(entry.account.maplePoint ?? 0);
        w.writeInt(0);
        entry.enc.write(w.getPacket());
    }

    private async handleCashItemRequest(
        session: Session,
        entry: { enc: EncryptedSession; accountId: number; account: any },
        packet: PacketReader,
    ): Promise<void> {
        const action = packet.readByte();

        const account = entry.account;
        if (!account) {
            this.sendBuyResult(session, entry, 2);
            return;
        }

        if (action === 3) {
            // Self purchase (buy to locker)
            packet.readInt();
            const sn = packet.readInt();
            const quantity = packet.readShort();

            const item = CashShopProvider.getItem(sn);
            if (!item) {
                this.sendBuyResult(session, entry, 3);
                return;
            }

            const totalCost = item.discountPrice > 0 ? item.discountPrice : item.price;
            if ((account.nxCredit ?? 0) < totalCost * quantity) {
                this.sendBuyResult(session, entry, 2);
                return;
            }

            account.nxCredit -= totalCost * quantity;

            await AccountDB.updateAccountCash(
                account.id,
                account.nxCredit,
                account.maplePoint ?? 0,
                account.nxPrepaid ?? 0,
            );

            await AccountDB.addCashItem(account.id, 0, item);

            this.sendBuyResult(session, entry, 0);
            this.sendUpdatedCash(session, entry);
        } else if (action === 0) {
            // Gift to another character
            packet.readInt();
            const sn = packet.readInt();
            const quantity = packet.readShort();
            const recipientName = packet.readMapleAsciiString();
            // giftMessage is limited to 12 chars in MapleStory
            const giftMessage = packet.readMapleAsciiString();

            const item = CashShopProvider.getItem(sn);
            if (!item) {
                this.sendBuyResult(session, entry, 3);
                return;
            }

            const totalCost = item.discountPrice > 0 ? item.discountPrice : item.price;
            if ((account.nxCredit ?? 0) < totalCost * quantity) {
                this.sendBuyResult(session, entry, 2);
                return;
            }

            const recipientCharId = await AccountDB.findCharacterIdByName(recipientName);
            if (!recipientCharId) {
                this.sendBuyResult(session, entry, 4); // Character not found
                return;
            }

            account.nxCredit -= totalCost * quantity;

            await AccountDB.updateAccountCash(
                account.id,
                account.nxCredit,
                account.maplePoint ?? 0,
                account.nxPrepaid ?? 0,
            );

            await AccountDB.addCashItem(account.id, recipientCharId, item);

            this.sendBuyResult(session, entry, 0);
            this.sendUpdatedCash(session, entry);
        } else if (action === 44) {
            // CCashShop::RequestCashPurchaseRecord @0x4823C0 (sub-action 0x2C):
            // purchase record for a limit(2|3) commodity SN. Response format
            // per OnCashItemResPurchaseRecord @0x495B50: int sn, byte purchased.
            const key = packet.readInt();
            let purchased = false;
            if (key !== 0 && account.id) {
                purchased = await AccountDB.hasCashItemRecord(account.id, key);
            }
            const w = new PacketWriter(8);
            w.writeShort(MapleSendOpcode.CASH_SHOP_CASH_ITEM_RESULT.getValue());
            w.writeByte(0xAF);
            w.writeInt(key);
            w.writeByte(purchased ? 1 : 0);
            entry.enc.write(w.getPacket());
        }
    }

    private sendBuyResult(
        session: Session,
        entry: { enc: EncryptedSession },
        result: number,
    ): void {
        const w = new PacketWriter(4);
        w.writeShort(MapleSendOpcode.CASH_SHOP_CASH_ITEM_RESULT.getValue());
        w.writeByte(3);
        w.writeByte(result);
        entry.enc.write(w.getPacket());
    }

    private sendUpdatedCash(
        session: Session,
        entry: { enc: EncryptedSession; accountId: number; account: any },
    ): void {
        const w = new PacketWriter(13);
        w.writeShort(MapleSendOpcode.CASH_SHOP_QUERY_CASH_RESULT.getValue());
        w.writeInt(entry.account.nxCredit ?? 0);
        w.writeInt(entry.account.maplePoint ?? 0);
        w.writeInt(0);
        entry.enc.write(w.getPacket());
    }

    private handleMigrateBack(
        session: Session,
        entry: { enc: EncryptedSession; accountId: number; account: any },
    ): void {
        const w = new PacketWriter(15);
        w.writeShort(MapleSendOpcode.MIGRATE_TO_CASH_SHOP_RESULT.getValue());
        w.writeByte(1);

        const channelServerId = CenterServer.instance?.channelServerSessionId;
        if (channelServerId) {
            const host = Config.instance.channel.host;
            const port = Config.instance.channel.port;
            w.writeMapleAsciiString(host);
            w.writeInt(port);
        }
        entry.enc.write(w.getPacket());
        session.socket.destroy();
    }

    private buildHandshake(version: number, ivRecv: Buffer, ivSend: Buffer): Buffer {
        const w = new PacketWriter(18);
        w.writeShort(14);
        w.writeShort(version);
        w.writeMapleAsciiString('1');
        w.write(ivRecv);
        w.write(ivSend);
        w.writeByte(8);
        return w.getPacket();
    }
}
