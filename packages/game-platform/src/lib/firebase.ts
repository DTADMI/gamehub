// lib/firebase.ts – stub for v0/Vercel deployment (no Firebase SDK configured)
// The actual Firebase integration requires env vars and the firebase package.
// This stub ensures the barrel export doesn't break at compile time.
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getFirebaseApp(): any {
  return undefined;
}

export function getFireStore(): any {
  return undefined;
}

export function getFirebaseAuth(): any {
  return undefined;
}
