"use client";

import { Gamepad2, Github } from "lucide-react";
import Link from "next/link";

import { GITHUB_URL } from "@/lib/env";

export function Footer() {
  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-t backdrop-blur">
      <div className="px-4 py-6 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="text-primary h-6 w-6" />
            <span className="text-lg font-bold">GameHub</span>
          </Link>

          <nav className="text-muted-foreground flex items-center gap-4 text-sm">
            <Link href="/games" className="hover:text-foreground transition-colors">Games</Link>
            <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
            {GITHUB_URL && (
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            )}
          </nav>

          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} GameHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
