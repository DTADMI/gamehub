"use client";

import { Button } from "@gamehub/ui";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "../contexts/AuthContext";
import { useFeature } from "../lib/flags";
import { useSiteLocale } from "../lib/site-locale";
import { LanguageToggle } from "./LanguageToggle";
import { ModeToggle } from "./ModeToggle";

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
  const showAdmin = useFeature("ADMIN", false);
  const { user, signout, isLoading } = useAuth();
  const { locale } = useSiteLocale();
  const t = copy[locale];

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold" aria-label="GameHub Home">
            GameHub
          </Link>
          <nav className="text-muted-foreground hidden items-center gap-4 text-sm md:flex">
            <Link href="/" className="hover:text-foreground">
              {t.home}
            </Link>
            <Link href="/games" className="hover:text-foreground">
              {t.games}
            </Link>
            <Link href="/projects" className="hover:text-foreground">
              {t.projects}
            </Link>
            <Link href="/leaderboard" className="hover:text-foreground">
              {t.leaderboard}
            </Link>
            <Link href="/blog" className="hover:text-foreground">
              {t.blog}
            </Link>
            {showAdmin ? (
              <Link href="/admin/flags" className="hover:text-foreground">
                {t.admin}
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <LanguageToggle />
          {user ? (
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-2"
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
            <Button asChild size="sm" variant="ghost">
              <Link href="/auth" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>{t.signIn}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
