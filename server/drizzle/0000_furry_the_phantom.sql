CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`disruption_id` text NOT NULL,
	`workflow_id` text,
	`path_id` text NOT NULL,
	`recommendation` text,
	`compliance_status` text,
	`status` text NOT NULL,
	`requested_at` text NOT NULL,
	`decided_by` text,
	`decided_at` text,
	`note` text,
	FOREIGN KEY (`disruption_id`) REFERENCES `disruptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_approvals_status_disruption` ON `approval_requests` (`status`,`disruption_id`);--> statement-breakpoint
CREATE TABLE `capabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`redundancy` integer NOT NULL,
	`target_redundancy` integer NOT NULL,
	`status` text NOT NULL,
	`owner` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_capabilities_status` ON `capabilities` (`status`);--> statement-breakpoint
CREATE TABLE `capability_requirements` (
	`capability_id` text NOT NULL,
	`requirement_id` text NOT NULL,
	PRIMARY KEY(`capability_id`, `requirement_id`),
	FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requirement_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_capreq_capability` ON `capability_requirements` (`capability_id`);--> statement-breakpoint
CREATE INDEX `idx_capreq_requirement` ON `capability_requirements` (`requirement_id`);--> statement-breakpoint
CREATE TABLE `disruptions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`supplier_id` text,
	`supplier` text,
	`component` text,
	`dependency` text,
	`capability_id` text,
	`severity` text NOT NULL,
	`detected_at` text NOT NULL,
	`impact_hours` integer,
	`impact` text,
	`affected_skus` integer,
	`exposed_units` text,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_disruptions_status_severity` ON `disruptions` (`status`,`severity`);--> statement-breakpoint
CREATE INDEX `idx_disruptions_detected` ON `disruptions` (`detected_at`);--> statement-breakpoint
CREATE TABLE `factories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`status` text NOT NULL,
	`free_capacity_pct` integer NOT NULL,
	`lines` integer NOT NULL,
	`capabilities` text NOT NULL,
	`constraints` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_factories_status` ON `factories` (`status`);--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`units` integer NOT NULL,
	`uom` text NOT NULL,
	`location` text NOT NULL,
	`status` text NOT NULL,
	`covers_days` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_status` ON `inventory_items` (`status`);--> statement-breakpoint
CREATE TABLE `logistics_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`transit_hours` integer NOT NULL,
	`cold_chain` integer NOT NULL,
	`constraints` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_routes_status_coldchain` ON `logistics_routes` (`status`,`cold_chain`);--> statement-breakpoint
CREATE TABLE `machines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`factory_id` text NOT NULL,
	`status` text NOT NULL,
	`utilisation_pct` integer NOT NULL,
	`capability` text NOT NULL,
	`tolerance_micron` integer NOT NULL,
	FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`capability`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_machines_factory` ON `machines` (`factory_id`);--> statement-breakpoint
CREATE INDEX `idx_machines_status_capability` ON `machines` (`status`,`capability`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region` text NOT NULL,
	`status` text NOT NULL,
	`tier` integer NOT NULL,
	`capabilities` text NOT NULL,
	`lead_time_days` integer NOT NULL,
	`certifications` text NOT NULL,
	`constraints` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_suppliers_status` ON `suppliers` (`status`);--> statement-breakpoint
CREATE INDEX `idx_suppliers_status_tier` ON `suppliers` (`status`,`tier`);--> statement-breakpoint
CREATE TABLE `workforce_records` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`site` text NOT NULL,
	`compatibility` integer NOT NULL,
	`machine_operation` integer NOT NULL,
	`quality_inspection` integer NOT NULL,
	`precision_forming` integer NOT NULL,
	`cold_chain` integer NOT NULL,
	`training_hours` integer NOT NULL,
	`recommendation` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_workforce_compatibility` ON `workforce_records` (`compatibility`);