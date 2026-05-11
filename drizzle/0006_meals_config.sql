CREATE TABLE IF NOT EXISTS `meals_config` (
  `id` integer PRIMARY KEY NOT NULL,
  `presets` text NOT NULL,
  `goal_g` integer NOT NULL DEFAULT 180,
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000)
);
