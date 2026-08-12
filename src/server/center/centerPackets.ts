import { CenterSendOpcode } from "../../protocol/opcodes/center/send";
import { PacketWriter } from "../../protocol/packets/packetWriter";
import { ServerType } from "../baseServer";
import { CharacterRank } from "../rank/CharacterRank";

export class CenterPackets {
    static getWorkerHandshake() {
        const packet = new PacketWriter(3);
        packet.writeShort(CenterSendOpcode.WORKER_HANDSHAKE.getValue());
        packet.writeByte(ServerType.CENTER);
        return packet.getPacket();
    }

    static getPreLoginPasswordAck(found: boolean, obj: any) {
        const packetLength = (found ? obj.password.length + obj.pin.length + obj.pic.length + 23 : 0) + 7;
        const packet = new PacketWriter(packetLength);
        packet.writeShort(CenterSendOpcode.PRE_LOGIN_ACK.getValue());
        packet.writeInt(obj.sessionId);
        packet.writeBoolean(found);
        if (found) {
            packet.writeInt(obj.id);
            packet.writeMapleAsciiString(obj.password);
            packet.writeByte(obj.gender);
            packet.writeBoolean(obj.banned);
            packet.writeFT(obj.temp_ban ? new Date(obj.temp_ban) : null);
            packet.writeMapleAsciiString(obj.pin);
            packet.writeMapleAsciiString(obj.pic);
            packet.writeByte(obj.character_slots);
            packet.writeBoolean(obj.tos);
            packet.writeByte(obj.language);
            return packet.getPacket();
        }
        return packet.getPacket();
    }

    static getAutoRegisterAck(sessionId: number, result: any): Buffer {
        const packet = new PacketWriter((result !== undefined ? result.password.length + result.pin.length + result.pic.length + 23 : 0) + 7);
        packet.writeShort(CenterSendOpcode.AUTO_REGISTER_ACK.getValue());
        packet.writeInt(sessionId);
        packet.writeBoolean(result !== undefined);
        if (result !== undefined) {
            packet.writeInt(result.id);
            packet.writeMapleAsciiString(result.password);
            packet.writeByte(result.gender);
            packet.writeBoolean(result.banned);
            packet.writeFT(result.temp_ban ? new Date(result.temp_ban) : null);
            packet.writeMapleAsciiString(result.pin);
            packet.writeMapleAsciiString(result.pic);
            packet.writeByte(result.character_slots);
            packet.writeBoolean(result.tos);
            packet.writeByte(result.language);
        }
        return packet.getPacket();
    }

    // Write extended stat fields from statJson to a packet writer.
    // This is used for both character list and create/viewAll ACKs.
    private static writeStatFields(packet: PacketWriter, sj: any): void {
        // Base appearance (re-read for consistency)
        packet.writeByte(sj?.gender ?? 0);
        const skinVal: number = sj?.skin ?? 0;
        packet.writeByte(skinVal > 0xFF ? (skinVal >> 16) & 0xFF : skinVal & 0xFF);
        packet.writeInt(sj?.face || 20000);
        packet.writeInt(sj?.hair || 30000);
        // Pet serials (long = 8 bytes each)
        packet.writeLong(BigInt(sj?.petSn1 ?? 0));
        packet.writeLong(BigInt(sj?.petSn2 ?? 0));
        packet.writeLong(BigInt(sj?.petSn3 ?? 0));
        // Combat stats
        packet.writeUByte(sj?.level ?? 1);
        packet.writeShort(sj?.job ?? 0);
        packet.writeShort(sj?.str ?? 4);
        packet.writeShort(sj?.dex ?? 4);
        packet.writeShort(sj?.int ?? 4);
        packet.writeShort(sj?.luk ?? 4);
        // HP/MP
        packet.writeInt(sj?.hp ?? 50);
        packet.writeInt(sj?.maxHp ?? 50);
        packet.writeInt(sj?.mp ?? 5);
        packet.writeInt(sj?.maxMp ?? 5);
        // AP/SP
        packet.writeShort(sj?.ap ?? 0);
        // SP encoding: extend job → count + pairs; normal → short
        const job = sj?.job ?? 0;
        const isExtend = (Math.floor(job / 1000) >= 3) || (Math.floor(job / 100) === 22) || job === 2001;
        const spData = sj?.sp;
        if (isExtend && Array.isArray(spData)) {
            // extendSp format: count of (jobLevel, sp) pairs
            const count = Math.min(spData.length, 10);
            packet.writeUByte(count);
            for (let i = 0; i < count; i++) {
                const pair = spData[i];
                if (Array.isArray(pair) && pair.length >= 2) {
                    packet.writeUByte(pair[0]); // jobLevel
                    packet.writeUByte(pair[1]); // sp
                } else {
                    packet.writeUByte(0);
                    packet.writeUByte(0);
                }
            }
        } else {
            // Normal SP: stored as short in spData[0..1], or 0
            const spVal = (Array.isArray(spData) && spData.length >= 2)
                ? (spData[0] | (spData[1] << 8))
                : 0;
            packet.writeShort(spVal);
        }
        // Remaining stats
        packet.writeInt(sj?.exp ?? 0);
        packet.writeShort(sj?.pop ?? 0);
        packet.writeInt(sj?.tempExp ?? 0);
        packet.writeInt(sj?.posMap ?? 100000000);
        packet.writeUByte(sj?.portal ?? 0);
        packet.writeInt(sj?.playTime ?? 0);
        packet.writeShort(sj?.subJob ?? 0);
        // Family placeholder (always 0); rank is written by the caller after stat fields.
        packet.writeUByte(0); // onFamily
    }

    private static writeRankBlock(packet: PacketWriter, rank: CharacterRank | null): void {
        if (rank) {
            packet.writeByte(1); // hasRank
            rank.encode(packet);
        } else {
            packet.writeByte(0); // hasRank
        }
    }

    static getCharacterListAck(sessionId: number, characters: Array<{ id: number; name: string; statJson: any; equippedJson: any }>, ranks: Map<number, CharacterRank> = new Map()): Buffer {
        // header: opcode(2) + sessionId(4) + count(4) = 10
        // per char: id(4) + name(2+len) + statFields(~77-97) + onFamily(1) + hasRank(1) + rank?(16) + equipCount(4) + equip(n*(1+4))
        let size = 10;
        for (const c of characters) {
            const eqCount = c.equippedJson?.items ? Object.keys(c.equippedJson.items).filter(p => Number(p) < 0).length : 0;
            const job = c.statJson?.job ?? 0;
            const isExtend = (Math.floor(job / 1000) >= 3) || (Math.floor(job / 100) === 22) || job === 2001;
            const spBytes = isExtend ? 1 + Math.min((c.statJson?.sp?.length ?? 0), 10) * 2 : 2;
            const hasRank = ranks.has(c.id);
            // per char: id(4) + nameLen(2) + name(var) + statFields(85fixed + sp) + hasRank(1) + rank?(16) + equipCount(4) + equip(n*5)
            size += 96 + c.name.length + spBytes + eqCount * 5 + (hasRank ? 16 : 0);
        }
        const packet = new PacketWriter(size);
        packet.writeShort(CenterSendOpcode.CHARACTER_LIST_ACK.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(characters.length);
        for (const c of characters) {
            packet.writeInt(c.id);
            packet.writeMapleAsciiString(c.name);
            CenterPackets.writeStatFields(packet, c.statJson);
            CenterPackets.writeRankBlock(packet, ranks.get(c.id) ?? null);
            // Equipped items — stored at positive keys by Inventory.putItem(Math.abs)
            const equippedItems = c.equippedJson?.items ?? {};
            const equippedPositions = Object.keys(equippedItems).map(Number).filter(p => p > 0 && p < 100);
            packet.writeInt(equippedPositions.length);
            for (const pos of equippedPositions) {
                const item = equippedItems[String(pos)];
                packet.writeByte(pos);
                packet.writeInt(item?.itemId ?? 0);
            }
        }
        return packet.getPacket();
    }

    static getCheckNameAck(sessionId: number, name: string, available: boolean): Buffer {
        const packet = new PacketWriter(9 + name.length);
        packet.writeShort(CenterSendOpcode.CHECK_NAME_ACK.getValue());
        packet.writeInt(sessionId);
        packet.writeMapleAsciiString(name);
        packet.writeBoolean(available);
        return packet.getPacket();
    }

    static getCreateCharacterAck(sessionId: number, cd: any | null, success: boolean): Buffer {
        let packet: PacketWriter;
        if (success && cd) {
            const cs = cd.characterStat;
            const equipped: Array<[number, number]> = [];
            for (const [pos, item] of (cd.inventoryManager?.equipped?.getItems?.() ?? new Map())) {
                if (pos > 0 && pos < 100) equipped.push([pos, item.itemId]);
            }
            const nameLen = (cs.name ?? '').length;
            const isExtend = (Math.floor((cs.job ?? 0) / 1000) >= 3) || (Math.floor((cs.job ?? 0) / 100) === 22) || (cs.job ?? 0) === 2001;
            const spBytes = isExtend ? 1 + Math.min((cs.sp?.length ?? 0), 10) * 2 : 2;
            const size = 7 + 4 + 2 + nameLen + 86 + spBytes + 4 + equipped.length * 5;
            packet = new PacketWriter(size);
            packet.writeShort(CenterSendOpcode.CREATE_CHARACTER_ACK.getValue());
            packet.writeInt(sessionId);
            packet.writeBoolean(success);
            packet.writeInt(cs.id);
            packet.writeMapleAsciiString(cs.name);
            CenterPackets.writeStatFields(packet, cs);
            CenterPackets.writeRankBlock(packet, null); // new characters are unranked
            packet.writeInt(equipped.length);
            for (const [slot, itemId] of equipped) {
                packet.writeByte(slot);
                packet.writeInt(itemId);
            }
        } else {
            packet = new PacketWriter(7);
            packet.writeShort(CenterSendOpcode.CREATE_CHARACTER_ACK.getValue());
            packet.writeInt(sessionId);
            packet.writeBoolean(success);
        }
        return packet.getPacket();
    }

    static getDeleteCharacterAck(sessionId: number, charId: number, success: boolean): Buffer {
        const packet = new PacketWriter(11);
        packet.writeShort(CenterSendOpcode.DELETE_CHARACTER_ACK.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(charId);
        packet.writeBoolean(success);
        return packet.getPacket();
    }

    static getViewAllCharAck(sessionId: number, characters: Array<{ id: number; name: string; statJson: any; equippedJson: any }>, ranks: Map<number, CharacterRank> = new Map()): Buffer {
        let size = 8;
        for (const c of characters) {
            const eqCount = c.equippedJson?.items ? Object.keys(c.equippedJson.items).filter(p => Number(p) < 0).length : 0;
            const job = c.statJson?.job ?? 0;
            const isExtend = (Math.floor(job / 1000) >= 3) || (Math.floor(job / 100) === 22) || job === 2001;
            const spBytes = isExtend ? 1 + Math.min((c.statJson?.sp?.length ?? 0), 10) * 2 : 2;
            const hasRank = ranks.has(c.id);
            size += 96 + c.name.length + spBytes + eqCount * 5 + (hasRank ? 16 : 0);
        }
        const packet = new PacketWriter(size);
        packet.writeShort(CenterSendOpcode.VIEW_ALL_CHAR_ACK.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(characters.length);
        for (const c of characters) {
            packet.writeInt(c.id);
            packet.writeMapleAsciiString(c.name);
            CenterPackets.writeStatFields(packet, c.statJson);
            CenterPackets.writeRankBlock(packet, ranks.get(c.id) ?? null);
            const equippedItems = c.equippedJson?.items ?? {};
            const equippedPositions = Object.keys(equippedItems).map(Number).filter(p => p > 0 && p < 100);
            packet.writeInt(equippedPositions.length);
            for (const pos of equippedPositions) {
                const item = equippedItems[String(pos)];
                packet.writeByte(pos);
                packet.writeInt(item?.itemId ?? 0);
            }
        }
        return packet.getPacket();
    }

    static getCashShopMigrateAck(sessionId: number, success: boolean, host: string, port: number): Buffer {
        const packet = new PacketWriter(11 + host.length);
        packet.writeShort(CenterSendOpcode.CASH_SHOP_MIGRATE_ACK.getValue());
        packet.writeInt(sessionId);
        packet.writeBoolean(success);
        if (success) {
            packet.writeMapleAsciiString(host);
            packet.writeInt(port);
        }
        return packet.getPacket();
    }

    static getMigrateResult(sessionId: number, success: boolean, host: string, port: number, charId: number = 0): Buffer {
        const packet = new PacketWriter(15 + host.length);
        packet.writeShort(CenterSendOpcode.MIGRATE_RESULT.getValue());
        packet.writeInt(sessionId);
        packet.writeBoolean(success);
        if (success) {
            packet.writeMapleAsciiString(host);
            packet.writeInt(port);
            packet.writeInt(charId);
        }
        return packet.getPacket();
    }
}
