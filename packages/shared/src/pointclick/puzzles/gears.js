// Pure-logic gears puzzle primitive
// Model: gears connected by meshing edges. The overall speed ratio between
// an input gear and an output gear equals the product of teeth(prev)/teeth(next)
// along a connection path (idler gears do not change magnitude of ratio beyond their teeth contribution).
// Sign/direction flips are UI concerns; logic focuses on absolute ratio.
export function createGearsState(gears, connections, inputId, outputId, targetRatio, tolerance = 1e-3) {
    const base = {
        gears: [...gears],
        connections: [...connections],
        inputId,
        outputId,
        targetRatio,
        tolerance,
        solved: false,
    };
    return evaluateGears(base);
}
export function setGearsTeeth(state, gearId, teeth) {
    const gears = state.gears.map((g) => (g.id === gearId ? { ...g, teeth } : g));
    return evaluateGears({ ...state, gears });
}
export function evaluateGears(state) {
    // Find a simple path from input to output via BFS and compute ratio
    const graph = buildGearsGraph(state.connections);
    const path = bfsPath(graph, state.inputId, state.outputId);
    if (!path) {
        return { ...state, solved: false };
    }
    const gearMap = new Map(state.gears.map((g) => [g.id, g]));
    // Ensure all gears on path exist and teeth > 0
    for (const id of path) {
        const g = gearMap.get(id);
        if (!g || !Number.isFinite(g.teeth) || g.teeth <= 0) {
            return { ...state, solved: false };
        }
    }
    // Compute magnitude ratio = product(teeth(prev)/teeth(next)) along the path
    let ratio = 1;
    for (let i = 0; i < path.length - 1; i++) {
        const a = gearMap.get(path[i]);
        const b = gearMap.get(path[i + 1]);
        ratio *= a.teeth / b.teeth;
    }
    const eps = state.tolerance ?? 1e-6;
    const solved = nearlyEqual(Math.abs(ratio), Math.abs(state.targetRatio), eps);
    return { ...state, solved };
}
export function clearConnections(state) {
    return evaluateGears({ ...state, connections: [] });
}
export function setConnection(state, a, b, on) {
    const exists = state.connections.some((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
    let connections = state.connections;
    if (on && !exists) {
        connections = [...connections, { a, b }];
    }
    else if (!on && exists) {
        connections = connections.filter((c) => !((c.a === a && c.b === b) || (c.a === b && c.b === a)));
    }
    return evaluateGears({ ...state, connections });
}
function buildGearsGraph(conns) {
    const g = {};
    for (const { a, b } of conns) {
        if (!g[a]) {
            g[a] = [];
        }
        if (!g[b]) {
            g[b] = [];
        }
        g[a].push(b);
        g[b].push(a);
    }
    return g;
}
function bfsPath(graph, start, goal) {
    if (start === goal) {
        return [start];
    }
    const queue = [start];
    const prev = new Map();
    prev.set(start, null);
    while (queue.length) {
        const cur = queue.shift();
        for (const nxt of graph[cur] || []) {
            if (!prev.has(nxt)) {
                prev.set(nxt, cur);
                if (nxt === goal) {
                    // reconstruct path
                    const path = [nxt];
                    let p = cur;
                    while (p) {
                        path.push(p);
                        p = prev.get(p) ?? null;
                    }
                    path.reverse();
                    return path;
                }
                queue.push(nxt);
            }
        }
    }
    return null;
}
function nearlyEqual(a, b, eps = 1e-9) {
    return Math.abs(a - b) <= eps;
}
