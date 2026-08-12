-- Characters table for MapleWeb channel server
CREATE TABLE IF NOT EXISTS `characters` (
  `id`                   INT NOT NULL,
  `account_id`           INT NOT NULL,
  `name`                 VARCHAR(13) NOT NULL,

  -- stat blob (gender/skin/face/hair/level/job/stats/hp/mp/ap/sp/exp/pos)
  `stat_json`            JSON NOT NULL,

  -- inventory blobs
  `equipped_json`        JSON NOT NULL,
  `equip_inv_json`       JSON NOT NULL,
  `consume_inv_json`     JSON NOT NULL,
  `install_inv_json`     JSON NOT NULL,
  `etc_inv_json`         JSON NOT NULL,
  `cash_inv_json`        JSON NOT NULL,

  `money`                INT NOT NULL DEFAULT 0,
  `ext_slot_expire`      DATETIME NULL,

  -- skill blobs
  `skill_cooltimes_json` JSON NOT NULL,
  `skill_records_json`   JSON NOT NULL,

  -- quest blob
  `quest_records_json`   JSON NOT NULL,

  -- misc
  `item_sn_counter`      INT NOT NULL DEFAULT 0,
  `friend_max`           INT NOT NULL DEFAULT 30,
  `party_id`             INT NOT NULL DEFAULT 0,
  `guild_id`             INT NOT NULL DEFAULT 0,
  `creation_time`        DATETIME NULL,
  `max_level_time`       DATETIME NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_account_id` (`account_id`),
  UNIQUE INDEX `idx_name_lower` ((LOWER(`name`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
