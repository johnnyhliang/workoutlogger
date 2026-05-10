CREATE TABLE `pickup_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`sport` text NOT NULL,
	`duration_min` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pickup_log_date_idx` ON `pickup_log` (`date`);--> statement-breakpoint
CREATE TABLE `vert_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`vert_in` real NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vert_log_date_idx` ON `vert_log` (`date`);--> statement-breakpoint
ALTER TABLE `workouts` ADD `slept_ok` integer;