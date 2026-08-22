import { CenterServer } from "../centerServer";
import { Database } from "./database";
import { Account } from '../../../world/user/Account';
import { Trunk } from '../../../world/item/Trunk';
import { CashShopProvider, CashShopItem } from '../../../provider/CashShopProvider';

export class AccountDB {
    static async getPreLoginInfo(username: string) {
        try {
            let records = await Database.knex('accounts')
                .where({name: username})
                .select('id', 'password', 'gender', 'banned', 'pic', 'pin', 'character_slots', 'tos', 'language', 'temp_ban');
            if (records.length > 0) return records[0];
        } catch (err) {
            CenterServer.instance.logger.error(err.message);
        }
        return undefined;
    }

    static async insertAutoRegisterAccount(username: string, hashedPassword: string) {
        try {
            let results = await Database.knex('accounts')
                .insert({name: username, password: hashedPassword});
            if (results.length > 0) {
                let preLoginInfo = await this.getPreLoginInfo(username);
                if (preLoginInfo !== undefined) return preLoginInfo;
                else CenterServer.instance.logger.error(`Could not return preLoginInfo after creating autoregister account for ${username}`);
            }
        } catch (err) {
            CenterServer.instance.logger.error(err.message);
        }
        return undefined;
    }

    static async loadAccount(accountId: number): Promise<Account | null> {
        try {
            const row = await Database.knex('accounts')
                .where({id: accountId})
                .select('id', 'name', 'nx_credit', 'maple_points', 'nx_prepaid', 'web_admin')
                .first();
            if (!row) return null;

            const account = new Account(row.id, row.name);
            account.nxCredit = row.nx_credit ?? 0;
            account.maplePoint = row.maple_points ?? 0;
            account.nxPrepaid = row.nx_prepaid ?? 0;
            account.gm = (row.web_admin ?? 0) !== 0;

            // Load storage data
            const storageRow = await Database.knex('storages')
                .where({account_id: accountId})
                .select('slots', 'meso')
                .first();
            if (storageRow) {
                account.trunk = new Trunk(storageRow.slots);
                account.trunk.setMoney(storageRow.meso);
            } else {
                account.trunk = new Trunk(48);
            }

            return account;
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.loadAccount(${accountId}): ${err.message}`);
            return null;
        }
    }

    static async updatePic(accountId: number, pic: string): Promise<void> {
        try {
            await Database.knex('accounts').where({ id: accountId }).update({ pic });
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.updatePic(${accountId}): ${err.message}`);
        }
    }

    static async updateAccountCash(accountId: number, nxCredit: number, maplePoint: number, nxPrepaid: number): Promise<void> {
        try {
            await Database.knex('accounts')
                .where({id: accountId})
                .update({nx_credit: nxCredit, maple_points: maplePoint, nx_prepaid: nxPrepaid});
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.updateAccountCash(${accountId}): ${err.message}`);
        }
    }

    static async addCashItem(accountId: number, characterId: number, item: CashShopItem): Promise<void> {
        try {
            await Database.knex('cash_items').insert({
                account_id: accountId,
                character_id: characterId,
                sn: item.sn,
                item_id: item.itemId,
                quantity: item.count,
                expire_date: item.period > 0
                    ? new Date(Date.now() + item.period * 86400000).toISOString().slice(0, 19).replace('T', ' ')
                    : null,
            });
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.addCashItem(${accountId}): ${err.message}`);
        }
    }

    /** CCashShop purchase record lookup (GetCashPurchaseRecord @0x482450):
     *  true when the account has ever bought the cash item with this SN. */
    static async hasCashItemRecord(accountId: number, sn: number): Promise<boolean> {
        try {
            const rows = await Database.knex('cash_items')
                .where({ account_id: accountId, sn })
                .select('id')
                .limit(1);
            return rows.length > 0;
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.hasCashItemRecord(${accountId}, ${sn}): ${err.message}`);
            return false;
        }
    }

    static async findCharacterIdByName(name: string): Promise<number | null> {
        try {
            const rows = await Database.knex('characters')
                .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
                .select('id')
                .limit(1);
            return rows.length > 0 ? rows[0].id : null;
        } catch {
            return null;
        }
    }

    static async banAccount(accountId: number, reason: string): Promise<void> {
        try {
            await Database.knex('accounts')
                .where({ id: accountId })
                .update({ banned: 1, ban_reason: reason ?? null });
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.banAccount(${accountId}): ${err.message}`);
        }
    }

    static async unbanAccount(accountId: number): Promise<void> {
        try {
            await Database.knex('accounts')
                .where({ id: accountId })
                .update({ banned: 0, ban_reason: null });
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.unbanAccount(${accountId}): ${err.message}`);
        }
    }

    static async setGm(accountId: number, gm: boolean): Promise<void> {
        try {
            await Database.knex('accounts')
                .where({ id: accountId })
                .update({ web_admin: gm ? 1 : 0 });
        } catch (err) {
            CenterServer.instance.logger.error(`AccountDB.setGm(${accountId}): ${err.message}`);
        }
    }

    static async findAccountIdByName(name: string): Promise<number | null> {
        try {
            const rows = await Database.knex('accounts')
                .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
                .select('id')
                .limit(1);
            return rows.length > 0 ? rows[0].id : null;
        } catch {
            return null;
        }
    }
}
