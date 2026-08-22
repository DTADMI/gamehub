"use client";

import React, { useState } from "react";

export type Plan = "FREE" | "PRO";

export type BillingPlan = "WEEKLY" | "MONTHLY" | "YEARLY" | "LIFETIME";

type PlanCardProps = {
  title: string;
  price: string;
  period?: string;
  features: string[];
  plan: BillingPlan;
  selected: boolean;
  onSelect: (plan: BillingPlan) => void;
};

function PlanCard({ title, price, period, features, plan, selected, onSelect }: PlanCardProps) {
  return (
    <div
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
        selected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 hover:border-gray-400"
      }`}
      onClick={() => onSelect(plan)}
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-2 text-2xl font-extrabold">
        {price}
        {period && <span className="text-sm font-normal text-muted-foreground">/{period}</span>}
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PlanPicker() {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>("MONTHLY");

  const plans: PlanCardProps[] = [
    {
      title: "Weekly", price: "$4.99", period: "wk",
      features: ["Full access", "Leaderboards", "No ads"],
      plan: "WEEKLY", selected: selectedPlan === "WEEKLY",
      onSelect: setSelectedPlan,
    },
    {
      title: "Monthly", price: "$9.99", period: "mo",
      features: ["Full access", "Leaderboards", "No ads", "Save 20%"],
      plan: "MONTHLY", selected: selectedPlan === "MONTHLY",
      onSelect: setSelectedPlan,
    },
    {
      title: "Yearly", price: "$59.99", period: "yr",
      features: ["Full access", "Leaderboards", "No ads", "Save 50%"],
      plan: "YEARLY", selected: selectedPlan === "YEARLY",
      onSelect: setSelectedPlan,
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Choose your plan</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.plan} {...p} />
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        All plans include a 7-day free trial. Cancel anytime.
      </div>
    </div>
  );
}