"use client";

import Link from "next/link";

export default function DashboardGate() {
  // This page exists primarily to exercise middleware-based redirects in E2E.
  // When not redirected (e.g., in E2E public mode), show a simple stub.
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white/70 p-6 dark:border-gray-800 dark:bg-gray-900/50">
        <h1 className="mb-2 text-xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mb-4 text-sm">
          This is a protected area. In production you should be redirected to Login.
        </p>
        <p className="text-sm">
          Go to{" "}
          <Link className="underline" href="/login">
            Login
          </Link>{" "}
          or{" "}
          <Link className="underline" href="/">
            Home
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
