import { describe, expect, it } from "vitest";

import { resolveProgress, type ProgressRecord } from "../lib/progress";

const local: ProgressRecord<{ level: number }> = {
  gameId: "SNAKE",
  data: { level: 3 },
  updatedAt: "2026-10-01T10:00:00.000Z",
};
const remoteNewer: ProgressRecord<{ level: number }> = {
  gameId: "SNAKE",
  data: { level: 7 },
  updatedAt: "2026-10-02T10:00:00.000Z",
};
const localNewer: ProgressRecord<{ level: number }> = {
  gameId: "SNAKE",
  data: { level: 9 },
  updatedAt: "2026-10-03T10:00:00.000Z",
};

describe("resolveProgress", () => {
  it("renvoie null quand aucune copie n'existe", () => {
    expect(resolveProgress(null, null)).toBeNull();
  });

  it("prend la copie locale seule", () => {
    const result = resolveProgress(local, null);
    expect(result?.status).toBe("no_conflict");
    expect(result?.source).toBe("local");
    expect(result?.record).toEqual(local);
  });

  it("prend la copie distante seule", () => {
    const result = resolveProgress(null, remoteNewer);
    expect(result?.status).toBe("no_conflict");
    expect(result?.source).toBe("remote");
  });

  it("signale un local perime et garde le distant", () => {
    const result = resolveProgress(local, remoteNewer);
    expect(result?.status).toBe("conflict");
    expect(result?.source).toBe("remote");
    expect(result?.status === "conflict" && result.reason).toBe("stale_local");
    expect(result?.record).toEqual(remoteNewer);
  });

  it("signale un distant perime et garde le local", () => {
    const result = resolveProgress(localNewer, remoteNewer);
    expect(result?.status).toBe("conflict");
    expect(result?.source).toBe("local");
    expect(result?.status === "conflict" && result.reason).toBe("stale_remote");
    expect(result?.record).toEqual(localNewer);
  });

  it("ne signale rien quand les copies sont identiques", () => {
    const result = resolveProgress(local, { ...local });
    expect(result?.status).toBe("no_conflict");
    expect(result?.source).toBe("local");
  });

  it("signale un tie quand l'horodatage est egal mais le contenu differe", () => {
    const other = { ...local, data: { level: 4 } };
    const result = resolveProgress(local, other);
    expect(result?.status).toBe("conflict");
    expect(result?.source).toBe("remote");
    expect(result?.status === "conflict" && result.reason).toBe("tie");
    expect(result?.record).toEqual(other);
  });
});
