import { POST as submitLeaderboardScore } from "@/app/api/leaderboard/submit/route";

export async function POST(request: Request) {
  return submitLeaderboardScore(request);
}
