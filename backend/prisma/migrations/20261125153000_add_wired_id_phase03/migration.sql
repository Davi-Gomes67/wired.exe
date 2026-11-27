-- WIRED ID Phase 03
ALTER TABLE "users" ADD COLUMN "displayName" TEXT;
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "publicMemberId" TEXT;

UPDATE "users"
SET "publicMemberId" = 'WRD-' || upper(substr(hex(randomblob(4)), 1, 8))
WHERE "publicMemberId" IS NULL;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_publicMemberId_key" ON "users"("publicMemberId");

CREATE TABLE "wishlist_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON "wishlist_items"("userId", "productId");
CREATE INDEX "wishlist_items_userId_createdAt_idx" ON "wishlist_items"("userId", "createdAt");

CREATE TABLE "recently_viewed_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recently_viewed_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "recently_viewed_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "recently_viewed_items_userId_productId_key" ON "recently_viewed_items"("userId", "productId");
CREATE INDEX "recently_viewed_items_userId_viewedAt_idx" ON "recently_viewed_items"("userId", "viewedAt");

CREATE TABLE "user_achievements" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "achievementCode" TEXT NOT NULL,
  "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" TEXT,
  CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "user_achievements_userId_achievementCode_key" ON "user_achievements"("userId", "achievementCode");
CREATE INDEX "user_achievements_userId_unlockedAt_idx" ON "user_achievements"("userId", "unlockedAt");
