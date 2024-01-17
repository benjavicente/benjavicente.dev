import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AutoRefresh } from "./AutoRefresh";
import Link from "next/link";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blog - BenjaVicente",
  metadataBase: new URL("https://blog.benjavicente.dev"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav>
          <header className="text-forest-50 text-2xl [font-weight:450] decoration-orange-500 decoration-2 underline-offset-1 tracking-tight -space-x-0.5 limit-width py-4 px-4">
            <Link href="/" className="underline hover:decoration-double">
              Blog
            </Link>{" "}
            <span className="bg-orange-500 text-orange-50 rounded-full aspect-square text-sm font-semibold inline-flex justify-center items-center h-6 w-6">
              by
            </span>{" "}
            <a href="https://benjavicente.dev" className="underline decoration-orange-500 hover:decoration-double">
              BenjaVicente
            </a>
          </header>
        </nav>
        {children}
      </body>
      {process.env.NODE_ENV === "development" ? <AutoRefresh /> : null}
    </html>
  );
}
