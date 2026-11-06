CREATE TABLE "budgets" (
	"ledger_id" text PRIMARY KEY,
	"monthly_budget" numeric(12,2) DEFAULT '1000' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ledger_id" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"category" text NOT NULL,
	"spent_on" date NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "expenses_ledger_idx" ON "expenses" ("ledger_id","spent_on");