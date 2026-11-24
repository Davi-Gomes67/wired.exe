-- AlterTable
ALTER TABLE "products" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "products_archived_createdAt_idx" ON "products"("archived", "createdAt");