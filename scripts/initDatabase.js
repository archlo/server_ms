#!/usr/bin/env node
/**
 * Initialize database tables.
 * Usage: node initDatabase.js
 */

const knex = require('knex');
require('dotenv').config();

async function initializeDatabase() {
  const dbName = process.env.DB_SCHEMA || 'maple';

  // 1. Connect without a database to create it if needed
  const tempKnex = knex({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: { min: 0, max: 1 },
  });

  try {
    console.log(`Creating database ${dbName} if needed...`);
    await tempKnex.raw(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    await tempKnex.raw(`USE \`${dbName}\``);

    // --- accounts table ---
    console.log('Creating accounts table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`accounts\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`name\` varchar(13) NOT NULL DEFAULT '',
          \`password\` varchar(128) NOT NULL DEFAULT '',
          \`pin\` varchar(10) NOT NULL DEFAULT '',
          \`pic\` varchar(26) NOT NULL DEFAULT '',
          \`logged_in\` tinyint(4) NOT NULL DEFAULT '0',
          \`last_login\` timestamp NULL DEFAULT NULL,
          \`create_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`birthday\` date NOT NULL DEFAULT '2015-01-01',
          \`banned\` tinyint(1) NOT NULL DEFAULT '0',
          \`ban_reason\` text,
          \`macs\` tinytext,
          \`nx_credit\` int(11) DEFAULT NULL,
          \`maple_points\` int(11) DEFAULT NULL,
          \`nx_prepaid\` int(11) DEFAULT NULL,
          \`character_slots\` tinyint(2) NOT NULL DEFAULT '3',
          \`gender\` tinyint(2) NOT NULL DEFAULT '0',
          \`temp_ban\` timestamp NOT NULL DEFAULT '2015-01-01 05:00:00',
          \`greason\` tinyint(4) NOT NULL DEFAULT '0',
          \`tos\` tinyint(1) NOT NULL DEFAULT '0',
          \`site_logged\` text,
          \`web_admin\` int(1) DEFAULT '0',
          \`nick\` varchar(20) DEFAULT NULL,
          \`mute\` int(1) DEFAULT '0',
          \`email\` varchar(45) DEFAULT NULL,
          \`ip\` text,
          \`reward_points\` int(11) NOT NULL DEFAULT '0',
          \`vote_points\` int(11) NOT NULL DEFAULT '0',
          \`hwid\` varchar(12) NOT NULL DEFAULT '',
          \`language\` int(1) NOT NULL DEFAULT '2',
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`name\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1
    `);

    // --- storages table ---
    console.log('Creating storages table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`storages\` (
          \`account_id\` int(11) NOT NULL,
          \`slots\` int(11) NOT NULL DEFAULT 0,
          \`meso\` int(11) NOT NULL DEFAULT 0,
          PRIMARY KEY (\`account_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    `);

    // --- characters table ---
    console.log('Creating characters table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`characters\` (
          \`id\`                   INT NOT NULL,
          \`account_id\`           INT NOT NULL,
          \`name\`                 VARCHAR(13) NOT NULL,
          \`stat_json\`            JSON NOT NULL,
          \`equipped_json\`        JSON NOT NULL,
          \`equip_inv_json\`       JSON NOT NULL,
          \`consume_inv_json\`     JSON NOT NULL,
          \`install_inv_json\`     JSON NOT NULL,
          \`etc_inv_json\`         JSON NOT NULL,
          \`cash_inv_json\`        JSON NOT NULL,
          \`money\`                INT NOT NULL DEFAULT 0,
          \`ext_slot_expire\`      DATETIME NULL,
          \`skill_cooltimes_json\` JSON NOT NULL,
          \`skill_records_json\`   JSON NOT NULL,
          \`quest_records_json\`   JSON NOT NULL,
          \`item_sn_counter\`      INT NOT NULL DEFAULT 0,
          \`friend_max\`           INT NOT NULL DEFAULT 30,
          \`party_id\`             INT NOT NULL DEFAULT 0,
          \`guild_id\`             INT NOT NULL DEFAULT 0,
          \`creation_time\`        DATETIME NULL,
          \`max_level_time\`       DATETIME NULL,
          \`friends_json\`         JSON NULL,
          PRIMARY KEY (\`id\`),
          INDEX \`idx_account_id\` (\`account_id\`),
          UNIQUE KEY \`name\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- guilds table ---
    console.log('Creating guilds table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`guilds\` (
          \`guild_id\`       INT NOT NULL,
          \`guild_name\`     VARCHAR(13) NOT NULL,
          \`leader\`         INT NOT NULL,
          \`capacity\`       INT NOT NULL DEFAULT 10,
          \`notice\`         TEXT,
          \`rank_titles\`    JSON NOT NULL,
          \`points\`         INT NOT NULL DEFAULT 0,
          \`logo\`           SMALLINT NOT NULL DEFAULT 0,
          \`logo_color\`     TINYINT NOT NULL DEFAULT 0,
          \`logo_bg\`        SMALLINT NOT NULL DEFAULT 0,
          \`logo_bg_color\`  TINYINT NOT NULL DEFAULT 0,
          \`alliance_id\`    INT NOT NULL DEFAULT 0,
          \`signature\`      INT NOT NULL DEFAULT 0,
          \`members\`        JSON NOT NULL,
          PRIMARY KEY (\`guild_id\`),
          UNIQUE INDEX \`idx_guild_name\` (\`guild_name\`),
          INDEX \`idx_leader\` (\`leader\`),
          INDEX \`idx_alliance_id\` (\`alliance_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- bbs_threads table ---
    console.log('Creating bbs_threads table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`bbs_threads\` (
          \`thread_id\`       INT NOT NULL,
          \`guild_id\`        INT NOT NULL,
          \`poster_char_id\`  INT NOT NULL,
          \`poster_name\`     VARCHAR(13) NOT NULL,
          \`name\`            VARCHAR(31) NOT NULL,
          \`timestamp\`       VARCHAR(30) NOT NULL,
          \`icon\`            INT NOT NULL DEFAULT 0,
          \`start_post\`      TEXT NOT NULL,
          PRIMARY KEY (\`thread_id\`),
          INDEX \`idx_bbs_guild_id\` (\`guild_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- bbs_replies table ---
    console.log('Creating bbs_replies table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`bbs_replies\` (
          \`reply_id\`        INT NOT NULL,
          \`thread_id\`       INT NOT NULL,
          \`poster_char_id\`  INT NOT NULL,
          \`poster_name\`     VARCHAR(13) NOT NULL,
          \`timestamp\`       VARCHAR(30) NOT NULL,
          \`content\`         TEXT NOT NULL,
          PRIMARY KEY (\`reply_id\`, \`thread_id\`),
          INDEX \`idx_bbs_reply_thread_id\` (\`thread_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- bbs_thread_ids counter table ---
    console.log('Creating bbs_thread_ids table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`bbs_thread_ids\` (
          \`id\` INT NOT NULL DEFAULT 1,
          \`next_id\` INT NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- cash_items table ---
    console.log('Creating cash_items table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`cash_items\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`account_id\` int(11) NOT NULL,
          \`character_id\` int(11) NOT NULL DEFAULT 0,
          \`sn\` int(11) NOT NULL,
          \`item_id\` int(11) NOT NULL,
          \`quantity\` int(11) NOT NULL DEFAULT 1,
          \`expire_date\` datetime NULL,
          PRIMARY KEY (\`id\`),
          INDEX \`idx_account_id\` (\`account_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    `);

    // --- memos table ---
    console.log('Creating memos table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`memos\` (
          \`memo_id\` INT NOT NULL,
          \`receiver_id\` INT NOT NULL,
          \`memo_type\` TINYINT NOT NULL,
          \`memo_content\` TEXT NOT NULL,
          \`sender_name\` VARCHAR(13) NOT NULL,
          \`date_sent\` DATETIME NULL,
          PRIMARY KEY (\`memo_id\`),
          INDEX \`idx_memo_receiver_id\` (\`receiver_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- memo_ids counter table ---
    console.log('Creating memo_ids table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`memo_ids\` (
          \`id\` INT NOT NULL DEFAULT 1,
          \`next_id\` INT NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // --- mob_drops table ---
    console.log('Creating mob_drops table...');
    await tempKnex.raw(`
        CREATE TABLE IF NOT EXISTS \`mob_drops\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`mob_id\` int(11) NOT NULL,
          \`item_id\` int(11) NOT NULL,
          \`min_quantity\` int(11) NOT NULL DEFAULT 1,
          \`max_quantity\` int(11) NOT NULL DEFAULT 1,
          \`probability\` decimal(10,6) NOT NULL,
          \`quest_id\` int(11) NOT NULL DEFAULT 0,
          \`field_id\` int(11) NOT NULL DEFAULT 0,
          PRIMARY KEY (\`id\`),
          KEY \`idx_mob_id\` (\`mob_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    `);

    console.log('All tables created successfully!');
  } finally {
    await tempKnex.destroy();
  }
}

initializeDatabase().catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
});