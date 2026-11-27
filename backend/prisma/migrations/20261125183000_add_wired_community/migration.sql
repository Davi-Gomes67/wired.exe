-- CreateTable
CREATE TABLE "community_posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "detailsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "community_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "community_post_images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "community_post_images_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "community_post_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "community_post_products_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_post_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "community_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VISIBLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "community_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "community_post_likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "community_saved_posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_saved_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_saved_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "community_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reporterId" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL,
    "postId" INTEGER,
    "commentId" INTEGER,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reviewedById" INTEGER,
    "reviewedAt" DATETIME,
    "resolutionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "community_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_reports_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "community_reports_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_reports_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "community_comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "community_posts_slug_key" ON "community_posts"("slug");
CREATE INDEX "community_posts_authorId_createdAt_idx" ON "community_posts"("authorId", "createdAt");
CREATE INDEX "community_posts_category_createdAt_idx" ON "community_posts"("category", "createdAt");
CREATE INDEX "community_posts_status_createdAt_idx" ON "community_posts"("status", "createdAt");

CREATE INDEX "community_post_images_postId_sortOrder_idx" ON "community_post_images"("postId", "sortOrder");

CREATE UNIQUE INDEX "community_post_products_postId_productId_key" ON "community_post_products"("postId", "productId");
CREATE INDEX "community_post_products_postId_sortOrder_idx" ON "community_post_products"("postId", "sortOrder");
CREATE INDEX "community_post_products_productId_idx" ON "community_post_products"("productId");

CREATE INDEX "community_comments_postId_createdAt_idx" ON "community_comments"("postId", "createdAt");
CREATE INDEX "community_comments_authorId_createdAt_idx" ON "community_comments"("authorId", "createdAt");
CREATE INDEX "community_comments_status_createdAt_idx" ON "community_comments"("status", "createdAt");

CREATE UNIQUE INDEX "community_post_likes_postId_userId_key" ON "community_post_likes"("postId", "userId");
CREATE INDEX "community_post_likes_userId_createdAt_idx" ON "community_post_likes"("userId", "createdAt");

CREATE UNIQUE INDEX "community_saved_posts_postId_userId_key" ON "community_saved_posts"("postId", "userId");
CREATE INDEX "community_saved_posts_userId_createdAt_idx" ON "community_saved_posts"("userId", "createdAt");

CREATE INDEX "community_reports_status_createdAt_idx" ON "community_reports"("status", "createdAt");
CREATE INDEX "community_reports_targetType_createdAt_idx" ON "community_reports"("targetType", "createdAt");
CREATE INDEX "community_reports_postId_idx" ON "community_reports"("postId");
CREATE INDEX "community_reports_commentId_idx" ON "community_reports"("commentId");
