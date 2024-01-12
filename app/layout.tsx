import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AutoRefresh } from "./AutoRefresh";

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
          <a href="/">Blog</a> by <a href="https://benjavicente.dev">Benja Vicente</a>
        </nav>
        {children}
      </body>
      {process.env.NODE_ENV === "development" ? <AutoRefresh /> : null}
    </html>
  );
}
