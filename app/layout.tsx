import "./globals.css";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub",
  description: "GameHub -- Play my web games and explore my projects in one place.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-[100svh] flex-col font-sans antialiased">
        <Providers>
          <Header />
          <main className="min-h-0 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
