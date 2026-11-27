-- CreateTable
CREATE TABLE "root_access_subscriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "planCode" TEXT NOT NULL DEFAULT 'root_access',
    "priceCents" INTEGER NOT NULL,
    "acceptedTermsAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "orderCode" TEXT,
    "notes" TEXT,
    "cancelledAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "root_access_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "root_access_subscriptions_userId_createdAt_idx" ON "root_access_subscriptions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "root_access_subscriptions_status_createdAt_idx" ON "root_access_subscriptions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "root_access_subscriptions_orderCode_idx" ON "root_access_subscriptions"("orderCode");
