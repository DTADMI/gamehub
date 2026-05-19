import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games - GameHub",
  description: "Play interactive browser games including Snake, Breakout, Chess, and more on GameHub.",
};

export const dynamic = "force-dynamic";

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
