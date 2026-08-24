import "./globals.css";

import { Footer, Header, I18nInitializer, Providers } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import LocaleInitializer from "@/components/LocaleInitializer";
import I18nServerProvider from "@/lib/i18n/server-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GameHub",
    template: "%s | GameHub",
  },
  description: "GameHub — 20 web games including point & click adventures, arcade classics, and creative spell-crafting tools.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "GameHub — Play My Web Games",
    description: "20 games in one place: point & click adventures, arcade classics, puzzle games, and creative spell-crafting tools.",
    url: "https://gamehub.vercel.app",
    siteName: "GameHub",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "GameHub — 20 Games",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameHub — Play My Web Games",
    description: "20 games in one place: point & click adventures, arcade classics, puzzle games, and creative spell-crafting tools.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
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
        <Suspense fallback={<LoadingShell variant="shimmer" />}>
          <I18nServerProvider>
            <Providers>
              <I18nInitializer />
              <LocaleInitializer />
              <Header />
              <main className="min-h-0 flex-1">
                {children}
              </main>
              <Footer githubUrl={githubUrl} linkedinUrl={linkedinUrl} contactEmail={contactEmail} />
              <Analytics />
            </Providers>
          </I18nServerProvider>
        </Suspense>
      </body>
    </html>
  );
}

