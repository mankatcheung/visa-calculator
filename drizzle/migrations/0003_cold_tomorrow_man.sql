PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leaves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`color` text,
	`remarks` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_leaves`("id", "created_at", "start_date", "end_date", "color", "remarks", "user_id") SELECT "id", "created_at", "start_date", "end_date", "color", "remarks", "user_id" FROM `leaves`;--> statement-breakpoint
DROP TABLE `leaves`;--> statement-breakpoint
ALTER TABLE `__new_leaves` RENAME TO `leaves`;--> statement-breakpoint
PRAGMA foreign_keys=ON;