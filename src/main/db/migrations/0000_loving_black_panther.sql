CREATE TABLE `analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`ctr` real DEFAULT 0 NOT NULL,
	`retention` real DEFAULT 0 NOT NULL,
	`subscribers` integer DEFAULT 0 NOT NULL,
	`rpm` real DEFAULT 0 NOT NULL,
	`watch_time` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`tags` text,
	`priority` text,
	`difficulty` text,
	`estimated_views` integer,
	`inspiration` text,
	`references_text` text,
	`links` text,
	`notes` text,
	`status` text DEFAULT 'Idea' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text,
	`title` text NOT NULL,
	`content` text,
	`duration_estimated` integer,
	`reading_time` integer,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'dark' NOT NULL,
	`ai_provider` text DEFAULT 'ollama' NOT NULL,
	`ai_model` text DEFAULT 'llama3.2' NOT NULL,
	`api_endpoint` text,
	`api_key` text,
	`default_description` text,
	`brand_colors` text,
	`brand_fonts` text,
	`updated_at` text NOT NULL
);
