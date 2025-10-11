import type { PrismaConfig } from "@prisma/sdk";

export default {
  // Use the Node seeder you already have
  seed: "node prisma/seed.js",
} satisfies PrismaConfig;
