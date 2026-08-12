import { PacketWriter } from '../../protocol/packets/packetWriter';

/**
 * CLogin::RANK (16 bytes) — per-character ranking block sent during the
 * character select / view-all-character flows. Mirrors kinoko's
 * `kinoko.server.rank.CharacterRank`.
 */
export class CharacterRank {
    readonly characterId: number;
    readonly worldRank: number;
    readonly jobRank: number;

    worldRankGap = 0;
    jobRankGap = 0;

    constructor(characterId: number, worldRank: number, jobRank: number) {
        this.characterId = characterId;
        this.worldRank = worldRank;
        this.jobRank = jobRank;
    }

    /** CLogin::RANK — 4 little-endian int32s (16 bytes). */
    encode(outPacket: PacketWriter): void {
        outPacket.writeInt(this.worldRank);     // nWorldRank
        outPacket.writeInt(this.worldRankGap);  // nWorldRankGap
        outPacket.writeInt(this.jobRank);       // nJobRank
        outPacket.writeInt(this.jobRankGap);    // nJobRankGap
    }
}
