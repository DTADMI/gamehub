"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setLoading(false);
      setError("Password must include upper, lower case letters and a number.");
      return;
    }
    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Registration failed");
      }
      // After signup, sign in with credentials and let NextAuth handle the redirect
      await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="bg-card/90 text-card-foreground w-full max-w-md rounded-2xl border border-transparent p-8 shadow-lg backdrop-blur-sm">
        <h1 className="text-foreground mb-2 text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Sign up to save progress, post scores and access more features.
        </p>
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="text-foreground mb-1 block text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="focus:ring-ring w-full rounded-md border bg-white px-3 py-2 focus:ring-2 focus:outline-none dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-foreground mb-1 block text-sm">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              type="text"
              className="focus:ring-ring w-full rounded-md border bg-white px-3 py-2 focus:ring-2 focus:outline-none dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-foreground mb-1 block text-sm">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              className="focus:ring-ring w-full rounded-md border bg-white px-3 py-2 focus:ring-2 focus:outline-none dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-foreground mb-1 block text-sm">Confirm Password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              type="password"
              className="focus:ring-ring w-full rounded-md border bg-white px-3 py-2 focus:ring-2 focus:outline-none dark:bg-gray-900"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-accent hover:underline" href="/login">
              Sign in
            </Link>
          </p>
          <Link className="text-indigo-600 hover:underline" href="/games">
            Play as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
