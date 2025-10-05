This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Deploy (Vercel)

1. **Environment**
   - This project uses Prisma with SQLite in development: `DATABASE_URL="file:./dev.db"`.
   - For production, use a hosted Postgres (e.g., Neon or Vercel Postgres) and set `DATABASE_URL` accordingly.
   - On deploy, run `npx prisma migrate deploy` after setting `DATABASE_URL`.

2. **Build**
   - Local preview:
     ```bash
     npm run build
     npm run start
     ```
   - Vercel:
     - Add `DATABASE_URL` in Project → Settings → Environment Variables.
     - (For demo-only, you can commit `prisma/dev.db`, but it's not durable in serverless.)

3. **Notes**
   - `next.config.ts` sets `experimental.outputFileTracingRoot` to this project folder to avoid false workspace-root inference.
   - If you see module-resolution warnings, clear caches:
     ```bash
     rm -rf .next node_modules
     npm ci
     ```
