-- Guilds table for MapleWeb channel server
-- Persists guild state across server restarts (port of kinoko's guild_table).
CREATE TABLE IF NOT EXISTS `guilds` (
  `guild_id`       INT NOT NULL,
  `guild_name`     VARCHAR(13) NOT NULL,
  `leader`         INT NOT NULL,
  `capacity`       INT NOT NULL DEFAULT 10,
  `notice`         TEXT,
  `rank_titles`    JSON NOT NULL,
  `points`         INT NOT NULL DEFAULT 0,
  `logo`           SMALLINT NOT NULL DEFAULT 0,
  `logo_color`     TINYINT NOT NULL DEFAULT 0,
  `logo_bg`        SMALLINT NOT NULL DEFAULT 0,
  `logo_bg_color`  TINYINT NOT NULL DEFAULT 0,
  `alliance_id`    INT NOT NULL DEFAULT 0,
  `signature`      INT NOT NULL DEFAULT 0,
  `members`        JSON NOT NULL,
  PRIMARY KEY (`guild_id`),
  UNIQUE INDEX `idx_guild_name` (`guild_name`),
  INDEX `idx_leader` (`leader`),
  INDEX `idx_alliance_id` (`alliance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
