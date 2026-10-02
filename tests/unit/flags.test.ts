// Tests de la lecture des drapeaux d environnement (B2). readEnv est le repli local
// d un drapeau de fonctionnalite : il lit NEXT_PUBLIC_FEATURE_*, puis une propriete
// globale, puis la valeur par defaut. Une inversion ici activerait une fonctionnalite
// non voulue (ou l inverse) sur une machine sans backend.
import { afterEach, describe, expect, it } from "vitest";

import { readEnv } from "../../packages/game-platform/src/lib/flags";

const KEYS = ["NEXT_PUBLIC_FEATURE_ALPHA", "NEXT_PUBLIC_FEATURE_BETA"];

afterEach(() => {
  for (const key of KEYS) {
    delete process.env[key];
    delete (window as unknown as Record<string, unknown>)[key];
  }
});

describe("readEnv", () => {
  it("renvoie la valeur par defaut si le drapeau est absent", () => {
    expect(readEnv("alpha")).toBe(false);
    expect(readEnv("alpha", true)).toBe(true);
  });

  it("lit process.env en priorite", () => {
    process.env.NEXT_PUBLIC_FEATURE_ALPHA = "true";
    expect(readEnv("alpha")).toBe(true);
  });

  it("ne considere vrai que la chaine true", () => {
    process.env.NEXT_PUBLIC_FEATURE_ALPHA = "false";
    expect(readEnv("alpha")).toBe(false);
    process.env.NEXT_PUBLIC_FEATURE_ALPHA = "1";
    expect(readEnv("alpha")).toBe(false);
  });

  it("retombe sur une propriete globale quand l environnement ne la definit pas", () => {
    (window as unknown as Record<string, unknown>).NEXT_PUBLIC_FEATURE_BETA = "true";
    expect(readEnv("beta")).toBe(true);
  });
});
