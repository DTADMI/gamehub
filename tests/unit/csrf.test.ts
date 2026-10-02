// Tests du garde CSRF (lib/csrf.ts) : un controle de securite qui decide si une
// requete mutante est acceptee. Un faux negatif ici casse l application, un faux
// positif ouvre une faille ; les deux doivent etre verrouilles par un test.
import { describe, expect, it } from "vitest";

import { generateCsrfToken, validateCsrf } from "../../lib/csrf";

function req(headers: Record<string, string>): Request {
  return new Request("https://gamehub.test/api/x", { headers });
}

describe("validateCsrf", () => {
  it("refuse quand ni Origin ni Referer ne sont fournis", () => {
    expect(validateCsrf(req({ host: "gamehub.test" }))).toBe(false);
  });

  it("accepte un Origin dont l hote correspond", () => {
    expect(validateCsrf(req({ host: "gamehub.test", origin: "https://gamehub.test" }))).toBe(true);
  });

  it("refuse un Origin dont l hote differe", () => {
    expect(validateCsrf(req({ host: "gamehub.test", origin: "https://evil.test" }))).toBe(false);
  });

  it("refuse un Origin non analysable", () => {
    expect(validateCsrf(req({ host: "gamehub.test", origin: "not a url" }))).toBe(false);
  });

  it("accepte un Referer seul quand l hote correspond", () => {
    expect(validateCsrf(req({ host: "gamehub.test", referer: "https://gamehub.test/games" }))).toBe(true);
  });

  it("refuse un Referer dont l hote differe", () => {
    expect(validateCsrf(req({ host: "gamehub.test", referer: "https://evil.test/x" }))).toBe(false);
  });

  it("refuse si Origin est bon mais Referer mauvais", () => {
    expect(
      validateCsrf(req({ host: "gamehub.test", origin: "https://gamehub.test", referer: "https://evil.test/x" })),
    ).toBe(false);
  });

  it("refuse quand le host est absent", () => {
    expect(validateCsrf(req({ origin: "https://gamehub.test" }))).toBe(false);
  });
});

describe("generateCsrfToken", () => {
  it("produit un identifiant non vide et unique", () => {
    const a = generateCsrfToken();
    const b = generateCsrfToken();
    expect(a.length).toBeGreaterThan(10);
    expect(a).not.toBe(b);
  });
});
