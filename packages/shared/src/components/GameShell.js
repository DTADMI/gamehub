"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { enableGameKeyCapture, GameHUD, soundManager } from "../";
import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
function MobileTouchControls({ onKey }) {
    const send = useCallback((key) => {
        // Dispatch keyboard to integrate with keyboard‑driven games
        onKey(key);
        // Haptics if available
        try {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
        catch {
            // Vibrate not supported or blocked
        }
    }, [onKey]);
    // Avoid re-renders
    return useMemo(() => (_jsxs("div", { className: "pointer-events-none fixed inset-0 flex flex-col justify-end p-4 gap-4 md:hidden", children: [_jsxs("div", { className: "pointer-events-auto mx-auto grid grid-cols-3 gap-3", children: [_jsx("button", { "aria-label": "Up", className: "row-start-1 col-start-2 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95", onClick: () => send("ArrowUp"), children: "\u25B2" }), _jsx("button", { "aria-label": "Left", className: "row-start-2 col-start-1 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95", onClick: () => send("ArrowLeft"), children: "\u25C0" }), _jsx("button", { "aria-label": "Down", className: "row-start-2 col-start-2 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95", onClick: () => send("ArrowDown"), children: "\u25BC" }), _jsx("button", { "aria-label": "Right", className: "row-start-2 col-start-3 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95", onClick: () => send("ArrowRight"), children: "\u25B6" })] }), _jsx("div", { className: "pointer-events-auto flex justify-center", children: _jsx("button", { "aria-label": "Pause or resume", className: "rounded-full px-6 py-3 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:scale-95", onClick: () => send(" "), children: "Pause / Resume" }) })] })), [send]);
}
export function GameShell({ children, ariaLabel, tips, className, preloadSounds, mobileControls = true, onPauseToggleAction, onRestartAction, }) {
    const rootRef = useRef(null);
    const [muted, setMuted] = useState(false);
    useEffect(() => {
        const el = rootRef.current;
        el?.focus();
        const cleanupCapture = enableGameKeyCapture({ rootEl: el ?? undefined });
        const preload = async () => {
            if (!preloadSounds || !preloadSounds.length) {
                return;
            }
            try {
                await Promise.all(preloadSounds.map((s) => soundManager.preloadSound(s.key, s.url, !!s.loop)));
            }
            catch (e) {
                console.warn("[GameShell] sound preload failed", e);
            }
        };
        preload();
        return () => {
            try {
                soundManager.stopMusic();
            }
            catch {
                // Fullscreen not supported or blocked
            }
            cleanupCapture();
        };
    }, [preloadSounds]);
    // Persist and apply mute preference
    useEffect(() => {
        try {
            const saved = localStorage.getItem("gamehub:soundMuted");
            const initial = saved === "true";
            setMuted(initial);
            // Best-effort: apply to sound manager if supported
            soundManager?.setMuted?.(initial);
        }
        catch {
            // ignore
        }
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem("gamehub:soundMuted", String(muted));
            soundManager?.setMuted?.(muted);
        }
        catch {
            // ignore
        }
    }, [muted]);
    const sendKey = useCallback((key) => {
        // Try dispatching a keyboard event by default
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }, []);
    const handlePause = useCallback(() => {
        if (onPauseToggleAction) {
            return onPauseToggleAction();
        }
        // Fallback: emit custom event then Space for keyboard‑driven games
        window.dispatchEvent(new Event("game:pauseToggle"));
        sendKey(" ");
    }, [onPauseToggleAction, sendKey]);
    const handleRestart = useCallback(() => {
        if (onRestartAction) {
            return onRestartAction();
        }
        window.dispatchEvent(new Event("game:restart"));
    }, [onRestartAction]);
    return (_jsxs("div", { ref: rootRef, className: `relative min-h-[80vh] outline-none focus:outline-none ${className ?? ""}`, tabIndex: 0, role: "application", "aria-label": ariaLabel, children: [_jsx("div", { className: "absolute right-3 top-3 z-20 flex items-center gap-2", children: _jsx("button", { "aria-label": muted ? "Unmute sound" : "Mute sound", className: "rounded-md border bg-background px-2 py-1 text-sm shadow-sm hover:bg-muted", onClick: () => setMuted((m) => !m), children: muted ? "🔇 Mute" : "🔈 Sound" }) }), children, mobileControls && _jsx(MobileTouchControls, { onKey: sendKey }), _jsx(GameHUD, { onPauseToggleAction: handlePause, onRestartAction: handleRestart, tips: tips })] }));
}
export default GameShell;
