CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE ideas ADD `project_id` text REFERENCES projects(id);--> statement-breakpoint
ALTER TABLE ideas ADD `recording_checklist` text;--> statement-breakpoint
ALTER TABLE ideas ADD `editing_checklist` text;--> statement-breakpoint
ALTER TABLE ideas ADD `duration_badge` text;--> statement-breakpoint
ALTER TABLE ideas ADD `progress_percent` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `thumbnail_start_color` text;--> statement-breakpoint
ALTER TABLE ideas ADD `thumbnail_end_color` text;--> statement-breakpoint
ALTER TABLE ideas ADD `thumbnail_text` text;--> statement-breakpoint
ALTER TABLE ideas ADD `actual_views` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `actual_ctr` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `actual_retention` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `actual_subscribers` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `actual_watch_time` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `actual_rpm` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE ideas ADD `published_at` text;--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/