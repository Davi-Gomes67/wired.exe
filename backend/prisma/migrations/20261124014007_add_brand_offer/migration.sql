-- AlterTable
ALTER TABLE "products" ADD COLUMN "brand" TEXT;
ALTER TABLE "products" ADD COLUMN "compareAtCents" INTEGER;

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");
