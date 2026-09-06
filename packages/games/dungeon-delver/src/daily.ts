/**
 * Daily Challenge mode for Dungeon Delver
 *
 * Seeded run based on YYYY-MM-DD. Same seed = same dungeon for all players.
 * One attempt per day. Separate leaderboard.
 */

// ─── Seeded PRNG (mulberry32) ──────────────────────────────────

/** Deterministic 32-bit hash of a string */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash >>> 0; // unsigned
}

/** Mulberry32 PRNG — fast, good distribution for game use */
export function createSeededRng(seed: number) {
  let state = seed;
  return function random(): number {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Get today's seed string "YYYY-MM-DD" */
export function getDailySeed(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Get a deterministic numeric seed from the date */
export function getDailySeedNumber(): number {
  return hashString(getDailySeed());
}

/** Check if player has already attempted today's challenge */
export function hasDailyAttempt(): boolean {
  try {
    const today = getDailySeed();
    const stored = localStorage.getItem("dd-daily-date");
    return stored === today;
  } catch {
    return false;
  }
}

/** Mark today's challenge as attempted */
export function markDailyAttempt(): void {
  try {
    localStorage.setItem("dd-daily-date", getDailySeed());
  } catch { /* ignore */ }
}

/** Get today's best score (optional local cache) */
export function getTodayBest(): number {
  try {
    const best = localStorage.getItem("dd-daily-best");
    return best ? parseInt(best, 10) : 0;
  } catch {
    return 0;
  }
}

/** Save today's best score */
export function setTodayBest(score: number): void {
  try {
    localStorage.setItem("dd-daily-best", String(score));
    localStorage.setItem("dd-daily-date-score", getDailySeed());
  } catch { /* ignore */ }
}