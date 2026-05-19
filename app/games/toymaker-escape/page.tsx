"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const ToymakerEscape = dynamicImport(
  () => import("@games/toymaker-escape").then((m) => m.ToymakerEscapeGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function ToymakerEscapePage() {
  return <ToymakerEscape />;
}



