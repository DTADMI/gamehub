// libs/shared/src/pointclick/puzzles/wires.ts
// Pure logic for a simple wires/connectors puzzle.
export function createWiresState(terminalsLeft, terminalsRight, goal) {
    return {
        terminalsLeft: [...terminalsLeft],
        terminalsRight: [...terminalsRight],
        connections: [],
        goal,
        solved: false,
    };
}
export function setWiresConnection(state, from, to, color) {
    // Remove any previous connection that uses either endpoint
    const filtered = state.connections.filter((c) => c.from !== from && c.to !== to);
    const next = {
        ...state,
        connections: [...filtered, { from, to, color }],
    };
    return evaluateSolved(next);
}
export function removeConnection(state, endpoint) {
    return evaluateSolved({
        ...state,
        connections: state.connections.filter((c) => c.from !== endpoint && c.to !== endpoint),
    });
}
export function clearWiresConnections(state) {
    return { ...state, connections: [], solved: false };
}
export function evaluateSolved(state) {
    // Consider solved when for every color, all required pairs exist in any order
    for (const [color, pairs] of Object.entries(state.goal)) {
        for (const pair of pairs) {
            const ok = state.connections.some((c) => c.color === color && c.from === pair.from && c.to === pair.to);
            if (!ok) {
                return { ...state, solved: false };
            }
        }
    }
    return { ...state, solved: true };
}
export function hasWiresCrossing(state) {
    // Optional helper: check if any two connections cross assuming ordered banks
    // We map left terminals to an index and right terminals to an index, then detect inversions.
    const leftIndex = new Map();
    state.terminalsLeft.forEach((t, i) => leftIndex.set(t, i));
    const rightIndex = new Map();
    state.terminalsRight.forEach((t, i) => rightIndex.set(t, i));
    const pairs = state.connections
        .map((c) => ({
        li: leftIndex.get(c.from) ?? 0,
        ri: rightIndex.get(c.to) ?? 0,
    }))
        .sort((a, b) => a.li - b.li);
    // If right indices are not non-decreasing, there is a crossing
    for (let i = 1; i < pairs.length; i++) {
        if (pairs[i].ri < pairs[i - 1].ri) {
            return true;
        }
    }
    return false;
}
