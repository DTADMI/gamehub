"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AuthProvider } from "../contexts/AuthContext";
import { FlagsProvider } from "../contexts/FlagsContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { SubscriptionProvider } from "../contexts/SubscriptionContext";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // In CI/E2E we want to avoid initializing Firebase/Auth and hitting the backend
  // because those external calls can cause client-side exceptions that break Playwright.
  // We still keep AuthProvider enabled so components calling `useAuth()` always have context.
  // IMPORTANT: Do NOT couple this to CI directly, because Next.js production
  // builds also run with CI=true in pipelines. Only disable when explicitly
  // requested via NEXT_PUBLIC_DISABLE_PROVIDERS (set by E2E runner).
  const disableExternalProviders = process.env.NEXT_PUBLIC_DISABLE_PROVIDERS === "true";

  if (disableExternalProviders) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FlagsProvider>
            <ProfileProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
              </ThemeProvider>
            </ProfileProvider>
          </FlagsProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <FlagsProvider>
            <ProfileProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
              </ThemeProvider>
            </ProfileProvider>
          </FlagsProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default Providers;
