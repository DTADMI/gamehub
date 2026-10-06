"use client";

import { Button } from "@gamehub/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

type AdminTopBarProps = {
  email?: string | null;
  role?: string | null;
};

export function AdminTopBar({ email, role }: AdminTopBarProps) {
  // NF-UX-FEEDBACK : une deconnexion est un appel reseau, elle doit se voir.
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div>
        <p className="text-sm text-muted-foreground">Signed in</p>
        <p className="text-base font-medium">{email ?? "Admin"}</p>
        {role ? (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Role: {role}</p>
        ) : null}
      </div>
      <Button
        variant="outline"
        disabled={signingOut}
        aria-busy={signingOut}
        onClick={async () => {
          setSigningOut(true);
          try {
            const supabase = createBrowserClient();
            await supabase.auth.signOut();
            router.push("/admin/sign-in");
            router.refresh();
          } finally {
            setSigningOut(false);
          }
        }}
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}
