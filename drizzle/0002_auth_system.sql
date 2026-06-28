ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','super_admin','doctor','patient','operator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `patients` ADD `patientPublicId` varchar(20);--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_patientPublicId_unique` UNIQUE(`patientPublicId`);--> statement-breakpoint
ALTER TABLE `patients` ADD `age` int;--> statement-breakpoint
ALTER TABLE `patients` ADD `gender` varchar(20);--> statement-breakpoint
ALTER TABLE `patients` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `patients` ADD `address` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `bloodGroup` varchar(10);--> statement-breakpoint
ALTER TABLE `patients` ADD `medicalHistory` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `emergencyContact` text;--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`doctorPublicId` varchar(20),
	`department` varchar(100),
	`specialization` varchar(100),
	`phone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_doctorPublicId_unique` UNIQUE(`doctorPublicId`)
);--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`performedBy` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
