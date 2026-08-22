"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "./AuthContext";

export type Plan = "FREE" | "PRO";

type Subscription = {
  id: string;
  plan: Plan;
  status: string;
  currentPeriodEnd?: string;
};

interface SubscriptionContextType {
  subscription: Subscription | null;
  plan: Plan;
  isLoading: boolean;
  loading: boolean;
  error: Error | null;
  entitlements: { advancedLeaderboards: boolean; cosmetics: boolean; earlyAccess: boolean };
  refresh: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    if (!user) {
      setSubscription(null);
      return;
    }
    // In-memory default: free tier for all authenticated users
    setSubscription({
      id: user.id ?? "default",
      plan: "FREE",
      status: "active",
    });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan = useMemo(() => subscription?.plan ?? "FREE", [subscription]);

  return (
    <SubscriptionContext.Provider value={{
      subscription, plan, isLoading, error, refresh,
      loading: isLoading,
      entitlements: { advancedLeaderboards: false, cosmetics: false, earlyAccess: false },
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

export { SubscriptionContext };