"use client";

import { useState, useCallback } from "react";
import { Button } from "@gamehub/ui";
import { LogIn, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "../contexts/AuthContext";
import { useSiteLocale } from "../lib/site-locale";
import { useFeature, UI_FLAGS } from "../lib/flags";
import { LanguageToggle } from "./LanguageToggle";
import { ModeToggle } from "./ModeToggle";
import { MobileNav } from "./MobileNav";

const copy = {
  en: {
    home: "Home",
    games: "Games",
    projects: "Projects",
    leaderboard: "Leaderboard",
    blog: "Blog",
    admin: "Admin",
    signIn: "Sign In",
    signOut: "Sign Out",
  },
  fr: {
    home: "Accueil",
    games: "Jeux",
    projects: "Projets",
    leaderboard: "Classement",
    blog: "Blog",
    admin: "Admin",
    signIn: "Connexion",
    signOut: "Déconnexion",
  },
} as const;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signout, isLoading } = useAuth();
  const { locale } = useSiteLocale();
  const t = copy[locale];
  const useMobileNav = useFeature(UI_FLAGS.MOBILE_NAV_DRAWER);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { href: "/", label: t.home },
    { href: "/games", label: t.games },
    { href: "/projects", label: t.projects },
    { href: "/leaderboard", label: t.leaderboard },
    { href: "/blog", label: t.blog },
    ...(user ? [{ href: "/admin/flags", label: t.admin }] : []),
  ];

  const isActivePath = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }, [pathname]);

  const handleMobileNavToggle = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile menu button */}
            {useMobileNav && (
              <button
                onClick={handleMobileNavToggle}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden min-h-[44px] min-w-[44px]"
                aria-label="Open menu"
                aria-expanded={isMobileNavOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <Link 
              href="/" 
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors" 
              aria-label="GameHub Home"
            >
              GameHub
            </Link>

            <nav className="text-muted-foreground hidden items-center gap-1 text-sm md:flex" role="navigation">
              {navItems.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 rounded-md transition-colors",
                      "hover:text-foreground hover:bg-muted/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "text-foreground bg-muted/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                    {/* Active indicator */}
                    {isActive && (
                      <span 
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <ModeToggle />
            <LanguageToggle />
            {user ? (
              <Button
                size="sm"
                variant="ghost"
                className="hidden sm:flex items-center gap-2"
                disabled={isLoading}
                onClick={async () => {
                  await signout();
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>{t.signOut}</span>
              </Button>
            ) : (
              <Button asChild size="sm" variant="ghost" className="hidden sm:flex">
                <Link href="/auth" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>{t.signIn}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {useMobileNav && (
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          items={navItems}
        />
      )}
    </>
  );
}

export default Header;
