"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const ChronoShift = dynamicImport(
  () => import("@games/chrono-shift").then((m) => m.ChronoShiftGame),
  { ssr: false, loading: () => <LoadingShell message="Loading ChronoShift..." /> },
);

export default function ChronoShiftPage() {
  return <ChronoShift />;
}
