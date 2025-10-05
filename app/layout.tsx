import type { Metadata } from "next";
import "./globals.css";
import { Topbar } from "@/components/app/topbar";

export const metadata: Metadata = {
  title: "ETF Discovery",
  description: "Fast ETF search, filters, compare, and export.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Topbar />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
