"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pause, Play, RotateCcw } from "lucide-react";
export function GameHUD({ onPauseToggleAction, onRestartAction, tips, }) {
    return (_jsx("div", { className: "pointer-events-none fixed bottom-4 right-4 z-40", children: _jsxs("div", { className: "pointer-events-auto flex items-center gap-2 rounded-md border bg-card text-card-foreground px-3 py-2 shadow-md", children: [_jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground", onClick: onPauseToggleAction, "aria-label": "Pause or resume", "data-testid": "hud-pause-toggle", children: [_jsx(Play, { className: "h-4 w-4" }), "/", _jsx(Pause, { className: "h-4 w-4" })] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground", onClick: onRestartAction, "aria-label": "Restart game", children: [_jsx(RotateCcw, { className: "h-4 w-4" }), " Restart"] }), tips ? (_jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: tips })) : null] }) }));
}
export default GameHUD;
