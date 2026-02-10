"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";

function useCallbackUrl() {
  if (typeof window === "undefined") {
    return "/";
  }
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("callbackUrl") || url.searchParams.get("next") || "/";
  } catch {
    return "/";
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = useCallbackUrl();

  const API_BASE = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    return base.replace(/\/$/, "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        // Create account on backend then sign in
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "Sign up failed");
          throw new Error(msg || "Sign up failed");
        }
      }
      // Use redirect: false so we can inspect the result object (NextAuth returns void when redirect: true)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      // When ok, NextAuth returns a url to navigate to; otherwise push our callbackUrl
      if (result?.ok) {
        if (result.url) {
          // Use full navigation to preserve NextAuth cookies
          window.location.href = result.url;
          return;
        }
        router.push(callbackUrl || "/");
        return;
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    }
    setLoading(false);
  }

  function provider(provider: "google" | "github") {
    signIn(provider, { callbackUrl });
  }

  return (
    <div className="grid min-h-[70svh] grid-cols-1 md:grid-cols-5">
      {/* Side panel */}
      <div className="hidden p-8 md:col-span-2 md:block">
        <div className="from-primary/15 to-accent/15 h-full rounded-xl bg-gradient-to-b backdrop-blur-sm">
          <div className="flex h-full flex-col justify-end">
            <h2 className="mb-2 text-2xl font-bold">Welcome to GameHub</h2>
            <p className="text-muted-foreground text-sm">
              Play web games, track progress, and compete on leaderboards.
            </p>
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div className="flex items-center justify-center p-6 md:col-span-3">
        <div className="bg-card/90 text-card-foreground w-full max-w-md rounded-xl p-6 shadow backdrop-blur-sm">
          <div className="mb-4 flex gap-4">
            <button
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                tab === "signin" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
              onClick={() => setTab("signin")}
              aria-pressed={tab === "signin"}
            >
              Sign In
            </button>
            <button
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                tab === "signup" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
              onClick={() => setTab("signup")}
              aria-pressed={tab === "signup"}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => provider("google")}
              className="border-input bg-background h-10 w-full rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Continue with Google
            </button>
            <button
              onClick={() => provider("github")}
              className="border-input bg-background h-10 w-full rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Continue with GitHub
            </button>
          </div>

          <div className="text-muted-foreground my-4 flex items-center gap-3 text-xs">
            <div className="bg-border h-px flex-1" />
            <span>or with email</span>
            <div className="bg-border h-px flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background h-10 w-full rounded-md border px-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input bg-background h-10 w-full rounded-md border px-3"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 h-10 w-full rounded-md text-white disabled:opacity-60"
            >
              {loading ? "Please wait…" : tab === "signin" ? "Sign In" : "Create account"}
            </button>
          </form>

          <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
            <Link href="#" className="underline underline-offset-2">
              Forgot password
            </Link>
            <span>
              By continuing you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy
              </Link>
              .
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
