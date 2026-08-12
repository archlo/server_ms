import { Database } from '../../center/db/database';
import { ChannelServer } from '../channelServer';
import { Memo, MemoType, memoTypeByValue } from '../../../world/memo/Memo';

/**
 * Port of kinoko's MemoAccessor (database.sqlite.SqliteMemoAccessor /
 * cassandra.CassandraMemoAccessor), backed by knex/MySQL.
 *
 * Table schema (created in Database.initialize):
 *   memos(memo_id INT PK, receiver_id INT, memo_type TINYINT,
 *         memo_content TEXT, sender_name VARCHAR(13), date_sent DATETIME)
 */
export const MemoDB = {
  async getMemosByCharacterId(characterId: number): Promise<Memo[]> {
    try {
      const rows = await Database.knex('memos')
        .where({ receiver_id: characterId })
        .select('memo_id', 'receiver_id', 'memo_type', 'memo_content', 'sender_name', 'date_sent')
        .orderBy('memo_id', 'asc');
      const memos: Memo[] = [];
      for (const r of rows) {
        const memoType = memoTypeByValue(Number(r.memo_type)) ?? MemoType.DEFAULT;
        const dateSent = r.date_sent ? new Date(r.date_sent) : new Date(0);
        memos.push(new Memo(
          memoType,
          Number(r.memo_id),
          String(r.sender_name ?? ''),
          String(r.memo_content ?? ''),
          dateSent,
        ));
      }
      return memos;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`MemoDB.getMemosByCharacterId(${characterId}): ${err.message}`);
      return [];
    }
  },

  async hasMemo(characterId: number): Promise<boolean> {
    try {
      const rows = await Database.knex('memos')
        .where({ receiver_id: characterId })
        .select('memo_id')
        .limit(1);
      return rows.length > 0;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`MemoDB.hasMemo(${characterId}): ${err.message}`);
      return false;
    }
  },

  async newMemo(memo: Memo, receiverId: number): Promise<boolean> {
    try {
      await Database.knex('memos').insert({
        memo_id: memo.memoId,
        receiver_id: receiverId,
        memo_type: memo.type,
        memo_content: memo.content,
        sender_name: memo.sender,
        date_sent: memo.dateSent,
      });
      return true;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`MemoDB.newMemo(${memo.memoId}): ${err.message}`);
      return false;
    }
  },

  async deleteMemo(memoId: number, receiverId: number): Promise<boolean> {
    try {
      const deleted = await Database.knex('memos')
        .where({ memo_id: memoId, receiver_id: receiverId })
        .delete();
      return deleted > 0;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`MemoDB.deleteMemo(${memoId}): ${err.message}`);
      return false;
    }
  },

  /**
   * Port of kinoko's IdAccessor::nextMemoId. Allocates a new unique memo id
   * using the `memo_id_seq` counter row in the `memo_ids` table (auto-created).
   */
  async nextMemoId(): Promise<number | null> {
    try {
      // Upsert a single counter row and increment atomically.
      const trx = await Database.knex.transaction();
      try {
        const rows = await trx('memo_ids').where({ id: 1 }).select('next_id').forUpdate();
        if (rows.length === 0) {
          const nextId = 1;
          await trx('memo_ids').insert({ id: 1, next_id: nextId + 1 });
          await trx.commit();
          return nextId;
        }
        const nextId = Number(rows[0].next_id);
        await trx('memo_ids').where({ id: 1 }).update({ next_id: nextId + 1 });
        await trx.commit();
        return nextId;
      } catch (err: any) {
        await trx.rollback();
        throw err;
      }
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`MemoDB.nextMemoId: ${err.message}`);
      return null;
    }
  },
};
