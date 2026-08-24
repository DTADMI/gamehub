"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const DungeonDelver = dynamicImport(
  () => import("@games/dungeon-delver").then((m) => m.DungeonDelverGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function DungeonDelverPage() {
  return <DungeonDelver />;
}