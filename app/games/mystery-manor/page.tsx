"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const Game = dynamicImport(
  () => import("@games/mystery-manor").then((m) => m.MysteryManorGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function MysteryManorPage() {
  return <Game />;
}
