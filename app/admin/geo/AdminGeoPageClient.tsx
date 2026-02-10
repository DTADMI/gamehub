"use client";

import { useFeature } from "@games/shared/lib/flags";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Dynamically import the ThreeScene component with no SSR
const ThreeScene = dynamic(() => import("@games/shared/components/admin/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex aspect-video w-full max-w-5xl items-center justify-center rounded border bg-gray-900">
      <p className="text-white">Loading 3D viewer...</p>
    </div>
  ),
});

export default function AdminGeoPageClient() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isAdminFlag = useFeature("ADMIN", false);

  // This ensures the component only renders on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAdmin = isAdminFlag === true;

  useEffect(() => {
    // If not loading and not admin, redirect to home
    if (!isAdmin) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300">
            You need admin access to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="mb-6 text-3xl font-bold">3D Model Editor</h1>
        <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
          <ThreeScene />
        </div>
      </div>
    </div>
  );
}
