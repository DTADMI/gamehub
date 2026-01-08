"use client";

import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getFirebaseApp } from "../lib/firebase";

export default function LogoutButton() {
  const router = useRouter();

  const app = getFirebaseApp();

  const handleLogout = async () => {
    try {
      if (!app) {
        console.error("Firebase app not initialized");
        router.push("/login");
        return;
      }

      const auth = getAuth(app);
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect to login even if there's an error
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-red-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
      aria-label="Sign out"
    >
      Sign Out
    </button>
  );
}
