// frontend/components/Navbar.tsx
"use client";

import { Button, cn } from "@gamehub/ui";
import { Gamepad2, Github, Linkedin, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { GITHUB_URL, LINKEDIN_URL } from "../lib/env";
import { ModeToggle } from "./ModeToggle";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Games", href: "/games" },
  { name: "Projects", href: "/projects" },
  { name: "Resume", href: "/resume" },
  { name: "Blog", href: "/blog" },
  { name: "Explore", href: "/explore" },
  { name: "Admin", href: "/admin" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const hasGithub = Boolean(GITHUB_URL);
  const hasLinkedIn = Boolean(LINKEDIN_URL);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="text-primary h-6 w-6" />
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
              Gamehub
            </span>
          </Link>

          <nav className="hidden space-x-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "hover:text-primary focus-visible:ring-primary/60 rounded-md px-1.5 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  pathname === item.href ? "text-primary" : "text-foreground/60",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden items-center space-x-2 md:flex">
            {hasGithub && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="focus-visible:ring-primary/60 focus-visible:ring-2"
              >
                <a
                  href={GITHUB_URL}
                  aria-label="GitHub profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            )}
            {hasLinkedIn && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="focus-visible:ring-primary/60 focus-visible:ring-2"
              >
                <a
                  href={LINKEDIN_URL}
                  aria-label="LinkedIn profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
          <ModeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container space-y-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "focus-visible:ring-primary/60 block rounded-md px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-2 border-t pt-2">
              {(hasGithub || hasLinkedIn) && (
                <div className="mb-2 flex items-center gap-2">
                  {hasGithub && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="focus-visible:ring-primary/60 focus-visible:ring-2"
                    >
                      <a
                        href={GITHUB_URL}
                        aria-label="GitHub profile"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {hasLinkedIn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="focus-visible:ring-primary/60 focus-visible:ring-2"
                    >
                      <a
                        href={LINKEDIN_URL}
                        aria-label="LinkedIn profile"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
