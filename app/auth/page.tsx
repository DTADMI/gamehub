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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { siteCopy } from "@/lib/site-copy";

const authSchema = z.object({
  email: z.string().email("Valid email required"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "At least 6 characters"),
});

type AuthForm = z.infer<typeof authSchema>;

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const { locale } = useSiteLocale();
  const copy = siteCopy[locale].auth;
  const { signin, signup, isLoading, user } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    shouldUnregister: true,
  });

  const ctaLabel = useMemo(() => {
    if (isSubmitting) {
      return mode === "signin" ? copy.signingIn : copy.creating;
    }
    return mode === "signin" ? copy.signIn : copy.signUp;
  }, [copy.creating, copy.signIn, copy.signUp, copy.signingIn, mode, isSubmitting]);

  const onSubmit = async (data: AuthForm) => {
    setMessage(null);

    try {
      if (mode === "signin") {
        await signin(data.email, data.password);
        router.push("/");
        router.refresh();
      } else {
        await signup(data.email, data.username ?? "", data.password);
        setMode("signin");
        setMessage(copy.accountCreated);
      }
    } catch (submitError) {
      const messageText =
        submitError instanceof Error ? submitError.message : "Authentication failed.";
      setError("root", { message: messageText });
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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">{copy.email}</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="username">{copy.username}</Label>
                <Input
                  id="username"
                  type="text"
                  aria-invalid={!!errors.username}
                  {...register("username")}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">{copy.password}</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
            {message && <p className="text-sm text-emerald-500">{message}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
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
