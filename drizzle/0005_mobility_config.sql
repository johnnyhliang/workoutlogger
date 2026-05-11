CREATE TABLE IF NOT EXISTS `mobility_config` (
  `id` integer PRIMARY KEY NOT NULL,
  `exercises` text NOT NULL,
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000)
);
