import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games - GameHub",
  description: "Play interactive browser games including Snake, Breakout, Chess, and more on GameHub.",
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
