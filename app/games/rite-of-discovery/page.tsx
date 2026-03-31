"use client";
import dynamicImport from "next/dynamic";
import React from "react";

const RiteOfDiscovery = dynamicImport(
  () => import("@games/rite-of-discovery").then((m) => m.RiteOfDiscoveryGame),
  { ssr: false, loading: () => <div className="p-8">Loading…</div> },
);

export default function RiteOfDiscoveryPage() {
  return <RiteOfDiscovery />;
}



