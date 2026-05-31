import "./globals.css";

import { Footer, Header, I18nInitializer, Providers } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import I18nServerProvider from "@/lib/i18n/server-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub",
  description: "GameHub — Play my web games and explore my projects in one place.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? "";
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "";
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex min-h-[100svh] flex-col font-sans antialiased`}>
        <I18nServerProvider>
          <Providers>
            <I18nInitializer />
            <Header />
            <main className="min-h-0 flex-1">
              <Suspense fallback={<LoadingShell variant="shimmer" />}>
                {children}
              </Suspense>
            </main>
            <Footer githubUrl={githubUrl} linkedinUrl={linkedinUrl} contactEmail={contactEmail} />
            <Analytics />
          </Providers>
        </I18nServerProvider>
      </body>
    </html>
  );
}

