import { gqlFetch } from "./client";
// Deprecated simple fetch kept for backward compatibility by adapting to paged form
export async function fetchLeaderboard(params) {
    const data = await fetchLeaderboardPaged({
        gameType: params.gameType,
        first: params.limit ?? 25,
    });
    const entries = data.leaderboard.edges.map((e) => e.node);
    return { leaderboard: entries };
}
// New paginated leaderboard aligned with backend schema
export async function fetchLeaderboardPaged(params) {
    const query = `
    query Leaderboard(
      $gameType: GameType!,
      $scope: LeaderboardScope,
      $window: TimeWindow,
      $first: Int,
      $after: String
    ) {
      leaderboard(
        gameType: $gameType,
        scope: $scope,
        window: $window,
        first: $first,
        after: $after
      ) {
        edges {
          cursor
          node {
            rank
            score
            gameType
            user { id username avatar }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
    return gqlFetch({ query, variables: params });
}
export async function submitScore(params) {
    const mutation = `
    mutation SubmitScore($input: ScoreInput!) {
      submitScore(input: $input) {
        id
        score
        createdAt
        gameType
        user { id username }
      }
    }
  `;
    return gqlFetch({
        query: mutation,
        variables: { input: params },
    });
}
export async function createCheckout(input) {
    const mutation = `
      mutation CreateCheckout($input: CreateCheckoutInput!) {
        createCheckout(input: $input) { id url }
      }
    `;
    return gqlFetch({
        query: mutation,
        variables: { input },
    });
}
export async function fetchViewer() {
    const query = `
      query Viewer {
        viewer {
          id
          username
          avatar
          subscription { id userId plan status currentPeriodEnd }
          premium { advancedLeaderboards cosmetics earlyAccess }
        }
      }
    `;
    return gqlFetch({ query });
}
