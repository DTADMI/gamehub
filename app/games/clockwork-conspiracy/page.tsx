"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const Game = dynamicImport(
  () => import("@games/clockwork-conspiracy").then((m) => m.ClockworkConspiracyGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function ClockworkConspiracyPage() {
  return <Game />;
}
