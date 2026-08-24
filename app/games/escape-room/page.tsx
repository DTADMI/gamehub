"use client";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import React from "react";

const EscapeRoom = dynamicImport(
  () => import("@games/escape-room").then((m) => m.EscapeRoomGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function EscapeRoomPage() {
  return <EscapeRoom />;
}