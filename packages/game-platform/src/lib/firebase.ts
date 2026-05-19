// lib/firebase.ts
"use client";

const isBrowser = typeof window !== "undefined";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function validateConfig() {
  const missing: string[] = [];
  for (const [k, v] of Object.entries(config)) {
    if (!v && ["apiKey", "authDomain", "projectId", "appId"].includes(k)) {
      missing.push(`NEXT_PUBLIC_FIREBASE_${k.toUpperCase()}`);
    }
  }
  if (missing.length && isBrowser) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Missing Firebase envs:", missing);
    }
  }
}

let firebaseApp: any = null;

export async function getFirebaseApp() {
  if (!isBrowser) {
    return undefined;
  }
  validateConfig();
  if (firebaseApp) {return firebaseApp;}
  const { getApp, getApps, initializeApp } = await import("firebase/app");
  firebaseApp = getApps().length ? getApp() : initializeApp(config as any);
  return firebaseApp;
}

export async function getFireStore() {
  const app = await getFirebaseApp();
  if (!app) {return undefined;}
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

export async function getFirebaseAuth() {
  const app = await getFirebaseApp();
  if (!app) {return undefined;}
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}
