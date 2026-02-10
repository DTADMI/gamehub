"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Auth not connected yet - just show a message
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-2xl border p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Sign in to track scores, compete on leaderboards, and unlock extra features.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          <Link href="/games" className="text-primary hover:underline">
            Play as guest
          </Link>
        </p>
      </div>
    </div>
  );
}
