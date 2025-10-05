// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rows = [
  { ticker: "SPY", name: "SPDR S&P 500 ETF Trust", issuer: "State Street", category: "Large Blend", expenseBps: 9,  aumUSD: 500_000_000_000n, inceptionDate: "1993-01-22" },
  { ticker: "QQQ", name: "Invesco QQQ Trust", issuer: "Invesco", category: "Large Growth", expenseBps: 20, aumUSD: 250_000_000_000n, inceptionDate: "1999-03-10" },
  { ticker: "VTI", name: "Vanguard Total Stock Market ETF", issuer: "Vanguard", category: "Total Market", expenseBps: 3, aumUSD: 400_000_000_000n, inceptionDate: "2001-05-24" },
  { ticker: "IWM", name: "iShares Russell 2000 ETF", issuer: "BlackRock", category: "Small Blend", expenseBps: 19, aumUSD: 70_000_000_000n, inceptionDate: "2000-05-22" },
  { ticker: "DIA", name: "SPDR Dow Jones Industrial Average ETF Trust", issuer: "State Street", category: "Large Blend", expenseBps: 16, aumUSD: 30_000_000_000n, inceptionDate: "1998-01-14" },
  { ticker: "IVV", name: "iShares Core S&P 500 ETF", issuer: "BlackRock", category: "Large Blend", expenseBps: 3, aumUSD: 450_000_000_000n, inceptionDate: "2000-05-15" },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF", issuer: "Vanguard", category: "Large Blend", expenseBps: 3, aumUSD: 420_000_000_000n, inceptionDate: "2010-09-07" },
  { ticker: "XLK", name: "Technology Select Sector SPDR Fund", issuer: "State Street", category: "Technology", expenseBps: 10, aumUSD: 70_000_000_000n, inceptionDate: "1998-12-16" },
  { ticker: "SMH", name: "VanEck Semiconductor ETF", issuer: "VanEck", category: "Semiconductors", expenseBps: 35, aumUSD: 20_000_000_000n, inceptionDate: "2011-12-20" },
  { ticker: "SOXX", name: "iShares Semiconductor ETF", issuer: "BlackRock", category: "Semiconductors", expenseBps: 35, aumUSD: 14_000_000_000n, inceptionDate: "2001-07-10" },
];

async function run() {
  for (const r of rows) {
    await prisma.etf.upsert({
      where: { ticker: r.ticker },
      update: {
        name: r.name,
        issuer: r.issuer,
        category: r.category,
        expenseBps: r.expenseBps ?? null,
        aumUSD: r.aumUSD ?? null,
        inceptionDate: r.inceptionDate ? new Date(r.inceptionDate) : null,
      },
      create: {
        ticker: r.ticker,
        name: r.name,
        issuer: r.issuer,
        category: r.category,
        expenseBps: r.expenseBps ?? null,
        aumUSD: r.aumUSD ?? null,
        inceptionDate: r.inceptionDate ? new Date(r.inceptionDate) : null,
      },
    });
  }
  console.log(`Seeded ${rows.length} ETFs`);
}

run().finally(() => prisma.$disconnect());
