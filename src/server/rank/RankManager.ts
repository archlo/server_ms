import { CharacterRank } from './CharacterRank';
import { CharacterDB } from '../channel/db/CharacterDB';
import { JobConstants } from '../../world/job/JobConstants';
import { CenterServer } from '../center/centerServer';

/**
 * Manages the in-memory character ranking cache for the login flow.
 *
 * Mirrors kinoko's `kinoko.server.rank.RankManager`:
 *   - On startup, loads the original (baseline) character ranks from the DB.
 *   - Every 10 minutes, refreshes the current ranks and computes the
 *     world/job rank gap (delta) against the original baseline.
 *   - At the top of each hour (nearest hour == 0, nearest minute == 0),
 *     the original baseline is re-snapshotted so the gap resets daily-ish.
 *
 * Rankings are computed from cumulative EXP (sum of all level thresholds up
 * to the character's level, plus current EXP) with `max_level_time` as the
 * tiebreaker. Characters are ranked overall (worldRank) and per job category
 * (jobRank). Admin/manager jobs are excluded.
 */
export class RankManager {
    private static originalCharacterRanks: Map<number, CharacterRank> = new Map();
    private static currentCharacterRanks: Map<number, CharacterRank> = new Map();
    private static refreshTimer: NodeJS.Timeout | null = null;

    /** Load initial ranks and start the periodic refresh (every 10 minutes). */
    static async initialize(): Promise<void> {
        try {
            this.originalCharacterRanks = await CharacterDB.getCharacterRanks();
            this.currentCharacterRanks = this.originalCharacterRanks;
        } catch (err: any) {
            CenterServer.instance?.logger?.error(
                `RankManager.initialize failed: ${err?.message ?? err}`,
            );
            this.originalCharacterRanks = new Map();
            this.currentCharacterRanks = this.originalCharacterRanks;
        }
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.refreshTimer = setInterval(() => {
            Promise.resolve(this.refresh()).catch((err: any) => {
                CenterServer.instance?.logger?.error(
                    `RankManager.refresh failed: ${err?.message ?? err}`,
                );
            });
        }, 10 * 60 * 1000);
    }

    /** Stop the periodic refresh timer. */
    static shutdown(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /** Reload ranks from DB and update gaps (or reset the baseline at top of hour). */
    static async refresh(): Promise<void> {
        if (this.getNearestHour() === 0 && this.getNearestMinute() === 0) {
            // Top of the hour — re-snapshot the original baseline.
            this.originalCharacterRanks = await CharacterDB.getCharacterRanks();
            this.currentCharacterRanks = this.originalCharacterRanks;
            return;
        }
        const newRanks = await CharacterDB.getCharacterRanks();
        for (const [characterId, newRank] of newRanks) {
            const oldRank = this.originalCharacterRanks.get(characterId);
            if (oldRank) {
                newRank.worldRankGap = oldRank.worldRank - newRank.worldRank;
                newRank.jobRankGap = oldRank.jobRank - newRank.jobRank;
            }
        }
        this.currentCharacterRanks = newRanks;
    }

    /**
     * Returns the current rank for a character, or `null` if the character
     * is unranked (admin/manager jobs or not present in the ranking cache).
     */
    static getCharacterRank(characterId: number, job: number): CharacterRank | null {
        if (JobConstants.isAdminJob(job) || JobConstants.isManagerJob(job)) {
            return null;
        }
        return this.currentCharacterRanks.get(characterId) ?? null;
    }

    /** Current size of the ranking cache (number of ranked characters). */
    static get rankedCount(): number {
        return this.currentCharacterRanks.size;
    }

    private static getNearestHour(): number {
        const minutes = Math.floor(Date.now() / 60000) % (60 * 24);
        return Math.round(minutes / 60) % 24;
    }

    private static getNearestMinute(): number {
        const seconds = Math.floor(Date.now() / 1000) % 3600;
        return Math.round(seconds / 60) % 60;
    }
}
