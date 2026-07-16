CREATE TABLE `visas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`country` text NOT NULL,
	`name` text NOT NULL,
	`start_date` integer NOT NULL,
	`expiry_date` integer NOT NULL,
	`arrival_date` integer NOT NULL,
	`max_stay_days` integer,
	`rolling_window_days` integer,
	`qualifying_period_years` integer,
	`remarks` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `visas` (`user_id`, `country`, `name`, `start_date`, `expiry_date`, `arrival_date`, `qualifying_period_years`)
SELECT `user_id`, 'United Kingdom', 'Skilled Worker', `visa_start_date`, `visa_expiry_date`, `arrival_date`, 5
FROM `user_settings`;
--> statement-breakpoint
DROP TABLE `user_settings`;
