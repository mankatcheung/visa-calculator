PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `email_change_tokens_new` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`pending_email` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `email_change_tokens_new` SELECT `token_hash`, `user_id`, `pending_email`, `expires_at` FROM `email_change_tokens`;
--> statement-breakpoint
DROP TABLE `email_change_tokens`;
--> statement-breakpoint
ALTER TABLE `email_change_tokens_new` RENAME TO `email_change_tokens`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
