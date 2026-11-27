-- CreateTable
CREATE TABLE "articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "content" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "readingTimeMinutes" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "article_related_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "article_related_products_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "article_related_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
CREATE INDEX "articles_status_publishedAt_idx" ON "articles"("status", "publishedAt");
CREATE INDEX "articles_category_publishedAt_idx" ON "articles"("category", "publishedAt");
CREATE INDEX "articles_featured_status_idx" ON "articles"("featured", "status");
CREATE UNIQUE INDEX "article_related_products_articleId_productId_key" ON "article_related_products"("articleId", "productId");
CREATE INDEX "article_related_products_articleId_sortOrder_idx" ON "article_related_products"("articleId", "sortOrder");
CREATE INDEX "article_related_products_productId_idx" ON "article_related_products"("productId");
