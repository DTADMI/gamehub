"use client";

import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@gamehub/ui";
import { ShellWrapper } from "@gamehub/ui/components/shell";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type AdminRole, adminRoleMatrix, canWriteFeatureFlags } from "@/lib/admin/roles";
import { type FeatureFlags, type FlagType, flattenFlags } from "@/lib/feature-flags";

type DefinitionRow = ReturnType<typeof flattenFlags>[number];

type AdminFlagsResponse = {
  flags: FeatureFlags;
  role: AdminRole;
  definitions: DefinitionRow[];
};

type AuditEntry = {
  id: string;
  flag_path: string;
  old_value: unknown;
  new_value: unknown;
  actor_user_id: string | null;
  actor_role: string;
  request_ip: string | null;
  user_agent: string | null;
  created_at: string;
};

const stringOptions = {
  "auth.postGameCTAFrequency": ["always", "occasional", "rare", "never"],
} satisfies Record<string, string[]>;

function hasStringOptions(path: string): path is keyof typeof stringOptions {
  return path in stringOptions;
}

function FlagTypeBadge({ type }: { type: FlagType }) {
  const variant =
    type === "percentage"
      ? ("default" as const)
      : type === "user_list"
        ? ("secondary" as const)
        : type === "subscription_tier"
          ? ("outline" as const)
          : ("secondary" as const);
  return (
    <Badge variant={variant} className="ml-1 text-[10px]">
      {type}
    </Badge>
  );
}

export default function AdminFlagsPage() {
  const { setFlagPath, refreshFromServer } = useFlags();
  const [loading, setLoading] = useState(true);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>("analyst");
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [definitions, setDefinitions] = useState<DefinitionRow[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const e2eHeaders = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("e2e_admin") === "1" ? ({ "x-e2e-admin": "1" } as const) : undefined;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/feature-flags", {
        cache: "no-store",
        headers: e2eHeaders,
      });
      if (!response.ok) {
        throw new Error(`Failed to load flags (${response.status})`);
      }
      const payload = (await response.json()) as AdminFlagsResponse;
      setRole(payload.role);
      setFlags(payload.flags);
      setDefinitions(payload.definitions);

      const auditResponse = await fetch("/api/admin/feature-flags/audit?limit=20", {
        cache: "no-store",
        headers: e2eHeaders,
      });
      if (auditResponse.ok) {
        const auditPayload = (await auditResponse.json()) as { audit?: AuditEntry[] };
        setAudit(auditPayload.audit ?? []);
      } else {
        setAudit([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load flags");
      setAudit([]);
    } finally {
      setLoading(false);
    }
  }, [e2eHeaders]);

  useEffect(() => {
    void load();
  }, [load]);

  const matrix = useMemo(() => adminRoleMatrix(), []);

  const updateFlag = async (path: string, body: Record<string, unknown>) => {
    setSavingPath(path);
    setError(null);

    try {
      const response = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(e2eHeaders ?? {}),
        },
        body: JSON.stringify({ path, ...body }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? `Failed to update ${path}`);
      }

      if (typeof body.value !== "undefined") {
        setFlagPath(path, body.value);
      }
      await refreshFromServer();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingPath(null);
    }
  };

  const renderFlagControl = (row: DefinitionRow) => {
    const canWrite = canWriteFeatureFlags(role, row.path);
    const isSaving = savingPath === row.path;
    const disabled = !canWrite || isSaving;

    if (hasStringOptions(row.path)) {
      return (
        <div className="w-44">
          <Label htmlFor={`flag-${row.path}`} className="sr-only">
            {row.label}
          </Label>
          <Select
            value={String(row.value)}
            disabled={disabled}
            onValueChange={(nextValue) =>
              void updateFlag(row.path, { value: nextValue })
            }
          >
            <SelectTrigger id={`flag-${row.path}`}>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {stringOptions[row.path].map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    switch (row.type) {
      case "boolean":
        return (
          <Switch
            checked={Boolean(row.value)}
            disabled={disabled}
            onCheckedChange={(nextValue) =>
              void updateFlag(row.path, { value: Boolean(nextValue), enabled: Boolean(nextValue) })
            }
            aria-label={row.label}
          />
        );

      case "percentage":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={Boolean(row.value) || row.enabled}
              disabled={disabled}
              onCheckedChange={(nextValue) =>
                void updateFlag(row.path, { value: nextValue ? row.percentage || 0 : 0, enabled: nextValue })
              }
              aria-label={`${row.label} enabled`}
            />
            <Input
              type="number"
              min={0}
              max={100}
              className="w-20"
              value={typeof row.value === "number" ? row.value : row.percentage}
              disabled={disabled}
              onChange={(e) => {
                const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                void updateFlag(row.path, { value: pct, percentage: pct });
              }}
            />
            <span className="text-muted-foreground text-xs">%</span>
          </div>
        );

      case "user_list":
        return (
          <div className="flex flex-col gap-2">
            <Switch
              checked={Boolean(row.value) || row.enabled}
              disabled={disabled}
              onCheckedChange={(nextValue) =>
                void updateFlag(row.path, { value: nextValue ? row.userIds : [], enabled: nextValue })
              }
              aria-label={`${row.label} enabled`}
            />
            <Input
              className="w-52"
              placeholder="user1, user2, ..."
              value={
                Array.isArray(row.value)
                  ? (row.value as string[]).join(", ")
                  : row.userIds.join(", ")
              }
              disabled={disabled}
              onChange={(e) => {
                const ids = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                void updateFlag(row.path, { value: ids, userIds: ids });
              }}
            />
          </div>
        );

      case "subscription_tier":
        return (
          <div className="flex flex-col gap-2">
            <Switch
              checked={Boolean(row.value) || row.enabled}
              disabled={disabled}
              onCheckedChange={(nextValue) =>
                void updateFlag(row.path, { value: nextValue ? row.subscriptionTiers : [], enabled: nextValue })
              }
              aria-label={`${row.label} enabled`}
            />
            <Input
              className="w-52"
              placeholder="free, premium, ..."
              value={
                Array.isArray(row.value)
                  ? (row.value as string[]).join(", ")
                  : row.subscriptionTiers.join(", ")
              }
              disabled={disabled}
              onChange={(e) => {
                const tiers = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                void updateFlag(row.path, { value: tiers, subscriptionTiers: tiers });
              }}
            />
          </div>
        );

      default:
        return (
          <code className="text-muted-foreground text-xs">
            {JSON.stringify(row.value)}
          </code>
        );
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Feature Flags</h1>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Flags are persisted server-side in Supabase and audited on change. Sensitive flags require
          elevated roles.
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Role: {role}</Badge>
          <Badge variant="outline">Audit enabled</Badge>
        </div>
      </section>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="text-destructive py-4 text-sm">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Flag Controls</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <ShellWrapper isLoading={loading} loadingMessage="Loading flags...">
            {definitions.map((row) => {
              const canWrite = canWriteFeatureFlags(role, row.path);
              return (
                <div key={row.path} className="flex items-start justify-between gap-4 rounded-md border p-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="font-medium">{row.label}</p>
                      <FlagTypeBadge type={row.type} />
                    </div>
                    <p className="text-muted-foreground text-xs">{row.description}</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted rounded px-1.5 py-0.5 text-[11px]">{row.path}</code>
                      {row.sensitive ? <Badge variant="destructive">Sensitive</Badge> : null}
                      {!canWrite ? (
                        <Badge variant="outline" className="text-[10px]">
                          Read-only
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {renderFlagControl(row)}
                </div>
              );
            })}
          </ShellWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Admin Access</th>
                <th className="py-2 pr-4">Edit Content</th>
                <th className="py-2 pr-4">Manage Flags</th>
                <th className="py-2 pr-4">Sensitive Flags</th>
                <th className="py-2 pr-4">Leaderboard Moderation</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.role} className="border-t align-top">
                  <td className="py-2 pr-4 font-medium uppercase">{row.role}</td>
                  <td className="py-2 pr-4">{row.canAccessAdmin ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{row.canEditContent ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{row.canManageFlags ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{row.canManageSensitiveFlags ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{row.canModerateLeaderboard ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Audit Timeline</CardTitle>
          <Button asChild size="sm" variant="outline">
            <a href="/api/admin/feature-flags/audit?format=csv&limit=500">Export CSV</a>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {audit.slice(0, 12).map((row) => (
            <div key={row.id} className="rounded-md border p-2 text-xs">
              <p className="font-medium">{row.flag_path}</p>
              <p className="text-muted-foreground">
                {new Date(row.created_at).toLocaleString()} - {row.actor_role}
              </p>
              <p className="text-muted-foreground">
                {JSON.stringify(row.old_value)}
                {" -> "}
                {JSON.stringify(row.new_value)}
              </p>
            </div>
          ))}
          {audit.length === 0 ? (
            <p className="text-muted-foreground text-xs">No audit events found.</p>
          ) : null}
          {definitions.length > 0 ? (
            <p className="text-muted-foreground text-xs">Tracked flags: {definitions.length}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
