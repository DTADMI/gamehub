// Centralized, typed accessors for public contact/profile env vars.

function readPublicEnv(key: string, fallback = ""): string {
  const env = process.env as unknown as Record<string, string | undefined>;
  return env[key] ?? fallback;
}

export const GITHUB_URL: string = readPublicEnv("NEXT_PUBLIC_GITHUB_URL", "https://github.com/DTADMI");
export const LINKEDIN_URL: string = readPublicEnv("NEXT_PUBLIC_LINKEDIN_URL", "");
export const CONTACT_EMAIL: string = readPublicEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");

export function mailto(email?: string): string {
  const e = (email ?? CONTACT_EMAIL).trim();
  if (!e) return "#";
  return `mailto:${e}`;
}
