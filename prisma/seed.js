const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// aumUSD uses JS BigInt (…n) to match Postgres BIGINT
const etfs = [
  { ticker: "SPY", name: "SPDR S&P 500 ETF Trust", issuer: "State Street", category: "Large Blend", expenseBps: 9,  aumUSD: 450000000000n, inceptionDate: new Date("1993-01-22") },
  { ticker: "IVV", name: "iShares Core S&P 500 ETF", issuer: "BlackRock",   category: "Large Blend", expenseBps: 3,  aumUSD: 420000000000n, inceptionDate: new Date("2000-05-15") },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF",     issuer: "Vanguard",    category: "Large Blend", expenseBps: 3,  aumUSD: 420000000000n, inceptionDate: new Date("2010-09-07") },
  { ticker: "QQQ", name: "Invesco QQQ Trust",        issuer: "Invesco",     category: "Large Growth",expenseBps: 20, aumUSD: 250000000000n, inceptionDate: new Date("1999-03-10") },
  { ticker: "DIA", name: "SPDR Dow Jones Industrial Average ETF", issuer: "State Street", category: "Large Blend", expenseBps: 16, aumUSD: 30000000000n, inceptionDate: new Date("1998-01-13") },
  { ticker: "IWM", name: "iShares Russell 2000 ETF", issuer: "BlackRock",   category: "Small Blend", expenseBps: 19, aumUSD: 70000000000n, inceptionDate: new Date("2000-05-22") },
  { ticker: "EFA", name: "iShares MSCI EAFE ETF",    issuer: "BlackRock",   category: "Foreign Large Blend", expenseBps: 32, aumUSD: 50000000000n, inceptionDate: new Date("2001-08-14") },
  { ticker: "EEM", name: "iShares MSCI Emerging Markets ETF", issuer: "BlackRock", category: "Diversified Emerging Mkts", expenseBps: 68, aumUSD: 25000000000n, inceptionDate: new Date("2003-04-11") },
  { ticker: "XLK", name: "Technology Select Sector SPDR Fund", issuer: "State Street", category: "Technology", expenseBps: 9, aumUSD: 60000000000n, inceptionDate: new Date("1998-12-16") },
  { ticker: "SMH", name: "VanEck Semiconductor ETF", issuer: "VanEck", category: "Technology", expenseBps: 35, aumUSD: 20000000000n, inceptionDate: new Date("2000-05-05") },
];

async function main() {
  for (const e of etfs) {
    await prisma.etf.upsert({
      where: { ticker: e.ticker },
      update: {
        name: e.name,
        issuer: e.issuer,
        category: e.category,
        expenseBps: e.expenseBps,
        aumUSD: e.aumUSD,
        inceptionDate: e.inceptionDate,
      },
      create: e,
    });
  }
  console.log(`Seeded ${etfs.length} ETFs`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
