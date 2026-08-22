// libfile:///score-submit.ts — Client-side score submission to server-backed leaderboard API

export async function submitScore(gameType: string, score: number, metadata?: Record<string, unknown>) {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameType, score, metadata }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Score submission failed (${res.status})`);
  }
  return res.json();
}

export async function fetchLeaderboard(gameType: string, limit = 10) {
  const res = await fetch(`/api/leaderboard?gameType=${encodeURIComponent(gameType)}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard (${res.status})`);
  }
  return res.json();
}