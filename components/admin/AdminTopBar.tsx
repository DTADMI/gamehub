"use client";

import { Button } from "@gamehub/ui";
import { useRouter } from "next/navigation";

import { createBrowserClient } from "@/lib/supabase/client";

type AdminTopBarProps = {
  email?: string | null;
};

export function AdminTopBar({ email }: AdminTopBarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div>
        <p className="text-sm text-muted-foreground">Signed in</p>
        <p className="text-base font-medium">{email ?? "Admin"}</p>
      </div>
      <Button
        variant="outline"
        onClick={async () => {
          const supabase = createBrowserClient();
          await supabase.auth.signOut();
          router.push("/admin/sign-in");
          router.refresh();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
