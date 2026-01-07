// games/bubble-pop/src/components/BubblePopGame.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { soundManager } from "@games/shared";
import { useCallback, useEffect, useRef, useState } from "react";
// --- Game constants
const COLS = 10;
const ROWS = 14;
const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
const CELL = 36; // logical cell size (will be scaled by DPR)
// --- Pure logic helpers (unit-test friendly)
export function createBoard(cols = COLS, rows = ROWS) {
    const b = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push(Math.floor(Math.random() * COLORS.length));
        }
        b.push(row);
    }
    return b;
}
export function inBounds(x, y, cols = COLS, rows = ROWS) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
}
export function findGroup(board, sx, sy) {
    if (!inBounds(sx, sy, board[0].length, board.length)) {
        return [];
    }
    const color = board[sy][sx];
    if (color < 0) {
        return [];
    }
    const seen = new Set();
    const out = [];
    const q = [{ x: sx, y: sy }];
    const key = (x, y) => `${x},${y}`;
    while (q.length) {
        const { x, y } = q.shift();
        const k = key(x, y);
        if (seen.has(k)) {
            continue;
        }
        seen.add(k);
        if (!inBounds(x, y, board[0].length, board.length)) {
            continue;
        }
        if (board[y][x] !== color) {
            continue;
        }
        out.push({ x, y });
        q.push({ x: x + 1, y });
        q.push({ x: x - 1, y });
        q.push({ x, y: y + 1 });
        q.push({ x, y: y - 1 });
    }
    return out;
}
export function popGroup(board, group) {
    const next = board.map((row) => row.slice());
    for (const { x, y } of group) {
        next[y][x] = -1;
    }
    return next;
}
export function applyGravity(board) {
    const cols = board[0].length;
    const rows = board.length;
    const next = board.map((row) => row.slice());
    for (let x = 0; x < cols; x++) {
        let write = rows - 1;
        for (let y = rows - 1; y >= 0; y--) {
            if (next[y][x] >= 0) {
                const val = next[y][x];
                next[y][x] = -1;
                next[write][x] = val;
                write--;
            }
        }
    }
    // Compact empty columns to the left
    let writeCol = 0;
    for (let x = 0; x < cols; x++) {
        const colEmpty = next.every((row) => row[x] === -1);
        if (!colEmpty) {
            if (writeCol !== x) {
                for (let y = 0; y < rows; y++) {
                    next[y][writeCol] = next[y][x];
                    next[y][x] = -1;
                }
            }
            writeCol++;
        }
    }
    return next;
}
export function refill(board) {
    const next = board.map((row) => row.slice());
    for (let y = 0; y < next.length; y++) {
        for (let x = 0; x < next[0].length; x++) {
            if (next[y][x] < 0) {
                next[y][x] = Math.floor(Math.random() * COLORS.length);
            }
        }
    }
    return next;
}
export function anyMove(board) {
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            const g = findGroup(board, x, y);
            if (g.length >= 3) {
                return true;
            }
        }
    }
    return false;
}
// --- Component (Canvas renderer)
export const BubblePopGame = () => {
    const canvasRef = useRef(null);
    const [board, setBoard] = useState(() => createBoard());
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [selected, setSelected] = useState(null);
    // Load high score
    useEffect(() => {
        try {
            const s = parseInt(localStorage.getItem("bubblepop:best") || "0", 10);
            if (!isNaN(s)) {
                setBest(s);
            }
        }
        catch {
        }
    }, []);
    // Drawing
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const w = COLS * CELL;
        const h = ROWS * CELL;
        if (canvas.width !== Math.floor(w * dpr) ||
            canvas.height !== Math.floor(h * dpr)) {
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);
        }
        // background
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#0b1020";
        ctx.fillRect(0, 0, w, h);
        // grid lines (subtle)
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CELL, 0);
            ctx.lineTo(x * CELL, h);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL);
            ctx.lineTo(w, y * CELL);
            ctx.stroke();
        }
        // bubbles
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const c = board[y][x];
                if (c < 0) {
                    continue;
                }
                const cx = x * CELL + CELL / 2;
                const cy = y * CELL + CELL / 2;
                const r = Math.floor(CELL * 0.42);
                const color = COLORS[c % COLORS.length];
                const grad = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.2, cx, cy, r);
                grad.addColorStop(0, "white");
                grad.addColorStop(0.2, color);
                grad.addColorStop(1, "#111827");
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
                // selection highlight
                if (selected?.some((p) => p.x === x && p.y === y)) {
                    ctx.strokeStyle = "rgba(255,255,255,0.9)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
        // HUD
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.fillText(`Score: ${score}`, 8, 18);
        ctx.fillText(`Best: ${best}`, 8, 36);
    }, [board, selected, score, best]);
    useEffect(() => {
        draw();
    }, [draw]);
    useEffect(() => {
        const onResize = () => draw();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [draw]);
    // Coordinate map from click to cell
    function toCell(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
        const y = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
        return { x, y };
    }
    // Handle click: select group (>=3) then pop on second click
    const onClick = (e) => {
        const { x, y } = toCell(e);
        const group = findGroup(board, x, y);
        if (group.length < 3) {
            setSelected(null);
            return;
        }
        // if already selected this group, pop
        const sameGroup = selected &&
            group.length === selected.length &&
            selected.every((p) => group.some((g) => g.x === p.x && g.y === p.y));
        if (sameGroup) {
            soundManager.playSound("click", 0.6);
            const popped = popGroup(board, group);
            const fallen = applyGravity(popped);
            const refilled = refill(fallen);
            setBoard(refilled);
            const gain = group.length * group.length; // simple scoring
            setScore((s) => {
                const next = s + gain;
                const newBest = Math.max(next, best);
                if (newBest !== best) {
                    setBest(newBest);
                    try {
                        localStorage.setItem("bubblepop:best", String(newBest));
                    }
                    catch {
                    }
                }
                return next;
            });
            setSelected(null);
            // notify panels (similar to snake)
            try {
                window.dispatchEvent(new Event("bubblepop:leaderboardUpdated"));
            }
            catch {
            }
        }
        else {
            setSelected(group);
        }
    };
    const onRestartAction = () => {
        setBoard(createBoard());
        setSelected(null);
        setScore(0);
    };
    // Keyboard support: move a cursor logically (optional minimal)
    const [cursor, setCursor] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handler = (ev) => {
            if (ev.key === "ArrowRight") {
                setCursor((c) => ({ x: Math.min(COLS - 1, c.x + 1), y: c.y }));
            }
            if (ev.key === "ArrowLeft") {
                setCursor((c) => ({ x: Math.max(0, c.x - 1), y: c.y }));
            }
            if (ev.key === "ArrowDown") {
                setCursor((c) => ({ x: c.x, y: Math.min(ROWS - 1, c.y + 1) }));
            }
            if (ev.key === "ArrowUp") {
                setCursor((c) => ({ x: c.x, y: Math.max(0, c.y - 1) }));
            }
            if (ev.key === " " || ev.key === "Enter") {
                const g = findGroup(board, cursor.x, cursor.y);
                if (g.length >= 3) {
                    soundManager.playSound("click", 0.6);
                    const popped = popGroup(board, g);
                    const fallen = applyGravity(popped);
                    const refilled = refill(fallen);
                    setBoard(refilled);
                    const gain = g.length * g.length;
                    setScore((s) => {
                        const next = s + gain;
                        const newBest = Math.max(next, best);
                        if (newBest !== best) {
                            setBest(newBest);
                            try {
                                localStorage.setItem("bubblepop:best", String(newBest));
                            }
                            catch {
                            }
                        }
                        return next;
                    });
                    try {
                        window.dispatchEvent(new Event("bubblepop:leaderboardUpdated"));
                    }
                    catch {
                    }
                }
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [board, cursor, best]);
    // Draw cursor overlay by toggling selected to cursor group (for feedback)
    useEffect(() => {
        const g = findGroup(board, cursor.x, cursor.y);
        setSelected(g.length >= 3 ? g : null);
    }, [board, cursor]);
    return (_jsxs("div", { className: "flex flex-col items-center justify-center p-2", children: [_jsx("canvas", { ref: canvasRef, width: COLS * CELL, height: ROWS * CELL, "data-testid": "bubblepop-canvas", role: "img", "aria-label": `Bubble Pop board, score ${score}, best ${best}`, className: "rounded-lg shadow-lg border border-gray-700", onClick: onClick }), _jsxs("div", { className: "mt-3 flex items-center gap-3", children: [_jsx("button", { onClick: onRestartAction, className: "px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90", children: "Restart" }), _jsx("span", { className: "text-sm text-gray-400", children: "Use mouse/touch to select groups (3+). Space/Enter to pop selected." })] }), _jsxs("div", { "aria-live": "polite", className: "sr-only", children: ["Score ", score, ". Best ", best, "."] })] }));
};
export default BubblePopGame;
