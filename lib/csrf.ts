import type { NextResponse } from "next/server";

export function validateCsrf(request: Request): boolean {
  const host = request.headers.get("host") ?? "";
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return false;
  }

  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      if (new URL(referer).host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set("csrf-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
}
