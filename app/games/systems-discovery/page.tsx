"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const SystemsDiscovery = dynamicImport(
  () => import("@games/systems-discovery").then((m) => m.SystemsDiscoveryGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function SystemsDiscoveryPage() {
  return <SystemsDiscovery />;
}



