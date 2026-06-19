CREATE TABLE `alertLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`patientId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`performedBy` int,
	`responseTime` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`alertType` enum('critical_heart_rate','critical_spo2','critical_bp','critical_temperature','fall_detection','bed_exit','medication_missed') NOT NULL,
	`severity` enum('warning','critical','emergency') NOT NULL DEFAULT 'critical',
	`vitalValue` text,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledgedAt` timestamp,
	`acknowledgedBy` int,
	`resolvedAt` timestamp,
	`status` enum('active','acknowledged','resolved','false_alarm') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`medicationId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalReminders` int NOT NULL DEFAULT 0,
	`acknowledgedReminders` int NOT NULL DEFAULT 0,
	`missedReminders` int NOT NULL DEFAULT 0,
	`compliancePercentage` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicationReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`medicationId` int NOT NULL,
	`patientId` int NOT NULL,
	`scheduledTime` varchar(5),
	`reminderDate` timestamp NOT NULL,
	`sentAt` timestamp,
	`acknowledgedAt` timestamp,
	`acknowledgedBy` int,
	`status` enum('pending','sent','acknowledged','missed','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicationReminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`medicationName` varchar(255) NOT NULL,
	`dosage` varchar(100),
	`frequency` enum('once_daily','twice_daily','three_times_daily','four_times_daily','every_6_hours','every_8_hours','every_12_hours','as_needed') NOT NULL,
	`prescribedBy` int,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`notes` text,
	`status` enum('active','completed','discontinued') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pushNotificationsEnabled` boolean NOT NULL DEFAULT true,
	`emailNotificationsEnabled` boolean NOT NULL DEFAULT true,
	`criticalAlertsOnly` boolean NOT NULL DEFAULT false,
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assignedDoctorId` int,
	`bedNumber` varchar(20),
	`medicalRecordNumber` varchar(50),
	`dateOfBirth` timestamp,
	`admissionDate` timestamp NOT NULL DEFAULT (now()),
	`dischargeDateEstimated` timestamp,
	`status` enum('admitted','monitoring','critical','discharged','transferred') NOT NULL DEFAULT 'monitoring',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_medicalRecordNumber_unique` UNIQUE(`medicalRecordNumber`)
);
--> statement-breakpoint
CREATE TABLE `vitals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`heartRate` int,
	`spO2` decimal(5,2),
	`systolicBP` int,
	`diastolicBP` int,
	`temperature` decimal(5,2),
	`respiratoryRate` int,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vitals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','doctor','patient','operator') NOT NULL DEFAULT 'user';