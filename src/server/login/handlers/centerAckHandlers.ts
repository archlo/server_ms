import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { Session } from "../../session";
import { LoginServer } from "../loginServer";
import { LoginPackets, CharData } from "../loginPackets";
import { JobConstants } from "../../../world/job/JobConstants";
import { Config } from "../../../util/config";

export class CharacterListAckHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        if (packet.remaining() < 8) {
            LoginServer.instance.logger.warn(`CharacterListAck: packet too small (${packet.remaining()} bytes)`);
            return;
        }
        const sessionId = packet.readInt();
        const count = packet.readInt();

        const characters: CharData[] = [];

        for (let i = 0; i < count; i++) {
            const charData = readCharData(packet);
            if (!charData) break;
            characters.push(charData);
        }

        const loginClient = LoginServer.instance.loginStore.get(sessionId);
        // Honor game.enablePic (mirror loginPackets.ts:93 bLoginOpt). When PIC is
        // disabled, loginOpt must be 2 so the client selects a character directly
        // instead of entering the register-PIC flow (loginOpt 0) that never
        // completes to in-game. Only compute 0/1 from the stored PIC when enabled.
        let loginOpt = 2;
        if (Config.instance.game.enablePic && loginClient) {
            loginOpt = loginClient.pic ? 1 : 0;
        }

        const encSession = LoginServer.instance.sessionStore.get(sessionId);
        if (!encSession) return;

        await encSession.write(LoginPackets.getSelectWorldResult(loginOpt, characters));
    }
}

/** Read one character's full data block from the center→login protocol (written by CenterPackets.writeStatFields). */
export function readCharData(packet: PacketReader): CharData | null {
    const minHeader = 19;
    if (packet.remaining() < minHeader) return null;
    try {
        const id = packet.readInt();
        const name = packet.readMapleAsciiString();
        const gender = packet.readByte();
        const skin = packet.readByte();
        const face = packet.readInt();
        const hair = packet.readInt();
        const petSn1 = packet.readLong();
        const petSn2 = packet.readLong();
        const petSn3 = packet.readLong();
        const level = packet.readByte();
        const job = packet.readShort();
        const str = packet.readShort();
        const dex = packet.readShort();
        const int = packet.readShort();
        const luk = packet.readShort();
        const hp = packet.readInt();
        const maxHp = packet.readInt();
        const mp = packet.readInt();
        const maxMp = packet.readInt();
        const ap = packet.readShort();
        // SP (variable)
        let sp: any;
        if (JobConstants.isExtendSpJob(job)) {
            const spCount = packet.readByte();
            const pairs: Array<[number, number]> = [];
            for (let k = 0; k < spCount; k++) {
                pairs.push([packet.readByte(), packet.readByte()]);
            }
            sp = pairs;
        } else {
            sp = packet.readShort();
        }
        const exp = packet.readInt();
        const pop = packet.readShort();
        const tempExp = packet.readInt();
        const posMap = packet.readInt();
        const portal = packet.readByte();
        const playTime = packet.readInt();
        const subJob = packet.readShort();
        const onFamily = packet.readByte() !== 0;
        const hasRank = packet.readByte() !== 0;
        let worldRank = 0, worldRankMove = 0, jobRank = 0, jobRankMove = 0;
        if (hasRank) {
            if (packet.remaining() < 16) return null;
            worldRank = packet.readInt();
            worldRankMove = packet.readInt();
            jobRank = packet.readInt();
            jobRankMove = packet.readInt();
        }
        if (packet.remaining() < 4) return null;
        const equipCount = packet.readInt();
        const equipped: Array<{ pos: number; itemId: number }> = [];
        for (let j = 0; j < equipCount; j++) {
            if (packet.remaining() < 5) break;
            const pos = packet.readByte();
            const itemId = packet.readInt();
            equipped.push({ pos, itemId });
        }
        return {
            id, name,
            gender, skin, face, hair,
            petSn1: Number(petSn1), petSn2: Number(petSn2), petSn3: Number(petSn3),
            level, job, str, dex, int, luk,
            hp, maxHp, mp, maxMp, ap, sp,
            exp, pop, tempExp, posMap, portal, playTime, subJob,
            onFamily, hasRank, worldRank, worldRankMove, jobRank, jobRankMove,
            equipped,
        };
    } catch {
        return null;
    }
}

export class CheckNameAckHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const name = packet.readMapleAsciiString();
        const available = packet.readBoolean();

        const encSession = LoginServer.instance.sessionStore.get(sessionId);
        if (!encSession) return;

        await encSession.write(LoginPackets.getCheckDuplicatedIdResult(name, available));
    }
}

export class CreateCharacterAckHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const success = packet.readBoolean();

        let charData: CharData | null = null;

        if (success) {
            charData = readCharData(packet);
            if (!charData) {
                LoginServer.instance.logger.warn(`CreateCharacterAck: success but readCharData failed`);
                return;
            }
        }

        const encSession = LoginServer.instance.sessionStore.get(sessionId);
        if (!encSession) return;

        await encSession.write(LoginPackets.getCreateNewCharacterResult(charData, success ? 0 : 1));
    }
}

export class DeleteCharacterAckHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const charId = packet.readInt();
        const success = packet.readBoolean();

        const encSession = LoginServer.instance.sessionStore.get(sessionId);
        if (!encSession) return;

        await encSession.write(LoginPackets.getDeleteCharacterResult(charId, success));
    }
}

export class ViewAllCharAckHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        if (packet.remaining() < 8) {
            LoginServer.instance.logger.warn(`ViewAllCharAck: packet too small`);
            return;
        }
        const sessionId = packet.readInt();
        const count = packet.readInt();

        const characters: CharData[] = [];

        for (let i = 0; i < count; i++) {
            const charData = readCharData(packet);
            if (!charData) break;
            characters.push(charData);
        }

        const loginClient = LoginServer.instance.loginStore.get(sessionId);
        let picStatus = 2;
        if (loginClient) {
            picStatus = loginClient.pic ? 1 : 0;
        }

        const encSession = LoginServer.instance.sessionStore.get(sessionId);
        if (!encSession) return;

        await encSession.write(LoginPackets.getViewAllCharResult(picStatus, characters));
    }
}

export class MigrateResultHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {
        const sessionId = packet.readInt();
        const success = packet.readBoolean();

        const encSession = LoginServer.instance.sessionStore.get(sessionId);
        if (!encSession) return;

        if (success) {
            const host = packet.readMapleAsciiString();
            const port = packet.readInt();
            const charId = packet.readInt();
            const isSpw = LoginServer.instance.spwPendingStore.delete(sessionId);
            await encSession.write(isSpw
                ? LoginPackets.getCheckSPWResult(host, port, charId)
                : LoginPackets.getSelectCharacterResult(host, port, charId));
        } else {
            LoginServer.instance.spwPendingStore.delete(sessionId);
            await encSession.write(LoginPackets.getLoginFailed(7));
        }
    }
}
