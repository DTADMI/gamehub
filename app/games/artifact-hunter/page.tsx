"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const Game = dynamicImport(
  () => import("@games/artifact-hunter").then((m) => m.ArtifactHunterGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function ArtifactHunterPage() {
  return <Game />;
}
