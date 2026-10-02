// Tests de la lecture d'IP (lib/rate-limit.ts). Cette fonction alimente la cle de
// limitation de debit : si elle se trompe, deux clients derriere un proxy partagent
// (ou evitent) la meme limite. Elle est pure, donc testable sans reseau.
import { describe, expect, it } from "vitest";

import { clientIpFromHeaders } from "../../lib/rate-limit";

function h(headers: Record<string, string>): Headers {
  return new Headers(headers);
}

describe("clientIpFromHeaders", () => {
  it("prend la premiere IP de x-forwarded-for", () => {
    expect(clientIpFromHeaders(h({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("retire les espaces autour de l IP", () => {
    expect(clientIpFromHeaders(h({ "x-forwarded-for": "  203.0.113.7  " }))).toBe("203.0.113.7");
  });

  it("retombe sur x-real-ip si x-forwarded-for est absent", () => {
    expect(clientIpFromHeaders(h({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("renvoie unknown si aucun en-tete", () => {
    expect(clientIpFromHeaders(h({}))).toBe("unknown");
  });

  it("renvoie unknown si x-forwarded-for est vide", () => {
    expect(clientIpFromHeaders(h({ "x-forwarded-for": "" }))).toBe("unknown");
  });

  it("ignore une premiere entree vide de x-forwarded-for", () => {
    expect(clientIpFromHeaders(h({ "x-forwarded-for": ", 10.0.0.1" }))).toBe("unknown");
  });
});
