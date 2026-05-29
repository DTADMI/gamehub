"use client";
import { getGame, isGameLaunchable } from "@gamehub/game-platform";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import dynamic from "next/dynamic";

const BlockBlastGame = dynamic(
  () => getGame("block-blast")!.getComponent(),
  { ssr: false },
);

export default function BlockBlastPage() {
  const { flags } = useFlags();
  const entry = getGame("block-blast")!;
  const isNonProd =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
  const allowUpcomingLocal =
    ((typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" &&
      isNonProd) ||
      !!flags.ui?.allowPlayUpcomingLocal) &&
    isGameLaunchable(entry);
  const flagEnabled = !!flags.games?.blockBlast;

  const isPlayable = (entry.upcoming && allowUpcomingLocal) || (!entry.upcoming && flagEnabled);

  if (!isPlayable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="rounded-md border bg-amber-50 p-4 dark:bg-amber-900/20">
          This game is marked as <b>Coming Soon</b>.
        </div>
        <div className="text-muted-foreground mt-3 text-xs">
          Feature flag <code>games.blockBlast</code> is off.
        </div>
      </div>
    );
  }

  return <BlockBlastGame />;
}
