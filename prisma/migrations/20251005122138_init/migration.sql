-- CreateTable
CREATE TABLE "Etf" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "category" TEXT,
    "expenseBps" INTEGER,
    "aumUSD" BIGINT,
    "inceptionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Etf_ticker_key" ON "Etf"("ticker");
