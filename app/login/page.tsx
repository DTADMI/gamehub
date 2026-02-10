"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Client-side only form to avoid hydration issues
const LoginForm = dynamic(() => import("./LoginForm"), {
  ssr: false,
});

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
