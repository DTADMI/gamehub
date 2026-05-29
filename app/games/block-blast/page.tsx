"use client";
import { getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";

const BlockBlastGame = dynamic(
  () => {
    const entry = getGame("block-blast");
    if (!entry || !isGameLaunchable(entry)) {
      return Promise.reject(new Error("not_playable"));
    }
    if (entry.upcoming && !process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL) {
      return Promise.reject(new Error("upcoming_gated"));
    }
    return entry.getComponent();
  },
  { loading: () => <LoadingShell variant="spinner" /> },
);

export default function BlockBlastPage() {
  return <BlockBlastGame />;
}
