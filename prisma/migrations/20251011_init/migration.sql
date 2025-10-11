-- CreateTable
CREATE TABLE "Etf" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "category" TEXT,
    "expenseBps" INTEGER,
    "aumUSD" BIGINT,
    "inceptionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Etf_ticker_key" ON "Etf"("ticker");

