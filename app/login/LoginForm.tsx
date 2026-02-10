"use client";

import { Icons } from "@games/shared";
import { Button } from "@games/shared/components/ui/button";
import { Input } from "@games/shared/components/ui/input";
import { Label } from "@games/shared/components/ui/label";
import { useToast } from "@games/shared/components/ui/use-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  // Sanitize callbackUrl: enforce same-origin relative path to avoid cross-origin redirects
  const rawCb = searchParams.get("callbackUrl") || "/";
  const callbackUrl = rawCb.startsWith("/") ? rawCb : "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const _result = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl,
      });
      // When redirect=true NextAuth will navigate; no manual push required
    } catch {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Sign in to track scores, compete on leaderboards, and unlock extra features.
        </p>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
          autoComplete="on"
          data-1p-ignore
          data-lpignore
        >
          <div className="space-y-2">
            <Label className="mb-1 block text-sm text-gray-700 dark:text-gray-200" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={loading}
              name="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="focus:ring-ring w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-accent text-sm font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              disabled={loading}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              className="focus:ring-ring w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="status" aria-live="polite">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            className="border-gray-300 dark:border-gray-600"
            onClick={async () => {
              setLoading(true);
              try {
                await signIn("google", { callbackUrl });
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}{" "}
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            className="border-gray-300 dark:border-gray-600"
            onClick={async () => {
              setLoading(true);
              try {
                await signIn("github", { callbackUrl });
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.github className="mr-2 h-4 w-4" />
            )}{" "}
            GitHub
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            No account?{" "}
            <Link
              className="text-accent font-medium underline-offset-4 hover:underline"
              href="/register"
            >
              Sign up
            </Link>
          </p>
          <Link
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            href="/games"
          >
            Play as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
