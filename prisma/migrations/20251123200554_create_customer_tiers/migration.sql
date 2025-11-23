-- CreateTable
CREATE TABLE "CustomerTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minSpent" REAL NOT NULL DEFAULT 0,
    "minOrders" INTEGER NOT NULL DEFAULT 0,
    "discountPercentage" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CustomerTierAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerTierAssignment_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "CustomerTier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustomerTier_shop_idx" ON "CustomerTier"("shop");

-- CreateIndex
CREATE INDEX "CustomerTierAssignment_shop_idx" ON "CustomerTierAssignment"("shop");

-- CreateIndex
CREATE INDEX "CustomerTierAssignment_customerId_idx" ON "CustomerTierAssignment"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerTierAssignment_shop_customerId_key" ON "CustomerTierAssignment"("shop", "customerId");
