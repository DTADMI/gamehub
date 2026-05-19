"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const RiteOfDiscovery = dynamicImport(
  () => import("@games/rite-of-discovery").then((m) => m.RiteOfDiscoveryGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function RiteOfDiscoveryPage() {
  return <RiteOfDiscovery />;
}



