ALTER TABLE "configs" ALTER COLUMN "page_overlays" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "page_overlays" SET DEFAULT '{}';