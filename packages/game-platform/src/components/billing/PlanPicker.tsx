"use client";

import React, { useState } from "react";

import { createCheckout, Plan } from "../../lib/graphql/queries";

export type BillingPlan = "WEEKLY" | "MONTHLY" | "YEARLY" | "LIFETIME";

type PlanCardProps = {
  title: string;
  price: string;
  period?: string;
  features: string[];
  recommended?: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

function PlanCard({
  title,
  price,
  period,
  features,
  recommended,
  onSelect,
  disabled,
}: PlanCardProps) {
  return (
    <div
      className={`bg-card text-card-foreground flex flex-col rounded-xl border p-6 shadow-sm ${recommended ? "ring-primary/30 ring-2" : ""}`}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {recommended && (
          <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">
            Recommended
          </span>
        )}
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground ml-1">/{period}</span>}
      </div>
      <ul className="mb-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="bg-primary/70 mt-1 inline-block size-1.5 rounded-full" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        onClick={onSelect}
        disabled={disabled}
      >
        {disabled ? "Coming soon" : "Select"}
      </button>
    </div>
  );
}

export default function PlanPicker() {
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null);
  const [error, setError] = useState<string>("");

  async function handleSelect(plan: BillingPlan) {
    try {
      setLoadingPlan(plan);
      setError("");
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      // Map BillingPlan to Plan
      const planMapping: Record<BillingPlan, Plan> = {
        WEEKLY: "PRO",
        MONTHLY: "PRO",
        YEARLY: "PRO",
        LIFETIME: "PRO",
      };

      const res = await createCheckout({
        plan: planMapping[plan],
        returnUrl: `${origin}/account/subscribe/success`,
        cancelUrl: `${origin}/account/subscribe`,
      });
      const url = res?.createCheckout?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      console.warn("Checkout create failed", e);
      setError(e?.message || "Failed to start checkout");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Choose your plan</h2>
        <p className="text-muted-foreground">
          Upgrade to unlock advanced leaderboards, cosmetics, and early access.
        </p>
      </div>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PlanCard
          title="Weekly"
          price="$2.99"
          period="week"
          features={["Advanced leaderboards", "Cosmetic themes", "Early access"]}
          onSelect={() => handleSelect("WEEKLY")}
          recommended={false}
          disabled={loadingPlan !== null}
        />
        <PlanCard
          title="Monthly"
          price="$7.99"
          period="month"
          features={["Advanced leaderboards", "Cosmetic themes", "Early access"]}
          onSelect={() => handleSelect("MONTHLY")}
          recommended
          disabled={loadingPlan !== null}
        />
        <PlanCard
          title="Yearly"
          price="$79.99"
          period="year"
          features={["2 months free", "Advanced leaderboards", "Cosmetic themes"]}
          onSelect={() => handleSelect("YEARLY")}
          recommended={false}
          disabled={loadingPlan !== null}
        />
        <PlanCard
          title="Lifetime"
          price="$199"
          features={["One-time purchase", "All premium features"]}
          onSelect={() => handleSelect("LIFETIME")}
          recommended={false}
          disabled={loadingPlan !== null}
        />
      </div>
      <p className="text-muted-foreground text-center text-xs">
        Prices are placeholders in test mode. Taxes may apply at checkout.
      </p>
    </div>
  );
}
