"use client";

import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Switch } from "@gamehub/ui";

const flagDefinitions = [
  {
    key: "sdBodEnabled",
    label: "Systems Discovery - Body Systems bundle",
    description: "Master switch for Body Systems content visibility in the games catalog.",
  },
  {
    key: "sdBodBreath",
    label: "Body Systems: Breath",
    description: "Enable the Breath sub-pack.",
  },
  {
    key: "sdBodFuel",
    label: "Body Systems: Fuel",
    description: "Enable the Fuel sub-pack.",
  },
  {
    key: "sdBodMove",
    label: "Body Systems: Move",
    description: "Enable the Move sub-pack.",
  },
  {
    key: "sdBodSignal",
    label: "Body Systems: Signal",
    description: "Enable the Signal sub-pack.",
  },
  {
    key: "sdBodGrow",
    label: "Body Systems: Grow",
    description: "Enable the Grow sub-pack.",
  },
] as const;

export default function AdminFlagsPage() {
  const { flags, setFlag, reset } = useFlags();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Feature Flags</h1>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Pilot gameplay visibility and rollout behavior from this panel. These toggles are currently
          local/browser-scoped and are intended for controlled QA and admin experimentation.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Flag Controls</CardTitle>
          <Badge variant="secondary">Local Scope</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {flagDefinitions.map((flagDef) => (
            <div key={flagDef.key} className="flex items-start justify-between gap-4 rounded-md border p-3">
              <div className="space-y-1">
                <p className="font-medium">{flagDef.label}</p>
                <p className="text-muted-foreground text-xs">{flagDef.description}</p>
              </div>
              <Switch
                checked={Boolean(flags[flagDef.key])}
                onCheckedChange={(nextValue) => setFlag(flagDef.key, Boolean(nextValue))}
                aria-label={flagDef.label}
              />
            </div>
          ))}

          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium">Allow local play for upcoming games</p>
              <p className="text-muted-foreground text-xs">
                Lets admins/testers launch upcoming-but-implemented games locally without production rollout.
              </p>
            </div>
            <Switch
              checked={Boolean(flags.ui?.allowPlayUpcomingLocal)}
              onCheckedChange={(nextValue) =>
                setFlag("ui", {
                  ...(flags.ui ?? {}),
                  allowPlayUpcomingLocal: Boolean(nextValue),
                })
              }
              aria-label="Allow local play for upcoming games"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium">Enhanced game cards</p>
              <p className="text-muted-foreground text-xs">
                Enables animated card visuals and richer card metadata on home and explore pages.
              </p>
            </div>
            <Switch
              checked={Boolean(flags.ui?.enhancedGameCards)}
              onCheckedChange={(nextValue) =>
                setFlag("ui", {
                  ...flags.ui,
                  enhancedGameCards: Boolean(nextValue),
                })
              }
              aria-label="Enhanced game cards"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium">Enhanced carousel</p>
              <p className="text-muted-foreground text-xs">
                Enables carousel dots, keyboard navigation, and optional autoplay behavior.
              </p>
            </div>
            <Switch
              checked={Boolean(flags.ui?.enhancedCarousel)}
              onCheckedChange={(nextValue) =>
                setFlag("ui", {
                  ...flags.ui,
                  enhancedCarousel: Boolean(nextValue),
                })
              }
              aria-label="Enhanced carousel"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium">Hero animation</p>
              <p className="text-muted-foreground text-xs">
                Enables progressive entry animations for homepage hero and related call-to-action blocks.
              </p>
            </div>
            <Switch
              checked={Boolean(flags.ui?.animatedHero)}
              onCheckedChange={(nextValue) =>
                setFlag("ui", {
                  ...flags.ui,
                  animatedHero: Boolean(nextValue),
                })
              }
              aria-label="Hero animation"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium">Shimmer loading states</p>
              <p className="text-muted-foreground text-xs">
                Uses shimmer skeletons for game and project loading placeholders.
              </p>
            </div>
            <Switch
              checked={Boolean(flags.ui?.shimmerSkeletons)}
              onCheckedChange={(nextValue) =>
                setFlag("ui", {
                  ...flags.ui,
                  shimmerSkeletons: Boolean(nextValue),
                })
              }
              aria-label="Shimmer loading states"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div className="space-y-1">
              <p className="font-medium">Leaderboard guest teaser</p>
              <p className="text-muted-foreground text-xs">
                Shows a blurred leaderboard preview with contextual sign-in call-to-action to guests.
              </p>
            </div>
            <Switch
              checked={Boolean(flags.auth?.leaderboardGuestTeaser)}
              onCheckedChange={(nextValue) =>
                setFlag("auth", {
                  ...flags.auth,
                  leaderboardGuestTeaser: Boolean(nextValue),
                })
              }
              aria-label="Leaderboard guest teaser"
            />
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={reset}>
              Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
