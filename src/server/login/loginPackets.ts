import { PacketWriter } from '../../protocol/packets/packetWriter';
import { CommonSendOpcode } from '../../protocol/opcodes/common/send';
import { ServerType } from '../baseServer';
import { LoginSendOpcode } from '../../protocol/opcodes/login/send';
import { PreLoginClient } from './types/preLoginClient';
import { MapleSendOpcode } from '../../protocol/opcodes/maple/send';
import { LoginClient } from './types/loginClient';
import { Config } from '../../util/config';
import { JobConstants } from '../../world/job/JobConstants';

/** Per-character data passed from center ack handlers to the v95 encoder functions. */
export interface CharData {
    id: number; name: string;
    gender: number; skin: number; face: number; hair: number;
    petSn1: number; petSn2: number; petSn3: number;
    level: number; job: number;
    str: number; dex: number; int: number; luk: number;
    hp: number; maxHp: number; mp: number; maxMp: number;
    ap: number;
    sp: any; // ExtendSp pair array | number
    exp: number; pop: number; tempExp: number;
    posMap: number; portal: number; playTime: number; subJob: number;
    onFamily: boolean; hasRank: boolean;
    worldRank: number; worldRankMove: number; jobRank: number; jobRankMove: number;
    equipped: Array<{ pos: number; itemId: number }>;
}

export class LoginPackets {

    static getCenterHandshakeAck(): Buffer {
        const packet = new PacketWriter(3);
        packet.writeShort(CommonSendOpcode.CENTER_HANDSHAKE_ACK.getValue());
        packet.writeByte(ServerType.LOGIN);
        return packet.getPacket();
    }

    static getLoginHandshake(mapleVersion: number, ivRecv: Buffer, ivSend: Buffer): Buffer {
        const packet = new PacketWriter(16);
        packet.writeShort(14);
        packet.writeShort(mapleVersion);
        packet.writeMapleAsciiString('1');
        packet.write(ivRecv);
        packet.write(ivSend);
        packet.writeByte(8);
        console.log(packet.getPacket().toString('hex').match(/../g).join(' '));
        return packet.getPacket();
    }

    static getPreLoginRequest(preLoginClient: PreLoginClient): Buffer {
        const packet = new PacketWriter(8 + preLoginClient.username.length);
        packet.writeShort(LoginSendOpcode.PRE_LOGIN.getValue());
        packet.writeInt(preLoginClient.sessionId);
        packet.writeMapleAsciiString(preLoginClient.username);
        return packet.getPacket();
    }

    static getLoginFailed(reason: number): Buffer {
        const packet = new PacketWriter(6);
        packet.writeShort(MapleSendOpcode.CHECK_PASSWORD_RESULT.getValue());
        packet.writeByte(reason);  // result != 0 = failure
        packet.writeByte(0);       // unknown
        packet.writeInt(0);        // unknown
        return packet.getPacket();
    }

    static getAutoRegister(sessionId: number, username: string, hashedPassword: string): Buffer {
        const packet = new PacketWriter(10 + username.length + hashedPassword.length);
        packet.writeShort(LoginSendOpcode.AUTO_REGISTER.getValue());
        packet.writeInt(sessionId);
        packet.writeMapleAsciiString(username);
        packet.writeMapleAsciiString(hashedPassword);
        return packet.getPacket();
    }

    static getAuthSuccess(loginClient: LoginClient): Buffer {
        const packet = new PacketWriter(51);
        packet.writeShort(MapleSendOpcode.CHECK_PASSWORD_RESULT.getValue());
        packet.writeByte(0);  // result = Success
        packet.writeByte(0);
        packet.writeInt(0);
        packet.writeInt(loginClient.id);  // dwAccountId
        packet.writeByte(0);              // nGender
        packet.writeByte(0);              // nGradeCode
        packet.writeShort(0);             // nSubGradeCode (2 bytes)
        packet.writeByte(0);              // nCountryID
        packet.writeMapleAsciiString(''); // sNexonClubID (empty)
        packet.writeByte(0);              // nPurchaseExp
        packet.writeByte(0);              // nChatBlockReason
        packet.writeLong(BigInt(0));      // dtChatUnblockDate
        packet.writeLong(BigInt(0));      // dtRegisterDate
        packet.writeInt(3); // nNumOfCharacter (default 3 slots)
        packet.writeByte(Config.instance.game.enablePin ? 0 : 1); // skipPinCode
        packet.writeByte(Config.instance.game.enablePic ? ((loginClient.pic === null || loginClient.pic === undefined || loginClient.pic === '') ? 0 : 1) : 2); // bLoginOpt
        packet.write(Buffer.alloc(8, 0)); // clientKey (8 bytes)
        return packet.getPacket();
    }

    static addLogin(accountId: number): Buffer {
        const packet = new PacketWriter(6);
        packet.writeShort(LoginSendOpcode.ADD_LOGIN.getValue());
        packet.writeInt(accountId);
        return packet.getPacket();
    }

    static getWorldInformation(): Buffer {
        const worldName = 'Scania';
        const channelName = 'Scania-1';
        const packet = new PacketWriter(32 + worldName.length + channelName.length);
        packet.writeShort(MapleSendOpcode.WORLD_INFORMATION.getValue());
        packet.writeByte(0);
        packet.writeMapleAsciiString(worldName);
        packet.writeByte(0);
        packet.writeMapleAsciiString('');
        packet.writeShort(100);
        packet.writeShort(100);
        packet.writeByte(0);
        packet.writeByte(1);
        packet.writeMapleAsciiString(channelName);
        packet.writeInt(200);
        packet.writeByte(0);
        packet.writeByte(0);
        packet.writeByte(0);
        packet.writeShort(0);
        return packet.getPacket();
    }

    static getEndOfWorldList(): Buffer {
        const packet = new PacketWriter(3);
        packet.writeShort(MapleSendOpcode.WORLD_INFORMATION.getValue());
        packet.writeByte(-1);
        return packet.getPacket();
    }

    // ---- Login flow: client packet builders (forwarded to CenterServer) ----

    static getCharacterListRequest(sessionId: number, accountId: number): Buffer {
        const packet = new PacketWriter(10);
        packet.writeShort(LoginSendOpcode.CHARACTER_LIST_REQUEST.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(accountId);
        return packet.getPacket();
    }

    static getCheckNameRequest(sessionId: number, name: string): Buffer {
        const packet = new PacketWriter(8 + name.length);
        packet.writeShort(LoginSendOpcode.CHECK_NAME_REQUEST.getValue());
        packet.writeInt(sessionId);
        packet.writeMapleAsciiString(name);
        return packet.getPacket();
    }

    static getCreateCharacterRequest(sessionId: number, accountId: number, charId: number, name: string, jobType: number, face: number, hair: number, hairColor: number, skin: number, top: number, bottom: number, shoes: number, weapon: number, gender: number): Buffer {
        const packet = new PacketWriter(48 + name.length);
        packet.writeShort(LoginSendOpcode.CREATE_CHARACTER_REQUEST.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(accountId);
        packet.writeInt(charId);
        packet.writeMapleAsciiString(name);
        packet.writeInt(jobType);
        packet.writeInt(face);
        packet.writeInt(hair);
        packet.writeInt(hairColor);
        packet.writeInt(skin);
        packet.writeInt(top);
        packet.writeInt(bottom);
        packet.writeInt(shoes);
        packet.writeInt(weapon);
        packet.writeByte(gender);
        return packet.getPacket();
    }

    static getDeleteCharacterRequest(sessionId: number, charId: number): Buffer {
        const packet = new PacketWriter(10);
        packet.writeShort(LoginSendOpcode.DELETE_CHARACTER_REQUEST.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(charId);
        return packet.getPacket();
    }

    static getViewAllCharRequest(sessionId: number, accountId: number): Buffer {
        const packet = new PacketWriter(10);
        packet.writeShort(LoginSendOpcode.VIEW_ALL_CHAR_REQUEST.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(accountId);
        return packet.getPacket();
    }

    static getMigrateToChannel(sessionId: number, charId: number): Buffer {
        const packet = new PacketWriter(10);
        packet.writeShort(LoginSendOpcode.MIGRATE_TO_CHANNEL.getValue());
        packet.writeInt(sessionId);
        packet.writeInt(charId);
        return packet.getPacket();
    }

    // ================ v95 AvatarCodec helpers ================

    /** Write a full v95 CharacterStat block (mirrors AvatarCodec.DecodeCharacterStat). */
    private static writeCharacterStat(packet: PacketWriter, c: CharData): void {
        packet.writeInt(c.id);
        packet.writeFixedString(c.name, 13);
        packet.writeByte(c.gender);
        packet.writeByte(c.skin);
        packet.writeInt(c.face);
        packet.writeInt(c.hair);
        packet.writeLong(BigInt(c.petSn1));
        packet.writeLong(BigInt(c.petSn2));
        packet.writeLong(BigInt(c.petSn3));
        packet.writeByte(c.level);
        packet.writeShort(c.job);
        packet.writeShort(c.str);
        packet.writeShort(c.dex);
        packet.writeShort(c.int);
        packet.writeShort(c.luk);
        packet.writeInt(c.hp);
        packet.writeInt(c.maxHp);
        packet.writeInt(c.mp);
        packet.writeInt(c.maxMp);
        packet.writeShort(c.ap);
        // SP (variable)
        if (JobConstants.isExtendSpJob(c.job)) {
            const pairs: Array<[number, number]> = Array.isArray(c.sp) ? c.sp : [];
            packet.writeByte(pairs.length);
            for (const [jl, spVal] of pairs) {
                packet.writeByte(jl);
                packet.writeByte(spVal);
            }
        } else {
            const spVal = typeof c.sp === 'number' ? c.sp : 0;
            packet.writeShort(spVal);
        }
        packet.writeInt(c.exp);
        packet.writeShort(c.pop);
        packet.writeInt(c.tempExp);
        packet.writeInt(c.posMap);
        packet.writeByte(c.portal);
        packet.writeInt(c.playTime);
        packet.writeShort(c.subJob);
    }

    /** Write a full v95 AvatarLook block (mirrors AvatarCodec.DecodeAvatarLook). */
    private static writeAvatarLook(packet: PacketWriter, c: CharData): void {
        packet.writeByte(c.gender);
        packet.writeByte(c.skin);
        packet.writeInt(c.face);
        packet.writeByte(0); // job byte placeholder
        packet.writeInt(c.hair);
        // HairEquip entries (terminated by 0xFF)
        for (const eq of c.equipped) {
            packet.writeUByte(eq.pos);
            packet.writeInt(eq.itemId);
        }
        packet.writeUByte(0xFF);
        // UnseenEquip (empty for character select)
        packet.writeUByte(0xFF);
        // Weapon sticker + pets
        packet.writeInt(0); // weaponStickerId
        packet.writeInt(0); // petId[0]
        packet.writeInt(0); // petId[1]
        packet.writeInt(0); // petId[2]
    }

    // ---- Login flow: client response builders ----

    static getSelectWorldResult(loginOpt: number, characters: CharData[]): Buffer {
        // byte result(0=success) + int count + per-char(CharacterStat + AvatarLook + onFamily + rank) + byte loginOpt + int slotCount + int buyCharCount
        let size = 7;
        for (const c of characters) {
            const isExtend = JobConstants.isExtendSpJob(c.job);
            const spBytes = isExtend ? 1 + (Array.isArray(c.sp) ? c.sp.length : 0) * 2 : 2;
            size += 101 + spBytes; // CharacterStat
            size += 29 + c.equipped.length * 5; // AvatarLook
            size += 2; // onFamily(1) + hasRank(1)
            if (c.hasRank) size += 16; // 4 ints
        }
        size += 9; // loginOpt(1) + slotCount(4) + buyCharCount(4)
        const packet = new PacketWriter(size);
        packet.writeShort(MapleSendOpcode.SELECT_WORLD_RESULT.getValue());
        packet.writeByte(0); // result (0 = success)
        packet.writeInt(characters.length);
        for (const c of characters) {
            LoginPackets.writeCharacterStat(packet, c);
            LoginPackets.writeAvatarLook(packet, c);
            packet.writeByte(c.onFamily ? 1 : 0);
            packet.writeByte(c.hasRank ? 1 : 0);
            if (c.hasRank) {
                packet.writeInt(c.worldRank);
                packet.writeInt(c.worldRankMove);
                packet.writeInt(c.jobRank);
                packet.writeInt(c.jobRankMove);
            }
        }
        packet.writeByte(loginOpt);
        packet.writeInt(3); // slotCount (default 3)
        packet.writeInt(0); // buyCharCount
        return packet.getPacket();
    }

    static getViewAllCharResult(picStatus: number, characters: CharData[]): Buffer {
        // CLogin::OnViewAllCharResult (decompile/5DE120.c) subType 0 decode:
        //   byte subType(0) + byte worldId + byte count + per-char(
        //   CharacterStat + AvatarLook + byte hasRank + 16-byte rank?) +
        //   byte loginOpt (only on the last batch).
        let size = 3;
        for (const c of characters) {
            const isExtend = JobConstants.isExtendSpJob(c.job);
            const spBytes = isExtend ? 1 + (Array.isArray(c.sp) ? c.sp.length : 0) * 2 : 2;
            size += 101 + spBytes;
            size += 29 + c.equipped.length * 5;
            size += 1; // hasRank flag
            if (c.hasRank) size += 16;
        }
        size += 1; // trailing loginOpt byte
        const packet = new PacketWriter(size);
        packet.writeShort(MapleSendOpcode.VIEW_ALL_CHAR_RESULT.getValue());
        packet.writeByte(0); // subType — character batch
        packet.writeByte(0); // world ID
        packet.writeByte(characters.length);
        for (const c of characters) {
            LoginPackets.writeCharacterStat(packet, c);
            LoginPackets.writeAvatarLook(packet, c);
            packet.writeByte(c.hasRank ? 1 : 0);
            if (c.hasRank) {
                packet.writeInt(c.worldRank);
                packet.writeInt(c.worldRankMove);
                packet.writeInt(c.jobRank);
                packet.writeInt(c.jobRankMove);
            }
        }
        packet.writeByte(picStatus);
        return packet.getPacket();
    }

    static getEnableSPWResult(flag: number, code: number): Buffer {
        const packet = new PacketWriter(4);
        packet.writeShort(MapleSendOpcode.ENABLE_SPW_RESULT.getValue());
        packet.writeByte(flag);
        packet.writeByte(code);
        return packet.getPacket();
    }

    static getCheckPinCodeResult(ok: boolean): Buffer {
        const packet = new PacketWriter(5);
        packet.writeShort(MapleSendOpcode.CHECK_PIN_CODE_RESULT.getValue());
        packet.writeByte(ok ? 0 : 1);
        return packet.getPacket();
    }

    static getCheckDuplicatedIdResult(name: string, available: boolean): Buffer {
        const packet = new PacketWriter(7 + name.length);
        packet.writeShort(MapleSendOpcode.CHECK_DUPLICATED_ID_RESULT.getValue());
        packet.writeMapleAsciiString(name);
        packet.writeByte(available ? 0 : 1);  // 0=available, 1=taken
        return packet.getPacket();
    }

    static getCreateNewCharacterResult(charData: CharData | null, failCode: number = 0): Buffer {
        if (charData) {
            const isExtend = JobConstants.isExtendSpJob(charData.job);
            const spBytes = isExtend ? 1 + (Array.isArray(charData.sp) ? charData.sp.length : 0) * 2 : 2;
            const size = 3 + 101 + spBytes + 29 + charData.equipped.length * 5;
            const packet = new PacketWriter(size);
            packet.writeShort(MapleSendOpcode.CREATE_NEW_CHARACTER_RESULT.getValue());
            packet.writeByte(0); // success
            LoginPackets.writeCharacterStat(packet, charData);
            LoginPackets.writeAvatarLook(packet, charData);
            return packet.getPacket();
        } else {
            // Failure: opcode(2) + failCode(1)
            const packet = new PacketWriter(3);
            packet.writeShort(MapleSendOpcode.CREATE_NEW_CHARACTER_RESULT.getValue());
            packet.writeByte(failCode);
            return packet.getPacket();
        }
    }

    static getDeleteCharacterResult(charId: number, success: boolean): Buffer {
        const packet = new PacketWriter(10);
        packet.writeShort(MapleSendOpcode.DELETE_CHARACTER_RESULT.getValue());
        packet.writeInt(charId);
        packet.writeBoolean(success);
        return packet.getPacket();
    }

    // SelectCharacterResult (opcode 12): byte result=0, byte subCode=0,
    // bytes[4] host, ushort port, int charId, byte authenCode=0, int premiumArg=0
    private static _writeMigrateSuccess(packet: any, host: string, port: number, charId: number): void {
        packet.writeByte(0);  // result = success
        packet.writeByte(0);  // subCode
        const hostParts = host.split('.').map(Number);
        packet.writeByte(hostParts[0] || 127);
        packet.writeByte(hostParts[1] || 0);
        packet.writeByte(hostParts[2] || 0);
        packet.writeByte(hostParts[3] || 1);
        packet.writeShort(port);
        packet.writeInt(charId);
        packet.writeByte(0);  // authenCode
        packet.writeInt(0);   // premiumArg
    }

    static getSelectCharacterResult(host: string, port: number, charId: number): Buffer {
        const packet = new PacketWriter(19);
        packet.writeShort(MapleSendOpcode.SELECT_CHARACTER_RESULT.getValue());
        LoginPackets._writeMigrateSuccess(packet, host, port, charId);
        return packet.getPacket();
    }

    static getCheckSPWResultFailed(code: number = 1): Buffer {
        const packet = new PacketWriter(3);
        packet.writeShort(MapleSendOpcode.CHECK_SPW_RESULT.getValue());
        packet.writeByte(code);
        return packet.getPacket();
    }

    static getCheckSPWResult(host: string, port: number, charId: number): Buffer {
        const packet = new PacketWriter(19);
        packet.writeShort(MapleSendOpcode.CHECK_SPW_RESULT.getValue());
        LoginPackets._writeMigrateSuccess(packet, host, port, charId);
        return packet.getPacket();
    }
}
