"use client";

import { Button } from "@gamehub/ui";
import { signIn, signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  if (!session) {
    return (
      <Button variant="outline" onClick={() => signIn()}>
        Sign in
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{session.user?.email || session.user?.name}</span>
      <Button variant="ghost" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
