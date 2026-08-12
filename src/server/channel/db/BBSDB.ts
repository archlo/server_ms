import { Database } from '../../center/db/database';
import { ChannelServer } from '../channelServer';
import { BBSThread, BBSReply } from '../../../world/guild/bbs/BBSThread';

let _nextThreadIdCounter = 1;
const _nextReplyIdCounters = new Map<number, number>();

export const BBSDB = {
  async loadThreads(guildId: number): Promise<BBSThread[]> {
    if (!Database.knex) return [];
    try {
      const threadRows = await Database.knex('bbs_threads')
        .where({ guild_id: guildId })
        .select('thread_id', 'guild_id', 'poster_char_id', 'poster_name', 'name', 'timestamp', 'icon', 'start_post')
        .orderBy('thread_id', 'asc');

      const threads: BBSThread[] = [];
      for (const t of threadRows) {
        const replyRows = await Database.knex('bbs_replies')
          .where({ thread_id: t.thread_id })
          .select('reply_id', 'thread_id', 'poster_char_id', 'poster_name', 'timestamp', 'content')
          .orderBy('reply_id', 'asc');

        const replies: BBSReply[] = replyRows.map((r: any) => ({
          replyId: Number(r.reply_id),
          threadId: Number(r.thread_id),
          posterCharacterId: Number(r.poster_char_id),
          posterName: String(r.poster_name),
          timestamp: BigInt(r.timestamp),
          content: String(r.content),
        }));

        const ts = typeof t.timestamp === 'bigint' ? t.timestamp : BigInt(t.timestamp);
        threads.push(new BBSThread(
          Number(t.thread_id),
          0,
          Number(t.poster_char_id),
          String(t.poster_name),
          String(t.name),
          ts,
          Number(t.icon),
          String(t.start_post),
          Number(t.guild_id),
          replies,
        ));
      }

      return threads;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`BBSDB.loadThreads(${guildId}): ${err.message}`);
      return [];
    }
  },

  async saveThread(thread: BBSThread): Promise<void> {
    if (!Database.knex) return;
    try {
      await Database.knex('bbs_threads').insert({
        thread_id: thread.threadId,
        guild_id: thread.guildId,
        poster_char_id: thread.posterCharacterId,
        poster_name: thread.posterName,
        name: thread.name,
        timestamp: thread.timestamp.toString(),
        icon: thread.icon,
        start_post: thread.startPost,
      });
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`BBSDB.saveThread(${thread.threadId}): ${err.message}`);
    }
  },

  async deleteThread(threadId: number): Promise<void> {
    if (!Database.knex) return;
    try {
      await Database.knex('bbs_replies').where({ thread_id: threadId }).delete();
      await Database.knex('bbs_threads').where({ thread_id: threadId }).delete();
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`BBSDB.deleteThread(${threadId}): ${err.message}`);
    }
  },

  async saveReply(reply: BBSReply): Promise<void> {
    if (!Database.knex) return;
    try {
      await Database.knex('bbs_replies').insert({
        reply_id: reply.replyId,
        thread_id: reply.threadId,
        poster_char_id: reply.posterCharacterId,
        poster_name: reply.posterName,
        timestamp: reply.timestamp.toString(),
        content: reply.content,
      });
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`BBSDB.saveReply: ${err.message}`);
    }
  },

  async nextThreadId(): Promise<number | null> {
    if (!Database.knex) {
      const id = _nextThreadIdCounter++;
      return id;
    }
    try {
      const trx = await Database.knex.transaction();
      try {
        const rows = await trx('bbs_thread_ids').where({ id: 1 }).select('next_id').forUpdate();
        if (rows.length === 0) {
          await trx('bbs_thread_ids').insert({ id: 1, next_id: 2 });
          await trx.commit();
          return 1;
        }
        const nextId = Number(rows[0].next_id);
        await trx('bbs_thread_ids').where({ id: 1 }).update({ next_id: nextId + 1 });
        await trx.commit();
        return nextId;
      } catch (err: any) {
        await trx.rollback();
        throw err;
      }
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`BBSDB.nextThreadId: ${err.message}`);
      return null;
    }
  },

  async nextReplyId(threadId: number): Promise<number | null> {
    if (!Database.knex) {
      const cur = _nextReplyIdCounters.get(threadId) ?? 0;
      const next = cur + 1;
      _nextReplyIdCounters.set(threadId, next);
      return next;
    }
    try {
      const rows = await Database.knex('bbs_replies')
        .where({ thread_id: threadId })
        .max('reply_id as max_id');
      return (Number(rows[0].max_id) || 0) + 1;
    } catch (err: any) {
      ChannelServer.instance?.logger.error(`BBSDB.nextReplyId: ${err.message}`);
      return null;
    }
  },
};
