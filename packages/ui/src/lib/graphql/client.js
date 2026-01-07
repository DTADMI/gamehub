// Minimal GraphQL client used by the app to talk to the backend GraphQL API
// It posts JSON to `${API_BASE}/graphql` where API_BASE is NEXT_PUBLIC_API_URL without the trailing /api.
function getGraphqlUrl() {
    // Default to backend port 8080 per guidelines for local dev
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const apiBase = base.replace(/\/api$/, "");
    return `${apiBase}/graphql`;
}
export async function gqlFetch(req, init) {
    const res = await fetch(getGraphqlUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
        body: JSON.stringify(req),
        credentials: "include",
        ...init,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
    }
    const json = (await res.json());
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    if (!json.data) {
        throw new Error("GraphQL response missing data");
    }
    return json.data;
}
