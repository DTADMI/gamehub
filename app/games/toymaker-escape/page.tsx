"use client";
import dynamicImport from "next/dynamic";
import React from "react";

const ToymakerEscape = dynamicImport(
  () => import("@games/toymaker-escape").then((m) => m.ToymakerEscapeGame),
  { ssr: false, loading: () => <div className="p-8">Loading…</div> },
);

export default function ToymakerEscapePage() {
  return <ToymakerEscape />;
}



