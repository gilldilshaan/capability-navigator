CREATE TABLE `graph_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`kind` text NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`status` text NOT NULL,
	`risk` text NOT NULL,
	`meta` text NOT NULL DEFAULT ''
);
--> statement-breakpoint
CREATE INDEX `idx_graph_nodes_kind` ON `graph_nodes` (`kind`);--> statement-breakpoint
CREATE TABLE `graph_edges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_node` text NOT NULL,
	`to_node` text NOT NULL,
	`critical` integer NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE INDEX `idx_graph_edges_from` ON `graph_edges` (`from_node`);--> statement-breakpoint
CREATE TABLE `failure_toggles` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`detail` text NOT NULL,
	`resilience_hit` integer NOT NULL,
	`removes` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hidden_dependencies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`impact` text NOT NULL,
	`alternatives` text NOT NULL,
	`redundancy` integer NOT NULL,
	`target` integer NOT NULL,
	`mitigation` text NOT NULL,
	`shared_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`disruption_id` text NOT NULL,
	`status` text NOT NULL DEFAULT 'COMPLETE',
	`progress` integer NOT NULL DEFAULT 100,
	`result_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`disruption_id`) REFERENCES `disruptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_workflows_disruption` ON `workflows` (`disruption_id`);--> statement-breakpoint
CREATE TABLE `simulations` (
	`id` text PRIMARY KEY NOT NULL,
	`failure_ids` text NOT NULL,
	`removed` text NOT NULL,
	`resilience_before` integer NOT NULL,
	`resilience_after` integer NOT NULL,
	`affected_capabilities_json` text NOT NULL,
	`vulnerabilities_json` text NOT NULL,
	`supplier_redundancy` integer NOT NULL,
	`capability_redundancy` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_simulations_created` ON `simulations` (`created_at`);--> statement-breakpoint
CREATE TABLE `llm_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`disruption_id` text NOT NULL,
	`analysis_type` text NOT NULL,
	`input_json` text NOT NULL,
	`output_json` text NOT NULL,
	`model` text,
	`duration_ms` integer,
	`validation` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_llm_disruption` ON `llm_analyses` (`disruption_id`);
