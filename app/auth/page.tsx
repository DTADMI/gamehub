"use client";

import { useAuth } from "@gamehub/game-platform";
import { useSiteLocale } from "@gamehub/game-platform/lib/site-locale";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@gamehub/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { siteCopy } from "@/lib/site-copy";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const { locale } = useSiteLocale();
  const copy = siteCopy[locale].auth;
  const { signin, signup, isLoading, user } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ctaLabel = useMemo(() => {
    if (submitting) {
      return mode === "signin" ? copy.signingIn : copy.creating;
    }
    return mode === "signin" ? copy.signIn : copy.signUp;
  }, [copy.creating, copy.signIn, copy.signUp, copy.signingIn, mode, submitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (mode === "signin") {
        await signin(email, password);
        router.push("/");
        router.refresh();
      } else {
        await signup(email, username, password);
        setMode("signin");
        setMessage(copy.accountCreated);
      }
    } catch (submitError) {
      const messageText =
        submitError instanceof Error ? submitError.message : "Authentication failed.";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle>{user ? copy.signIn : copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="inline-flex w-full rounded-md border p-1">
            <Button
              type="button"
              variant={mode === "signin" ? "default" : "ghost"}
              className="w-1/2"
              onClick={() => setMode("signin")}
            >
              {copy.signIn}
            </Button>
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "ghost"}
              className="w-1/2"
              onClick={() => setMode("signup")}
            >
              {copy.signUp}
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{copy.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="username">{copy.username}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="password">{copy.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-500">{message}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading || submitting}>
              {ctaLabel}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            {mode === "signin" ? copy.needAccount : copy.haveAccount}{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? copy.signUp : copy.signIn}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
